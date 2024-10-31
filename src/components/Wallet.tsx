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

export default function Wallet() {
  const { userSession, signOut } = useAuth();
  const { isConnected } = useAccount();

  if (!userSession || !isConnected) {
    return (
      <div>
        <LoginButton />
      </div>
    );
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button>{shortAddress(userSession?.futurepass)}</Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <div className="grid gap-3 p-2">
          <Accounts />
          <Button variant="default" onClick={() => signOut()}>
            Logout
          </Button>
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
