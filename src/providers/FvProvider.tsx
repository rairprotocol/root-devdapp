import React from 'react';

import { QueryClientProvider } from '@tanstack/react-query';

import { authClient, getWagmiConfig, queryClient } from '@/providers/config';

import type { State } from 'wagmi';
import { TrnApiProvider } from '@futureverse/transact-react';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import {
  AuthUiProvider,
  DefaultTheme,
  type ThemeConfig,
} from '@futureverse/auth-ui';

import {
  FutureverseAuthProvider,
  FutureverseWagmiProvider,
} from '@futureverse/auth-react';

import type { NetworkName } from '@therootnetwork/api';
import { AssetRegisterProvider } from './AssetRegisterProvider';

const customTheme: ThemeConfig = {
  ...DefaultTheme,
  defaultAuthOption: 'custodial',
  colors: {
    primaryBackground: 'rgba(234, 88, 12, 1)',
    primaryForeground: 'rgba(255, 255, 255, 1)',
    primaryHover: 'rgba(15, 23, 42, 1)',
    primaryActive: 'rgba(255, 255, 255, 0.2)',
    primaryBackgroundDisabled: 'rgba(68, 68, 68, 1)',
    primaryForegroundDisabled: 'rgba(165, 163, 164, 1)',
    secondaryBackground: 'rgba(255, 255, 255, 0)',
    secondaryForeground: 'rgba(15, 23, 42, 1)',
    secondaryHover: 'rgba(255, 255, 255, 0)',
    secondaryActive: 'rgba(255, 255, 255, 0.05)',
    secondaryBackgroundDisabled: 'rgba(68, 68, 68, 1)',
    secondaryForegroundDisabled: 'rgba(165, 163, 164, 1)',
    border: 'rgba(234, 88, 12, 1)',
    borderHover: 'rgba(15, 23, 42, 1)',
    borderActive: 'rgba(255, 255, 255, 1)',
    borderError: 'rgba(171, 21, 57, 1)',
    errorForeground: 'rgba(171, 21, 57, 1)',
    body: 'rgba(15, 23, 42, 1)',
    muted: 'rgba(15, 23, 42, 1)',
    surface: 'rgba(15, 23, 42, 0.09)',
    page: 'rgba(24, 24, 24, 1)',
  },
  images: {
    background: '/images/paris.jpg',
  },
};

const network = (import.meta.env.VITE_NETWORK ?? 'porcini') as
  | NetworkName
  | undefined;

export default function FutureverseProviders({
  children,
  initialWagmiState,
}: {
  children: React.ReactNode;
  initialWagmiState?: State;
}) {
  return (
    <QueryClientProvider client={queryClient}>
      <TrnApiProvider network={network}>
        <FutureverseWagmiProvider
          getWagmiConfig={getWagmiConfig}
          initialState={initialWagmiState}
        >
          <FutureverseAuthProvider authClient={authClient}>
            <AuthUiProvider themeConfig={customTheme} authClient={authClient}>
              <AssetRegisterProvider>
                {children}

                <ReactQueryDevtools initialIsOpen={false} />
              </AssetRegisterProvider>
            </AuthUiProvider>
          </FutureverseAuthProvider>
        </FutureverseWagmiProvider>
      </TrnApiProvider>
    </QueryClientProvider>
  );
}
