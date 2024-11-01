# Step 5 - Introduce AR

## Instructions

We are now going to introduce Asset Register to our application.

### Create Asset Register Provider to Futureverse Providers

#### Create Asset Register Provider

Create `src/providers/AssetRegisterProvider.tsx` with the following content

```typescript
import { AssetRegisterClientProvider } from '@futureverse/asset-register-react/v2';
import { useFutureverseSigner } from '@futureverse/auth-react';
import { type ReactNode, useEffect, useMemo, useState } from 'react';
import { type Address } from 'viem';

const url = 'https://ar-api.futureverse.cloud/graphql';

const ASSET_REGISTRY_DOMAIN =
  typeof window === 'undefined' ? '' : window.location.host;
const ASSET_REGISTRY_ORIGIN =
  typeof window === 'undefined' ? '' : window.origin;

type Props = {
  children: ReactNode;
};

export const AssetRegisterProvider: React.FC<Props> = ({ children }) => {
  const signer = useFutureverseSigner();
  const [address, setAddress] = useState<Address>();
  useEffect(() => {
    void (async () => {
      if (signer) {
        setAddress((await signer.getAddress()) as Address);
      }
    })();
  }, [signer]);

  const auth = useMemo(() => {
    if (!address || !signer) {
      return undefined;
    }
    return {
      origin: ASSET_REGISTRY_ORIGIN,
      domain: ASSET_REGISTRY_DOMAIN,
      chainId: 1,
      sign: (message: string) => signer.signMessage(message),
      walletAddress: address,
      storage: {
        get: (key: string) => localStorage.getItem(key),
        set: (key: string, value: string) => localStorage.setItem(key, value),
      },
    };
  }, [address, signer]);

  return (
    <AssetRegisterClientProvider url={url} auth={auth}>
      {children}
    </AssetRegisterClientProvider>
  );
};
```

---

#### Add Asset Register Provider to Futureverse Providers

Open `src/providers/FvProvider.tsx` and add the following import at the top of the file

```typescript
import { AssetRegisterProvider } from './AssetRegisterProvider';
```

Add the `AssetRegisterProvider` inside of `<AuthUiProvider ../>` tags and around `{children}` to look like this

```typescript
<AuthUiProvider themeConfig={customTheme} authClient={authClient}>
  <AssetRegisterProvider>
    {children}
  </AssetRegisterProvider>
</AuthUiProvider>
```

---

### Add Page to query users assets and display minted tokens

#### Create NFT Component to display NFT

Create `src/components/NftToken.tsx` with the following content

```typescript
import type { AssetModel } from '@futureverse/asset-register/models';
import { Skeleton } from './ui/skeleton';

type NftTokenProps = {
  asset: AssetModel;
};

export default function NftToken({ asset }: NftTokenProps) {
  return (
    <>
      <div className="cursor-pointer">
        <div className="aspect-square relative cursor-pointer">
          {asset?.metadata?.properties?.image ? (
            <img
              src={asset?.metadata?.properties?.image}
              alt="alt"
              className="aspect-square relative pointer-events-none cursor-pointer rounded-md overflow-hidden"
            />
          ) : (
            <Skeleton className="aspect-square animate-pulse w-full" />
          )}

          <div className="absolute top-2 left-0 text-left text-sm md:text-base lg:text-lg leading-none font-semibold p-2 bg-slate-400 bg-opacity-50 backdrop-blur-sm">
            {/* @ts-expect-error - Error will be fixed in SDK */}
            Token {asset?.rawData?.tokenId}
          </div>
        </div>
      </div>
    </>
  );
}
```

---

#### Create `/my-collection` route and implement useAssets Hook in MyCollection Component

Create `src/components/MyCollection.tsx` with the following content

