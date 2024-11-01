import { createWagmiConfig } from '@futureverse/wagmi-connectors';
import { FutureverseAuthClient } from '@futureverse/auth-react/auth';
import { mainnet } from 'viem/chains';
import { QueryClient } from '@tanstack/react-query';
import { cookieStorage, createStorage } from 'wagmi';
import { http, type Storage } from '@wagmi/core';
import { porcini } from '@futureverse/auth';

const clientId = import.meta.env.VITE_PASS_CLIENT_ID;
const walletConnectProjectId = import.meta.env.VITE_WALLET_CONNECT_PROJECT_ID;

export const authClient = new FutureverseAuthClient({
  clientId,
  environment: 'staging',
  redirectUri: `${
    typeof window !== 'undefined' ? `${window.location.origin}/login` : ''
  }`,
  signInFlow: 'redirect',
});

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnMount: false,
      refetchOnWindowFocus: false,
      refetchInterval: false,
      refetchOnReconnect: false,
    },
  },
});

export const getWagmiConfig = async () => {
  return createWagmiConfig({
    walletConnectProjectId,
    authClient,
    metamaskDappMetadata: {
      name: 'Futureverse Paris Workshop',
      url: 'https://xxx.replit.dev',
    },
    transports: {
      7672: http('https://porcini.rootnet.app/'),
    },
    ssr: true,
    chains: [mainnet, porcini],
    storage: createStorage({
      storage: cookieStorage,
    }) as Storage,
  });
};
