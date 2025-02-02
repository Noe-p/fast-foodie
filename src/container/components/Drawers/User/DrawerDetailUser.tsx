import { Avatar, ModalRemove } from '@/components';
import { DrawerMotion } from '@/components/Drawer';
import { Col, Row } from '@/components/Helpers';
import { H2, P14 } from '@/components/Texts';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import {
  DrawerType,
  useAppContext,
  useAuthContext,
  useDishContext,
} from '@/contexts';
import { ApiService } from '@/services/api';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Edit, Loader2, LogOutIcon, PlusIcon, Trash2Icon } from 'lucide-react';
import { useTranslation } from 'next-i18next';
import { useState } from 'react';
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
      ApiService.users.removeCollaborator(data.id),
    onSuccess: async (data) => {
      await refreshUser();
      onClose();
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
            <Col className='gap-1'>
              <H2>{t('user:detail.collaborators')}</H2>
              <div className='grid grid-cols-3 gap-2'>
                {currentUser?.collaborators?.map((collaborator) => (
                  <Col
                    className='bg-background relative p-2 rounded-lg items-center justify-center w-full h-22'
                    key={collaborator.id}
                  >
                    <Avatar size={35} user={collaborator} />
                    <P14 className='text-center mt-1'>
                      {collaborator.userName}
                    </P14>
                    <Row className='justify-end w-full absolute bottom-2 right-2'>
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
                          removeCollab({ id: collaborator.id });
                        }}
                      />
                    </Row>
                  </Col>
                ))}
                <Col
                  onClick={() => setIsAddCollab(true)}
                  className='bg-background p-2 rounded-lg items-center w-full justify-center h-22 text-muted-foreground'
                >
                  <PlusIcon />
                </Col>
              </div>
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
