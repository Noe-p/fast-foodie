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
                  <Row className='gap-2.5 flex-1'>
                    {!!icon && <IconContainer>{icon}</IconContainer>}
                    <Title>{title}</Title>
                  </Row>
                  <CloseIcon onClick={props.onClose} />
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
  bg-background/50
  flex
  justify-end
  items-end
`;

const DrawerContainer = tw(motion.div)`
  flex
  flex-col
  md:bg-primary
  backdrop-blur-sm 
  text-primary md:text-background
  group/drawerBase
  md:h-screen
  overflow-hidden
  absolute md:relative
  top-0
  right-0
  bottom-0
  left-0
  pt-0 md:pt-0

`;

const CloseIcon = tw(X)`
  min-w-4
  min-h-4
  cursor-pointer
  ml-2
  text-primary-foreground
`;

const IconContainer = styled.div`
  width: 34px;
  height: 34px;
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
  overflow-y-scroll
  hide-scrollbar
`;

const Header = tw(Col)`
  px-6
  absolute
  justify-center
  w-full
  top-0
  left-0
  z-10
  h-20
  bg-primary
`;

const DrawerChildren = tw(Col)`
  h-full
  overflow-y-auto
  mt-25
`;

const Divider = tw.div`
  divider
  m-0
  h-px
`;
