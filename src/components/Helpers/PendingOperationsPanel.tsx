import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { useOnlineStatus } from '@/hooks/useOnlineStatus';
import { usePendingOperationsManager } from '@/hooks/usePendingOperationsManager';
import {
  CheckCircle,
  Clock,
  RefreshCw,
  Trash2,
  Wifi,
  WifiOff,
  XCircle,
} from 'lucide-react';
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';

export const PendingOperationsPanel: React.FC = () => {
  const { t } = useTranslation();
  const { isOnline } = useOnlineStatus();
  const {
    getOperations,
    getPendingCount,
    formatOperation,
    syncAll,
    syncOne,
    removeOperation,
    clearAll,
    canSync,
    isSyncing,
  } = usePendingOperationsManager();

  const [isExpanded, setIsExpanded] = useState(false);
  const pendingCount = getPendingCount();
  const operations = getOperations();

  if (pendingCount === 0) {
    return null;
  }

  const handleSyncAll = async () => {
    await syncAll();
  };

  const handleSyncOne = async (operationId: string) => {
    await syncOne(operationId);
  };

  const handleRemoveOne = (operationId: string) => {
    removeOperation(operationId);
  };

  const handleClearAll = () => {
    clearAll();
  };

  return (
    <div className='fixed bottom-4 right-4 z-50'>
      <Card className='w-80 shadow-lg'>
        <CardHeader className='pb-3'>
          <div className='flex items-center justify-between'>
            <CardTitle className='text-sm font-medium flex items-center gap-2'>
              <Clock className='h-4 w-4' />
              Opérations en attente
              <Badge variant='secondary' className='ml-2'>
                {pendingCount}
              </Badge>
            </CardTitle>
            <div className='flex items-center gap-2'>
              {isOnline ? (
                <Wifi className='h-4 w-4 text-green-500' />
              ) : (
                <WifiOff className='h-4 w-4 text-red-500' />
              )}
              <Button
                variant='ghost'
                size='sm'
                onClick={() => setIsExpanded(!isExpanded)}
                className='h-6 w-6 p-0'
              >
                {isExpanded ? '−' : '+'}
              </Button>
            </div>
          </div>
        </CardHeader>

        {isExpanded && (
          <CardContent className='pt-0'>
            <div className='space-y-3'>
              {/* Actions principales */}
              <div className='flex gap-2'>
                <Button
                  size='sm'
                  onClick={handleSyncAll}
                  disabled={!canSync() || isSyncing}
                  className='flex-1'
                >
                  <RefreshCw
                    className={`h-4 w-4 mr-2 ${
                      isSyncing ? 'animate-spin' : ''
                    }`}
                  />
                  {isSyncing ? 'Synchronisation...' : 'Tout synchroniser'}
                </Button>
                <Button
                  size='sm'
                  variant='outline'
                  onClick={handleClearAll}
                  className='flex-shrink-0'
                >
                  <Trash2 className='h-4 w-4' />
                </Button>
              </div>

              {/* Liste des opérations */}
              <ScrollArea className='h-48'>
                <div className='space-y-2'>
                  {operations.map((operation) => {
                    const formatted = formatOperation(operation);
                    return (
                      <div key={operation.id} className='p-2 border rounded-md'>
                        <div className='flex items-start justify-between gap-2'>
                          <div className='flex-1 min-w-0'>
                            <p className='text-sm font-medium truncate'>
                              {formatted.label}
                            </p>
                            <p className='text-xs text-muted-foreground'>
                              {formatted.timestamp}
                            </p>
                          </div>
                          <div className='flex gap-1'>
                            {isOnline && (
                              <Button
                                size='sm'
                                variant='ghost'
                                onClick={() => handleSyncOne(operation.id)}
                                className='h-6 w-6 p-0'
                                title='Synchroniser'
                              >
                                <CheckCircle className='h-3 w-3' />
                              </Button>
                            )}
                            <Button
                              size='sm'
                              variant='ghost'
                              onClick={() => handleRemoveOne(operation.id)}
                              className='h-6 w-6 p-0 text-red-500'
                              title='Supprimer'
                            >
                              <XCircle className='h-3 w-3' />
                            </Button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </ScrollArea>

              {/* Statut de connexion */}
              <Separator />
              <div className='flex items-center gap-2 text-xs text-muted-foreground'>
                {isOnline ? (
                  <>
                    <Wifi className='h-3 w-3 text-green-500' />
                    <span>En ligne - Synchronisation disponible</span>
                  </>
                ) : (
                  <>
                    <WifiOff className='h-3 w-3 text-red-500' />
                    <span>Hors-ligne - Synchronisation en attente</span>
                  </>
                )}
              </div>
            </div>
          </CardContent>
        )}
      </Card>
    </div>
  );
};
