import { z } from 'zod';

const domainFieldOrder = ['name', 'version', 'chainId', 'verifyingContract', 'salt'] as const;

const domainSchemas = [
  z.object({ name: z.literal('name'), type: z.literal('string') }),
  z.object({ name: z.literal('version'), type: z.literal('string') }),
  z.object({ name: z.literal('chainId'), type: z.literal('uint256') }),
  z.object({ name: z.literal('verifyingContract'), type: z.union([z.literal('address'), z.literal('string')]) }),
  z.object({ name: z.literal('salt'), type: z.union([z.literal('bytes32'), z.literal('string')]) }),
] as const;

export const EIP712DomainTypeValidator = z
  .array(z.union(domainSchemas))
  .min(1)
  .refine(
    (arr) => {
      const seen = new Set();
      return arr.every((item) => {
        if (seen.has(item.name)) return false;
        seen.add(item.name);
        return true;
      });
    },
    { message: 'Duplicate domain fields are not allowed' },
  )
  .transform((arr) => {
    return [...arr].sort((a, b) => domainFieldOrder.indexOf(a.name) - domainFieldOrder.indexOf(b.name));
  });

export const EIP712MessageValidator = z.object({
  types: z
    .object({
      EIP712Domain: EIP712DomainTypeValidator,
    })
    .catchall(z.any()),
  primaryType: z.string().min(1),
  domain: z.record(z.any()),
  message: z.record(z.any()),
});
