import useGetUserBalance from '@/hooks/useGetUserBalance';
import { Skeleton } from './ui/skeleton';

const TOKEN_MAP: Record<number, string> = {
  1: 'ROOT',
  2: 'XRP',
};

export default function Balance({
  assetId,
  address,
}: {
  assetId: number;
  address: string;
}) {
  const { data: balance, isLoading } = useGetUserBalance({
    walletAddress: address ?? '',
    assetId: assetId,
  });

  if (isLoading) {
    return <Skeleton className="w-full h-4" />;
  }

  return (
    <div className="flex flex-col">
      <div className="text-[0.6rem] uppercase font-black">
        {TOKEN_MAP[assetId]}
      </div>
      <div className="value text-xs">{balance?.balance}</div>
    </div>
  );
}
