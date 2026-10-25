# DAAM — Decentralized Identity & Digital Asset Governance Platform

> **A unified trust layer for decentralized identity, intelligent purpose-bound access governance, NFT asset passports, and verifiable chain of custody.**

---

## 📖 Executive Summary

**DAAM** is an enterprise-grade, cybersecurity-focused platform architected to solve the critical challenges of physical and digital asset governance in decentralized organizations. 

Rather than relying on conventional siloed databases or fragile credentials, DAAM combines:
- **Decentralized Identifiers (DIDs)** linked to cryptographic wallet addresses.
- **Dynamic Role-Based Access Control (RBAC)** coupled with **purpose-bound authorization**.
- **ERC-721 NFT Digital Asset Passports** that strictly decouple organizational ownership from operational custody.
- **State-machine lifecycle management** ensuring assets follow valid regulatory state transitions.
- **An append-only chain of custody ledger** preserving unbroken historical provenance.
- **A zero-leakage, privacy-preserving audit center** leveraging real **Web Crypto SHA-256** hashing.

The interface embodies an **"Editorial Cybersecurity meets Modern Digital Asset Studio"** aesthetic, featuring an automated horizontal storytelling showcase, asymmetric editorial typography, warm peach backgrounds, and vibrant pink accents.

---

## 🎨 Visual Identity & Design System

The platform strictly adheres to the curated design tokens specified in the product specification:

| Token | Hex Code | Purpose |
| :--- | :--- | :--- |
| **Base / Background** | `#FEE7C8` | Warm peach canvas evoking physical stationery & security papers |
| **Primary / Accent** | `#FF467A` | Vibrant high-visibility pink for primary actions, active tokens & badges |
| **Secondary** | `#FF9292` | Warm blush pink for supporting tags & hover highlights |
| **Deep Ink** | `#321B2A` | Deep contrast ink for headings, primary typography & dark cards |
| **Dark Muted Text** | `#74535C` | Refined muted text for technical descriptions and secondary labels |
| **White / Cream Surfaces** | `#FFF9F2` | Elevated card surfaces, form inputs, and modal backgrounds |
| **Success** | `#3D7A57` | Muted natural forest green for valid credentials & granted access |
| **Warning** | `#A8670C` | Warm amber for pending verification, maintenance & approval gates |
| **Destructive / Error** | `#B8403A` | Dark coral for suspensions, revocations, and policy denials |

### Typography & Layout
- **Display Font:** *Instrument Serif* — oversized editorial titles, numbered capabilities, and passport headers.
- **Sans-Serif Font:** *Geist Sans* — ultra-clean technical labels, body copy, and form fields.
- **Monospace Font:** *Geist Mono* — DIDs, wallet addresses, cryptographic hashes, and transaction references.
- **Geometry:** Generously rounded corners (`rounded-3xl`), razor-thin borders (`border-border`), subtle drop shadows, and asymmetric card layouts.

---

## 🌟 Key Features & Functional Modules

### 1. Automatic Horizontal Storytelling Landing Page
- **Hero Screen:** Displays the flagship headline (*"Identity you control. Assets you can verify."*), trust indicators, and an interactive identity-to-asset pipeline illustration (`Wallet → DID → Access Policy → NFT Passport → Audit Trail`).
- **Seamless Feature Exhibition:** An automated, infinite horizontal carousel moving smoothly from right to left showcasing the 8 core capabilities.
- **Interactive Controls:** Pauses automatically on pointer hover or keyboard focus, supports manual touch/drag swiping, includes play/pause toggle controls, and respects `prefers-reduced-motion`.

### 2. Wallet Connection & DID Resolution
- **Multi-Provider Modal:** Supports simulated connection for *Demo Wallet*, with placeholders for *MetaMask* and *WalletConnect*.
- **Persona Switcher:** Quick switcher supporting four distinct demo personas:
  - **Admin** (`did:bel:admin:0001`): Full governance over identity verification, asset registration, and policy rules.
  - **Manager** (`did:bel:manager:0417`): Manages custody handovers, approvals, and lifecycle changes.
  - **User** (`did:bel:employee:1023`): Requests purpose-bound access to operational assets.
  - **Auditor** (`did:bel:auditor:0091`): Read-only inspection with real cryptographic hash verification.
- **Unregistered Wallet Onboarding:** Connect with an unlinked address to walk through self-service registration and administrator approval.

### 3. Command & Governance Dashboard (`/app`)
- **Operational Metrics:** Real-time counters for Registered Assets, Active Identities, Pending Approvals, and Custody Events.
- **Active Persona Context Banner:** Highlights active DID, wallet address, role, and operational capabilities.
- **Interactive Trust Flow Diagram:** High-level visualization of the 4 trust layers.
- **Actionable Governance Queue:** Instant approve/reject controls for pending access requests and custody transfers (with separation-of-duties enforcement).
- **Attention Asset Tracker & Identity Distribution:** Visual bars displaying identity status proportions and assets requiring maintenance.

