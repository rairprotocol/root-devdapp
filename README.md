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

- [ ] Add TrnProvider from `@futureverse/transact-react` To Futureverse Providers
- [ ] Query Users Root and XRP Balances and display in Menu Bar (shadcn/ui drop down)
  - [ ] Add Accounts to Wallet (shadcn/ui)
    - [ ] Use useShouldShowEoa to display EOA if allowed
    - [ ] Add Account Component
      - [ ] Add Balance (iterate through assets)
        - [ ] useGetUserBalance
          - [ ] getBalance function in useQuery
          - [ ] transactionQuery from useTransactionQuery
        - [ ] useGetUserBalances
          - [ ] getBalances function in useQuery

### Step 3 - Mint NFTs to users FuturePass

- [ ] Update Home Page To Link to New Mint Page
- [ ] Create a mint page to mint nft
  - [ ] Update Navigation Bar (shadcn/ui)
    - [ ] Add Mint Mav Link
  - [ ] add `(authed)` Route Folder
    - [ ] add layout.tsx
      - [ ] set up cookies/userSession validation using /me endpoint
      - [ ] ensure server only auth function used
    - [ ] add `/mint` route
      - [ ] Get required items for Transact SDK (UserSession, TrnApi, Signer)
      - [ ] Set up States
        - [ ] gas
        - [ ] payload
        - [ ] walletToPayGas
        - [ ] gasTokenId
        - [ ] toSign
        - [ ] currentBuilder
        - [ ] mint qty
        - [ ] show modal
      - [ ] useGetTokenCount
        - [ ] eoa
        - [ ] fpass
      - [ ] handleQty Change function
      - [ ] onSuccessCallback function to refetch count
      - [ ] create mintBuilder component
        - [ ] run address through getAddress & null address validation
        - [ ] add getExtrinsic
        - [ ] gas Fees
        - [ ] payloads
        - [ ] setUp mint extrinsic through transact
        - [ ] set up gas fee proxy
        - [ ] set up pass proxy
        - [ ] show modal when to sign has been set
      - [ ] Add Mint Control component
        - [ ] pass in mint qty, handle set Mint Qty, totalCount & isFetching
        - [ ] Slider with numeric input (shadcn/ui)
          - [ ] only show futurepass proxy if useEoa is ok
        - [ ] Add Fee Proxy (shadcn/ui)
        - [ ] Add Pass Proxy (shadcn/ui)
- [ ] Components to Display Mint Result (shadcn/ui)
  - [ ] Add Modal
    - [ ] Dialog (shadcn/ui)
    - [ ] States for
      - [ ] Sign
      - [ ] Signed
      - [ ] Processing
      - [ ] Success
      - [ ] Error
    - [ ] onSign Callback
    - [ ] onSend Callback
    - [ ] result Callback
    - [ ] add signExtrinsic function
- [ ] Add validation for user balance > gas payments
  - [ ] Check user balance is greater than the gas amount
  - [ ] Check user not balance is less than required amount
- [ ] Add sign logic to mint to fpass

### Step 4 - Mint SFTs to users FuturePass

- [ ] Create a mint page to mint multiple SFTs
  - [ ] Add `/accessories`
    - [ ] add page.tsx
    - [ ] update navigation
    - [ ] add useGetSftUserTokens
    - [ ] add SftToken.tsx
    - [ ] add SftSelector.tsx
    - [ ] implement in page.tsx
      - [ ] Set Up TokenType
      - [ ] useGetSftUserTokens for each wallet and collection
        - [ ] merged collection function to combine wallet ownership
      - [ ] onSuccessful Mint callback
      - [ ] set up Mint Builder function
        - [ ] trnApi, signer & user session checks
        - [ ] addressToSend & validation
        - [ ] getExtrinsic function to get gasFees & Payloads
        - [ ] getTokensToMint function to prepare the extrinsics
        - [ ] prepare extrinsics
        - [ ] create Batch Transact
        - [ ] implement SftSelector on page.tsx
- [ ] Add logic to display mint result
  - [ ] Update Mint Qty

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
