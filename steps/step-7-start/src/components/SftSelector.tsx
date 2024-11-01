import React from 'react';
import SftToken from './SftToken';
import type { TokenType } from '@/app/(authed)/accessories/page';

type SftSelectorProps = {
  type: string;
  collectionId: number;
  sftTokens: Array<{
    id: number;
    tokenName: string;
    reservedBalance: number;
    freeBalance: number;
  }>;
  selectedTokens: Array<TokenType> | null;
  setSelectedTokens: React.Dispatch<
    React.SetStateAction<Array<TokenType> | null>
  >;
};

export default function SftSelector({
  type,
  sftTokens,
  collectionId,
  selectedTokens,
  setSelectedTokens,
}: SftSelectorProps) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 ">
      <div className="w-full col-span-full flex flex-col gap-1">
        <h1 className="text-3xl font-black text-start leading-6">{type}</h1>
        <h2 className="text-lg text-start leading-none">
          Select {type} accessories to mint
        </h2>
      </div>
      {sftTokens
        ?.sort((a, b) => {
          return Number(a?.id) > Number(b?.id) ? 1 : -1;
        })
        ?.map(sftToken => (
          <SftToken
            key={`${type}-${sftToken.id}`}
            sftToken={sftToken}
            selectedTokens={selectedTokens}
            setSelectedTokens={setSelectedTokens}
            type={type}
            collectionId={collectionId}
          />
        ))}
    </div>
  );
}
