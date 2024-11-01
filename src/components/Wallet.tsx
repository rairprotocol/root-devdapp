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
