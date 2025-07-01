import { AnimatePresence, motion } from 'framer-motion';
import { useEffect, useState } from 'react';
import tw from 'tailwind-styled-components';
import { Progress } from '../ui/progress';

interface PageProgressBarProps {
  isLoading?: boolean;
  className?: string;
}

export function PageProgressBar(props: PageProgressBarProps): JSX.Element {
  const { isLoading = false, className } = props;
  const [progress, setProgress] = useState(0);
  const [show, setShow] = useState(false);

  useEffect(() => {
    if (isLoading) {
      setShow(true);
      setProgress(0);

      // Simulation d'une progression
      const interval = setInterval(() => {
        setProgress((prev) => {
          if (prev >= 90) return prev;
          return prev + Math.random() * 15;
        });
      }, 200);

      return () => clearInterval(interval);
    } else {
      setProgress(100);
      // Masquer la barre après un court délai
      const timer = setTimeout(() => setShow(false), 300);
      return () => clearTimeout(timer);
    }
  }, [isLoading]);

  return (
    <AnimatePresence>
      {show && (
        <ProgressBarContainer
          initial={{ opacity: 0, y: -2 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -2 }}
          transition={{ duration: 0.2 }}
          className={className}
        >
          <Progress
            value={progress}
            className='h-1 w-full rounded-none bg-transparent'
          />
        </ProgressBarContainer>
      )}
    </AnimatePresence>
  );
}

const ProgressBarContainer = tw(motion.div)`
  fixed
  top-0
  left-0
  right-0
  z-50
  bg-transparent
`;
