import { useCallback, useMemo, useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './ui/dialog';
import type {
  ExtrinsicPayload,
  ExtrinsicResult,
  RootTransactionBuilder,
} from '@futureverse/transact';
import { TransactionPayload } from '@futureverse/transact-react';
import { Button } from './ui/button';
import Spinner from './Spinner';
import useGetUserBalance from '@/hooks/useGetUserBalance';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from './ui/accordion';

type ModalProps = {
  setShow: (show: boolean) => void;
  extrinsicBuilder: RootTransactionBuilder | null;
  toSign: string;
  signedCallback?: () => void;
  resultCallback?: (result: ExtrinsicResult) => void;
  gas: {
    gasFee: string;
    gasString: string;
    tokenDecimals: number;
  };
  payload?: ExtrinsicPayload | null;
  walletAddress: string;
  gasTokenId: number;
};

export default function Modal({
  setShow,
  extrinsicBuilder,
  toSign,
  signedCallback,
  resultCallback,
  gas,
  payload,
  walletAddress,
  gasTokenId,
}: ModalProps) {
  const [signed, setSigned] = useState(false);
  const [, setSent] = useState(false);
  const [result, setResult] = useState<ExtrinsicResult>();
  const [error, setError] = useState<string>();

  const { data: gasTokenUserBalance, isLoading: gasTokenUserBalanceLoading } =
    useGetUserBalance({
      walletAddress: walletAddress ?? '',
      assetId: gasTokenId,
    });

  const onSign = useCallback(() => {
    setSigned(true);

    if (signedCallback) {
      signedCallback();
    }
  }, [setSigned, signedCallback]);

  const onSend = useCallback(() => {
    setSent(true);
  }, [setSent]);

  const signExtrinsic = useCallback(async () => {
    if (toSign && extrinsicBuilder) {
      try {
        const result = await extrinsicBuilder.signAndSend({ onSign, onSend });
        setResult(result as unknown as ExtrinsicResult);
        if (resultCallback) {
          resultCallback(result);
        }
      } catch (e: unknown) {
        console.error(e);
        if (typeof e === 'string') {
          setError(e);
        }
        if (typeof e === 'object' && e instanceof Error) {
          setError(e?.message);
        }
      }
    }
  }, [
    extrinsicBuilder,
    onSend,
    onSign,
    resultCallback,
    setError,
    setResult,
    toSign,
  ]);

  const balanceLowerThanGasFee = useMemo(() => {
    if (gasTokenUserBalanceLoading) {
      return false;
    }
    return BigInt(gasTokenUserBalance?.rawBalance ?? '') <= BigInt(gas.gasFee);
  }, [gasTokenUserBalanceLoading, gasTokenUserBalance, gas.gasFee]);

  return (
    <Dialog open={true} defaultOpen={true} onOpenChange={() => setShow(false)}>
      <DialogContent
        className="max-w-[600px] p-6 w-[90vw] border-white"
        onInteractOutside={e => {
          e.preventDefault();
        }}
      >
        {!signed && !result && !error && (
          <DialogHeader>
            <DialogTitle className="text-md -mb-2">
              Confirm & Sign Transaction
            </DialogTitle>
          </DialogHeader>
        )}
        {result && !error && (
          <DialogHeader>
            <DialogTitle className="text-md -mb-2">
              Tokens Minted Successfully
            </DialogTitle>
          </DialogHeader>
        )}
        <div className="flex flex-col gap-4">
          {!result && !error && !signed && (
            <>
              {toSign && (
                <div className="w-full">
                  <div className="w-full text-sm mb-2 font-bold uppercase text-orange-600 tracking-wider">
                    Transaction Encoded As
                  </div>
                  <div className="w-full bg-foreground text-background font-mono text-xs p-2 rounded-lg break-all">
                    {toSign}
                  </div>
                </div>
              )}
              {payload && (
                <>
                  <div>
                    <div className="w-full max-h-[50vh]">
                      <Accordion type="single" collapsible>
                        <AccordionItem
                          value="tx-data"
                          className="border-none hover:no-underline"
                        >
                          <AccordionTrigger className="justify-start text-start hover:no-underline p-0">
                            <div className="w-full text-sm mb-2 font-bold uppercase text-orange-600 tracking-wider">
                              Expand Transaction Details
                            </div>
                          </AccordionTrigger>
                          <AccordionContent>
                            <TransactionPayload
                              payload={payload.trnPayload}
                              config={{
                                backgroundColor: 'hsl(var(--foreground))',
                                textColor: 'hsl(var(--background))',
                                highlightColor: 'hsl(var(--accent))',
                                borderColor: 'hsl(var(--primary-foreground))',
                              }}
                            />
                          </AccordionContent>
                        </AccordionItem>
                      </Accordion>
                    </div>
                  </div>
                  <div className="w-full grid grid-cols-1 justify-center justify-items-center">
                    <div className="w-full text-sm font-bold uppercase text-orange-600 tracking-wider">
                      Gas Fee
                    </div>
                    <div
                      className={`w-full text-3xl ${
                        balanceLowerThanGasFee ? 'text-red-700 underline' : ''
                      }`}
                    >
                      {gas.gasString}
                    </div>
                  </div>
                  {!signed && (
                    <Button
                      className={`text-lg bg-accent-foreground p-6 text-orange-600 hover:bg-orange-600 hover:text-white transition-colors duration-300 rounded-md col-span-2 w-full ${balanceLowerThanGasFee ? 'cursor-not-allowed' : 'cursor-pointer'}`}
                      onClick={signExtrinsic}
                      disabled={
                        gasTokenUserBalanceLoading ||
                        !gasTokenUserBalance ||
                        balanceLowerThanGasFee
                      }
                    >
                      {balanceLowerThanGasFee
                        ? 'Top Up Funds To Cover Gas'
                        : 'Sign Transaction'}
                    </Button>
                  )}
                </>
              )}
            </>
          )}
          {signed && !result && !error && (
            <div className="grid grid-cols-1 p-8 justify-center justify-items-center w-full">
              <Spinner className="w-36 h-36" />
            </div>
          )}
          {result && (
            <>
              <div className="grid gap-4 mt-2">
                <Button asChild className="bg-orange-500">
                  <a
                    href={`https://porcini.rootscan.io/extrinsic/${result.extrinsicId}`}
                    target="_blank"
                    rel="noreferrer noopener"
                  >
                    View Transaction
                  </a>
                </Button>
              </div>
            </>
          )}
          {error && (
            <div className="grid grid-cols-1 p-2">
              <div className="bg-red-700 p-2 rounded-sm">
                <div className="text-sm font-bold mb-1">
                  There has been an error...
                </div>
                <div className="text-xs">{error}</div>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
