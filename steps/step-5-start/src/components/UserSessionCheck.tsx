import { useAuth } from '@futureverse/auth-react';
import React from 'react';
import { LoginButton } from './LoginButton';

export default function UserSessionCheck() {
  const { userSession } = useAuth();

  if (!userSession) {
    return <LoginButton />;
  }

  return (
    <div className="flex flex-col justify-center">
      <div className="flex flex-col justify-center p-4 text-center text-xl">
        Your user session may have expired.
        <br />
        Please clear your cookies and try again...
      </div>
      <LoginButton />
    </div>
  );
}
