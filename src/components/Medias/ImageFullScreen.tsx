import { DRAWER_VARIANTS } from '@/services/motion';
import { AnimatePresence, motion } from 'framer-motion';
import { X } from 'lucide-react';
import { useEffect, useState } from 'react';
import tw from 'tailwind-styled-components';
import { Button } from '../ui/button';
import {
  Carousel,
  CarouselApi,
  CarouselContent,
  CarouselItem,
  PaginationDot,
  useDotButton,
} from '../ui/carousel';

interface ImageFullScreenProps {
  images: string[];
  className?: string;
  isOpen: boolean;
  onClose: () => void;
  startIndex?: number;
  onLastImageShown?: () => void;
}

export function ImageFullScreen(props: ImageFullScreenProps): JSX.Element {
  const { images, className, onClose, isOpen, startIndex, onLastImageShown } =
    props;

  const [api, setApi] = useState<CarouselApi>();
  const [currentIndex, setCurrentIndex] = useState(0);

  const { selectedIndex, scrollSnaps, onDotButtonClick } = useDotButton(api);

  function isLastImageShown(index: number): boolean {
    return index === images.length - 1;
  }

  useEffect(() => {
    if (!api) return;
    setCurrentIndex(api.selectedScrollSnap());
    api.on('select', () => {
      setCurrentIndex(api.selectedScrollSnap());
    });
    return () => {
      api.off('select', () => {
        setCurrentIndex(api.selectedScrollSnap());
      });
    };
  }, [api]);

  useEffect(() => {
    isLastImageShown(currentIndex) && onLastImageShown?.();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentIndex]);

  return (
    <AnimatePresence initial={false} mode='wait'>
      {isOpen && (
        <Main
          variants={DRAWER_VARIANTS['bottom']}
          initial='hidden'
          animate='visible'
          exit='exit'
        >
          <CloseButton className='border-white' variant='outline' onClick={onClose}>
            <X className='text-white'/>
          </CloseButton>
          <Carousel
            opts={{
              startIndex,
            }}
            setApi={setApi}
          >
            <CarouselContent>
              {images.map((image) => (
                <CarouselItem key={image}>
                  <Image loading='lazy' src={image} alt='image' />
                </CarouselItem>
              ))}
            </CarouselContent>
            {/* <CarouselPrevious className='left-10' /> */}
            {/* <CarouselNext className='right-10' /> */}
          </Carousel>
          <Pagination>
            {scrollSnaps.map((snap, index) => (
              <PaginationDot
                key={snap}
                onClick={() => onDotButtonClick(index)}
                $isActive={index === selectedIndex}
              />
            ))}
          </Pagination>
        </Main>
      )}
    </AnimatePresence>
  );
}

const Main = tw(motion.div)`
  fixed
  top-0
  left-0
  bottom-0
  right-0
  z-50
  flex
  justify-center
  items-center
  noise backdrop-blur-sm
`;

const CloseButton = tw(Button)`
  absolute
  top-4
  right-4
  z-50
  h-12
  w-12
  rounded-full
  hover:bg-gray-100
  hover:border-gray-500
  transition
  duration-300
  ease-in-out
  hover:scale-105
`;

const Image = tw.img`
  w-full
  h-full
  max-w-screen
  max-h-screen
  object-contain
  object-center
`;

const Pagination = tw.div`
  flex
  gap-2
  absolute
  bottom-5
  transform
  z-50
`;
