import React, { type Dispatch, type SetStateAction } from 'react';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Checkbox } from '@/components/ui/checkbox';
import { Button } from '@/components/ui/button';
import {
  type DefinedUseInfiniteQueryResult,
  type InfiniteData,
  useQueryClient,
} from '@tanstack/react-query';
import type { ARCommand, SelectedItems } from './NftAssetLinker';
import type { ARError, AssetSlot } from '@futureverse/asset-register/v2';
import type {
  AssetModel,
  AssetsModel,
} from '@futureverse/asset-register/models';
import { SftAssetLink } from '@futureverse/asset-register';

type AccessoriesTabProps = {
  itemsToLoad: Array<{
    name: string;
    data: Array<AssetModel>;
    reactQuery: DefinedUseInfiniteQueryResult<
      InfiniteData<AssetsModel, unknown>,
      ARError
    >;
  }>;
  selectedId: string;
  selectedItems: SelectedItems;
  setSelectedItems: Dispatch<SetStateAction<SelectedItems>>;
  slots: Array<AssetSlot> | null | undefined;
  removalPaths: Array<{ path: string; collectionId: string; tokenId: string }>;
  operations: Array<ARCommand>;
  setShowModal: (value: boolean) => void;
};

export const NftAssetLinkerAccessories: React.FC<AccessoriesTabProps> = ({
  itemsToLoad,
  selectedId,
  selectedItems,
  setSelectedItems,
  slots,
  removalPaths,
  operations,
  setShowModal,
}) => {
  const queryClient = useQueryClient();

  return (
    <div className="w-full flex flex-col gap-2">
      <div className="col-span-full mb-2 flex flex-row gap-2 items-baseline">
        <h3 className="text-xl font-bold">Accessories</h3>{' '}
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

      <Tabs defaultValue="clothes" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          {itemsToLoad.map(item => (
            <TabsTrigger
              key={`tab-${item?.name}`}
              value={item?.name.toLowerCase()}
            >
              {item?.name}
            </TabsTrigger>
          ))}
        </TabsList>
        {itemsToLoad.map(item => (
          <TabsContent
            key={`content-${item?.name}`}
            value={item?.name.toLowerCase()}
          >
            <Card>
              <CardContent className="grid grid-cols-5 gap-4 p-2 md:p-6">
                {item?.reactQuery.isLoading && (
                  <>
                    <Skeleton className="aspect-square animate-pulse" />
                    <Skeleton className="aspect-square animate-pulse" />
                    <Skeleton className="aspect-square animate-pulse" />
                    <Skeleton className="aspect-square animate-pulse" />
                    <Skeleton className="aspect-square animate-pulse" />
                  </>
                )}
                {item?.data
                  ?.sort((a, b) => {
                    return Number(a?.tokenId) > Number(b?.tokenId) ? 1 : -1;
                  })
                  ?.map(data => {
                    const ownershipBalance =
                      //@ts-expect-error - needs to be fixed in future
                      data?.rawData?.ownership?.balancesOf?.reduce(
                        (acc: number, balance: { balance: number }) => {
                          return balance?.balance;
                        }
                      );

                    const linkedTotal =
                      (data?.links as SftAssetLink)?.parentLinks?.length ?? 0;

                    const remaining = ownershipBalance - linkedTotal;

                    const typeName = `${
                      (data?.schema?.name?.charAt(0)?.toLowerCase() ?? '') +
                      (data?.schema?.name?.slice(1) ?? '')
                    }`;

                    const itemSelected =
                      selectedItems
                        ?.find(selectedItem => selectedItem.type === typeName)
                        ?.tokenId.toString() === data?.tokenId;

                    const alreadyEquipped = slots
                      ?.filter(
                        slot =>
                          slot?.schemaName.toLowerCase() ===
                          data?.schema?.name.toLowerCase()
                      )
                      .some(
                        slot => slot?.equippedAsset?.tokenId === data?.tokenId
                      );

                    return (
                      <div
                        key={data?.tokenId}
                        className={`w-full flex items-center justify-between ${remaining === 0 || alreadyEquipped ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
                        onClick={() => {
                          if (itemSelected) {
                            //remove the item from the selected items and UPDATE the selected items
                            const newItems = selectedItems.filter(
                              i => i.type !== typeName
                            );

                            setSelectedItems([...newItems]);
                          } else {
                            if (remaining > 0 && !alreadyEquipped) {
                              setSelectedItems([
                                ...(selectedItems ?? []),
                                {
                                  type: typeName,
                                  collectionId: data.collectionId,
                                  tokenId: data.tokenId,
                                },
                              ]);
                            }
                          }
                        }}
                      >
                        <div className="w-full flex items-center relative">
                          <div className="w-full flex flex-col gap-1">
                            <div className="relative">
                              <img
                                src={data?.metadata?.properties?.image ?? ''}
                                alt={data?.metadata?.properties?.name}
                                className={`object-cover rounded-lg border-[2px] ${alreadyEquipped ? 'border-white' : itemSelected ? 'border-orange-500' : 'border-transparent'}`}
                              />
                              {alreadyEquipped && (
                                <div className="absolute bottom-1.5 left-1.5 cursor-pointer leading-none bg-slate-300 p-1 rounded-md text-xs font-black text-orange-500">
                                  EQUIPPED
                                </div>
                              )}
                            </div>
                            <div className="text-xs whitespace-nowrap overflow-hidden text-ellipsis">
                              {data?.metadata?.properties?.name}
                            </div>
                            <div className="absolute top-1.5 left-1.5 cursor-pointer leading-none bg-slate-300 py-1.5 px-2 rounded-md text-xs font-black text-slate-900">
                              {remaining}
                            </div>

                            {itemSelected && (
                              <Checkbox
                                id={`${item?.name}-${data?.tokenId}`}
                                className="absolute top-1.5 right-1.5 cursor-pointer"
                                checked={itemSelected}
                              />
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
              </CardContent>
            </Card>
          </TabsContent>
        ))}
      </Tabs>
      {(removalPaths.length > 0 || operations.length > 0) && (
        <div className="grid grid-cols-1 gap-4 row-auto">
          <Button onClick={() => setShowModal(true)}>Check Changes</Button>
        </div>
      )}
    </div>
  );
};
