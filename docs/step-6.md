# Step 6 - Equip/Unequip Items

## Instructions

We are now going to create all the components that allow us to interact with the Asset Register.

### Add Component's to enable equipping SFTs to base NFT

#### Create ARModal for Signing

Create `src/components/ARModal.tsx` using the following content

```typescript
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
```

---

#### Create NftAssetLinkerSlots for Slots

Create `src/components/NftAssetLinkerSlots.tsx` using the following content

```typescript
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
```

---

#### Create NftAssetLinkerAccessories for Accessories

Create `src/components/NftAssetLinkerAccessories.tsx` using the following content

```typescript
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
```

---

#### Create NftAssetLinker Component

Create `src/components/NftAssetLinker.tsx` using the following content

```typescript
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './ui/dialog';
import {
  useCallback,
  useMemo,
  useState,
  type Dispatch,
  type SetStateAction,
} from 'react';
import { useAssets, useGetAsset } from '@futureverse/asset-register-react/v2';
import {
  CLOTHING_COLLECTION_ID,
  COLLECTION_ID,
  HEAD_COLLECTION_ID,
  NECK_COLLECTION_ID,
} from '@/lib/utils';
import { useAuth } from '@futureverse/auth-react';
import { Skeleton } from './ui/skeleton';
import type { NftAssetLink } from '@futureverse/asset-register';
import ARModal from './ARModal';

import { useQueryClient } from '@tanstack/react-query';
import type { AssetSlot } from '@futureverse/asset-register/v2';
import { NftAssetLinkerAccessories } from './NftAssetLinkerAccessories';
import { NftAssetLinkerSlots } from './NftAssetLinkerSlots';

export type ARCommand = {
  type: string;
  action: 'create' | 'delete';
  args: [
    string,
    `${string}:${string}:${string}:${string}:${string}:${string}`,
    `${string}:${string}:${string}:${string}:${string}:${string}`,
  ];
};

type NftAssetLinkProps = {
  selectedId: string;
  slots: Array<AssetSlot> | null | undefined;
  isSlotsLoading: boolean;
  setEquipperOpen: Dispatch<SetStateAction<boolean | null>>;
};

export type SelectedItems =
  | Array<{ type: string; collectionId: string; tokenId: string }>
  | undefined;

export default function NftAssetLinker({
  selectedId,
  slots,
  isSlotsLoading,
  setEquipperOpen,
}: NftAssetLinkProps) {
  const { userSession } = useAuth();
  const queryClient = useQueryClient();

  const [showModal, setShowModal] = useState(false);

  const [selectedItems, setSelectedItems] = useState<SelectedItems>();

  const [removalPaths, setRemovalPaths] = useState<
    Array<{ path: string; collectionId: string; tokenId: string }>
  >([]);

  const assetQueryParamsHead = useMemo(
    () => ({
      first: 5,
      addresses: [userSession?.eoa, userSession?.futurepass],
      collectionIds: [`7672:root:${HEAD_COLLECTION_ID}`],
    }),
    [userSession]
  );

  const assetQueryParamsClothes = useMemo(
    () => ({
      first: 5,
      addresses: [userSession?.eoa, userSession?.futurepass],
      collectionIds: [`7672:root:${CLOTHING_COLLECTION_ID}`],
    }),
    [userSession]
  );
  const assetQueryParamsNeck = useMemo(
    () => ({
      first: 5,
      addresses: [userSession?.eoa, userSession?.futurepass],
      collectionIds: [`7672:root:${NECK_COLLECTION_ID}`],
    }),
    [userSession]
  );

  const { assets: clothesAssets, reactQuery: clothesReactQuery } = useAssets(
    assetQueryParamsClothes
  );
  const { assets: hatAssets, reactQuery: hatReactQuery } =
    useAssets(assetQueryParamsHead);
  const { assets: neckAssets, reactQuery: neckReactQuery } =
    useAssets(assetQueryParamsNeck);

  const itemsToLoad = useMemo(
    () => [
      { name: 'Clothes', data: clothesAssets, reactQuery: clothesReactQuery },
      { name: 'Neck', data: neckAssets, reactQuery: neckReactQuery },
      { name: 'Hat', data: hatAssets, reactQuery: hatReactQuery },
    ],
    [
      clothesAssets,
      clothesReactQuery,
      hatAssets,
      hatReactQuery,
      neckAssets,
      neckReactQuery,
    ]
  );

  const arAsset = useGetAsset({
    tokenId: selectedId.toString(),
    collectionId: `7672:root:${COLLECTION_ID}`,
    addresses: [userSession?.eoa, userSession?.futurepass],
  });

  const linkedAssets = useMemo(() => {
    if (!arAsset?.asset) {
      return;
    }

    return (arAsset?.asset?.links as NftAssetLink)?.childLinks
      ? (arAsset?.asset?.links as NftAssetLink)?.childLinks
      : [];
  }, [arAsset?.asset]);

  const getLinkedAsset = useCallback(
    (path: string) => {
      return linkedAssets?.filter((link: { path: string }) =>
        link.path.includes(path)
      );
    },
    [linkedAssets]
  );

  const prepareDelete = useCallback(
    (ops: ARCommand[], path: string) => {
      const linkedItems = getLinkedAsset(path);
      if (!linkedItems) {
        return;
      }

      linkedItems.forEach(link => {
        ops.push({
          type: 'asset-link',
          action: 'delete',
          args: [
            path,
            `did:fv-asset:7672:root:${COLLECTION_ID}:${selectedId}`,
            `did:fv-asset:${link?.asset?.collectionId as `${string}:${string}:${string}`}:${link?.asset?.tokenId}`,
          ],
        });
      });
    },
    [getLinkedAsset, selectedId]
  );

  const operations = useMemo(() => {
    const ops: Array<ARCommand> = [];

    if (removalPaths.length > 0) {
      removalPaths.forEach(removal => {
        ops.push({
          type: 'asset-link',
          action: 'delete',
          args: [
            removal.path,
            `did:fv-asset:7672:root:${COLLECTION_ID}:${selectedId}`,
            `did:fv-asset:${removal.collectionId as `${string}:${string}:${string}`}:${removal.tokenId}`,
          ],
        });
      });
    }

    selectedItems?.forEach(item => {
      const selectedItem = item.type;
      prepareDelete(ops, `equippedWith_${selectedItem}`);
      ops.push({
        type: 'asset-link',
        action: 'create',
        args: [
          `equippedWith_${selectedItem}`,
          `did:fv-asset:7672:root:${COLLECTION_ID}:${selectedId}`,
          `did:fv-asset:${item?.collectionId as `${string}:${string}:${string}`}:${item?.tokenId}`,
        ],
      });
    });

    return ops;
  }, [removalPaths, selectedItems, selectedId, prepareDelete]);

  const successCallBack = useCallback(async () => {
    setSelectedItems(undefined);
    setRemovalPaths([]);

    await queryClient.invalidateQueries({
      predicate: query =>
        query.queryKey[0] === 'GetAsset' &&
        (query.queryKey[1] as { tokenId: string })?.tokenId === selectedId,
    });

    setTimeout(() => {
      void (async () => {
        await queryClient.invalidateQueries({
          queryKey: ['slots', selectedId],
        });
      })();
    }, 2000);
  }, [queryClient, selectedId]);

  return (
    <>
      <Dialog
        open={true}
        defaultOpen={true}
        onOpenChange={() => setEquipperOpen(null)}
      >
        <DialogContent
          className="max-w-[460px] md:max-w-[800px] lg:max-w-[900px] xl:max-w-[1200px] p-6 w-[90vw] border-white"
          onInteractOutside={e => {
            e.preventDefault();
          }}
        >
          {!arAsset?.asset && (
            <>
              <DialogHeader>
                <DialogTitle className="text-md -mb-2">
                  Loading Token Links
                </DialogTitle>
              </DialogHeader>
              <div className="py-16 px-24 text-center">Loading...</div>
            </>
          )}
          {arAsset?.asset && (
            <>
              <DialogHeader>
                <DialogTitle className="text-md -mb-2">Token Links</DialogTitle>
              </DialogHeader>

              <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
                <div className="col-span-2 image-wrap md:aspect-square text-center flex justify-center">
                  {arAsset?.asset?.metadata?.properties?.image ? (
                    <img
                      src={arAsset?.asset?.metadata?.properties?.image}
                      alt="alt"
                      className="max-w-[250px] md:max-w-none md:aspect-square relative pointer-events-none cursor-pointer"
                    />
                  ) : (
                    <Skeleton className="aspect-square animate-pulse w-full" />
                  )}
                </div>

                <div className="col-span-full md:col-span-4 flex flex-col gap-8">
                  <NftAssetLinkerSlots
                    selectedId={selectedId}
                    slots={slots}
                    isSlotsLoading={isSlotsLoading}
                    removalPaths={removalPaths}
                    setRemovalPaths={setRemovalPaths}
                  />

                  <NftAssetLinkerAccessories
                    selectedId={selectedId}
                    slots={slots}
                    selectedItems={selectedItems}
                    setSelectedItems={setSelectedItems}
                    operations={operations}
                    setShowModal={setShowModal}
                    itemsToLoad={itemsToLoad}
                    removalPaths={removalPaths}
                  />
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
      {showModal && (
        <ARModal
          operations={operations}
          setShowModal={setShowModal}
          successCallBack={successCallBack}
        />
      )}
    </>
  );
}
```

---

#### Adding `NftAssetLinker.tsx` component, with `useGetAsset` and `useGetSlots` hooks to `NftToken.tsx`

Modify `NftToken.tsx` so it looks like

```typescript
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
    // @ts-expect-error - Error will be fixed in SDK
    tokenId: asset?.rawData?.tokenId,
    collectionId: `7672:root:${COLLECTION_ID}`,
    addresses: [userSession?.eoa, userSession?.futurepass],
  });

  const { data: slots, isLoading: isSlotsLoading } = useGetSlots(
    // @ts-expect-error - Error will be fixed in SDK
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
            {/* @ts-expect-error - Error will be fixed in SDK */}
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
                        // @ts-expect-error - Error will be fixed in SDK
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
          // @ts-expect-error - Error will be fixed in SDK
          selectedId={asset?.rawData?.tokenId}
          setEquipperOpen={setEquipperOpen}
        />
      )}
    </>
  );
}
```
