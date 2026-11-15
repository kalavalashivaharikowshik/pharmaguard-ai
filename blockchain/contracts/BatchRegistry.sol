// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/AccessControl.sol";

/**
 * @title BatchRegistry
 * @notice Immutable registry of pharmaceutical batch fingerprints for PharmaGuard AI.
 *
 * Each batch is stored as a keccak256 hash of its critical data (batch number,
 * drug name, manufacture date, expiry date, quantity). The backend recomputes
 * that hash from its database and compares it with the on-chain value to detect
 * tampering. A batch can also be revoked on-chain (the "self-destructing digital
 * drug identity"), after which `isValid` returns false forever.
 */
contract BatchRegistry is AccessControl {
    bytes32 public constant REGISTRAR_ROLE = keccak256("REGISTRAR_ROLE");

    struct BatchRecord {
        string batchNumber;
        string batchHash;
        uint256 registeredAt;
        address registeredBy;
        bool revoked;
        uint256 revokedAt;
        string revocationReason;
    }

    mapping(string => BatchRecord) private batches;
    uint256 public totalBatches;
    uint256 public totalRevoked;

    event BatchRegistered(string batchNumber, string batchHash, uint256 registeredAt, address indexed registeredBy);
    event BatchRevoked(string batchNumber, string reason, uint256 revokedAt, address indexed revokedBy);

    constructor() {
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _grantRole(REGISTRAR_ROLE, msg.sender);
    }

    function registerBatch(string memory batchNumber, string memory batchHash)
        public
        onlyRole(REGISTRAR_ROLE)
    {
        require(bytes(batchNumber).length > 0, "Batch number required");
        require(bytes(batchHash).length > 0, "Batch hash required");
        require(bytes(batches[batchNumber].batchNumber).length == 0, "Batch already registered");

        batches[batchNumber] = BatchRecord({
            batchNumber: batchNumber,
            batchHash: batchHash,
            registeredAt: block.timestamp,
            registeredBy: msg.sender,
            revoked: false,
            revokedAt: 0,
            revocationReason: ""
        });
        totalBatches += 1;

        emit BatchRegistered(batchNumber, batchHash, block.timestamp, msg.sender);
    }

    /// @notice Permanently revokes a batch's digital identity. Cannot be undone.
    function revokeBatch(string memory batchNumber, string memory reason)
        public
        onlyRole(REGISTRAR_ROLE)
    {
        BatchRecord storage batch = batches[batchNumber];
        require(bytes(batch.batchNumber).length != 0, "Batch not registered");
        require(!batch.revoked, "Batch already revoked");

        batch.revoked = true;
        batch.revokedAt = block.timestamp;
        batch.revocationReason = reason;
        totalRevoked += 1;

        emit BatchRevoked(batchNumber, reason, block.timestamp, msg.sender);
    }

    /// @notice Backwards-compatible getter used by the original backend.
    function getBatch(string memory batchNumber)
        public
        view
        returns (string memory, string memory, uint256)
    {
        BatchRecord memory batch = batches[batchNumber];
        return (batch.batchNumber, batch.batchHash, batch.registeredAt);
    }

    function getBatchDetails(string memory batchNumber)
        public
        view
        returns (
            string memory batchHash,
            uint256 registeredAt,
            address registeredBy,
            bool revoked,
            uint256 revokedAt,
            string memory revocationReason
        )
    {
        BatchRecord memory batch = batches[batchNumber];
        return (
            batch.batchHash,
            batch.registeredAt,
            batch.registeredBy,
            batch.revoked,
            batch.revokedAt,
            batch.revocationReason
        );
    }

    /// @notice True only when the batch is registered, not revoked, and the hash matches.
    function verifyBatch(string memory batchNumber, string memory batchHash) public view returns (bool) {
        BatchRecord memory batch = batches[batchNumber];
        if (bytes(batch.batchNumber).length == 0 || batch.revoked) {
            return false;
        }
        return keccak256(bytes(batch.batchHash)) == keccak256(bytes(batchHash));
    }

    function isRegistered(string memory batchNumber) public view returns (bool) {
        return bytes(batches[batchNumber].batchNumber).length != 0;
    }

    function isRevoked(string memory batchNumber) public view returns (bool) {
        return batches[batchNumber].revoked;
    }
}
