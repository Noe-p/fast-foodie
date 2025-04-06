import { useDishContext } from '@/contexts';
import { ApiService } from '@/services/api';
import { useMutation } from '@tanstack/react-query';
import { PlusIcon, Trash2Icon, XIcon } from 'lucide-react';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import tw from 'tailwind-styled-components';
import { DrawerMotion } from '../Drawer';
import { Col, Row, RowBetween } from '../Helpers';
import { ModalRemove } from '../Modal/ModalRemove';
import { P16, P18 } from '../Texts';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { useToast } from '../ui/use-toast';

interface InputTagsProps {
  tags?: string[];
  onChange: (tags: string[]) => void;
}

export function InputTags(props: InputTagsProps): JSX.Element {
  const { tags, onChange } = props;
  const { t } = useTranslation();
  const [addOpen, setAddOpen] = useState(false);
  const { tags: tagsAlreadyExist, refresh } = useDishContext();
  const [newTag, setNewTag] = useState('');
  const { toast } = useToast();

  if (!tags || !tagsAlreadyExist) return <></>;

  const handleAddTag = () => {
    if (newTag.trim() && !tags.includes(newTag)) {
      onChange([...tags, newTag.trim()]);
      setNewTag('');
    }
  };

  const { mutate: remove, isPending } = useMutation({
    mutationFn: (id: string) => ApiService.dishes.deleteTag(id),
    onSuccess: async () => {
      await refresh();
      toast({
        title: t('dishes:tags.removed'),
      });
    },
    onError: (error: any) => {
      toast({
        title: t(error.data.title),
        description: t(error.data.message),
        variant: 'destructive',
      });
    },
  });

  return (
    <Main>
      <Row
        onClick={() => setAddOpen(!addOpen)}
        className='items-center gap-1 flex-wrap'
      >
        {tags.map((tag) => (
          <Badge variant={'active'} key={tag}>
            {tag}
          </Badge>
        ))}
        <Badge variant='outline'>
          <PlusIcon size={16} />
        </Badge>
      </Row>
      <DrawerMotion
        className='h-fit relative'
        isOpen={addOpen}
        onClose={() => setAddOpen(false)}
        title={t('fields:addTag.label')}
      >
        <DrawerContent>
          <P18 className='font-bold'>{t('dishes:tags.title')}</P18>
          <Row className='items-center bg-background px-2 h-10 rounded gap-1 flex-wrap'>
            {tags.map((tag) => (
              <Badge
                onClick={() => onChange(tags.filter((t) => t !== tag))}
                variant={'active'}
                key={tag}
                className='gap-1'
              >
                {tag}
                <XIcon
                  onClick={(e) => {
                    e.stopPropagation();
                    onChange(tags.filter((t) => t !== tag));
                  }}
                  size={14}
                />
              </Badge>
            ))}
          </Row>
          <Row className='items-center gap-2'>
            <Input
              value={newTag}
              className='w-full'
              onChange={(e) => setNewTag(e)}
              placeholder={t('fields:addTag.placeholder')}
            />
            <Button type='button' variant='outline' onClick={handleAddTag}>
              {t('generics.add')}
            </Button>
          </Row>
          {tagsAlreadyExist.filter((tag) => !tags.includes(tag)).length > 0 && (
            <Col>
              <P18 className='mt-3 font-bold'>{t('dishes:tags.list')}</P18>
              <Col className='gap-1 mt-2 max-h-60 overflow-y-auto'>
                {tagsAlreadyExist
                  .filter((tag) => !tags.includes(tag))
                  .map((tag) => (
                    <RowBetween
                      key={tag}
                      className='items-center gap-1 cursor-pointer bg-background rounded p-2'
                      onClick={() => {
                        if (!tags.includes(tag)) {
                          onChange([...tags, tag]);
                        }
                      }}
                    >
                      <P16>{tag}</P16>
                      <ModalRemove
                        icon={
                          <Trash2Icon
                            onClick={(e) => e.stopPropagation()}
                            size={15}
                          />
                        }
                        isPending={isPending}
                        onRemove={() => remove(tag)}
                      />
                    </RowBetween>
                  ))}
              </Col>
            </Col>
          )}
          <Button
            type='button'
            className='mt-5'
            onClick={() => setAddOpen(false)}
          >
            {t('generics.save')}
          </Button>
        </DrawerContent>
      </DrawerMotion>
    </Main>
  );
}

const Main = tw.div`
  w-full
`;

const DrawerContent = tw(Col)`
  px-4
  pb-5
  gap-2
  pt-2
`;
