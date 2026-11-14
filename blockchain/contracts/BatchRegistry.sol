// SPDX-License-Identifier: MIT

pragma solidity ^0.8.20;

contract BatchRegistry {

    struct BatchRecord {
        string batchNumber;
        string batchHash;
        uint256 registeredAt;
    }

    mapping(string => BatchRecord) private batches;

    event BatchRegistered(
        string batchNumber,
        string batchHash,
        uint256 registeredAt
    );

    function registerBatch(
        string memory batchNumber,
        string memory batchHash
    ) public {

        require(
            bytes(batches[batchNumber].batchNumber).length == 0,
            "Batch already registered"
        );

        batches[batchNumber] = BatchRecord({
            batchNumber: batchNumber,
            batchHash: batchHash,
            registeredAt: block.timestamp
        });

        emit BatchRegistered(
            batchNumber,
            batchHash,
            block.timestamp
        );
    }

    function getBatch(
        string memory batchNumber
    )
        public
        view
        returns (
            string memory,
            string memory,
            uint256
        )
    {
        BatchRecord memory batch =
            batches[batchNumber];

        return (
            batch.batchNumber,
            batch.batchHash,
            batch.registeredAt
        );
    }
}