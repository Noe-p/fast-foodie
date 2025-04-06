import {
  Avatar,
  Col,
  H2,
  Layout,
  Modal,
  ModalRemove,
  P14,
  P16,
  P18,
  Row,
  RowBetween,
  RowCenter,
} from '@/components';
import { Table } from '@/components/Table';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/components/ui/use-toast';
import { DishesCard } from '@/container/components/Dishes/DishesCard';
import { dishColumns } from '@/container/components/Tables';
import { useAuthContext, useDishContext } from '@/contexts';
import { ROUTES } from '@/routes';
import { ApiService } from '@/services/api';
import { areSimilar } from '@/services/utils';
import { CollaboratorDto, User } from '@/types';
import { Dish } from '@/types/dto/Dish';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import {
  AlignJustify,
  ChevronLeft,
  CircleEllipsisIcon,
  Grid2X2,
  Loader2,
  SearchIcon,
} from 'lucide-react';
import { useTranslation } from 'next-i18next';
import router from 'next/router';
import { useEffect, useState } from 'react';
import PullToRefresh from 'react-simple-pull-to-refresh';
import tw from 'tailwind-styled-components';

interface UserDishesPageProps {
  colabId: string;
}

export function UserDishesPage(props: UserDishesPageProps): React.JSX.Element {
  const { colabId } = props;
  const { t } = useTranslation();
  const [search, setSearch] = useState<string>();
  const { dishes, refresh } = useDishContext();
  const [chef, setChef] = useState<User>();
  const [isEditOpen, setIsEditOpen] = useState(false);
  const { toast } = useToast();
  const { currentUser, refreshUser } = useAuthContext();
  const queryClient = useQueryClient();
  const [collab, setCollab] = useState<CollaboratorDto>();

  function filterDishes(search?: string, dishes?: Dish[]): Dish[] {
    if (!dishes) return [];
    return dishes
      .filter((dish) => {
        if (search && !areSimilar(search, dish.name, false)) return false;
        if (chef && dish.chef.id !== chef.id) return false;
        return true;
      })
      .sort((a, b) => (a.createdAt > b.createdAt ? -1 : 1));
  }

  useEffect(() => {
    if (currentUser) {
      const collab =
        currentUser.collaborators.find((c) => c.id === colabId) ||
        currentUser.collabSend.find((c) => c.id === colabId);
      if (collab) {
        setChef(collab.collaborator || collab.sender);
        setCollab(collab);
      }
    }
  }, [colabId, currentUser]);

  const { mutate: removeCollab, isPending } = useMutation({
    mutationFn: (data: { id: string }) =>
      ApiService.collaborators.remove(data.id),
    onSuccess: async (data) => {
      await refreshUser();
      toast({
        title: t('toast:collaborator.remove.success'),
      });
      queryClient.refetchQueries({
        queryKey: ['user'],
        exact: false,
        type: 'all',
      });
      setIsEditOpen(false);
      router.push(ROUTES.dishes.index);
    },

    // eslint-disable-next-line  @typescript-eslint/no-explicit-any
    onError: (error: any) => {
      toast({
        title: t(error.data.response.title),
        description: t(error.data.response.message),
        variant: 'destructive',
      });
    },
  });

  return (
    <Layout className='p-0'>
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
        <H2 className='text-background'>{chef?.userName}</H2>
        <CircleEllipsisIcon
          onClick={() => setIsEditOpen(true)}
          className='text-primary-foreground'
        />
      </RowBetween>
      <Content>
        <PullToRefresh
          onRefresh={refresh}
          pullingContent={
            <RowCenter className='w-screen items-center justify-center'>
              <Loader2 className='h-8 text-primary w-8 animate-spin' />
            </RowCenter>
          }
          refreshingContent={
            <RowCenter className='w-screen items-center justify-center'>
              <Loader2 className='h-8 text-primary w-8 animate-spin' />
            </RowCenter>
          }
        >
          <Tabs defaultValue='card'>
            <Row className='items-center gap-3 text_background px-3 py-5 rounded-sm shadow-md'>
              <Avatar className='w-max' user={chef} size={70} />
              <Col className='w-fit'>
                <P18>{chef?.userName}</P18>
                <P14 className='text-primary/80 w-full leading-tight'>
                  {t(`collaboratorType.${collab?.type}`)}
                </P14>
              </Col>
            </Row>
            <Input
              icon={<SearchIcon className='h-5 w-5 text-muted-foreground' />}
              className='w-full mt-5'
              placeholder={t('generics.search')}
              onChange={(v) => setSearch(v)}
            />

            <Row className='justify-end mt-2'>
              <TabsList>
                <TabsTrigger value='card'>
                  <Grid2X2 size={20} />
                </TabsTrigger>
                <TabsTrigger value='list'>
                  <AlignJustify size={20} />
                </TabsTrigger>
              </TabsList>
            </Row>

            <TabsContent value='list'>
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
                <Table
                  columns={dishColumns}
                  data={filterDishes(search, dishes) ?? []}
                  redirection={(id) => {
                    router.push(`${ROUTES.dishes.detail(id)}?user=${colabId}`);
                  }}
                />
              </motion.div>
            </TabsContent>
            <TabsContent value='card'>
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
                <Col className='items-center gap-5'>
                  {filterDishes(search, dishes)?.length === 0 ? (
                    <P14 className='text-primary mt-20 text-center w-full'>
                      {t('generics.noResults')}
                    </P14>
                  ) : (
                    filterDishes(search, dishes)?.map((dish: Dish) => (
                      <DishesCard from='user' key={dish.id} dish={dish} />
                    ))
                  )}
                </Col>
              </motion.div>
            </TabsContent>
          </Tabs>
        </PullToRefresh>
      </Content>
      <Modal
        className='h-min relative'
        isOpen={isEditOpen}
        onClose={() => setIsEditOpen(false)}
        title={t('user:detail.collaborators.remove')}
      >
        <Col className='gap-1'>
          <ModalRemove
            isPending={isPending}
            onRemove={() => {
              removeCollab({ id: colabId });
            }}
          />
        </Col>
      </Modal>
    </Layout>
  );
}

const Content = tw(Col)`
  px-3
  pb-33
  pt-23
`;
