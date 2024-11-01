import React from 'react';

import { useCopyToClipboard } from '@/hooks/useCopyToClipboard';
import { TickIcon } from './icons/TickIcon';
import { CopyIcon } from '@radix-ui/react-icons';

export function CopyText({
  text,
  children,
}: {
  text: string;
  children?: React.ReactNode;
}) {
  const { isCopied, copyToClipboard } = useCopyToClipboard();

  return (
    <div className="flex flex-row gap-1 leading-none justify-between items-center">
      <div className="content">{children}</div>
      <div className="icon" onClick={() => copyToClipboard(text)}>
        {isCopied ? (
          <TickIcon width={16} height={16} />
        ) : (
          <CopyIcon width={16} height={16} />
        )}
      </div>
    </div>
  );
}
