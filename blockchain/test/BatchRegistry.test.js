const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("BatchRegistry", function () {
  let registry, owner, stranger;
  const HASH = ethers.utils.id("batch-payload");

  beforeEach(async function () {
    [owner, stranger] = await ethers.getSigners();
    const Factory = await ethers.getContractFactory("BatchRegistry");
    registry = await Factory.deploy();
    await registry.deployed();
  });

  it("registers a batch and returns it", async function () {
    await expect(registry.registerBatch("ASP-001", HASH)).to.emit(registry, "BatchRegistered");
    const [num, hash, ts] = await registry.getBatch("ASP-001");
    expect(num).to.equal("ASP-001");
    expect(hash).to.equal(HASH);
    expect(ts).to.be.gt(0);
    expect(await registry.totalBatches()).to.equal(1);
  });

  it("rejects duplicate registration", async function () {
    await registry.registerBatch("ASP-001", HASH);
    await expect(registry.registerBatch("ASP-001", HASH)).to.be.revertedWith("Batch already registered");
  });

  it("rejects empty input", async function () {
    await expect(registry.registerBatch("", HASH)).to.be.revertedWith("Batch number required");
    await expect(registry.registerBatch("ASP-002", "")).to.be.revertedWith("Batch hash required");
  });

  it("only lets registrars write", async function () {
    await expect(registry.connect(stranger).registerBatch("ASP-003", HASH)).to.be.reverted;
    await registry.registerBatch("ASP-003", HASH);
    await expect(registry.connect(stranger).revokeBatch("ASP-003", "x")).to.be.reverted;
  });

  it("verifies the matching hash and detects tampering", async function () {
    await registry.registerBatch("ASP-004", HASH);
    expect(await registry.verifyBatch("ASP-004", HASH)).to.equal(true);
    expect(await registry.verifyBatch("ASP-004", ethers.utils.id("tampered"))).to.equal(false);
    expect(await registry.verifyBatch("UNKNOWN", HASH)).to.equal(false);
  });

  it("revokes permanently (self-destructing identity)", async function () {
    await registry.registerBatch("ASP-005", HASH);
    await expect(registry.revokeBatch("ASP-005", "EXPIRED")).to.emit(registry, "BatchRevoked");
    expect(await registry.isRevoked("ASP-005")).to.equal(true);
    expect(await registry.verifyBatch("ASP-005", HASH)).to.equal(false);
    const details = await registry.getBatchDetails("ASP-005");
    expect(details.revocationReason).to.equal("EXPIRED");
    await expect(registry.revokeBatch("ASP-005", "again")).to.be.revertedWith("Batch already revoked");
    await expect(registry.revokeBatch("NOPE", "x")).to.be.revertedWith("Batch not registered");
  });

  it("allows the admin to grant registrar role", async function () {
    const role = await registry.REGISTRAR_ROLE();
    await registry.grantRole(role, stranger.address);
    await expect(registry.connect(stranger).registerBatch("ASP-006", HASH)).to.emit(registry, "BatchRegistered");
  });
});
