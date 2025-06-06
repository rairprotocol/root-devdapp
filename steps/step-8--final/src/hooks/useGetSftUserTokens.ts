import { useQuery } from '@tanstack/react-query';
import { useTrnApi } from '@futureverse/transact-react';

export function useGetSftUserTokens(
  collectionId: number,
  walletAddress?: string
) {
  const { trnApi } = useTrnApi();

  return useQuery({
    queryKey: ['sft-tokens', collectionId, walletAddress],
    queryFn: async () => {
      if (!trnApi) {
        console.log('Missing trnApi or walletAddress');
        return null;
      }

      const sftCollectionInfo =
        await trnApi.query.sft.sftCollectionInfo(collectionId);

      const info = sftCollectionInfo.toHuman() as unknown as {
        nextSerialNumber: string;
      };

      const collectionTokens = Number(info?.nextSerialNumber);

      const tokenInfo = collectionTokens
        ? await Promise.all(
            Array.from({ length: collectionTokens }).map(async (_, index) => {
              const token = await trnApi.query.sft.tokenInfo([
                collectionId,
                index,
              ]);
              const info = token.toHuman() as unknown as {
                tokenName: string;
                ownedTokens: [
                  string,
                  { freeBalance: string; reservedBalance: string },
                ][];
              };

              const ownedTokens = walletAddress
                ? info?.ownedTokens.find(owned => {
                    return (
                      owned[0].toLowerCase() === walletAddress.toLowerCase()
                    );
                  })
                : null;

              return {
                id: index,
                tokenName: info?.tokenName,
                reservedBalance: ownedTokens
                  ? ownedTokens?.[1].reservedBalance
                  : null,
                freeBalance: ownedTokens ? ownedTokens?.[1].freeBalance : null,
              };
            })
          )
        : [];

      return tokenInfo ?? null;
    },
    enabled:
      !!trnApi && !!collectionId && !!walletAddress && walletAddress !== '',
  });
}
