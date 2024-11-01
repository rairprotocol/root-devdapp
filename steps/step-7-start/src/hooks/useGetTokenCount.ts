import '@therootnetwork/api-types';

import { useQuery } from '@tanstack/react-query';
import { useTrnApi } from '@futureverse/transact-react';

export function useGetTokenCount(
  walletAddress: string,
  collectionId: number,
  refetchInterval: number | false = false
) {
  const { trnApi } = useTrnApi();

  return useQuery<number, Error>({
    queryKey: ['tokens', walletAddress, collectionId],
    queryFn: async () => {
      if (!trnApi || !walletAddress) {
        console.log('Missing trnApi or walletAddress');
        return 0;
      }

      const tokensResponse = await trnApi.rpc.nft.ownedTokens(
        collectionId,
        walletAddress,
        0,
        1000
      );

      const { 1: tokenCount } = tokensResponse.toJSON() as unknown as [
        number,
        number,
        number[],
      ];

      return tokenCount;
    },
    enabled:
      !!trnApi && !!walletAddress && walletAddress !== '' && !!collectionId,
    refetchInterval,
  });
}
