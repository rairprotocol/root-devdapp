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
