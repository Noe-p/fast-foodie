import { ImageFullScreen } from '@/components';
import { DrawerMotion } from '@/components/Drawer';
import { Col, Row } from '@/components/Helpers';
import { H2, P18 } from '@/components/Texts';
import { Badge } from '@/components/ui/badge';
import { useAppContext } from '@/contexts';
import { ApiService } from '@/services/api';
import { DishStatus } from '@/types';
import { ChefHatIcon, EyeIcon, EyeOffIcon } from 'lucide-react';
import { useTranslation } from 'next-i18next';
import { useState } from 'react';
import styled from 'styled-components';
import tw from 'tailwind-styled-components';


interface DrawerDetailDishProps {
  className?: string;
  isOpen: boolean;
  onClose: () => void;
}

export function DrawerDetailDish(props: DrawerDetailDishProps): JSX.Element {
  const { className, isOpen, onClose } = props;
  const { t } = useTranslation();
  const { setDrawerOpen, currentDish, setCurrentDish } = useAppContext();
  const [ isLoading, setIsLoading ] = useState<boolean>(false);
  const [isImageFullScreenOpen, setIsImageFullScreenOpen] = useState<boolean>(false);


  async function handleDelete() {
    if (!currentDish) return;
    setIsLoading(true);
    await ApiService.dishes.remove(currentDish.id);
    setCurrentDish(undefined);
    onClose();
    setIsLoading(false);
  }

  return !currentDish ? <></> : (
    <>
      <DrawerMotion className='text_background' isOpen={isOpen} onClose={onClose} title={currentDish.name}>
        <Content className={className}>
          <Row className='flex-wrap gap-2'>
          {currentDish?.tags?.map((tag) => <Badge
                variant={'outline'}
                key={tag}
              >
                {tag}
            </Badge>
          )}
          {currentDish.chef && <Badge
                className='flex items-center gap-1'
                variant={'outline'}
              >
                <ChefHatIcon size={15} />
                {currentDish.chef.userName}
            </Badge>
          }
          <Badge
                className='flex items-center gap-1'
                variant={'outline'}
              >
                {currentDish.status === DishStatus.PRIVATE ? <EyeOffIcon size={15} /> : <EyeIcon size={15} />}
          </Badge>
          </Row>
          <Grid2>
            <TextContainer>
            <H2 className='text-center'>{'Ingrédients'}</H2>
            <ul className='mt-2 list-disc'>
              {currentDish.ingredients.map((ingredient)=> 
                <li className='gap-2 text-[18px] ml-4 font-main' key={ingredient.id}>
                  {ingredient.quantity}{' '}{ingredient.food.name}
                </li>
              )}
            </ul>
            </TextContainer>
            {currentDish.images[0] && <Image
              onClick={() => setIsImageFullScreenOpen(true)}
              src={currentDish.images[0].url}
            />}
          </Grid2>
          <Col className='mt-5'>
            <TextContainer className=''>
            <H2 className='text-center'>{'Instructions'}</H2>
            <Col className='mt-2'>
              {currentDish.instructions  && <Main className='' dangerouslySetInnerHTML={{ __html: currentDish.instructions }}/>}
            </Col>
            </TextContainer>
          </Col>
        </Content>
      </DrawerMotion>
      <ImageFullScreen
        startIndex={0}
        images={currentDish.images.map((image)=> image.url)}
        isOpen={isImageFullScreenOpen}
        onClose={() => setIsImageFullScreenOpen(false)}
      />
    </>
  );
}

const Content = tw(Col)`
  px-3
  pb-10
`;

const Grid2 = tw.div`
  grid
  grid-cols-2
  gap-4
  mt-4
`;

const Image = tw.img`
  w-full
  h-60
  object-cover
  rounded-lg
  p-2
  bg-background
  shadow-lg
`;

const TextContainer = tw(Col)`
  
`

const Text = tw(P18)`
  font-main
  font-bold
`

const Main = styled.div`
  ${() => WysiwygRenderStyle}
`;

// * Use these style to render the Wysiwyg content in the same way as it will be rendered in the
// * Wysiwyg + add 'ql-editor' class to the html content div to inherit list styles from 'react-quill' css
export const WysiwygRenderStyle = `
  --primary: hsl(218.03 56.8% 24.51%);
  padding: 0px;
  overflow-x: hidden;
  width: 100%;
  text-align: justify;
  font-size: 15px;

  a {
    color: var(--primary);
    &:hover {
      color: var(--primary);
    }
  }

  h1 {
    font-size : 25px;
    margin-bottom: 2px;
  }

  h2 {
    font-size : 20px;
    margin-bottom: 2px;
  }

  strong {
    font-weight: bold
  }

  blockquote {
    border-left: 4px solid var(--primary);
    margin-bottom: 5px;
    margin-top: 5px;
    padding-left: 12px;
  }

  // * Code block
  pre.ql-syntax {
    background-color: #101828;
    border-radius: 4px;
    padding: 0.5rem;
    margin: 0.5rem 0;
    color: #cacaca;
  }

  ol,
  ul, li {
    padding-left: 20px;
    list-style: round; 
    maring-bottom: 10px;
  }

  li {
    
  }
`;
