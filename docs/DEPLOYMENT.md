# Deploying PharmaGuard AI (free tiers)

You end up with:

| Part | Host | URL (example) |
|---|---|---|
| API + PostgreSQL + Redis | Render | `https://pharmaguard-api.onrender.com` |
| Web dashboard | Vercel | `https://pharmaguard-ai.vercel.app` |
| Smart contract | Ethereum Sepolia testnet | `0x…` |
| Android app | EAS Build (APK) | download link from Expo |

Do the steps in this order. Total time is about 45 minutes.

---

## 1. Get a Gemini API key (2 min)

1. Open <https://aistudio.google.com/apikey> and sign in with Google.
2. Click **Create API key** and copy it. Keep it for step 3.

Without a key the AI features still work using the built-in rule engine.

## 2. Blockchain: nothing to do (optional Sepolia)

By default the API runs its **own embedded Ethereum chain** inside the server: on start-up it deploys `BatchRegistry`, re-anchors existing batches, and records every new batch and revocation there. No wallet, keys or test ETH needed. Leave the `BLOCKCHAIN_*` variables empty.

Trade-off: the embedded chain is private to your server, so transactions are not visible on a public explorer. If you want public, verifiable transactions on Etherscan, deploy to Sepolia instead (below) and fill in the three `BLOCKCHAIN_*` variables in step 3.

### Optional: deploy to Sepolia (15 min)

You need a wallet that holds a little free Sepolia test ETH.

1. **Wallet:** install MetaMask, create a new account **used only for this project**, and copy its private key (Account details → Show private key). Never use a wallet that holds real money.
2. **Test ETH:** get free Sepolia ETH from a faucet such as <https://cloud.google.com/application/web3/faucet/ethereum/sepolia> (paste your wallet address).
3. **RPC URL:** create a free app at <https://dashboard.alchemy.com> (or Infura), choose Ethereum → Sepolia, and copy the HTTPS URL.
4. On your computer:

   ```bash
   cd blockchain
   npm install
   cp .env.example .env
   # edit .env: SEPOLIA_RPC_URL=<alchemy url>  DEPLOYER_PRIVATE_KEY=<wallet private key>
   USE_LOCAL_SOLC=false npm run deploy:sepolia
   ```

5. Copy the printed `BatchRegistry deployed: 0x…` address. It is also saved in `blockchain/deployments/sepolia.json` (safe to commit).

The API pays gas for every batch registration and revocation from this wallet. Each costs a tiny amount of test ETH. Top up from the faucet if it runs out.

## 3. Deploy the API, database and Redis on Render (10 min)

1. Sign in at <https://render.com> with GitHub.
2. **New → Blueprint**, pick the `pharmaguard-ai` repository. Render reads `render.yaml` and proposes:
   - `pharmaguard-api` (web service), `pharmaguard-db` (PostgreSQL), `pharmaguard-redis` (Key Value)
3. Fill in the values it asks for:

   | Variable | Value |
   |---|---|
   | `FRONTEND_URL` | your Vercel URL from step 4 (you can come back and set it after) |
   | `GEMINI_API_KEY` | key from step 1 |
   | `BLOCKCHAIN_RPC_URL`, `BLOCKCHAIN_PRIVATE_KEY`, `BLOCKCHAIN_CONTRACT_ADDRESS` | leave empty for the embedded chain, or fill in from the optional Sepolia step |
   | `BREVO_API_KEY` + `EMAIL_FROM` | optional email via Brevo's HTTPS API (use this on Render free, which blocks SMTP ports) |
   | `SMTP_*`, `TWILIO_*`, `FIREBASE_SERVICE_ACCOUNT` | optional, leave empty to skip email (SMTP needs a paid host) / SMS / push |

4. Click **Apply**. The first build takes about 5 minutes. Migrations run automatically, and `SEED_DEMO_DATA=true` creates the demo accounts.
5. Check `https://<your-api>.onrender.com/health`. It should show `"status":"ok"` with the database, blockchain and AI status. API docs are at `/api/docs`.

Free-tier notes:
- The API sleeps after 15 minutes without traffic. The first request after that takes about 30–50 seconds.
- Render's free PostgreSQL expires after 30 days. Upgrade it or create a new one and redeploy.
- Uploaded files (registration documents, QR images) are not kept across redeploys on the free plan.

Optional demo activity (batches, transfers and an active recall):

```bash
API=https://<your-api>.onrender.com bash apps/backend/scripts/demo-data.sh
```

## 4. Deploy the web app on Vercel (5 min)

1. Sign in at <https://vercel.com> with GitHub → **Add New → Project** → import `pharmaguard-ai`.
2. **Root Directory:** `apps/web` (Framework preset: Vite is detected).
3. **Environment variable:** `VITE_API_URL` = `https://<your-api>.onrender.com`
4. **Deploy.** You get a URL like `https://pharmaguard-ai.vercel.app`.
5. Go back to Render → `pharmaguard-api` → Environment and set `FRONTEND_URL` to this URL (this enables CORS for it and fixes links in emails). Render redeploys automatically.

Log in with `admin@pharmaguard.ai` / `Demo@1234` (see the README for all demo accounts). Change the passwords if you share the link publicly.

## 5. Build the Android app with EAS (10 min + build queue)

1. Create a free account at <https://expo.dev>.
2. Put your Firebase `google-services.json` in `apps/mobile/` (it is git-ignored). For cloud builds, upload it as an EAS file secret named `GOOGLE_SERVICES_JSON`:
   ```bash
   cd apps/mobile
   npx eas-cli login
   npx eas-cli init                      # links the project, prints a project ID
   npx eas-cli env:create --name GOOGLE_SERVICES_JSON --type file --value ./google-services.json --environment preview
   ```
3. In `apps/mobile/eas.json`, set `EXPO_PUBLIC_API_URL` in the `preview` profile to your Render URL.
4. Build an installable APK:
   ```bash
   npx eas-cli build --platform android --profile preview
   ```
5. When the build finishes, Expo shows a download link and QR code for the APK. For the Play Store, use `--profile production` (AAB).

## 6. Verify everything

Run the end-to-end check against the live API (it creates test data):

```bash
API=https://<your-api>.onrender.com bash apps/backend/scripts/e2e-smoke.sh
```

The tamper-detection step needs direct database access (`DATABASE_URL`). Without it, that step is skipped.

## Updating

Every push to `main` runs CI (GitHub Actions) and redeploys Render and Vercel automatically.
