import type { AssetTreeClass } from '@futureverse/asset-register/v2';
import { useQuery } from '@tanstack/react-query';

export function useGetSlots(
  selectedId: string,
  assetTree: AssetTreeClass | undefined
) {
  return useQuery({
    queryKey: ['slots', selectedId],
    queryFn: async () => {
      const s = await assetTree?.getSlots();
      return s ?? null;
    },
    enabled: !!assetTree,
  });
}
