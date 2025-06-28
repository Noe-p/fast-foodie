'use client';

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
  CarouselNext,
  CarouselPrevious,
  PaginationDot,
  useDotButton,
} from '../ui/carousel';
import { ImageLoader } from './ImageLoader';

interface ImageFullScreenProps {
  images: string[];
  className?: string;
  isOpen: boolean;
  onClose: () => void;
  startIndex?: number;
  onLastImageShown?: () => void;
  projectName?: string;
}

export function ImageFullScreen(props: ImageFullScreenProps): JSX.Element {
  const {
    images,
    className,
    onClose,
    isOpen,
    startIndex = 0,
    onLastImageShown,
    projectName,
  } = props;

  const [api, setApi] = useState<CarouselApi>();
  const [currentIndex, setCurrentIndex] = useState(startIndex);
  const { selectedIndex, scrollSnaps, onDotButtonClick } = useDotButton(api);

  function isLastImageShown(index: number): boolean {
    return index === images.length - 1;
  }

  // Réinitialiser l'index quand la galerie s'ouvre
  useEffect(() => {
    if (isOpen) {
      setCurrentIndex(startIndex);
    }
  }, [isOpen, startIndex]);

  // Précharger les images adjacentes
  useEffect(() => {
    const preloadImages = () => {
      const nextIndex = (currentIndex + 1) % images.length;
      const prevIndex =
        currentIndex === 0 ? images.length - 1 : currentIndex - 1;

      const preloadImage = (src: string) => {
        const img = new window.Image();
        img.src = src;
      };

      preloadImage(images[nextIndex]);
      preloadImage(images[prevIndex]);
    };

    if (isOpen && images.length > 0) {
      preloadImages();
    }
  }, [currentIndex, images, isOpen]);

  useEffect(() => {
    if (!api) return;
    setCurrentIndex(api.selectedScrollSnap());
    api.on('select', () => {
      const newIndex = api.selectedScrollSnap();
      setCurrentIndex(newIndex);
    });
    return () => {
      api.off('select', () => {
        setCurrentIndex(api.selectedScrollSnap());
      });
    };
  }, [api, currentIndex]);

  useEffect(() => {
    isLastImageShown(currentIndex) && onLastImageShown?.();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentIndex]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!api) return;

    if (e.key === 'ArrowLeft') {
      api.scrollPrev();
    }
    if (e.key === 'ArrowRight') {
      api.scrollNext();
    }
    if (e.key === 'Escape') {
      onClose();
    }
  };

  const handleClose = () => {
    onClose();
  };

  return (
    <AnimatePresence initial={false} mode='wait'>
      {isOpen && (
        <Main
          variants={DRAWER_VARIANTS['bottom']}
          initial='hidden'
          animate='visible'
          exit='exit'
          className={className}
          onKeyDown={handleKeyDown}
          tabIndex={0}
        >
          {/* Bouton de fermeture */}
          <CloseButton onClick={handleClose} aria-label='Fermer la galerie'>
            <X className='h-6 w-6' />
          </CloseButton>

          {/* Carousel principal */}
          <Carousel
            opts={{
              startIndex,
              loop: true,
            }}
            setApi={setApi}
            className='w-full h-full max-w-7xl max-h-[80vh]'
          >
            <CarouselContent>
              {images.map((image, index) => (
                <CarouselItem key={image} className='h-[80vh]'>
                  <div className='relative w-full h-full flex items-center justify-center p-4'>
                    <ImageLoader
                      src={image}
                      alt={`Image ${index + 1} sur ${images.length}`}
                      width={800}
                      height={600}
                      className='max-w-full max-h-full object-contain'
                      priority={index === startIndex}
                      quality={90}
                      showProgress={true}
                      fallbackSrc='/images/image-fallback.jpg'
                      overlayClassName='bg-black'
                      onLoadComplete={() => {
                        // Optionnel : callback quand l'image est chargée
                      }}
                      onError={() => {
                        // Optionnel : callback en cas d'erreur
                      }}
                    />
                  </div>
                </CarouselItem>
              ))}
            </CarouselContent>

            {/* Boutons de navigation */}
            <CarouselPrevious className='left-4 bg-black/30 text-white border-white/20' />
            <CarouselNext className='right-4 bg-black/30 text-white border-white/20' />
          </Carousel>

          {/* Indicateurs de position */}
          <PaginationContainer>
            {scrollSnaps.map((snap, index) => (
              <PaginationDot
                key={snap}
                onClick={() => onDotButtonClick(index)}
                $isActive={index === selectedIndex}
                aria-label={`Aller à l'image ${index + 1}`}
                aria-current={index === selectedIndex}
              />
            ))}
          </PaginationContainer>

          {/* Compteur d'images */}
          <ImageCounter>
            {currentIndex + 1} / {images.length}
          </ImageCounter>
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
  flex-col
  justify-center
  items-center
  bg-black/90
  backdrop-blur-sm
  focus:outline-none
`;

const CloseButton = tw(Button)`
  absolute
  top-4
  right-4
  z-50
  h-12
  w-12
  rounded-full
  bg-black/30
  hover:bg-black/50
  text-white
  hover:text-white
  border-white/20
  hover:border-white/40
  transition-all
  duration-300
  ease-in-out
  hover:scale-105
  focus:outline-none
  focus:ring-0
`;

const PaginationContainer = tw.div`
  flex
  gap-2
  absolute
  bottom-25
  left-1/2
  transform
  -translate-x-1/2
  bg-black/30
  px-4
  py-2
  rounded-full
  backdrop-blur-sm
  z-50
`;

const ImageCounter = tw.div`
  absolute
  top-4
  left-4
  bg-black/30
  text-white
  px-3
  py-1
  rounded-full
  text-sm
  font-medium
  backdrop-blur-sm
  z-50
`;
