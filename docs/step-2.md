# Step 2 - Interact with Blockchain

## Instructions

### Add TrnProvider Provider

Open `src/providers/FvProvider.tsx` and add the following imports to the top of the file.

```typescript
import { TrnApiProvider } from '@futureverse/transact-react';
import type { NetworkName } from '@therootnetwork/api';
```

Add the following just before the `FutureverseProviders` function

```typescript
const network = (import.meta.env.VITE_NETWORK ?? 'porcini') as
  | NetworkName
  | undefined;
```

Add the `<TrnApiProvider>` tags as the first child of the `<QueryClientProvider>` tags so the `FutureverseProviders` function looks like

```typescript
export default function FutureverseProviders({
  children,
  initialWagmiState,
}: {
  children: React.ReactNode;
  initialWagmiState?: State;
}) {
  return (
    <QueryClientProvider client={queryClient}>
      <TrnApiProvider network={network}>
        <FutureverseWagmiProvider
          getWagmiConfig={getWagmiConfig}
          initialState={initialWagmiState}
        >
          <FutureverseAuthProvider authClient={authClient}>
            <AuthUiProvider themeConfig={customTheme} authClient={authClient}>
              {children}
              <ReactQueryDevtools initialIsOpen={false} />
            </AuthUiProvider>
          </FutureverseAuthProvider>
        </FutureverseWagmiProvider>
      </TrnApiProvider>
    </QueryClientProvider>
  );
}

```

### Query Users Root and XRP Balances and display in Menu Bar

#### Balance Component

Create `src/components/Balance.tsx` with the following content

```typescript
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
```

#### Account Component

Update `src/components/Account.tsx` with the following content

```typescript
import { shortAddress } from '@/lib/utils';
import Balance from './Balance';
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

#### Accounts Component

Create `src/components/Accounts.tsx` with the following content

```typescript
import { useShouldShowEoa } from '@/hooks/useShouldShowEoa';
import { useAuth } from '@futureverse/auth-react';
import Account from './Account';

const assetIds = [1, 2];
export function Accounts() {
  const shouldShowEoa = useShouldShowEoa();
  const { userSession } = useAuth();

  return (
    <div className="flex flex-row gap-3 text-right">
      {shouldShowEoa && (
        <Account
          type={'eoa'}
          address={userSession?.eoa ?? ''}
          assetIds={assetIds}
        />
      )}
      <Account
        type={'futurepass'}
        address={userSession?.futurepass ?? ''}
        assetIds={assetIds}
      />
    </div>
  );
}
```

#### Update Wallet Component

Open `src/components/Wallet.tsx` and update with the following content

```typescript
import { useAuth } from '@futureverse/auth-react';
import { LoginButton } from './LoginButton';
import { shortAddress } from '@/lib/utils';
import { Button } from './ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from './ui/dropdown-menu';
import { Accounts } from './Accounts';
import { useAccount } from 'wagmi';
import { LogoutButton } from './LogoutButton';

export default function Wallet() {
  const { userSession } = useAuth();
  const { isConnected } = useAccount();

  if (!userSession || !isConnected) {
    return <LoginButton />;
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button>{shortAddress(userSession?.futurepass)}</Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <div className="grid gap-3 p-2">
          <Accounts />
          <LogoutButton />
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
```
