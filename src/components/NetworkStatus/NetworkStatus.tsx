import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import tw from 'tailwind-styled-components';

export function NetworkStatus(): React.JSX.Element | null {
  const [isOnline, setIsOnline] = useState(true);
  const { t } = useTranslation();

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    // Vérifier l'état initial
    setIsOnline(navigator.onLine);

    // Écouter les changements d'état réseau
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Ne rien afficher si en ligne
  if (isOnline) return null;

  return (
    <StatusContainer>
      <StatusIcon>
        <svg
          width='12'
          height='12'
          viewBox='0 0 24 24'
          fill='none'
          stroke='currentColor'
          strokeWidth='2'
          strokeLinecap='round'
          strokeLinejoin='round'
        >
          <line x1='1' y1='1' x2='23' y2='23' />
          <path d='M16.72 11.06A10.94 10.94 0 0 1 19 12.55' />
          <path d='M5 12.55a10.94 10.94 0 0 1 5.17-2.39' />
          <path d='M10.71 5.05A16 16 0 0 1 22.58 9' />
          <path d='M1.42 9a15.91 15.91 0 0 1 4.7-2.88' />
          <path d='M8.53 16.11a6 6 0 0 1 6.95 0' />
          <line x1='12' y1='20' x2='12.01' y2='20' />
        </svg>
      </StatusIcon>
      <StatusText>{t('offline')}</StatusText>
    </StatusContainer>
  );
}

const StatusContainer = tw.div`
  fixed
  top-2
  left-2
  z-40
  flex
  items-center
  gap-1
  bg-red-500
  bg-opacity-80
  text-white
  px-2
  py-1
  rounded-md
  shadow-sm
  text-xs
`;

const StatusIcon = tw.div`
  flex
  items-center
  justify-center
`;

const StatusText = tw.span`
  text-xs
  font-normal
`;
