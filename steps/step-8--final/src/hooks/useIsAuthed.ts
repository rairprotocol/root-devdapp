import { useAuth } from '@futureverse/auth-react';
import { useMemo } from 'react';
import { useAccount } from 'wagmi';

export default function useIsAuthed() {
  const { userSession, isFetchingSession } = useAuth();
  const { isConnected } = useAccount();

  const isAuthed = useMemo(
    () => !isFetchingSession && !!userSession && isConnected,
    [isConnected, isFetchingSession, userSession]
  );

  return { isAuthed };
}
