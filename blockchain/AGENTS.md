# Hardhat 2 + ethers v5 project

This workspace uses **Hardhat 2.22** with `@nomiclabs/hardhat-ethers` and **ethers v5** (not Hardhat 3 / ethers v6).

```
contracts/   BatchRegistry.sol (OpenZeppelin AccessControl)
test/        Mocha + chai tests (JavaScript)
scripts/     deploy.js, export-abi.js
hardhat.config.js
```

- Run `npx hardhat test` after any contract change.
- After changing the contract ABI, run `npm run export-abi` so `apps/backend/src/modules/blockchain/abi.ts` stays in sync.
- Keep `getBatch(string)` backwards compatible; the backend falls back to it on older deployments.
