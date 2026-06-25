
<h1 align="center">🛍️ MerchantLink</h1>
<p align="center">
  <img src="./banner.png" alt="MerchantLink Banner" width="100%">
</p>

<p align="center">
  <strong>A zero-fee, blockchain-powered Point-of-Sale (POS) platform bridging real-world merchants with Solana-native consumers.</strong>
</p>

<p align="center">
  <a href="https://explorer.solana.com/address/Do2bnhgFrAxQbGB4woahzBKyQZm4efHaDnk2FQzSVsJh?cluster=devnet">
    <img src="https://img.shields.io/badge/Solana-Devnet-blueviolet?logo=solana" alt="Devnet">
  </a>
  <img src="https://img.shields.io/badge/Anchor-v1.0.2-blue" alt="Anchor">
  <img src="https://img.shields.io/badge/Token--2022-SPL-green" alt="Token-2022">
  <img src="https://img.shields.io/badge/React-v19-61DAFB?logo=react" alt="React">
  <img src="https://img.shields.io/badge/Vite-v8-646CFF?logo=vite" alt="Vite">
</p>

---

## 📋 Table of Contents

- [The Vision](#-the-vision)
- [Key Features](#-key-features)
- [Architecture](#-architecture)
- [How the Smart Contract Works](#-how-the-smart-contract-works)
- [Tech Stack](#-tech-stack)
- [Project Structure](#-project-structure)
- [Getting Started](#-getting-started)
- [Frontend dApp](#-frontend-dapp)
- [Devnet Deployment](#-devnet-deployment)
- [End-to-End Testing Flow](#-end-to-end-testing-flow)
- [Vercel Deployment](#-vercel-deployment)
- [License](#-license)

---

## 🌟 The Vision

Traditional POS systems are fragmented, taking massive cuts from gift card sales and making loyalty point tracking a hassle. **MerchantLink** transforms this process by putting the power back into the hands of the merchant and consumer.

By leveraging Solana's high throughput and Token-2022's advanced extension capabilities, we enable a frictionless Web3 retail experience where gift cards act as standard tokens and loyalty points are permanently tied to the consumer's identity.

---

## 🚀 Key Features

| Feature | Description |
|---------|-------------|
| 💵 **USDC Payments** | Consumers buy gift cards using USDC, which routes instantly and automatically to the merchant's wallet. |
| 🎁 **Token-2022 Gift Cards** | Gift cards are minted dynamically as Token-2022 assets. They can be freely traded, gifted, or held in any compatible Solana wallet. |
| 🔒 **Soulbound Loyalty Points** | Utilizing Token-2022's `NonTransferable` extension, every gift card purchase rewards the consumer with a loyalty point that is mathematically bound to their wallet and cannot be sold or transferred. |
| 🏪 **In-Store Redemption** | Consumers can seamlessly burn their gift cards in-store to pay for real-world goods. |
| ⚡ **Off-Chain Webhooks** | Emits heavily structured Solana events (`GiftCardRedeemed`) that backend servers can listen to in real-time, instantly updating real-world inventory or POS systems. |
| 🌐 **Mobile-First dApp** | A beautiful, glassmorphism-styled React frontend with full wallet integration (Phantom, Solflare). |
| 📊 **Live Blockchain Data** | The UI dynamically fetches real registered merchants and transaction history directly from Solana Devnet. |

---

## 🏗️ Architecture

The backend is built around a streamlined, atomic architecture designed to minimize on-chain bloat while maximizing security.

```
┌─────────────────────────────────────────────────────────────────┐
│                        MerchantLink Program                     │
│                                                                 │
│  ┌──────────────────┐  ┌──────────────┐  ┌──────────────────┐  │
│  │ InitializeMerchant│  │ BuyGiftCard  │  │ RedeemGiftCard   │  │
│  │                  │  │              │  │                  │  │
│  │ • Creates Merchant│  │ • USDC → ATA │  │ • Burns Gift Card│  │
│  │   State PDA      │  │ • Mint Card  │  │ • Tracks Analytics│  │
│  │ • Gift Card Mint │  │ • Mint Loyalty│  │ • Fires Events   │  │
│  │ • Loyalty Mint   │  │ • Atomic CPI │  │ • POS Webhook    │  │
│  │   (NonTransfer.) │  │              │  │                  │  │
│  └──────────────────┘  └──────────────┘  └──────────────────┘  │
│                                                                 │
│  Token-2022 Program (CPI)          SPL Token Program (USDC)    │
└─────────────────────────────────────────────────────────────────┘
```

### Instruction Flow

1. **`InitializeMerchant`** — The merchant sets up their profile, registering the fixed cost of a gift card. Two mints are automatically deployed via CPI:
   - A standard Token-2022 mint for **Gift Cards**
   - A Token-2022 mint with the **Non-Transferable Extension** for **Loyalty Points**

2. **`BuyGiftCard`** — A fully atomic, multi-program transaction. The consumer pays USDC to the merchant's Associated Token Account (ATA). In the exact same transaction, the merchant's PDA mints 1 Gift Card and 1 Soulbound Loyalty Point back to the consumer.

3. **`RedeemGiftCard`** — The consumer burns their gift card from their wallet. The contract tracks the analytical data and fires a `GiftCardRedeemed` event for the merchant's Web2 server to catch and process the physical world sale.

---

## 🔧 How the Smart Contract Works

### Accounts & PDAs

| Account | Type | Purpose |
|---------|------|---------|
| `MerchantState` | PDA (`[b"merchant", admin.key()]`) | Stores merchant config: admin pubkey, gift card price, mints, and analytics |
| `gift_card_mint` | Token-2022 Mint | Fungible mint for gift card tokens |
| `loyalty_mint` | Token-2022 Mint (NonTransferable) | Soulbound mint for loyalty points |
| `merchant_usdc_ata` | Associated Token Account | Merchant's USDC receiving wallet |
| `buyer_gift_card_ata` | Associated Token Account | Consumer's gift card token account |
| `buyer_loyalty_ata` | Associated Token Account | Consumer's loyalty point account |

### Token-2022 Extensions Used

- **`NonTransferable`** — Applied to the Loyalty Point mint, making loyalty points permanently bound to the consumer's wallet (soulbound tokens).
- **Standard Mint** — Gift cards use a regular Token-2022 mint, allowing free transfer and trading between wallets.

---

## 🛠️ Tech Stack

| Layer | Technology |
|-------|-----------|
| **Smart Contracts** | Rust & Anchor Framework (`v1.0.2`) |
| **Token Standard** | SPL Token-2022 (`spl-token-2022`) |
| **Payments** | SPL Token (USDC standard) |
| **Local Testing** | LiteSVM (Fast, in-process Solana validator) |
| **Frontend** | React 19 + TypeScript + Vite 8 |
| **Wallet Adapter** | `@solana/wallet-adapter-react` (Phantom, Solflare) |
| **Blockchain SDK** | `@coral-xyz/anchor` + `@solana/web3.js` |
| **Styling** | Custom CSS with glassmorphism design system |
| **Hosting** | Vercel (Frontend) / Solana Devnet (Smart Contract) |

---

## 📁 Project Structure

```
merchant-link/
├── Anchor.toml                 # Anchor workspace configuration
├── Cargo.toml                  # Rust workspace manifest
├── README.md                   # This file
├── banner.png                  # Project banner image
│
├── programs/
│   └── merchant-link/
│       └── src/
│           ├── lib.rs          # Program entrypoint & instruction routing
│           ├── constants.rs    # Program constants & seeds
│           ├── error.rs        # Custom error definitions
│           ├── events.rs       # On-chain event definitions
│           ├── state.rs        # Account state structs (MerchantState)
│           ├── instructions.rs # Instruction module exports
│           └── instructions/   # Individual instruction handlers
│
├── tests/                      # Rust integration tests (LiteSVM)
│
├── app/                        # Frontend React dApp
│   ├── index.html
│   ├── vite.config.ts          # Vite + Node polyfills config
│   ├── package.json
│   ├── vercel.json             # Vercel SPA routing config
│   └── src/
│       ├── main.tsx            # App entrypoint + wallet provider
│       ├── App.tsx             # Main app shell with tab navigation
│       ├── index.css           # Global styles & glassmorphism theme
│       ├── idl/
│       │   └── merchant_link.json  # Program IDL (auto-generated)
│       ├── components/
│       │   ├── WalletContextProvider.tsx  # Solana wallet setup
│       │   ├── LoginScreen.tsx            # Wallet connect screen
│       │   ├── UserOnboarding.tsx         # Profile setup flow
│       │   ├── InitializeProtocol.tsx     # Merchant admin panel
│       │   ├── CouponTicket.tsx           # Gift card visual component
│       │   └── Navbar.tsx                 # Top navigation bar
│       └── pages/
│           └── MerchantDashboard.tsx  # Buy/Issue gift cards
│
└── target/                     # Build artifacts
    ├── deploy/                 # Compiled .so program binary
    └── idl/                    # Generated IDL
```

---

## 🏁 Getting Started

### Prerequisites

- **Rust & Cargo** — [Install](https://rustup.rs/)
- **Solana CLI** (`v1.18+`) — [Install](https://docs.solana.com/cli/install-solana-cli-tools)
- **Anchor CLI** (`v1.0.2`) — [Install](https://www.anchor-lang.com/docs/installation)
- **Node.js** (`v20+`) and **npm**

### Build the Smart Contract

```bash
# Clone the repository
git clone https://github.com/SAMIR897/capstone_MerchantLink.git
cd capstone_MerchantLink

# Build the Anchor program
anchor build
```

### Run Tests

```bash
cargo test
```

### Deploy to Devnet

```bash
# Ensure your Solana CLI is configured for Devnet
solana config set --url devnet

# Deploy
solana program deploy target/deploy/merchant_link.so \
  --program-id target/deploy/merchant_link-keypair.json \
  --url devnet \
  --with-compute-unit-price 50000 \
  --max-sign-attempts 100
```

---

## 💻 Frontend dApp

MerchantLink includes a fully functional, mobile-first Web3 dApp built with React and Vite. It serves as the main portal for both Merchants and Consumers.

### Frontend Features

- 🔐 **Wallet Integration** — Full integration with Phantom, Solflare, and other Solana wallets
- 🏪 **Merchant Admin Panel** — Initialize your protocol, set gift card prices, and deploy mints directly from the UI
- 🛒 **Consumer Dashboard** — Browse registered merchants, buy gift cards, and issue cards to others
- 📊 **Live Activity Feed** — Real transaction history pulled directly from Solana Devnet
- 🔍 **Explore Tab** — Dynamically fetches all registered merchants from the blockchain
- 👤 **Profile & Settings** — Account management with wallet details and protocol initialization

### Running the Frontend Locally

```bash
cd app
npm install
npm run dev
```

The app will start at `http://localhost:5173`.

---

## 🌐 Devnet Deployment

The MerchantLink smart contract is **live on Solana Devnet**.

| Item | Value |
|------|-------|
| **Program ID** | `Do2bnhgFrAxQbGB4woahzBKyQZm4efHaDnk2FQzSVsJh` |
| **Network** | Solana Devnet |
| **Explorer** | [View on Solana Explorer](https://explorer.solana.com/address/Do2bnhgFrAxQbGB4woahzBKyQZm4efHaDnk2FQzSVsJh?cluster=devnet) |
| **Deploy Authority** | `Awx1ouo1h4svLsLRP2KvKYmfYGm6HamYcqyKuY4B9Uye` |

---

## 🧪 End-to-End Testing Flow

1. **Connect Wallet** — Open the dApp and connect your Phantom wallet (set to Devnet).
2. **Get Devnet USDC** — Obtain Devnet USDC from a standard SPL token faucet.
3. **Complete Onboarding** — Enter your display name, email, and role during the onboarding flow.
4. **Initialize Protocol** — Go to the **Profile** tab, scroll to **Initialize Protocol**, enter your Devnet USDC Mint address and set a price, then click **Launch Protocol** to deploy your merchant store on-chain.
5. **Buy a Gift Card** — Go to the **Dashboard** tab, select **Buy from The Platform**, enter an amount, and click **Purchase**. The smart contract will deduct your USDC and mint your Gift Card + Loyalty tokens in a single atomic transaction.
6. **View Activity** — Switch to the **Activity** tab to see your real on-chain transaction history.
7. **Explore Merchants** — Check the **Explore** tab to see all registered merchants fetched live from the blockchain.

---

## 🚀 Vercel Deployment

The frontend is deployed on Vercel for instant global access.

### Deploy Your Own

1. Fork this repository.
2. Go to [Vercel](https://vercel.com/) and import the repo.
3. Set the **Root Directory** to `app`.
4. Vercel will auto-detect **Vite** as the framework.
5. Click **Deploy** — done!

### Configuration

A `vercel.json` is included in the `app/` directory to handle SPA routing:

```json
{
  "rewrites": [{ "source": "/(.*)", "destination": "/index.html" }]
}
```

---

## 📜 License

This project is open source and available under the [MIT License](LICENSE).

---

<p align="center">
  <strong>Built with ❤️ for the Solana Turbin3 Capstone</strong>
</p>
