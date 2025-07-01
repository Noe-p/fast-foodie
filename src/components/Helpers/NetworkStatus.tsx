import { Badge } from '@/components/ui/badge';
import { useOnlineStatus } from '@/hooks/useOnlineStatus';
import React from 'react';
import { useTranslation } from 'react-i18next';

export const NetworkStatus: React.FC = () => {
  const { isOnline } = useOnlineStatus();
  const { t } = useTranslation();

  if (isOnline) {
    return null; // Ne pas afficher quand en ligne
  }

  return (
    <div className='fixed top-4 right-4 z-50'>
      <Badge variant='destructive' className='animate-pulse'>
        {t('common:offline')}
      </Badge>
    </div>
  );
};
