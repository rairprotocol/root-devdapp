# Step 3 - Mint NFTs to users Pass

Now we know a users balance, lets work on the Mint NFT functionality of the site.

## Instructions

### Create Mint Page

#### Create `Mint` Component

Create `src/components/Mint.tsx` with the following content

```typescript
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
```

---

### Create Mint Control component

Create `src/components/MintControl.tsx` with the following content

```typescript
import { Skeleton } from './ui/skeleton';
import { MAX_MINT_QTY } from '@/lib/utils';

import { type PropsWithChildren } from 'react';
import { Slider } from './ui/slider';

type MintControlProps = PropsWithChildren<{
  mintQty: number;
  handleSetMintQty: (value: number[]) => void;
  totalTokenCount: number;
  isFetching: boolean;
}>;

export default function MintControl({
  children,
  mintQty,
  handleSetMintQty,
  totalTokenCount,
  isFetching,
}: MintControlProps) {
  return (
    <div className="w-full flex flex-col justify-center items-center gap-8">
      {isFetching && <Skeleton className="text-4xl p-4">Loading...</Skeleton>}
      {!isFetching && (
        <>
          {totalTokenCount < MAX_MINT_QTY ? (
            <>
              <div className="w-full flex flex-col justify-center items-center">
                <div className="text-sm uppercase">Mint Qty</div>
                <input
                  type="number"
                  className="appearance-none bg-transparent text-center w-full m-3 rounded-lg text-8xl font-black"
                  value={mintQty.toString()}
                  min={1}
                  max={MAX_MINT_QTY - totalTokenCount}
                  onChange={e => handleSetMintQty([parseInt(e.target.value)])}
                />
              </div>
              <Slider
                defaultValue={[1]}
                max={MAX_MINT_QTY - totalTokenCount}
                min={1}
                step={1}
                value={[mintQty]}
                onValueChange={handleSetMintQty}
                minStepsBetweenThumbs={1}
              />
              {children}
            </>
          ) : (
            <div className="text-4xl text-orange-500 text-center">
              Sorry, you have reached the maximum mint quantity of allowed
            </div>
          )}
        </>
      )}
    </div>
  );
}
```

---

### Create Modal Component

Create `src/components/Modal.tsx` with the following content

```typescript
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
```

---

#### Add `/mint` to navigation

Open `src/components/Navigation.tsx` and replace content with

```typescript
/* eslint-disable @typescript-eslint/no-unused-vars */
import { Link } from 'react-router-dom';
import {
  NavigationMenu,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  navigationMenuTriggerStyle,
} from './ui/navigation-menu';

import Wallet from './Wallet';
import { type Dispatch, type SetStateAction, useState } from 'react';

export function Navigation() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <div className="relative">
      <InnerNavigation
        classes="hidden lg:flex flex-row"
        closeHandler={setIsMenuOpen}
      />
      <button
        onClick={() => setIsMenuOpen(!isMenuOpen)}
        className="text-white hover:text-orange-500 duration-300 transition-colors flex lg:hidden border-orange-500 border-[1px] rounded-md p-2 uppercase text-xs tracking-wider"
      >
        Menu
      </button>
      {isMenuOpen && (
        <div className="absolute -right-4 -bottom-6 translate-y-full bg-slate-500 bg-opacity-90 rounded-md p-2 pl-1.5 items-end">
          <InnerNavigation
            classes="flex lg:hidden flex-col text-end items-end"
            closeHandler={setIsMenuOpen}
          />
        </div>
      )}
    </div>
  );
}

const InnerNavigation = ({
  classes = '',
  closeHandler,
}: {
  classes?: string;
  closeHandler: Dispatch<SetStateAction<boolean>>;
}) => {
  return (
    <NavigationMenu>
      <NavigationMenuList className={classes}>
        <NavigationMenuItem>
          <NavigationMenuLink
            asChild
            onClick={() => closeHandler && closeHandler(false)}
            className={`${navigationMenuTriggerStyle()} bg-transparent hover:bg-transparent text-white hover:text-orange-500 duration-300 transition-colors text-lg`}
          >
            <Link to="/mint">Mint NFT</Link>
          </NavigationMenuLink>
        </NavigationMenuItem>
        {/* <NavigationMenuItem>
          <NavigationMenuLink
            onClick={() => closeHandler && closeHandler(false)}
            asChild
            className={`${navigationMenuTriggerStyle()} bg-transparent hover:bg-transparent text-white hover:text-orange-500 duration-300 transition-colors text-lg`}
          >
            <Link to="/accessories">Mint Accessories</Link>
          </NavigationMenuLink>
        </NavigationMenuItem> */}
        {/* <NavigationMenuItem>
          <NavigationMenuLink
            asChild
            onClick={() => closeHandler && closeHandler(false)}
            className={`${navigationMenuTriggerStyle()} bg-transparent hover:bg-transparent text-white hover:text-orange-500 duration-300 transition-colors text-lg`}
          >
            <Link to="/my-collection">My Collection</Link>
          </NavigationMenuLink>
        </NavigationMenuItem> */}
        <NavigationMenuItem>
          <Wallet />
        </NavigationMenuItem>
      </NavigationMenuList>
    </NavigationMenu>
  );
};
```

#### Adding Mint Route to `App.tsx` and look at Protected Route

Remove the following comments from `src/App.tsx`

```typescript
//import Mint from '@/components/Mint';
```

and

```typescript
{
  /* <Route
  path="/mint"
  element={
    <ProtectedRoute>
      <Mint />
    </ProtectedRoute>
  }
/> */
}
```

so it looks like

```typescript
<Route
  path="/mint"
  element={
    <ProtectedRoute>
      <Mint />
    </ProtectedRoute>
  }
/>
```

#### Change Homepage Content

Open `src/components/Home.tsx` and replace the content with the following

```typescript
import { useAuth } from '@futureverse/auth-react';
import { Button } from '@/components/ui/button';
import { LoginButton } from '@/components/LoginButton';
import { useAccount } from 'wagmi';
import { Link } from 'react-router-dom';

export default function HomePage() {
  const { userSession } = useAuth();
  const { isConnected } = useAccount();

  return (
    <main className="flex min-h-[calc(100dvh-6rem-1rem)] flex-col items-center justify-center text-white">
      <div className="container grid grid-cols-6 gap-y-3 ">
        <div className="grid gap-8 col-span-full md:col-span-4 pb-52 lg:pb-0 z-20 lg:z-0">
          <h1 className="text-4xl lg:text-6xl xl:text-8xl font-bold text-left">
            Mint Your Swappables! 🚀
          </h1>
          <div className="flex justify-start">
            {!userSession || !isConnected ? (
              <LoginButton buttonText="Login to mint your NFT now!" />
            ) : (
              <Button
                asChild
                size="lg"
                className={`text-lg xl:text-xl bg-accent-foreground py-6 px-8 text-orange-600 hover:bg-orange-600 hover:text-white transition-colors duration-300 rounded-md`}
              >
                <Link to="/mint">Mint your NFT now!</Link>
              </Button>
            )}
          </div>
        </div>
      </div>
      <div className="absolute bottom-0 right-0 w-full md:w-1/2 h-auto z-10">
        <img
          src="/RichieRich.webp"
          width={1200}
          height={1200}
          alt="Futureverse Workshop: Paris"
          className="h-auto w-auto"
        />
      </div>
    </main>
  );
}
```
