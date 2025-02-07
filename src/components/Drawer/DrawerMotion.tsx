/* eslint-disable @typescript-eslint/no-explicit-any */
import { DRAWER_VARIANTS } from '@/services/motion';
import { MEDIA_QUERIES } from '@/static/constants';
import { AnimatePresence, motion } from 'framer-motion';
import { X } from 'lucide-react';
import { ReactNode, useMemo } from 'react';
import styled from 'styled-components';
import tw from 'tailwind-styled-components';
import { useEventListener, useMediaQuery } from 'usehooks-ts';
import { Col, Row, RowBetween } from '../Helpers';
import { H2 } from '../Texts/Texts';

export type DrawerPlacement = 'right' | 'bottom';

export interface DrawerMotionProps {
  isOpen: boolean;
  children?: React.ReactNode;
  onClose?: () => void;
  className?: string;
  shouldCloseOnOverlayClick?: boolean;
  shouldCloseOnEsc?: boolean;
  placement?: DrawerPlacement;
  width?: number | string;
  zIndex?: number;
  //
  title?: ReactNode;
  icon?: ReactNode;
  containerClassName?: string;
  headerClassName?: string;
}

export const DrawerMotion = (props: DrawerMotionProps) => {
  const {
    isOpen,
    onClose,
    children,
    headerClassName,
    className,
    shouldCloseOnOverlayClick = true,
    shouldCloseOnEsc = true,
    placement,
    width = 500,
    title,
    icon,
    containerClassName,
    zIndex = 50,
  } = props;
  const isSmBreakpoint = useMediaQuery(MEDIA_QUERIES.MD);

  const defaultPlacement = useMemo(() => {
    if (placement) return placement;
    return !isSmBreakpoint ? 'bottom' : 'right';
  }, [placement, isSmBreakpoint]);

  const defaultWidth = useMemo(() => {
    if (defaultPlacement === 'bottom') return '100vw';
    if (defaultPlacement === 'right') return width;
    return '100vw';
  }, [width, defaultPlacement]);

  useEventListener('keydown', (e) => {
    if (e.key === 'Escape' && shouldCloseOnEsc) onClose?.();
  });

  return (
    <AnimatePresence initial={false} mode='wait'>
      {isOpen && (
        <Overlay
          onClick={shouldCloseOnOverlayClick ? onClose : undefined}
          initial={{
            opacity: 0,
          }}
          animate={{
            opacity: 1,
          }}
          style={{ zIndex: zIndex - 1 }}
        >
          <DrawerContainer
            onClick={(e: any) => e.stopPropagation()}
            className={className}
            style={{ width: defaultWidth, zIndex }}
            variants={DRAWER_VARIANTS[defaultPlacement]}
            initial='hidden'
            animate='visible'
            exit='exit'
          >
            <DrawerContent>
              <Header className={headerClassName}>
                <RowBetween>
                  <Row className='flex-1'>
                    <Title className='leading-none'>{title}</Title>
                  </Row>
                  <Row className='gap-2 items-center'>
                    {!!icon && <IconContainer>{icon}</IconContainer>}
                    <CloseIcon size={20} onClick={props.onClose} />
                  </Row>
                </RowBetween>
              </Header>
              <Divider />
              <DrawerChildren className={containerClassName}>
                {children}
              </DrawerChildren>
            </DrawerContent>
          </DrawerContainer>
        </Overlay>
      )}
    </AnimatePresence>
  );
};

const Overlay = tw(motion.div)`
  fixed
  inset-0
  bg-background/10
  backdrop-filter
  backdrop-blur-sm
  flex
  justify-end
  items-end
`;

const DrawerContainer = tw(motion.div)`
  flex
  flex-col
  backdrop-blur-sm 
  text-primary
  group/drawerBase
  overflow-hidden
  absolute
  top-0
  right-0
  bottom-0
  left-0
  mt-20
  rounded-t-2xl
  lain_background
`;

const CloseIcon = tw(X)`
  min-w-4
  min-h-4
  cursor-pointer
  ml-2
  text-primary-foreground
`;

const IconContainer = styled.div`
  width: 20px;
  height: 20px;
  svg {
    width: 100%;
    height: 100%;
  }
`;

const Title = tw(H2)`
  text-left
  text-primary-foreground
`;

const DrawerContent = tw(Col)`
  w-full
  h-full
  relative
`;

const Header = tw(Col)`
  px-6
  absolute
  justify-center
  w-full
  top-0
  left-0
  z-10
  h-15
  bg-primary
  rounded-t-2xl
  overflow-hidden
`;

const DrawerChildren = tw(Col)`
  h-full
  overflow-y-scroll
  mt-15
  pt-5
  mb-5
`;

const Divider = tw.div`
  divider
  m-0
  h-px
`;
