import { Skeleton } from './ui/skeleton';
import { MAX_MINT_QTY } from '@/lib/utils';

import { type PropsWithChildren } from 'react';
import { Slider } from './ui/slider';

type MintControlProps = PropsWithChildren<{
  mintQty: number;
  handleSetMintQty: (value: number[]) => void;
  totalTokenCount: number;
  isFetching: boolean;
}>;

export default function MintControl({
  children,
  mintQty,
  handleSetMintQty,
  totalTokenCount,
  isFetching,
}: MintControlProps) {
  return (
    <div className="w-full flex flex-col justify-center items-center gap-8">
      {isFetching && <Skeleton className="text-4xl p-4">Loading...</Skeleton>}
      {!isFetching && (
        <>
          {totalTokenCount < MAX_MINT_QTY ? (
            <>
              <div className="w-full flex flex-col justify-center items-center">
                <div className="text-sm uppercase">Mint Qty</div>
                <input
                  type="number"
                  className="appearance-none bg-transparent text-center w-full m-3 rounded-lg text-8xl font-black"
                  value={mintQty.toString()}
                  min={1}
                  max={MAX_MINT_QTY - totalTokenCount}
                  onChange={e => handleSetMintQty([parseInt(e.target.value)])}
                />
              </div>
              <Slider
                defaultValue={[1]}
                max={MAX_MINT_QTY - totalTokenCount}
                min={1}
                step={1}
                value={[mintQty]}
                onValueChange={handleSetMintQty}
                minStepsBetweenThumbs={1}
              />
              {children}
            </>
          ) : (
            <div className="text-4xl text-orange-500 text-center">
              Sorry, you have reached the maximum mint quantity of allowed
            </div>
          )}
        </>
      )}
    </div>
  );
}
