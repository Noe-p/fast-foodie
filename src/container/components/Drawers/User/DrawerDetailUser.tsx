import { Avatar, DialogModal, ModalRemove } from '@/components';
import { DrawerMotion } from '@/components/Drawer';
import { Col, Row, RowBetween } from '@/components/Helpers';
import { H2, P10, P12, P14 } from '@/components/Texts';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import {
  DrawerType,
  useAppContext,
  useAuthContext,
  useDishContext,
} from '@/contexts';
import { ApiService } from '@/services/api';
import { CollaboratorDto, CollaboratorStatus, CollaboratorType } from '@/types';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Edit, Loader2, LogOutIcon, PlusIcon, Trash2Icon } from 'lucide-react';
import { useTranslation } from 'next-i18next';
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
  const { clearData, refresh } = useDishContext();
  const { toast } = useToast();
  const [isAddCollab, setIsAddCollab] = useState<boolean>(false);
  const [collaborators, setCollaborators] = useState<CollaboratorDto[]>([]);
  const [collabPending, setCollabPending] = useState<CollaboratorDto[]>([]);
  const queryClient = useQueryClient();

  async function handleLogout() {
    setIsLoading(true);
    removeToken();
    onClose();
    setIsLoading(false);
    clearData();
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
      <DrawerMotion
        className='relative h-min'
        isOpen={isOpen}
        onClose={onClose}
        title={t('user:title')}
      >
        <Content className={className}>
          <Col className='gap-4'>
            <Col className='gap-1'>
              <H2>{t('user:detail.title')}</H2>
              <Col className='gap-2'>
                {currentUser?.profilePicture && (
                  <img
                    src={currentUser?.profilePicture?.url}
                    alt={currentUser?.userName}
                    className='w-20 h-20 border border-primary rounded-full object-cover'
                  />
                )}
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
                <H2>{t('user:detail.collaborators.title')}</H2>
                <div className='grid grid-cols-3 gap-2'>
                  {collaborators &&
                    collaborators
                      .filter((e) => e)
                      ?.map((collab) => (
                        <Col
                          className='bg-background relative p-2 rounded-lg items-center justify-center w-full h-30'
                          key={collab?.id}
                        >
                          <Avatar
                            size={35}
                            user={collab?.collaborator || collab.sender}
                          />
                          <P14 className='text-center mt-1'>
                            {collab?.collaborator?.userName ||
                              collab.sender.userName}
                          </P14>
                          <P12 className='text-center text-primary/80'>
                            {collab.type === CollaboratorType.FULL_ACCESS
                              ? t('generics.fullAccess')
                              : t('generics.readOnly')}
                          </P12>
                          <Row className='justify-end w-full mt-1'>
                            <ModalRemove
                              icon={
                                isPending ? (
                                  <Loader2 className='w-6 h-6 animate-spin' />
                                ) : (
                                  <Trash2Icon
                                    size={17}
                                    className='text-muted-foreground'
                                  />
                                )
                              }
                              onRemove={() => {
                                removeCollab({ id: collab.id });
                              }}
                            />
                          </Row>
                        </Col>
                      ))}
                  <Col
                    onClick={() => setIsAddCollab(true)}
                    className='bg-background p-2 rounded-lg items-center w-full justify-center h-30 text-muted-foreground'
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