### 4. Identity & Credential Governance Registry (`/app/identity`)
- **DID Table & Credential Inspector:** Lists all organizational personas, wallet mappings, organizational units, roles, and credential states.
- **Supported Identity States:** `Pending`, `Verified`, `Active`, `Suspended`, `Revoked`.
- **Administrative Governance Actions:**
  - Verify pending registrations and assign enterprise RBAC roles.
  - Suspend identities with instant global policy enforcement.
  - Reinstate suspended identities.
  - Revoke credentials permanently with confirmation modals.
- **Status-Gated Enforcement:** Suspended or revoked identities are instantly blocked from initiating protected actions across the entire platform.

### 5. Dynamic RBAC & Purpose-Bound Access Engine (`/app/access`)
- **Live Access Request Console:** Submit purpose-bound requests by specifying Requesting DID, Target Asset, Requested Action, Purpose, and Duration.
- **Transparent Policy Checklist:** Real-time animated evaluation checking:
  1. *Wallet identity recognized?*
  2. *DID active & credential valid?*
  3. *Role authorized for requested action?*
  4. *Target asset state eligible?*
  5. *Requested action enabled in policy?*
  6. *Purpose permitted for this asset?*
  7. *Additional conditions & duration limits satisfied?*
- **Clear Explanations:** Explains exact grounds for `Access Granted`, `Access Denied`, or `Approval Required`.
- **Zero-Risk Policy Simulator:** Interactive sandbox letting evaluators toggle role, identity status, asset status, purpose, and action to observe instant deterministic verdicts.
- **Decision History Ledger:** Historical record of every evaluation timestamped with outcome reasons.

### 6. NFT Digital Asset Passports (`/app/assets` & `/app/assets/[id]`)
- **Tokenized Digital Twins:** Every registered asset is bound to an ERC-721 style simulated NFT identifier.
- **Ownership vs. Custody Delineation:** Legal ownership permanently resides with the organization (`BEL`), while operational custody is assigned to individual employees or field teams.
- **Asset Passport View:**
  - Distinctive large token badge (`NFT #0001`).
  - Immutable metadata hash & IPFS URI reference.
  - State machine lifecycle transition controls with rule validation.
  - Chronological custody timeline specific to the asset.
  - Attached cryptographic document hashes with real in-browser SHA-256 calculation.
  - Related authorization decisions history.

### 7. Asset Lifecycle State Machine
- **Supported States:** `Registered`, `Active`, `Maintenance`, `Retired`, `Revoked`.
- **Deterministic Transitions:**
  - `Registered` → `Active`, `Revoked`
  - `Active` → `Maintenance`, `Retired`, `Revoked`
  - `Maintenance` → `Active`, `Retired`, `Revoked`
  - `Retired` → *Terminal decommission*
  - `Revoked` → *Terminal invalidation*
- Prevents illegal transitions with explicit explanations; updates dependent policy evaluations immediately.

### 8. Verifiable Chain of Custody (`/app/custody`)
- **Connected-Node Timeline:** Interactive visual timeline tracing prior custodian, new custodian, initiating DID, approver, transfer purpose, timestamp, and simulated transaction reference.
- **Interactive Transfer Workflow:** Managers can initiate custody handovers; policy pre-flight checks validate both identities and asset readiness.
- **Separation of Duties:** The policy engine prevents transfer initiators from approving their own custody requests.

### 9. Privacy-Preserving Cryptographic Audit Center (`/app/audit`)
- **Zero-Leak Security Model:** Sensitive payload documents are kept in encrypted off-chain storage (`enc://vault/...`). Only their cryptographic fingerprint is placed on the audit ledger.
- **Browser Web Crypto SHA-256 Verifier:** Uses native `window.crypto.subtle.digest('SHA-256')` to re-compute document hashes in real time.
- **Interactive Tamper Simulation:** Evaluators can tamper with the document text to witness immediate integrity mismatch detection.
- **Audit Event Explorer:** Filterable ledger logging every identity event, role change, access grant/denial, NFT mint, custody handover, and lifecycle transition.

### 10. Enterprise Policy Management (`/app/policies`)
- **Admin Policy Console:** Fine-tune authorized roles, permitted purposes, allowed asset states, and approval gates for all operational actions.
- **Global Identity Blocks:** Configure which identity states (e.g. `Suspended`, `Revoked`) globally invalidate operations.
- **Live Rule Preview:** Live summary of effective rules with instant state propagation.

### 11. Guided Walkthrough Simulator (`/app/settings` & Header)
- Built-in **16-Step Guided Walkthrough** that automatically leads evaluators through the required end-to-end scenario with interactive step prompts and highlighted UI elements.

---

## 🛠️ Technology Stack

