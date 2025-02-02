import {
  ImageFullScreen,
  ImageLoader,
  Layout,
  Modal,
  ModalRemove,
} from '@/components';
import { Col, Row, RowBetween } from '@/components/Helpers';
import { H2, P12, P16 } from '@/components/Texts';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/components/ui/use-toast';
import { useAuthContext, useDishContext } from '@/contexts';
import { ROUTES } from '@/routes';
import { ApiService } from '@/services/api';
import { cn, writeUnit } from '@/services/utils';
import { DishStatus } from '@/types';
import { useMutation } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import {
  Calendar,
  ChefHatIcon,
  ChevronLeft,
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

interface DetailDishPageProps {
  idPage: string;
  className?: string;
}

export function DetailDishPage(props: DetailDishPageProps): React.JSX.Element {
  const { idPage, className } = props;
  const { getDishesById } = useDishContext();
  const dish = getDishesById(idPage);
  const { t } = useTranslation();
  const { currentUser } = useAuthContext();
  const [isImageFullScreenOpen, setIsImageFullScreenOpen] =
    useState<boolean>(false);
  const [newRation, setNewRation] = useState<number>(dish?.ration ?? 2);
  const { setWeeklyDishes, weeklyDishes, refresh, clearData } =
    useDishContext();
  const [isEditOpen, setIsEditOpen] = useState(false);
  const { toast } = useToast();

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

  return dish ? (
    <Layout className={'text_background p-0'}>
      <RowBetween className='bg-primary fixed top-0 z-40 w-full items-center px-3 py-5'>
        <Row
          className='items-center'
          onClick={() => router.push(ROUTES.dishes.index)}
        >
          <ChevronLeft className='text-background' size={30} />
          <P16 className='text-background translate-y-0.5'>
            {t('generics.back')}
          </P16>
        </Row>
        <H2 className='text-background'>
          {dish.name.substring(0, 16)}
          {dish.name.length > 16 && '...'}
        </H2>
        <CircleEllipsisIcon
          onClick={() => setIsEditOpen(true)}
          className='text-primary-foreground'
        />
      </RowBetween>
      <Content className={className}>
        <motion.div
          initial={{
            x: 100,
          }}
          animate={{
            x: 0,
          }}
          transition={{
            duration: 0.2,
            type: 'spring',
            damping: 13,
            stiffness: 150,
          }}
        >
          <RowBetween className='items-start'>
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
          </RowBetween>
          <Grid2>
            <TextContainer>
              <H2 className='text-center'>{'Ingrédients'}</H2>
              <ul className='mt-2 list-disc'>
                {dish.ingredients.map((ingredient) => (
                  <li className='gap-2 ml-4 text-primary' key={ingredient.id}>
                    <strong>{writeUnit(ingredient, newRation, t, dish)}</strong>{' '}
                    {ingredient.food.name}
                  </li>
                ))}
              </ul>
            </TextContainer>
            {imageCover && (
              <Image
                onClick={() => setIsImageFullScreenOpen(true)}
                src={imageCover.url}
                alt={dish.name}
                height={250}
                width={150}
                quality={20}
              />
            )}
          </Grid2>
          <Col className='mt-5'>
            <TextContainer className=''>
              <H2 className='text-center'>{t('dishes:instruction')}</H2>
              <Col className='mt-2'>
                {dish.instructions && (
                  <Main
                    dangerouslySetInnerHTML={{ __html: dish.instructions }}
                  />
                )}
              </Col>
            </TextContainer>
          </Col>
        </motion.div>
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
            'fixed bottom-23 right-2 gap-2',
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
          {currentUser?.id === dish.chef.id && (
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
    </Layout>
  ) : (
    <></>
  );
}

const Content = tw(Col)`
  px-3
  pb-33
  pt-23
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
