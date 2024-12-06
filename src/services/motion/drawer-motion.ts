import { DrawerPlacement } from '@/components/Drawer';

const MOTION_DURATION = 0.1;
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const DRAWER_VARIANTS: Record<DrawerPlacement, any> = {
  right: {
    hidden: {
      x: '100vw',
      opacity: 0,
    },
    visible: {
      x: '0',
      opacity: 1,
      transition: {
        duration: MOTION_DURATION,
        type: 'spring',
        damping: 25,
        stiffness: 200,
      },
    },
    exit: {
      x: '100vw',
      transition: {
        duration: 0.5,
      },
    },
  },
  bottom: {
    hidden: {
      y: '100vh',
    },
    visible: {
      y: '0',
      opacity: 1,
      transition: {
        duration: MOTION_DURATION,
        type: 'spring',
        damping: 25,
        stiffness: 200,
      },
    },
    exit: {
      y: '100vh',
      transition: {
        duration: 0.3,
      },
    },
  },
};