| Layer | Technology |
| :--- | :--- |
| **Framework** | [Next.js 16](https://nextjs.org/) (App Router, Turbopack) |
| **Library** | [React 19](https://react.dev/) & TypeScript 5.7 |
| **Styling** | [Tailwind CSS v4](https://tailwindcss.com/) (`@tailwindcss/postcss`) & Custom Design Tokens |
| **Icons** | [Lucide React](https://lucide.dev/) |
| **Typography** | Google Fonts (*Instrument Serif*, *Geist Sans*, *Geist Mono*) |
| **Cryptography** | Native Browser Web Crypto API (`window.crypto.subtle`) for SHA-256 |
| **State Management** | Centralized Reactive React Context Store (`lib/daam/store.tsx`) |

---

## 🚀 Installation & Local Setup

### Prerequisites
- **Node.js**: v20.x or v22.x (Tested on Node v22.18.0)
- **npm** or **pnpm** (npm v10+ recommended)

### 1. Clone or Open the Repository
```bash
cd d:/Git_Projects/DAAM
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Run the Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

*(Alternative: You can build and start the optimized production server)*:
```bash
npm run build
npm start
```

---

## 🧭 Application Navigation Guide

| Route | View | Description |
| :--- | :--- | :--- |
| `/` | **Landing Page** | Editorial showcase with automatic horizontal scrolling exhibition |
| `/app` | **Overview Console** | Operational metrics, active persona context, trust architecture & queue |
| `/app/identity` | **Identity & Credentials** | Verifiable DID registry, role assignment, suspension & revocation |
| `/app/assets` | **Asset Registry** | Card/Table browser of tokenized assets and "Mint Passport" trigger |
| `/app/assets/[id]` | **Asset Passport** | NFT identity card, state machine transitions, custody log & document hashes |
| `/app/access` | **Access & Policy** | Purpose-bound access requests, transparent checklist & sandbox simulator |
| `/app/custody` | **Chain of Custody** | Connected-node custody timeline and demo transfer handover console |
| `/app/audit` | **Audit Center** | Tamper-evident event explorer & Web Crypto SHA-256 hash verifier |
| `/app/policies` | **Policy Management** | Admin configuration of RBAC rules, permitted purposes, and gates |
| `/app/settings` | **Settings & Demo** | State reset, JSON snapshot export, and smart contract architecture specs |

---

## 🧪 Recommended Evaluation Scenario (16-Step Walkthrough)

To experience the complete trust lifecycle, click the **"Guided demo"** button in the header or follow these steps:

1. **Connect as Admin**: Open the wallet modal, choose **Demo Wallet**, select the **Admin** persona (`did:bel:admin:0001`), and connect.
2. **Verify Pending Identity**: In `/app/identity`, find pending identity `did:bel:employee:2088`, verify it, and assign the **User** role.
3. **Mint NFT Asset Passport**: In `/app/assets`, click **Register Asset & Mint NFT** to register `BEL-TX-9001` (Transceiver Array), then transition it to **Active**.
4. **Assign Custodian**: In `/app/custody`, transfer custody of `BEL-TX-9001` from the registry vault to `did:bel:employee:2088`.
5. **Switch to Manager**: Use the top-right persona switcher to switch to **Manager** (`did:bel:manager:0417`).
6. **Request Purpose-Bound Access**: In `/app/access`, request *"View maintenance record"* on `BEL-TX-9001` with purpose *"Scheduled maintenance"*.
7. **Inspect Policy Verdict**: Observe the transparent checklist pass and the policy engine return **Access Granted**.
8. **Transition to Maintenance**: On the asset passport (`/app/assets/BEL-TX-9001`), transition the state from **Active → Maintenance**.
9. **Handover Custody to Maintenance**: Transfer custody to `did:bel:maint:team-07` for scheduled maintenance.
10. **Anchor Document Hash**: On the asset passport, click **Anchor Document** to compute and anchor a maintenance report hash with Web Crypto.
11. **Switch to Auditor**: Use the persona switcher to switch to **Auditor** (`did:bel:auditor:0091`).
12. **Inspect Passport History**: Review the complete immutable custody log and ownership vs. custody distinction.
13. **Verify Cryptographic Hash**: In `/app/audit`, select the anchored maintenance report and click **Re-Compute & Verify SHA-256**. Test the **Tamper Simulation** button to verify that altered bytes trigger an instant mismatch.
14. **Suspend Identity**: Switch back to **Admin** in `/app/identity` and suspend `did:bel:employee:2088`.
15. **Attempt Protected Operation**: In `/app/access`, attempt an access request as the suspended DID. Observe the policy engine return **Access Denied** (*"Access denied because this identity is suspended"*).
16. **Review Tamper-Evident Audit Trail**: In `/app/audit`, verify that the suspension, denial, and prior transfers are all permanently recorded with cryptographic hashes.

---

## 🔒 Security & Smart Contract Readiness

- **Isolated Cryptographic Adapters**: Real SHA-256 hashing is executed client-side via the W3C Web Crypto standard (`crypto.subtle`).
- **EVM Contract Interface Parity**: Store actions map directly to EVM smart contract interfaces (`DIDRegistry.sol`, `AssetPassportNFT.sol`, `AuditAnchor.sol`), facilitating plug-and-play migration to Ethereum, Polygon, or Arbitrum testnets.
- **Zero Key Storage**: No sensitive employee private keys or authentication secrets are stored in insecure browser storage.

---

## 📄 License
This project was built for evaluation and demonstration as a Decentralized Identity & Digital Asset Governance Platform prototype. All rights reserved.
