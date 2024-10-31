import type { AssetModel } from '@futureverse/asset-register/models';
import { useState } from 'react';
import { Skeleton } from './ui/skeleton';
import { useGetSlots } from '@/hooks/useGetSlots';
import { useGetAsset } from '@futureverse/asset-register-react/v2';
import { COLLECTION_ID } from '@/lib/utils';
import { useAuth } from '@futureverse/auth-react';
import NftAssetLinker from './NftAssetLinker';

type NftTokenProps = {
  asset: AssetModel;
};

export default function NftToken({ asset }: NftTokenProps) {
  const { userSession } = useAuth();
  const [equipperOpen, setEquipperOpen] = useState<boolean | null>(null);

  const { assetTree } = useGetAsset({
    // @ts-expect-error - This needs SDK changes
    tokenId: asset?.rawData?.tokenId,
    collectionId: `7672:root:${COLLECTION_ID}`,
    addresses: [userSession?.eoa, userSession?.futurepass],
  });

  const { data: slots, isLoading: isSlotsLoading } = useGetSlots(
    // @ts-expect-error - This needs SDK changes
    asset?.rawData?.tokenId,
    assetTree
  );

  return (
    <>
      <div
        className="cursor-pointer"
        onClick={() => {
          setEquipperOpen(true);
        }}
      >
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
            {/* @ts-expect-error - This needs SDK changes */}
            Token {asset?.rawData?.tokenId}
          </div>
          {isSlotsLoading && (
            <div className="absolute bottom-0 translate-y-[calc(50%-20px)] left-0 w-full p-4 grid grid-cols-3 gap-4  ">
              <Skeleton className="bg-slate-500 aspect-square rounded-md drop-shadow-md " />
              <Skeleton className="bg-slate-500 aspect-square rounded-md drop-shadow-md " />
              <Skeleton className="bg-slate-500 aspect-square rounded-md drop-shadow-md " />
            </div>
          )}
          {!isSlotsLoading && slots && (
            <div className="absolute bottom-0 translate-y-[calc(50%-20px)] left-0 w-full p-4 grid grid-cols-3 gap-4 ">
              {slots.map(slot => {
                return (
                  slot.equippedAsset &&
                  slot?.equippedAsset?.metadata?.properties?.image && (
                    <div
                      className="aspect-square border-2 border-slate-300 rounded-md drop-shadow-md"
                      key={`${
                        // @ts-expect-error - This needs SDK changes
                        asset?.rawData?.tokenId
                      }-${slot?.schemaName}`}
                    >
                      <img
                        src={slot?.equippedAsset?.metadata?.properties?.image}
                        alt={slot.schemaName}
                      />
                    </div>
                  )
                );
              })}
            </div>
          )}
        </div>
      </div>
      {equipperOpen && (
        <NftAssetLinker
          isSlotsLoading={isSlotsLoading}
          slots={slots}
          // @ts-expect-error - This needs SDK changes
          selectedId={asset?.rawData?.tokenId}
          setEquipperOpen={setEquipperOpen}
        />
      )}
    </>
  );
}
