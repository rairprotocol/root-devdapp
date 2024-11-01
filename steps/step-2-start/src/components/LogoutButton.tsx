import { useAuth } from '@futureverse/auth-react';
import { Button } from './ui/button';

export function LogoutButton({ buttonText = 'Logout' }) {
  const { signOut } = useAuth();

  return <Button onClick={() => signOut()}>{buttonText}</Button>;
}
