import { useAuthUi } from '@futureverse/auth-ui';
import { Button } from './ui/button';

export function LoginButton({ buttonText = 'Login' }) {
  const { openLogin } = useAuthUi();

  return <Button onClick={() => openLogin()}>{buttonText}</Button>;
}
