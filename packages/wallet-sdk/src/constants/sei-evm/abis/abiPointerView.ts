export const abiPointerView = [
  {
    inputs: [{ internalType: 'string', name: 'cwAddr', type: 'string' }],
    name: 'getCW20Pointer',
    outputs: [
      { internalType: 'address', name: 'addr', type: 'address' },
      { internalType: 'uint16', name: 'version', type: 'uint16' },
      { internalType: 'bool', name: 'exists', type: 'bool' },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [{ internalType: 'string', name: 'cwAddr', type: 'string' }],
    name: 'getCW721Pointer',
    outputs: [
      { internalType: 'address', name: 'addr', type: 'address' },
      { internalType: 'uint16', name: 'version', type: 'uint16' },
      { internalType: 'bool', name: 'exists', type: 'bool' },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [{ internalType: 'string', name: 'token', type: 'string' }],
    name: 'getNativePointer',
    outputs: [
      { internalType: 'address', name: 'addr', type: 'address' },
      { internalType: 'uint16', name: 'version', type: 'uint16' },
      { internalType: 'bool', name: 'exists', type: 'bool' },
    ],
    stateMutability: 'view',
    type: 'function',
  },
];