```typescript
'use client';

import { useAssets } from '@futureverse/asset-register-react/v2';
import { useAuth } from '@futureverse/auth-react';

import type { AssetModel } from '@futureverse/asset-register/models';

import React from 'react';
import { COLLECTION_ID } from '@/lib/utils';
import { Skeleton } from '@/components/ui/skeleton';
import NftToken from '@/components/NftToken';

import { useQueryClient } from '@tanstack/react-query';

export default function MyCollection() {
  const { userSession } = useAuth();
  const queryClient = useQueryClient();

  const assetQueryParams = React.useMemo(
    () => ({
      first: 11,
      addresses: [userSession?.eoa, userSession?.futurepass],
      collectionIds: [`7672:root:${COLLECTION_ID}`],
    }),
    [userSession]
  );

  const {
    assets,
    reactQuery: { hasNextPage, fetchNextPage, isFetching, isLoading, error },
  } = useAssets(assetQueryParams, {
    enabled: true,
    initialPageParam: undefined,
    getNextPageParam: lastPage => lastPage?.nextCursor,
  });

  return (
    <>
      <main className="flex min-h-[calc(100dvh-6rem-1rem)] flex-col items-center text-white">
        <div className="container grid grid-cols-1 gap-4 pb-8 mt-4">
          <div className="w-full col-span-full flex flex-row gap-4 items-baseline">
            <h1 className="text-3xl font-black text-start leading-6">
              Your Collection
            </h1>
            <span
              className="text-xs text-start cursor-pointer inline-flex leading-none"
              onClick={() => {
                void queryClient.invalidateQueries({ queryKey: ['assets'] });
                void queryClient.invalidateQueries({ queryKey: ['GetAsset'] });
                void queryClient.invalidateQueries({ queryKey: ['slots'] });
              }}
            >
              [&nbsp;&nbsp;<span className="underline">REFRESH</span>
              &nbsp;&nbsp;]
            </span>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-10 ">
            {isLoading && (
              <>
                <Skeleton className="aspect-square" />
                <Skeleton className="aspect-square" />
                <Skeleton className="aspect-square" />
                <Skeleton className="aspect-square" />
                <Skeleton className="aspect-square" />
              </>
            )}
            {assets
              ?.sort((a, b) => {
                return Number(a?.tokenId) > Number(b?.tokenId) ? 1 : -1;
              })
              ?.map((asset: AssetModel, i: number) => (
                <NftToken key={`nft-${i}`} asset={asset} />
              ))}

            {!isLoading && isFetching && (
              <Skeleton className="aspect-square flex flex-col justify-center items-center text-center">
                Fetching...
              </Skeleton>
            )}
          </div>
          {error && (
            <div className="bg-red-500 text-white p-2 rounded-md col-span-full">
              {error.message}
            </div>
          )}
          {hasNextPage && (
            <button
              type="button"
              onClick={() => fetchNextPage()}
              className="bg-slate-400 text-white p-2 rounded-md col-span-full"
            >
              Load More
            </button>
          )}
        </div>
      </main>
    </>
  );
}
```

---

#### Adding My Collection Page to the navigation

Remove the comments the following code blocks in `src/components/Navigation.tsx`

```typescript
{
  /* 
        <NavigationMenuItem>
          <NavigationMenuLink
            asChild
            onClick={() => closeHandler && closeHandler(false)}
            className={`${navigationMenuTriggerStyle()} bg-transparent hover:bg-transparent text-white hover:text-orange-500 duration-300 transition-colors text-lg`}
          >
            <Link to="/my-collection">My Collection</Link>
          </NavigationMenuLink>
        </NavigationMenuItem>
        */
}
```

so it looks like

```typescript
        <NavigationMenuItem>
          <NavigationMenuLink
            asChild
            onClick={() => closeHandler && closeHandler(false)}
            className={`${navigationMenuTriggerStyle()} bg-transparent hover:bg-transparent text-white hover:text-orange-500 duration-300 transition-colors text-lg`}
          >
            <Link to="/my-collection">My Collection</Link>
          </NavigationMenuLink>
        </NavigationMenuItem>
```

---

#### Adding My Collection Page Route to `App.tsx`

Remove the following comments from `src/App.tsx`

```typescript
// import MyCollection from '@/components/MyCollection';
```

and

```typescript
{
  /* <Route
            path="/my-collection"
            element={
              <ProtectedRoute>
                <MyCollection />
              </ProtectedRoute>
            }
          /> */
}
```

so it looks like

```typescript
          <Route
            path="/my-collection"
            element={
              <ProtectedRoute>
                <MyCollection />
              </ProtectedRoute>
            }
          />
```
