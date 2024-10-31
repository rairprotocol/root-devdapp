import MintControl from '@/components/MintControl';
import { useGetTokenCount } from '@/hooks/useGetTokenCount';
import { COLLECTION_ID, GAS_TOKENS, shortAddress } from '@/lib/utils';
import { useAuth, useFutureverseSigner } from '@futureverse/auth-react';
import { useCallback, useMemo, useState } from 'react';
import { useTrnApi } from '@futureverse/transact-react';
import {
  type ExtrinsicPayload,
  type RootTransactionBuilder,
  TransactionBuilder,
} from '@futureverse/transact';
import { getAddress, isAddress } from 'viem';
import Modal from '@/components/Modal';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useShouldShowEoa } from '@/hooks/useShouldShowEoa';
import { Label } from '@/components/ui/label';
import { useQueryClient } from '@tanstack/react-query';

export type GasProps = {
  gasString: string;
  gasFee: string;
  tokenDecimals: number;
};
export default function Mint() {
  const queryClient = useQueryClient();
  const shouldShowEoa = useShouldShowEoa();
  const { userSession } = useAuth();
  const signer = useFutureverseSigner();
  const { trnApi } = useTrnApi();

  const [gas, setGas] = useState<GasProps>({
    gasString: '',
    gasFee: '',
    tokenDecimals: 0,
  });

  const [payload, setPayload] = useState<null | ExtrinsicPayload>(null);

  const [walletToPayGas, setWalletToPayGas] = useState<'fpass' | 'eoa'>(
    'fpass'
  );
  const [gasTokenId, setGasTokenId] = useState<number>(2);
  const [toSign, setToSign] = useState<string>('');
  const [currentBuilder, setCurrentBuilder] =
    useState<RootTransactionBuilder | null>(null);

  const { data: fpassTokenCount, isFetching: fpassCountFetching } =
    useGetTokenCount(userSession?.futurepass ?? '', COLLECTION_ID);

  const { data: eoaTokenCount, isFetching: eoaCountFetching } =
    useGetTokenCount(userSession?.eoa ?? '', COLLECTION_ID);

  const isFetching = fpassCountFetching || eoaCountFetching;
  const totalTokenCount = (fpassTokenCount ?? 0) + (eoaTokenCount ?? 0);

  const [mintQty, setMintQty] = useState<number>(1);
  const [showModal, setShowModal] = useState<boolean>(false);

  const handleSetMintQty = (value: number[]) => {
    if (value && Array.isArray(value) && value[0] !== undefined) {
      setMintQty(value[0]);
    }
  };

  const onSuccessfulMint = useCallback(async () => {
    void queryClient.invalidateQueries({ queryKey: ['assets'] });
    void queryClient.invalidateQueries({ queryKey: ['tokens'] });
    void queryClient.invalidateQueries({ queryKey: ['balance'] });
  }, [queryClient]);

  const mintBuilder = useCallback(async () => {
    if (!trnApi || !signer || !userSession) {
      console.log('Missing trnApi, signer or userSession');
      return;
    }

    const addressToSend = getAddress(userSession.futurepass);

    if (isAddress(addressToSend) && parseInt(addressToSend) === 0) {
      throw new Error('Invalid futurepass address');
      // return;
    }

    const getExtrinsic = async (builder: RootTransactionBuilder) => {
      const gasEstimate = await builder?.getGasFees();
      if (gasEstimate) {
        setGas(gasEstimate);
      }
      const payloads = await builder?.getPayloads();
      if (!payloads) {
        return;
      }
      setPayload(payloads);
      const { ethPayload } = payloads;
      setToSign(ethPayload.toString());
    };

    const nft = TransactionBuilder.nft(
      trnApi,
      signer,
      userSession.eoa,
      COLLECTION_ID
    ).mint({
      walletAddress: addressToSend,
      quantity: mintQty,
    });

    if (walletToPayGas === 'fpass') {
      if (gasTokenId === 2) {
        await nft.addFuturePass(userSession.futurepass);
      }

      if (gasTokenId !== 2) {
        await nft.addFuturePassAndFeeProxy({
          futurePass: userSession.futurepass,
          assetId: gasTokenId,
          slippage: 5,
        });
      }
    }

    if (walletToPayGas === 'eoa') {
      if (gasTokenId !== 2) {
        await nft.addFeeProxy({
          assetId: gasTokenId,
          slippage: 5,
        });
      }
    }

    await getExtrinsic(nft);
    setCurrentBuilder(nft);
  }, [trnApi, signer, userSession, mintQty, walletToPayGas, gasTokenId]);

  useMemo(() => {
    setShowModal(!!toSign);
  }, [toSign]);

  return (
    <main className="flex min-h-[calc(100dvh-6rem-1rem)] flex-col items-center justify-center text-white">
      <div className="container grid grid-cols-1 lg:grid-cols-9 gap-8 px-4 items-center ">
        <div className="grid lg:col-span-5 gap-4">
          <div className="w-full">
            <h1 className="text-4xl md:text-5xl lg:text-6xl xl:text-8xl font-bold text-left mb-4">
              How many would you like to mint?
            </h1>
            <div className="text-3xl text-orange-500">
              Mint limited to 10 per person
            </div>
          </div>
          <div className="text-base text-orange-500">
            You currently own {totalTokenCount} tokens
          </div>
        </div>
        <div className="w-full lg:col-span-4 flex justify-end items-center">
          <div className="bg-slate-700 p-4 w-full rounded-lg">
            <MintControl
              mintQty={mintQty}
              handleSetMintQty={handleSetMintQty}
              totalTokenCount={totalTokenCount}
              isFetching={isFetching}
            >
              <div className="grid grid-cols-1 md:grid-cols-5 gap-4 w-full bg-slate-500 bg-opacity-20 p-4 rounded-lg">
                {shouldShowEoa && userSession && (
                  <div className="md:col-span-3">
                    <Label className="text-xs font-bold tracking-wider uppercase">
                      Account To Pay Gas
                    </Label>
                    <Select
                      onValueChange={value =>
                        setWalletToPayGas(value as 'fpass' | 'eoa')
                      }
                      value={walletToPayGas}
                    >
                      <SelectTrigger className="text:base xl:text-xl leading-6 p-4 h-12 mt-1">
                        <SelectValue
                          placeholder="Account To Pay Gas"
                          className="text:base xl:text-lg font-bold"
                        />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="eoa">
                          {shortAddress(userSession?.eoa)}
                        </SelectItem>
                        <SelectItem value="fpass">
                          {shortAddress(userSession?.futurepass)}
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                )}
                <div
                  className={`${!shouldShowEoa ? 'md:col-span-5' : 'md:col-span-2'}`}
                >
                  <Label className="text-xs font-bold tracking-wider uppercase">
                    Gas Token
                  </Label>

                  <Select
                    onValueChange={value => setGasTokenId(parseInt(value))}
                    value={gasTokenId.toString()}
                  >
                    <SelectTrigger className="text:base xl:text-xl leading-6 p-4 h-12 mt-1">
                      <SelectValue
                        placeholder="Select Gas Token"
                        className="text:base xl:text-lg font-bold"
                      />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.keys(GAS_TOKENS).map(key => (
                        <SelectItem
                          key={key}
                          value={GAS_TOKENS[
                            key as keyof typeof GAS_TOKENS
                          ].toString()}
                        >
                          {key}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <button
                  onClick={async () => await mintBuilder()}
                  className="text-base lg:text-lg xl:text-xl bg-accent-foreground py-2 px-3 xl:py-4 xl:px-6 text-orange-600 hover:bg-orange-600 hover:text-white transition-colors duration-300 rounded-md md:col-span-5 w-full"
                >
                  Mint {mintQty} Token{mintQty > 1 ? 's' : ''} Now!
                </button>
              </div>
            </MintControl>
          </div>
        </div>

        {showModal && (
          <Modal
            setShow={() => setShowModal(false)}
            gas={gas}
            toSign={toSign}
            payload={payload}
            gasTokenId={gasTokenId}
            walletAddress={
              (walletToPayGas === 'fpass'
                ? userSession?.futurepass
                : userSession?.eoa) ?? ''
            }
            extrinsicBuilder={currentBuilder}
            // signedCallback={signedCallback}
            resultCallback={onSuccessfulMint}
          />
        )}
      </div>
    </main>
  );
}
