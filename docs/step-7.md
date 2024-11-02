# Added Bonus - Customising Login & Adding RNS Functionality

## Instructions

### Customising Login

Head to the [Futureverse Playground Auth-UI Beta (https://sdk-demo-authui-update.vercel.app/auth/ui-customiser)](https://sdk-demo-authui-update.vercel.app/auth/ui-customiser) to customise your Pass.Online login.

Once you are happy, copy the configuration object and apply inside `customTheme` variable on `FvProvider.tsx`.

Example:

```typescript
const customTheme: ThemeConfig = {
  ...DefaultTheme,
  defaultAuthOption: 'custodial',
  colors: {
    primaryBackground: 'rgba(234, 88, 12, 1)',
    primaryForeground: 'rgba(255, 255, 255, 1)',
    primaryHover: 'rgba(15, 23, 42, 1)',
    primaryActive: 'rgba(255, 255, 255, 0.2)',
    primaryBackgroundDisabled: 'rgba(68, 68, 68, 1)',
    primaryForegroundDisabled: 'rgba(165, 163, 164, 1)',
    secondaryBackground: 'rgba(255, 255, 255, 0)',
    secondaryForeground: 'rgba(15, 23, 42, 1)',
    secondaryHover: 'rgba(255, 255, 255, 0)',
    secondaryActive: 'rgba(255, 255, 255, 0.05)',
    secondaryBackgroundDisabled: 'rgba(68, 68, 68, 1)',
    secondaryForegroundDisabled: 'rgba(165, 163, 164, 1)',
    border: 'rgba(234, 88, 12, 1)',
    borderHover: 'rgba(15, 23, 42, 1)',
    borderActive: 'rgba(255, 255, 255, 1)',
    borderError: 'rgba(171, 21, 57, 1)',
    errorForeground: 'rgba(171, 21, 57, 1)',
    body: 'rgba(15, 23, 42, 1)',
    muted: 'rgba(15, 23, 42, 1)',
    surface: 'rgba(15, 23, 42, 0.09)',
    page: 'rgba(24, 24, 24, 1)',
  },
  images: {
    background: '/images/paris.jpg',
  },
};
```

---

### Adding RNS Functionality

Change `src/components/Account.tsx` so it looks like

```typescript
import { shortAddress } from '@/lib/utils';
import React from 'react';
import Balance from './Balance';
import { useRnsResolveAddress } from '@/hooks/useRns';
import { useAuth } from '@futureverse/auth-react';
import { Skeleton } from './ui/skeleton';
import { CopyText } from './CopyText';

export default function Account({
  address,
  assetIds,
  type,
}: {
  address: string;
  assetIds: number[];
  type: 'eoa' | 'futurepass';
}) {
  const { authClient } = useAuth();

  const { data: accountRns, isFetching: rnsFetching } = useRnsResolveAddress(
    address,
    authClient
  );

  return (
    <div>
      <div className="mr-1 text-[0.6rem] font-extrabold uppercase mb-[2px]">
        {type}
      </div>
      <div className="flex flex-col text-right rounded-md bg-slate-300 bg-opacity-10 p-2">
        <div className="mb-1">
          <div className="text-sm font-extrabold uppercase">
            <CopyText text={address}>{shortAddress(address ?? '')}</CopyText>
          </div>
          {rnsFetching && <Skeleton className="w-full h-4" />}
          {accountRns && !rnsFetching && (
            <div className="text-xs text-gray-500">{accountRns}</div>
          )}
        </div>
        <div className="flex flex-col gap-1 mt-1">
          {assetIds.map(assetId => (
            <Balance key={assetId} assetId={assetId} address={address ?? ''} />
          ))}
        </div>
      </div>
    </div>
  );
}
```
