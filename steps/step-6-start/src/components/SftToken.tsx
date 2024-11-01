import React from 'react';
import { Checkbox } from './ui/checkbox';
import { TokenType } from './MintAccessories';

type SftTokenProps = {
  type: string;
  collectionId: number;
  sftToken: {
    id: number;
    tokenName: string;
    reservedBalance: number;
    freeBalance: number;
  };
  selectedTokens: Array<TokenType> | null;
  setSelectedTokens: React.Dispatch<
    React.SetStateAction<Array<TokenType> | null>
  >;
};

export default function SftToken({
  type,
  collectionId,
  sftToken,
  selectedTokens,
  setSelectedTokens,
}: SftTokenProps) {
  const isSelected = selectedTokens?.some(
    token =>
      token.collectionId === collectionId && token.tokenId === sftToken.id
  );

  return (
    <div
      className={`cursor-pointer box-content border-4  rounded-xl overflow-hidden ${isSelected ? 'border-orange-500 ' : 'border-transparent'} `}
    >
      <div className="aspect-square relative cursor-pointer  ">
        <label htmlFor={`${type}-${sftToken.id}`} className="cursor-pointer">
          <img
            src={`/images/sft/${type.toLowerCase()}/${sftToken.id}.png`}
            alt={`${type}: ${sftToken.tokenName}`}
            width={600}
            height={600}
            className="aspect-square relative pointer-events-none cursor-pointer"
          />
        </label>
        <div className="absolute top-2 left-0 text-left text-sm md:text-base lg:text-lg leading-none font-semibold p-2 bg-slate-400 bg-opacity-50 backdrop-blur-sm">
          {sftToken.tokenName}
        </div>
        <Checkbox
          id={`${type}-${sftToken.id}`}
          className="absolute bottom-2 right-2 cursor-pointer"
          checked={isSelected}
          onCheckedChange={selected => {
            if (selected) {
              setSelectedTokens([
                ...(selectedTokens ?? []),
                {
                  collectionId: collectionId,
                  tokenId: sftToken.id,
                  quantity: 1,
                },
              ]);
            } else {
              setSelectedTokens(
                selectedTokens?.filter(
                  token =>
                    token.collectionId !== collectionId ||
                    token.tokenId !== sftToken.id
                ) ?? []
              );
            }
          }}
        />
        <div className="absolute bottom-2 left-0 text-left p-2 bg-slate-400 bg-opacity-50 backdrop-blur-sm leading-none flex flex-col gap-1">
          <div className="text-sm md:text-base lg:text-lg font-bold leading-none">
            {sftToken.reservedBalance + sftToken.freeBalance}
          </div>
          <div className="text-[0.5rem] lg:text-[0.6rem]  uppercase font-black tracking-widest leading-none">
            Owned
          </div>
        </div>
      </div>
    </div>
  );
}
