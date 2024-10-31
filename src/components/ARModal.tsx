import { useEffect, useMemo, useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './ui/dialog';
import { Button } from './ui/button';
import { type ARCommand } from './NftAssetLinker';
import {
  useGetARTM,
  useGetTransaction,
  useSignAndSubmitTransaction,
} from '@futureverse/asset-register-react/v2';
import { useAuth } from '@futureverse/auth-react';
import { cn } from '@/lib/utils';

type ModalProps = {
  operations: Array<ARCommand>;
  setShowModal: (show: boolean) => void;
  successCallBack?: () => void;
};

export default function ARModal({
  operations,
  setShowModal,
  successCallBack,
}: ModalProps) {
  const { userSession } = useAuth();
  const [callBackCalled, setCallBackCalled] = useState(false);

  const operationsText = useMemo(() => {
    return JSON.stringify(operations, null, 2);
  }, [operations]);

  const {
    reactQuery: { refetch: getARTM },
  } = useGetARTM(
    {
      address: userSession?.eoa ?? '',
      operations,
    },
    { enabled: false }
  );

  const { submitAsync, transaction } = useSignAndSubmitTransaction();

  const submitARTM = async () => {
    const { data: artm } = await getARTM();
    if (!artm) {
      return;
    }

    return submitAsync({ artm, check: false });
  };

  const txDataComplete = useGetTransaction(
    { transactionHash: transaction },
    {
      refetchInterval: query => {
        return query.state.data?.status === 'PENDING' ? 2000 : false;
      },
    }
  );

  useEffect(() => {
    if (
      txDataComplete?.reactQuery?.data?.status === 'SUCCESS' &&
      callBackCalled === false
    ) {
      successCallBack?.();
      setCallBackCalled(true);
    }
  }, [txDataComplete?.reactQuery?.data, successCallBack, callBackCalled]);

  return (
    <Dialog
      open={true}
      defaultOpen={true}
      onOpenChange={() => setShowModal(false)}
    >
      <DialogContent
        className="max-w-[450px] p-6 w-[90vw] border-white"
        onInteractOutside={e => {
          e.preventDefault();
        }}
      >
        <DialogHeader>
          <DialogTitle className="text-md -mb-2">Check The Changes</DialogTitle>
        </DialogHeader>
        <div className="flex flex-col gap-4">
          {txDataComplete?.reactQuery?.data?.status !== 'SUCCESS' && (
            <div className="w-full">
              <div className="w-full bg-foreground text-background font-mono text-xs p-2 rounded-lg break-all">
                <pre className="overflow-scroll max-h-[20dvh] max-w-[275px] md:max-w-none">
                  {operationsText}
                </pre>
              </div>
            </div>
          )}
          {!transaction && (
            <Button onClick={() => submitARTM()}>Save Changes</Button>
          )}
          {transaction && (
            <div className="w-full">
              <div className="w-full text-xs">TRANSACTION ID</div>
              <div className="w-full bg-foreground text-background font-mono text-xs p-2 rounded-lg break-all">
                {transaction}
              </div>
            </div>
          )}
          {txDataComplete?.reactQuery?.data && (
            <div className="w-full">
              <div
                className={cn(
                  `w-full font-mono text-xs p-2 rounded-lg break-all`,
                  `${txDataComplete?.reactQuery?.data?.status === 'PENDING' ? 'animate-pulse' : txDataComplete?.reactQuery?.data?.status === 'SUCCESS' ? 'bg-green-400 text-background' : 'bg-red-600 text-white'}`
                )}
              >
                {txDataComplete?.reactQuery?.data?.status}
              </div>
            </div>
          )}
          {txDataComplete?.reactQuery?.data?.status === 'FAILED' && (
            <div className="w-full">
              <div
                className={
                  'w-full font-mono text-xs p-2 rounded-lg break-all bg-red-600 text-white'
                }
              >
                {txDataComplete?.reactQuery?.data?.error?.message}
              </div>
            </div>
          )}

          {txDataComplete?.reactQuery?.data &&
            txDataComplete?.reactQuery?.data?.status !== 'PENDING' && (
              <Button
                onClick={() => {
                  setShowModal(false);
                }}
              >
                Close
              </Button>
            )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
