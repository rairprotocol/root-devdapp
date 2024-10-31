import { useAuth } from '@futureverse/auth-react';
import { useMemo } from 'react';

export default function useIsAuthed() {
  const { userSession, isFetchingSession } = useAuth();

  const isAuthed = useMemo(
    () => !isFetchingSession && !!userSession,
    [isFetchingSession, userSession]
  );

  return { isAuthed };
}
