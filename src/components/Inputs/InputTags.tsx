import { ApiService } from '@/services/api';
import { useQuery } from '@tanstack/react-query';
import { PlusIcon } from 'lucide-react';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import tw from 'tailwind-styled-components';
import { DrawerMotion } from '../Drawer';
import { Col, Row } from '../Helpers';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { Input } from '../ui/input'; // Assumez que ce composant existe pour styliser l'input

interface InputTagsProps {
  tags?: string[];
  onChange: (tags: string[]) => void;
}

export function InputTags(props: InputTagsProps): JSX.Element {
  const { tags, onChange } = props;
  const { t } = useTranslation();
  const [addOpen, setAddOpen] = useState(false);
  const [newTag, setNewTag] = useState('');

  const {
    data: tagsAlreadyExist,
  } = useQuery({
    queryKey: ['getTags'],
    queryFn: ApiService.dishes.getTags,
    refetchOnWindowFocus: true,
  });

  if (!tags || !tagsAlreadyExist) return <></>;

  const handleAddTag = () => {
    if (newTag.trim() && !tags.includes(newTag)) {
      onChange([...tags, newTag.trim()]);
      setNewTag('');
      setAddOpen(false);
    }
  };

  return (
    <Main>
      <Row className="items-center gap-1 flex-wrap">
        {[...tagsAlreadyExist, ...tags].filter(
          (tag, index, self) => self.indexOf(tag) === index
        )?.map((tag) => (
          <Badge
            variant={tags?.includes(tag) ? 'active' : 'outline'}
            key={tag}
            onClick={() =>
              tags?.includes(tag)
                ? onChange(tags.filter((t) => t !== tag))
                : onChange([...tags, tag])
            }
          >
            {tag}
          </Badge>
        ))}
        <Badge
          variant="outline"
          className="ml-2"
          onClick={() => setAddOpen(!addOpen)}
        >
          <PlusIcon 
            size={16}
          />
        </Badge>
      </Row>
      <DrawerMotion className='lain_background' isOpen={addOpen} onClose={()=> setAddOpen(false)} title={t('fields:addTag.label')}>
        <DrawerContent>
          <Input
            className='w-full'
            placeholder={t('fields:addTag.placeholder')} 
            onChange={(v) => setNewTag(v.target.value)}
            value={newTag}
          />
          <Button type="button" className='mt-5' onClick={() => handleAddTag()}>
            {t('generics.add')}
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
