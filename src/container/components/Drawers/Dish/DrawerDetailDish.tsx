import { ImageFullScreen, ImageLoader, Modal, ModalRemove } from '@/components';
import { DrawerMotion } from '@/components/Drawer';
import { Col, Row, RowBetween } from '@/components/Helpers';
import { H2, H3, P12, P16 } from '@/components/Texts';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/components/ui/use-toast';
import { useAuthContext, useDishContext } from '@/contexts';
import { ROUTES } from '@/routes';
import { ApiService } from '@/services/api';
import { cn, writeUnit } from '@/services/utils';
import { IMAGE_FALLBACK } from '@/static/constants';
import { CollaboratorStatus, CollaboratorType, DishStatus } from '@/types';
import { Dish } from '@/types/dto/Dish';
import { useMutation } from '@tanstack/react-query';
import {
  Calendar,
  ChefHatIcon,
  CircleEllipsisIcon,
  EditIcon,
  EyeIcon,
  EyeOffIcon,
  X,
} from 'lucide-react';
import { useTranslation } from 'next-i18next';
import router from 'next/router';
import { useEffect, useState } from 'react';
import styled from 'styled-components';
import tw from 'tailwind-styled-components';

interface DrawerDetailDishProps {
  className?: string;
  isOpen: boolean;
  onClose: () => void;
  dish?: Dish;
}

export function DrawerDetailDish(
  props: DrawerDetailDishProps
): React.JSX.Element {
  const { className, isOpen, onClose, dish } = props;
  const { t } = useTranslation();
  const { currentUser } = useAuthContext();
  const [isImageFullScreenOpen, setIsImageFullScreenOpen] =
    useState<boolean>(false);
  const [newRation, setNewRation] = useState<number>(dish?.ration ?? 2);
  const { setWeeklyDishes, weeklyDishes, refresh, clearData } =
    useDishContext();
  const [isEditOpen, setIsEditOpen] = useState(false);
  const { toast } = useToast();
  const [youAreInReadOnlyMode, setYouAreInReadOnlyMode] = useState(true);

  const isWeeklyDish = weeklyDishes.some((d) => d.id === dish?.id);

  const { mutate: remove, isPending } = useMutation({
    mutationFn: () => ApiService.dishes.remove(dish?.id ?? ''),
    onSuccess: () => {
      toast({
        title: t('toast.remove.success.title'),
        description: t('toast.remove.success.description'),
      });
      clearData();
      refresh();
      setIsEditOpen(false);
      router.push(ROUTES.dishes.index);
    },
    onError: (error: any) => {
      toast({
        title: t(error.data.response.title),
        description: t(error.data.response.message),
        variant: 'destructive',
      });
    },
  });

  useEffect(() => {
    setNewRation(dish?.ration ?? 2);
  }, [dish]);

  const imageCover = dish?.images.find(
    (image) => image.id === dish.favoriteImage
  );

  useEffect(() => {
    if (currentUser && dish) {
      const collabReadOnly = [
        ...currentUser?.collaborators.filter(
          (collaborator) =>
            collaborator?.type === CollaboratorType.READ_ONLY &&
            collaborator?.status === CollaboratorStatus.IS_ACCEPTED
        ),
        ...currentUser?.collabSend.filter(
          (collab) =>
            collab?.type === CollaboratorType.READ_ONLY &&
            collab?.status === CollaboratorStatus.IS_ACCEPTED
        ),
      ];
      if (collabReadOnly.length > 0) {
        const getCollaboratorId = collabReadOnly.map(
          (collab) => collab?.collaborator?.id || collab.sender.id
        );
        if (getCollaboratorId.includes(dish.chef.id)) {
          setYouAreInReadOnlyMode(true);
        } else {
          setYouAreInReadOnlyMode(false);
        }
      } else {
        setYouAreInReadOnlyMode(false);
      }
    }
  }, [currentUser, dish]);

  return dish ? (
    <DrawerMotion
      className='mt-0 rounded-t-none'
      headerClassName='rounded-t-none'
      isOpen={isOpen}
      onClose={onClose}
      icon={
        <CircleEllipsisIcon
          size={20}
          className='text-white'
          onClick={(e) => {
            e.stopPropagation();
            setIsEditOpen(true);
          }}
        />
      }
    >
      <Content className={className}>
        <H2 className='leading-none'>{dish.name}</H2>
        <RowBetween className='items-start mt-5'>
          <Row className='flex-wrap gap-1 mr-2'>
            {dish?.tags?.map((tag) => (
              <Badge variant={'outline'} key={tag}>
                {tag}
              </Badge>
            ))}
            {dish.chef && (
              <Badge className='flex items-center gap-1' variant={'outline'}>
                <ChefHatIcon size={15} />
                {dish.chef.userName}
              </Badge>
            )}
            <Badge className='flex items-center gap-1' variant={'outline'}>
              {dish.status === DishStatus.PRIVATE ? (
                <EyeOffIcon size={15} />
              ) : (
                <EyeIcon size={15} />
              )}
            </Badge>
          </Row>
          {dish.ingredients.length > 0 && (
            <Input
              min={1}
              isArrow
              type='number'
              onChange={(v) => {
                setNewRation(Number(v));
                if (isWeeklyDish) {
                  setWeeklyDishes(
                    weeklyDishes.map((d) =>
                      d.id === dish.id
                        ? {
                            ...d,
                            ration: Number(v),
                            ingredients: d.ingredients.map((ingredient) => ({
                              ...ingredient,
                              quantity:
                                (ingredient.quantity / d.ration) * Number(v),
                            })),
                          }
                        : d
                    )
                  );
                }
              }}
              value={newRation.toString()}
              className='w-14 h-7'
              iconSize={22}
            />
          )}
        </RowBetween>
        <Grid2>
          {dish.ingredients.length > 0 && (
            <TextContainer>
              <H3 className=''>{t('generics.ingretients')}</H3>
              <ul className='mt-2 list-disc'>
                {dish.ingredients.map((ingredient) => (
                  <li
                    className='gap-2 ml-4 text-primary leading-none mb-2'
                    key={ingredient.id}
                  >
                    <strong>{writeUnit(ingredient, newRation, t, dish)}</strong>{' '}
                    {ingredient.food.name}
                  </li>
                ))}
              </ul>
            </TextContainer>
          )}
          <Image
            onClick={() => imageCover && setIsImageFullScreenOpen(true)}
            src={imageCover?.url ?? IMAGE_FALLBACK}
            alt={dish.name}
            height={250}
            width={150}
            quality={1}
          />
        </Grid2>
        {dish.instructions && (
          <Col className='mt-5'>
            <H3 className='text-center'>{t('dishes:instruction')}</H3>
            <Col className='mt-2'>
              {dish.instructions && (
                <Main dangerouslySetInnerHTML={{ __html: dish.instructions }} />
              )}
            </Col>
          </Col>
        )}
        <Button
          onClick={(e) => {
            e.stopPropagation();
            if (isWeeklyDish) {
              setWeeklyDishes(weeklyDishes.filter((d) => d.id !== dish.id));
              return;
            }
            setWeeklyDishes([...weeklyDishes, dish]);
          }}
          className={cn(
            'fixed bottom-10 right-2 gap-2',
            isWeeklyDish ? 'bg-primary/90' : 'bg-primary/60'
          )}
        >
          {isWeeklyDish ? <X size={15} /> : <Calendar size={15} />}
          <P12 className={'text-background'}>
            {isWeeklyDish ? t('dishes:week.remove') : t('dishes:week.add')}
          </P12>
        </Button>
      </Content>
      <ImageFullScreen
        startIndex={0}
        images={dish.images.map((image) => image.url)}
        isOpen={isImageFullScreenOpen}
        onClose={() => setIsImageFullScreenOpen(false)}
      />
      <Modal
        className='h-min relative'
        isOpen={isEditOpen}
        onClose={() => setIsEditOpen(false)}
      >
        <Col className='gap-1'>
          <RowBetween
            onClick={(e) => {
              e.stopPropagation();
              if (isWeeklyDish) {
                setWeeklyDishes(weeklyDishes.filter((d) => d.id !== dish.id));
                return;
              }
              setWeeklyDishes([...weeklyDishes, dish]);
            }}
            className={`${
              isWeeklyDish
                ? 'bg-primary text-background'
                : 'bg-background text-primary'
            } p-2 rounded-lg gap-2 items-center`}
          >
            <Calendar />
            <P16
              className={`${isWeeklyDish ? 'text-background' : 'text-primary'}`}
            >
              {isWeeklyDish ? t('dishes:week.remove') : t('dishes:week.add')}
            </P16>
          </RowBetween>
          {!youAreInReadOnlyMode && (
            <RowBetween
              onClick={() => {
                router.push(ROUTES.dishes.update(dish.id));
              }}
              className='bg-background text-primary p-2 rounded-lg gap-2 items-center'
            >
              <EditIcon />
              <P16>{t('generics.edit')}</P16>
            </RowBetween>
          )}
          {currentUser?.id === dish.chef.id && (
            <ModalRemove isPending={isPending} onRemove={() => remove()} />
          )}
        </Col>
      </Modal>
    </DrawerMotion>
  ) : (
    <></>
  );
}

