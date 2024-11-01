# Step 1 - Add Futureverse Providers and Pass.Online Authentication

Our journey will begin by adding the Futureverse Providers required to implement Pass.Online authentication using Auth UI for styling the login flow.

## Instructions

### Add Futureverse Config

**Create File**: `src/providers/config.ts` and add following content.

```typescript
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
```

---

### Add Futureverse Provider

**Create File**: `src/providers/FvProvider.tsx` and add following content.

```typescript
import React from 'react';

import { QueryClientProvider } from '@tanstack/react-query';

import { authClient, getWagmiConfig, queryClient } from '@/providers/config';

import type { State } from 'wagmi';

import {
  AuthUiProvider,
  DefaultTheme,
  type ThemeConfig,
} from '@futureverse/auth-ui';

import {
  FutureverseAuthProvider,
  FutureverseWagmiProvider,
} from '@futureverse/auth-react';

const customTheme: ThemeConfig = {
  ...DefaultTheme,
  defaultAuthOption: 'custodial',
};

export default function FutureverseProviders({
  children,
  initialWagmiState,
}: {
  children: React.ReactNode;
  initialWagmiState?: State;
}) {
  return (
    <QueryClientProvider client={queryClient}>
      <FutureverseWagmiProvider
        getWagmiConfig={getWagmiConfig}
        initialState={initialWagmiState}
      >
        <FutureverseAuthProvider authClient={authClient}>
          <AuthUiProvider themeConfig={customTheme} authClient={authClient}>
            {children}
          </AuthUiProvider>
        </FutureverseAuthProvider>
      </FutureverseWagmiProvider>
    </QueryClientProvider>
  );
}
```

---

### Create Login/Logout Buttons and add to Navigation

#### Create Login Button Component

**Create File**: `src/components/LoginButton.tsx` and add the following content.

```typescript
import { useAuthUi } from '@futureverse/auth-ui';
import { Button } from './ui/button';

export function LoginButton({ buttonText = 'Login' }) {
  const { openLogin } = useAuthUi();

  return <Button onClick={() => openLogin()}>{buttonText}</Button>;
}

```

#### Create Logout Button Component

**Create File**: `src/components/LogoutButton.tsx`and add the following content

```typescript
import { useAuth } from '@futureverse/auth-react';
import { Button } from './ui/button';

export function LogoutButton({ buttonText = 'Logout' }) {
  const { signOut } = useAuth();

  return <Button onClick={() => signOut()}>{buttonText}</Button>;
}

```

#### Create Wallet Component

**Create File**: `src/components/Wallet.tsx` and add the following content

```typescript
import { useAuth } from '@futureverse/auth-react';
import { LoginButton } from './LoginButton';
import { shortAddress } from '@/lib/utils';
import { useAccount } from 'wagmi';
import { LogoutButton } from './LogoutButton';

export default function Wallet() {
  const { userSession } = useAuth();
  const { isConnected } = useAccount();

  if (!userSession || !isConnected) {
    return <LoginButton />;
  }

  return <LogoutButton buttonText={shortAddress(userSession?.futurepass)} />
}

```

#### Add Wallet Component to Navigation

Open `src/components/Navigation.tsx` and add `<Wallet />` to the `InnerNavigation` component so `src/components/Navigation.tsx` looks like

```typescript
/* eslint-disable @typescript-eslint/no-unused-vars */
import {
  NavigationMenu,
  NavigationMenuItem, NavigationMenuList
} from './ui/navigation-menu';

import Wallet from './Wallet';
import { type Dispatch, type SetStateAction, useState } from 'react';

export function Navigation() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <div className="relative">
      <InnerNavigation
        classes="hidden lg:flex flex-row"
        closeHandler={setIsMenuOpen}
      />
      <button
        onClick={() => setIsMenuOpen(!isMenuOpen)}
        className="text-white hover:text-orange-500 duration-300 transition-colors flex lg:hidden border-orange-500 border-[1px] rounded-md p-2 uppercase text-xs tracking-wider"
      >
        Menu
      </button>
      {isMenuOpen && (
        <div className="absolute -right-4 -bottom-6 translate-y-full bg-slate-500 bg-opacity-90 rounded-md p-2 pl-1.5 items-end">
          <InnerNavigation
            classes="flex lg:hidden flex-col text-end items-end"
            closeHandler={setIsMenuOpen}
          />
        </div>
      )}
    </div>
  );
}

const InnerNavigation = ({
  classes = '',
  closeHandler,
}: {
  classes?: string;
  closeHandler: Dispatch<SetStateAction<boolean>>;
}) => {
  return (
    <NavigationMenu>
      <NavigationMenuList className={classes}>
        <NavigationMenuItem>
          <Wallet />
        </NavigationMenuItem>
      </NavigationMenuList>
    </NavigationMenu>
  );
};

```

---

### Add Pass.Online Callback Page

**Create File**: `/src/components/Login.tsx` and add the following content

```typescript
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

```

---

### Add Providers & Header to `src/App.tsx` and create the `/login` callback route

Open `src/App.tsx` and add uncomment the following imports

```typescript
// import Header from '@/components/Header';
// import Login from '@/components/Login';
// import FutureverseProviders from '@/providers/FvProvider';
```

Add `<FutureverseProviders>` tag outside the `<Routes>` tag in the `App` function and uncomment the Login Route so your `App.tsx`.

Then, inside the `Layout` function add the `<Header />` component just inside the first div... Your complete `src/App.tsx` should look like

```typescript
/* eslint-disable @typescript-eslint/no-unused-vars */
import './App.css';
import { Routes, Route, Outlet, Navigate } from 'react-router-dom';
import Home from '@/components/Home';
import useIsAuthed from '@/hooks/useIsAuthed';
import Header from '@/components/Header';
import Login from '@/components/Login';
import FutureverseProviders from '@/providers/FvProvider';
// import MintAccessories from '@/components/MintAccessories';
// import MyCollection from '@/components/MyCollection';
// import Mint from '@/components/Mint';
import { Toaster } from './components/ui/sonner';
import { toast } from 'sonner';
import { useEffect } from 'react';

function App() {
  return (
    <FutureverseProviders>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Home />} />
          <Route path="/login" element={<Login />} />
          {/* <Route
            path="/mint"
            element={
              <ProtectedRoute>
                <Mint />
              </ProtectedRoute>
            }
          /> */}
          {/* <Route
            path="/accessories"
            element={
              <ProtectedRoute>
                <MintAccessories />
              </ProtectedRoute>
            }
          /> */}
          {/* <Route
            path="/my-collection"
            element={
              <ProtectedRoute>
                <MyCollection />
              </ProtectedRoute>
            }
          /> */}
        </Route>
      </Routes>
    </FutureverseProviders>
  );
}

export default App;

function Layout() {
  return (
    <div className=" bg-slate-900">
      <Header />
      <div className="p-4 pt-24">
        <Outlet />
        <Toaster />
      </div>
    </div>
  );
}

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isAuthed } = useIsAuthed();

  useEffect(() => {
    if (!isAuthed) {
      toast.warning('You are not logged in or your wallet is not connected', {
        id: 'login',
      });
    }
  }, [isAuthed]);

  if (!isAuthed) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
}
```
