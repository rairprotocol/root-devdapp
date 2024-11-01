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
