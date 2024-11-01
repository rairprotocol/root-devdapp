import { LoginButton } from '@/components/LoginButton';
import Spinner from '@/components/Spinner';
import type { UserSession } from '@futureverse/auth';
import { useAuth } from '@futureverse/auth-react';
import { useNavigate } from 'react-router-dom';

import { useEffect, useState } from 'react';

export default function Login() {
  const { authClient } = useAuth();
  const [signInState, setSignInState] = useState<boolean | undefined>(
    undefined
  );
  const navigate = useNavigate();

  useEffect(() => {
    const userStateChange = (user: UserSession | undefined) => {
      if (user) {
        setSignInState(true);
        navigate('/');
      }
      if (!user) {
        setSignInState(false);
      }
    };

    authClient.addUserStateListener(userStateChange);
    return () => {
      authClient.removeUserStateListener(userStateChange);
    };
  }, [authClient, navigate]);

  if (signInState === true) {
    return (
      <RowComponent showSpinner={true}>
        Redirecting, please wait...
      </RowComponent>
    );
  }
  if (signInState === false) {
    return (
      <RowComponent showSpinner={false}>
        <div>Not Authenticated - Please Log In...</div>
        <LoginButton />
      </RowComponent>
    );
  }
  return <RowComponent showSpinner={true}>Authenticating...</RowComponent>;
}

const RowComponent = ({
  children,
  showSpinner,
}: {
  children: React.ReactNode;
  showSpinner: boolean;
}) => {
  return (
    <main className="flex min-h-[calc(100dvh-6rem-1rem)] flex-col items-center justify-center text-white">
      <div className="flex flex-row justify-center">
        {showSpinner && <Spinner className="mr-2" />}
        <div className="text-center">{children}</div>
      </div>
    </main>
  );
};
