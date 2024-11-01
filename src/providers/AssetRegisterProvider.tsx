import { AssetRegisterClientProvider } from '@futureverse/asset-register-react/v2';
import { useFutureverseSigner } from '@futureverse/auth-react';
import { type ReactNode, useEffect, useMemo, useState } from 'react';
import { type Address } from 'viem';

const url = 'https://ar-api.futureverse.cloud/graphql';

const ASSET_REGISTRY_DOMAIN =
  typeof window === 'undefined' ? '' : window.location.host;
const ASSET_REGISTRY_ORIGIN =
  typeof window === 'undefined' ? '' : window.origin;

type Props = {
  children: ReactNode;
};

export const AssetRegisterProvider: React.FC<Props> = ({ children }) => {
  const signer = useFutureverseSigner();
  const [address, setAddress] = useState<Address>();
  useEffect(() => {
    void (async () => {
      if (signer) {
        setAddress((await signer.getAddress()) as Address);
      }
    })();
  }, [signer]);

  const auth = useMemo(() => {
    if (!address || !signer) {
      return undefined;
    }
    return {
      origin: ASSET_REGISTRY_ORIGIN,
      domain: ASSET_REGISTRY_DOMAIN,
      chainId: 1,
      sign: (message: string) => signer.signMessage(message),
      walletAddress: address,
      storage: {
        get: (key: string) => localStorage.getItem(key),
        set: (key: string, value: string) => localStorage.setItem(key, value),
      },
    };
  }, [address, signer]);

  return (
    <AssetRegisterClientProvider url={url} auth={auth}>
      {children}
    </AssetRegisterClientProvider>
  );
};
