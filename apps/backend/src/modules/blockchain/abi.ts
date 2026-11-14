export const BatchRegistryABI = [
  {
    inputs: [
      {
        internalType: 'string',
        name: 'batchNumber',
        type: 'string',
      },
      {
        internalType: 'string',
        name: 'batchHash',
        type: 'string',
      },
    ],
    name: 'registerBatch',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'string',
        name: 'batchNumber',
        type: 'string',
      },
    ],
    name: 'getBatch',
    outputs: [
      {
        internalType: 'string',
        name: '',
        type: 'string',
      },
      {
        internalType: 'string',
        name: '',
        type: 'string',
      },
      {
        internalType: 'uint256',
        name: '',
        type: 'uint256',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
];