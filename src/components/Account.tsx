import { shortAddress } from '@/lib/utils';
import React from 'react';
import Balance from './Balance';
import { useRnsResolveAddress } from '@/hooks/useRns';
import { useAuth } from '@futureverse/auth-react';
import { Skeleton } from './ui/skeleton';
import { CopyText } from './CopyText';

export default function Account({
  address,
  assetIds,
  type,
}: {
  address: string;
  assetIds: number[];
  type: 'eoa' | 'futurepass';
}) {
  const { authClient } = useAuth();

  const { data: accountRns, isFetching: rnsFetching } = useRnsResolveAddress(
    address,
    authClient
  );

  return (
    <div className="">
      <div className="mr-1 text-[0.6rem] font-extrabold uppercase mb-[2px]">
        {type}
      </div>
      <div className="flex flex-col text-right rounded-md bg-slate-300 bg-opacity-10 p-2">
        <div className="mb-1">
          <div className="text-sm font-extrabold uppercase">
            <CopyText text={address}>{shortAddress(address ?? '')}</CopyText>
          </div>
          {rnsFetching && <Skeleton className="w-full h-4" />}
          {accountRns && !rnsFetching && (
            <div className="text-xs text-gray-500">{accountRns}</div>
          )}
        </div>
        <div className="flex flex-col gap-1 mt-1">
          {assetIds.map(assetId => (
            <Balance key={assetId} assetId={assetId} address={address ?? ''} />
          ))}
        </div>
      </div>
    </div>
  );
}