const Content = tw(Col)`
  px-5
  pb-18
  justify-between
  items-between
`;

const Grid2 = tw.div`
  grid
  grid-cols-2
  gap-4
  mt-4
`;

const Image = tw(ImageLoader)`
  w-full
  rounded-lg
  p-2
  bg-background
  shadow-lg
`;

const TextContainer = tw(Col)`
  
`;

const Main = styled.div`
  ${() => WysiwygRenderStyle}
`;

// * Use these style to render the Wysiwyg content in the same way as it will be rendered in the
// * Wysiwyg + add 'ql-editor' class to the html content div to inherit list styles from 'react-quill' css
export const WysiwygRenderStyle = `
  all: unset;
  --primary: hsl(218.03 56.8% 24.51%);
  padding: 0px;
  overflow-x: hidden;
  width: 100%;
  text-align: justify;
  font-size: 15px;
  color: hsl(218.03 56.8% 24.51%);
  line-height: 1.3;

  h1 {
    font-size : 22px;
    margin-bottom: 2px;
    margin-top: 5px;
    color: hsl(218.03 56.8% 24.51%);
    font-weight: bold;
  }

  h2 {
    margin-top: 10px;
    font-size : 18px;
    margin-bottom: 2px;
    color: hsl(218.03 56.8% 24.51%);
    font-weight: bold;
  }

  strong {
    font-weight: bold
  }

  blockquote {
    border-left: 4px solid hsl(218.03 56.8% 24.51%);
    margin-bottom: 5px;
    margin-top: 5px;
    padding-left: 12px;
  }

  ul{
  
  }

  ol,
  ul, li {
    padding-left: 25px;
    list-style: round; 
    maring-bottom: 10px;
    color: hsl(218.03 56.8% 24.51%);
  }

  li {
    padding-left: 0px;
    margin-bottom: 9px;
  }
`;
