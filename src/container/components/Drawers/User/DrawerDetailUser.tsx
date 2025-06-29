import { Avatar, DialogModal } from '@/components';
import { DrawerMotion } from '@/components/Drawer';
import { Col, Row, RowBetween } from '@/components/Helpers';
import { H2, P10, P12, P14 } from '@/components/Texts';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import { DrawerType, useAppContext, useAuthContext } from '@/contexts';
import { useClearWeeklyDishes, useDishes } from '@/hooks';
import { ROUTES } from '@/routes';
import { ApiService } from '@/services/api';
import { CollaboratorDto, CollaboratorStatus, CollaboratorType } from '@/types';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import {
  ArrowRight,
  Edit,
  LogOutIcon,
  PlusIcon,
  Trash2Icon,
} from 'lucide-react';
import { useTranslation } from 'next-i18next';
import router from 'next/router';
import { useEffect, useState } from 'react';
import tw from 'tailwind-styled-components';
import { DrawerAddCollab } from './DrawerAddCollab';

interface DrawerDetailUserProps {
  className?: string;
  isOpen: boolean;
  onClose: () => void;
}

export function DrawerDetailUser(props: DrawerDetailUserProps): JSX.Element {
  const { className, isOpen, onClose } = props;
  const { t } = useTranslation();
  const { currentUser, removeToken, refreshUser } = useAuthContext();
  const { setDrawerOpen } = useAppContext();
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const { refetch } = useDishes();
  const clearWeeklyDishes = useClearWeeklyDishes();
  const { toast } = useToast();
  const [isAddCollab, setIsAddCollab] = useState<boolean>(false);
  const [collaborators, setCollaborators] = useState<CollaboratorDto[]>([]);
  const [collabPending, setCollabPending] = useState<CollaboratorDto[]>([]);
  const queryClient = useQueryClient();
  const [typeSelected, setTypeSelected] = useState<CollaboratorType>(
    CollaboratorType.READ_ONLY
  );

  async function handleLogout() {
    setIsLoading(true);
    removeToken();
    onClose();
    setIsLoading(false);
    clearWeeklyDishes.mutate();
  }

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

  const { mutate: acceptCollab } = useMutation({
    mutationFn: (data: { id: string }) =>
      ApiService.collaborators.accept(data.id),
    onSuccess: async (data) => {
      await refreshUser();
      await refetch();
      toast({
        title: t('toast:collaborator.add.success'),
      });
      queryClient.refetchQueries({
        queryKey: ['user'],
        exact: false,
        type: 'all',
      });
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

  function getCollaborators() {
    setCollaborators([
      ...(currentUser?.collaborators?.filter(
        (collab) => collab.status === CollaboratorStatus.IS_ACCEPTED
      ) || []),
      ...(currentUser?.collabSend?.filter(
        (collab) => collab.status === CollaboratorStatus.IS_ACCEPTED
      ) || []),
    ]);

    setCollabPending([
      ...(currentUser?.collaborators?.filter(
        (collab) => collab.status === CollaboratorStatus.IS_PENDING
      ) || []),
      ...(currentUser?.collabSend?.filter(
        (collab) => collab.status === CollaboratorStatus.IS_PENDING
      ) || []),
    ]);
  }

  useEffect(() => {
    getCollaborators();
  }, [currentUser]);

  return (
    <>
      <DrawerMotion isOpen={isOpen} onClose={onClose} title={t('user:title')}>
        <Content className={className}>
          <Col className='gap-4'>
            <Col className='gap-1'>
              <H2>{t('user:detail.title')}</H2>
              <Col className='gap-2'>
                <Avatar size={80} user={currentUser} />
                <Row className='gap-2 bg-background rounded-md px-3 py-2 w-full'>
                  <Col>
                    <Label>{t('fields:userName.label')}</Label>
                    <Text $empty={!currentUser?.userName}>
                      {currentUser?.userName}
                    </Text>
                  </Col>
                </Row>
              </Col>
            </Col>
            <Col className='gap-4'>
              <Col className='gap-2'>
                <Row className='w-full items-end gap-2'>
                  <H2>{t('user:detail.collaborators.title')}</H2>
                  <P14 className='text-primary/90 -translate-y-1'>
                    {`(${t('generics.fullAccess')})`}
                  </P14>
                </Row>
                <div className='grid grid-cols-3 gap-2'>
                  {collaborators &&
                    collaborators
                      .filter((e) => e.type === CollaboratorType.FULL_ACCESS)
                      ?.map((collab) => (
                        <Col
                          className='bg-background relative p-2 rounded-lg items-center justify-center w-full h-25'
                          key={collab?.id}
                          onClick={() => {
                            router.push(ROUTES.users.detail(collab.id));
                            setDrawerOpen(undefined);
                          }}
                        >
                          <Avatar
                            size={35}
                            user={collab?.collaborator || collab.sender}
                          />
                          <P14 className='text-center mt-1'>
                            {collab?.collaborator?.userName ||
                              collab.sender.userName}
                          </P14>
                          <Row className='justify-end w-full items-center mt-1 gap-1'>
                            <P12 className='text-primary/80'>
                              {t('generics.seeMore')}
                            </P12>
                            <ArrowRight className='text-primary/80' size={15} />
                          </Row>
                        </Col>
                      ))}
                  <Col
                    onClick={() => {
                      setTypeSelected(CollaboratorType.FULL_ACCESS);
                      setIsAddCollab(true);
                    }}
                    className='bg-background p-2 rounded-lg items-center w-full justify-center h-25 text-muted-foreground'
                  >
                    <PlusIcon />
                  </Col>
                </div>
              </Col>
              <Col className='gap-2'>
                <Row className='w-full items-end gap-2'>
                  <H2>{t('user:detail.friends.title')}</H2>
                  <P14 className='text-primary/90 -translate-y-1'>
                    {`(${t('generics.readOnly')})`}
                  </P14>
                </Row>
                <div className='grid grid-cols-3 gap-2'>
                  {collaborators &&
                    collaborators
                      .filter((e) => e.type === CollaboratorType.READ_ONLY)
                      ?.map((collab) => (
                        <Col
                          className='bg-background relative p-2 rounded-lg items-center justify-center w-full h-25'
                          key={collab?.id}
                          onClick={() => {
                            router.push(ROUTES.users.detail(collab.id));
                            setDrawerOpen(undefined);
                          }}
                        >
                          <Avatar
                            size={35}
                            user={collab?.collaborator || collab.sender}
                          />
                          <P14 className='text-center mt-1'>
                            {collab?.collaborator?.userName ||
                              collab.sender.userName}
                          </P14>
                          <Row className='justify-end w-full items-center mt-1 gap-1'>
                            <P12 className='text-primary/80'>
                              {t('generics.seeMore')}
                            </P12>
                            <ArrowRight className='text-primary/80' size={15} />
                          </Row>
                        </Col>
                      ))}
                  <Col
                    onClick={() => {
                      setTypeSelected(CollaboratorType.READ_ONLY);
                      setIsAddCollab(true);
                    }}
                    className='bg-background p-2 rounded-lg items-center w-full justify-center h-25 text-muted-foreground'
                  >
                    <PlusIcon />
                  </Col>
                </div>
              </Col>
              {collabPending.length > 0 && (
                <Col className='gap-2'>
                  <H2>{t('user:detail.collaborators.pending')}</H2>
                  <Col className='gap-1'>
                    {collabPending.map((collab) => (
                      <RowBetween
                        className='bg-background p-2 rounded-lg items-center w-full justify-between'
                        key={collab.id}
                      >
                        <Row className='gap-2 items-center'>
                          <Avatar
                            size={35}
                            user={collab.sender || currentUser}
                          />
                          <P14>
                            {collab?.sender?.userName || currentUser?.userName}
                          </P14>
                        </Row>
                        {collab.collaborator ? (
                          <Row className='gap-2 items-center'>
                            <P10 className='text-primary/80'>
                              {t('user:detail.collaborators.pending')}
                            </P10>

                            <Trash2Icon
                              size={17}
                              className='text-muted-foreground'
                              onClick={() => {
                                removeCollab({ id: collab.id });
                              }}
                            />
                          </Row>
                        ) : (
                          <Row className='gap-2 items-center'>
                            <P12
                              onClick={() => {
                                removeCollab({ id: collab.id });
                              }}
                              className='bg-primary text-background rounded px-2 py-1'
                            >
                              {t('generics.refuse')}
                            </P12>
                            <DialogModal
                              button={
                                <P12 className='bg-primary text-background rounded px-2 py-1'>
                                  {t('generics.accept')}
                                </P12>
                              }
                              title={t(
                                'user:detail.collaborators.accept.title'
                              )}
                              description={
                                collab.type === CollaboratorType.FULL_ACCESS
                                  ? t(
                                      'user:detail.collaborators.accept.fullAccess'
                                    )
                                  : t(
                                      'user:detail.collaborators.accept.readOnly'
                                    )
                              }
                              onAccept={() => {
                                acceptCollab({ id: collab.id });
                              }}
                              onRefuse={() => {
                                removeCollab({ id: collab.id });
                              }}
                            />
                          </Row>
                        )}
                      </RowBetween>
                    ))}
                  </Col>
                </Col>
              )}
            </Col>
          </Col>
          <Button
            className='w-full  mt-10 '
            onClick={() => setDrawerOpen(DrawerType.UPDATE_USER)}
          >
            <Edit size={20} className='mr-2' />
            {t('generics.edit')}
          </Button>
          <Button
            className='w-full mt-2'
            onClick={() => handleLogout()}
            isLoading={isLoading}
            variant={'destructive'}
          >
            <LogOutIcon size={20} className='mr-2' />
            {t('generics.logout')}
          </Button>
        </Content>
      </DrawerMotion>
      <DrawerAddCollab
        isOpen={isAddCollab}
        onClose={() => setIsAddCollab(false)}
        type={typeSelected}
      />
    </>
  );
}

const Content = tw(Col)`
  px-5
  pb-10
  justify-between
  items-between
`;

const Label = tw(P14)`
  font-semibold
`;

const Text = tw(P14)<{ $empty?: boolean }>`
  ${(props) => props.$empty && 'text-primary/50'}
`;

const Place = tw.div`
  bg-background
  rounded
  px-3
  py-1
  w-fit
`;
