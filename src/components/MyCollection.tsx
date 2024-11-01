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
