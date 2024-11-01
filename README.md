# Futureverse Workshop

All packages have been preinstalled for you, we will work through the steps as we go. If you fall behind, you can pick up on the next step and copy in the files needed to catch you up.

To run this app, please run `npm run dev`

## Important Links

- [Playground](https://playground.therootnetwork.com/)
- [Faucet](https://faucet.rootnet.cloud/)
- [Portal](https://portal.rootnet.live/)
- [SDK Documentation](https://docs.futureverse.com/dev/)
- [Pass.Online Client Creation](https://login.passonline.cloud/manageclients)
- [shadcn/ui - Components For Demo](https://ui.shadcn.com/docs)

## Getting Started

- When prompted, head to the [Root Network Playground](https://playground.therootnetwork.com/) and create your Pass.Online for our testnet, Porcini.
- Get some testnet funds from our [Faucet](https://faucet.rootnet.cloud/).
- Clone this repo in Replit.

## API Keys

- [Pass.Online Client Portal](https://login.passonline.cloud/manageclients) - If you want to create your own Pass Online, create it here, ensuring you use the ExAcT url of your Replit URL for the callback url.
- [Wallet Connect](https://cloud.reown.com/sign-in)

## Steps

### Step 1 - Connect using FuturePass

- [ ] Create config.ts Auth Config
  - [ ] All Environment Variables
  - [ ] Add Auth Config
  - [ ] Add Wagmi Config
  - [ ] Add Query Client
- [ ] Add Futureverse Providers
  - [ ] React Query Provider
  - [ ] Futureverse Wagmi Providers
  - [ ] Futureverse Auth Provider
  - [ ] Auth UI Provider
- [ ] Add Login Button to Nav Bar
- [ ] Add `/login` Callback Page To Handle UserSession
- [ ] Display User Address In Nav Bar

### Step 2 - Interact with Blockchain

- [ ] Add TrnProvider Provider
- [ ] Query Users Root and XRP Balances and display in Menu Bar

### Step 3 - Mint NFTs to users FuturePass

- [ ] Create a mint page to mint NFT
- [ ] Create Protected Routes
  - [ ] Create `/mint` route
    - [ ] Add Mint Control component
    - [ ] Add Modal

### Step 4 - Mint SFTs to users FuturePass

- [ ] Create a mint page to mint multiple SFTs
  - [ ] Create /accessories and associated components
  - [ ] useGetSftUserTokens for each wallet and collection

### Step 5 - Introduce AR

- [ ] Add Asset Register Provider to Futureverse Providers
  - [ ] AssetRegisterProvider.tsx
- [ ] Add Page to query users assets and display minted tokens
  - [ ] Create `/my-collection` route and implement useAssets Hook
  - [ ] Create NFT Component to display NFT

### Step 6 - Equip / Unequip Items

- [ ] Add Component's to enable equipping SFTs to base NFT
  - [ ] Create ARModal for Signing
  - [ ] Add NftAssetLinkerAccessories for Accessories
  - [ ] Add NftAssetLinkerSlots for Slots from Schema
  - [ ] Add NFTAssetLinker Component to NFTToken Component passing in Slots.
  - [ ] Adding `NftAssetLinker.tsx` component, with `useGetAsset` and `useGetSlots` hooks to `NftToken.tsx`

### Step 7 - Added Bonus

- [ ] Customise Log In
- [ ] Add RNS Functionality
