import { type AssetSlot } from '@futureverse/asset-register/v2';
import { useQueryClient } from '@tanstack/react-query';
import React, { type Dispatch } from 'react';
import Spinner from './Spinner';
import { Skeleton } from './ui/skeleton';
import { Button } from './ui/button';

type SlotsTabProps = {
  selectedId: string;
  isSlotsLoading: boolean;
  slots: Array<AssetSlot> | null | undefined;
  removalPaths: Array<{ path: string; collectionId: string; tokenId: string }>;
  setRemovalPaths: Dispatch<
    React.SetStateAction<
      Array<{ path: string; collectionId: string; tokenId: string }>
    >
  >;
};

export const NftAssetLinkerSlots: React.FC<SlotsTabProps> = ({
  selectedId,
  isSlotsLoading,
  slots,
  removalPaths,
  setRemovalPaths,
}) => {
  const queryClient = useQueryClient();
  return (
    <div className="w-full">
      <div className="col-span-full mb-2 flex flex-row gap-2 items-baseline">
        <h3 className="text-xl font-bold">Slots</h3>{' '}
        <span
          className="text-xs text-start cursor-pointer inline-flex leading-none"
          onClick={() => {
            void queryClient.invalidateQueries({
              queryKey: ['slots', selectedId],
            });
          }}
        >
          [&nbsp;&nbsp;<span className="underline">REFRESH</span>
          &nbsp;&nbsp;]
        </span>
      </div>
      {isSlotsLoading && (
        <div className="flex flex-row  gap-2">
          <Spinner /> Checking Links
        </div>
      )}
      {!isSlotsLoading && !slots && (
        <div className="flex flex-row ">Nothing equipped</div>
      )}
      {!isSlotsLoading && slots && (
        <div className="grid grid-cols-5 ">
          {slots?.map(slot => (
            <div
              key={`${slot?.schemaName}`}
              className={`flex flex-col p-1 rounded-md `}
            >
              <div
                className={`flex flex-col gap-1 relative justify-between p-2 border-[1px] rounded-md ${removalPaths.some(removal => removal.collectionId === slot?.equippedAsset?.collectionId && removal.tokenId === (slot?.equippedAsset?.tokenId ?? '')) ? 'bg-red-500 ' : 'bg-slate-700'} `}
              >
                <div className="flex flex-row justify-start uppercase text-xs font-extrabold tracking-widest mb-1">
                  {slot?.schemaName?.replace('richie', '')}
                </div>
                {slot?.equippedAsset?.metadata?.properties?.image ? (
                  <img
                    src={slot?.equippedAsset?.metadata?.properties?.image}
                    alt={slot?.schemaName?.replace('richie', '')}
                    className="object-cover rounded-lg"
                  />
                ) : (
                  <Skeleton className="aspect-square animate-none bg-slate-400 bg-opacity-15 object-cover rounded-lg" />
                )}
                <div className="text-xs whitespace-nowrap overflow-hidden text-ellipsis">
                  {slot?.equippedAsset
                    ? slot?.equippedAsset?.metadata?.properties?.name
                    : 'Slot Empty'}
                </div>
                {slot?.equippedAsset && (
                  <Button
                    className={`absolute top-1 right-1 leading-none p-0 w-6 h-6 ${removalPaths.some(removal => removal.collectionId === slot?.equippedAsset?.collectionId && removal.tokenId === (slot?.equippedAsset?.tokenId ?? '')) ? 'bg-white text-red-500 hover:text-background' : 'bg-orange-500'} `}
                    onClick={() => {
                      setRemovalPaths(() => {
                        const existingIndex = removalPaths.findIndex(
                          removal =>
                            removal.collectionId ===
                              slot?.equippedAsset?.collectionId &&
                            removal.tokenId ===
                              (slot?.equippedAsset?.tokenId ?? '')
                        );

                        if (existingIndex !== -1) {
                          return removalPaths.filter(
                            removal =>
                              removal.collectionId !==
                                slot?.equippedAsset?.collectionId ||
                              removal.tokenId !==
                                (slot?.equippedAsset?.tokenId ?? '')
                          );
                        } else {
                          return [
                            ...removalPaths,
                            {
                              path: `equippedWith_${slot?.schemaName}`,
                              collectionId: slot?.equippedAsset?.collectionId,
                              tokenId: slot?.equippedAsset?.tokenId ?? '',
                            },
                          ];
                        }
                      });
                    }}
                  >
                    {removalPaths.some(
                      removal =>
                        removal.collectionId ===
                          slot?.equippedAsset?.collectionId &&
                        removal.tokenId === (slot?.equippedAsset?.tokenId ?? '')
                    )
                      ? '+'
                      : 'x'}
                  </Button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
