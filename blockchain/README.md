# PharmaGuard AI — BatchRegistry smart contract

Hardhat 2 + ethers v5 workspace (kept separate from the NestJS backend to avoid ESM/CommonJS conflicts).

`contracts/BatchRegistry.sol` stores a keccak256 fingerprint of every medicine batch and lets the backend revoke a batch permanently:

| Function | Who | Purpose |
|---|---|---|
| `registerBatch(batchNumber, batchHash)` | `REGISTRAR_ROLE` | Store a batch fingerprint (once) |
| `revokeBatch(batchNumber, reason)` | `REGISTRAR_ROLE` | Self-destructing identity: permanently invalidate a batch |
| `verifyBatch(batchNumber, hash)` | anyone | `true` only if registered, not revoked and the hash matches |
| `getBatch` / `getBatchDetails` / `isRegistered` / `isRevoked` | anyone | Read state |

Access control uses OpenZeppelin `AccessControl`. The deployer gets the admin and registrar roles. Set `REGISTRAR_ADDRESS` when deploying to grant the backend wallet the registrar role too.

## Commands

```bash
npm install
npm test                 # 7 tests
npm run node             # local chain on http://127.0.0.1:8545
npm run deploy:local     # deploy to the local chain
npm run deploy:sepolia   # deploy to Sepolia (needs .env, see .env.example)
npm run export-abi       # copy the ABI into apps/backend
```

When the official compiler download is blocked, Hardhat uses the `solc` npm package (`USE_LOCAL_SOLC`, on by default). Set `USE_LOCAL_SOLC=false` to use the native compiler.
