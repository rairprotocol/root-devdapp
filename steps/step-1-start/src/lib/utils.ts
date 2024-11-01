import type { RootQueryBuilder } from '@futureverse/transact';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { formatUnits } from 'viem';

export const GAS_TOKENS = {
  ROOT: 1,
  XRP: 2,
  SYLO: 3172,
  ASTO: 17508,
};

export const MAX_MINT_QTY = 10;

// Base NFT Collection Id
export const COLLECTION_ID = 855140;

// SFT Collection Ids
export const CLOTHING_COLLECTION_ID = 856164;
export const NECK_COLLECTION_ID = 857188;
export const HEAD_COLLECTION_ID = 859236;

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const shortAddress = (address: string, start = 6, end = 4) => {
  return `${address.slice(0, start)}...${address.slice(-end)}`;
};

export const getBalance = async (
  transactionQuery: RootQueryBuilder | undefined,
  address: string,
  assetId: number
) => {
  if (!transactionQuery) {
    return {
      balance: '0',
      rawBalance: '0',
      decimals: 0,
    };
  }

  const walletBalance = await transactionQuery?.checkBalance({
    walletAddress: address,
    assetId: assetId,
  });

  return {
    balance: walletBalance
      ? formatUnits(BigInt(walletBalance?.balance), walletBalance?.decimals)
      : '0',
    rawBalance: walletBalance?.balance,
    decimals: walletBalance?.decimals,
  };
};

export const getBalances = async (
  transactionQuery: RootQueryBuilder | undefined,
  walletAssetIds: Array<{ walletAddress: string; assetId: number }>
) => {
  if (!transactionQuery) {
    return [
      {
        walletAddress: '',
        balance: '0',
        rawBalance: '0',
        decimals: 0,
      },
    ];
  }

  const walletBalances = await transactionQuery?.checkBalances(walletAssetIds);

  const balances = walletBalances?.map(walletBalance => {
    return {
      walletAddress: walletBalance.walletAddress,
      balance: formatUnits(
        BigInt(walletBalance?.balance),
        walletBalance?.decimals
      ),
      rawBalance: walletBalance?.balance,
      decimals: walletBalance?.decimals,
    };
  });

  return balances;
};
