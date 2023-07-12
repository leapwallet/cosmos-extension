# Types - Activity

Type definitions related to activity

## TxType

Type of transaction

```ts
export type TxType =
  | 'send'
  | 'receive'
  | 'delegate'
  | 'undelegate'
  | 'ibc/transfer'
  | 'vote'
  | 'liquidity/add'
  | 'liquidity/remove'
  | 'swap'
  | 'fallback';

```

## RawTxData

Raw transaction data

```ts
interface Message {
  '@type': string;
  sender: string;
  [key: string]: any;
}

export type RawTxData = {
  height: string;
  txhash: string;
  codespace: string;
  code: number;
  data: string;
  rawLog: string;
  info: string;
  gasWanted: string;
  gasUsed: string;
  timestamp: string;
  tx: {
    '@type': string;
    body: {
      memo: string;
      timeout_height: string;
      extension_options: [];
      non_critical_extension_options: [];
      messages: Message[];
    };
    auth_info: {
      signer_info: SignerInfo[];
      fee: {
        amount: [
          {
            denom: string;
            amount: string;
          },
        ];
        gas_limit: string;
        payer: string;
        granter: string;
      };
      signatures: string[];
    };
  };
  logs: {
    msg_index: number;
    log: string;
    events: Dict[];
  }[];
  events: Dict[];
};
```

## TypedParsedTx

Parsed transaction with definitive types and properties

```ts
// to understand what a discriminate union is check out
// #discriminated-union section after this code block

export type DiscriminatedUnionForParsedTx<K extends PropertyKey, T extends { [S in TxType]: Dict }> = {
  [P in keyof T]: { [Q in K]: P } & T[P] extends infer U ? { [Q in keyof U]: U[Q] } & BaseParsedTx : never;
}[keyof T];

export type TypedParsedTx = DiscriminatedUnionForParsedTx<
  'action',
  {
    send: {
      sentAmount: AmountInfo;
      toAddress: string;
    };
    receive: {
      sentAmount: AmountInfo;
      toAddress: string;
    };
    delegate: {
      sentAmount: AmountInfo;
      toAddress: string;
    };
    undelegate: {
      sentAmount: AmountInfo;
      toAddress: string;
    };
    'ibc/transfer': {
      sentAmount: AmountInfo;
      toAddress: string;
    };
    vote: {
      voteOption: string;
      toAddress: string;
    };
    fallback: {
      sentAmount?: AmountInfo;
    };
    'liquidity/add': {
      poolId: string;
      shares: string;
      tokens: AmountInfo[];
    };
    'liquidity/remove': {
      poolId: string;
      shares: string;
      tokens: AmountInfo[];
    };
    swap: {
      poolId: string;
      tokenGained?: AmountInfo;
      tokenGiven?: AmountInfo;
    };
  }
>;
```

### Discriminated Union

A discriminated union is a type that represents a set of other types, with a common field that is used to discriminate between them. It is a way to create a type that represents a single value that can have one of several possible types, each of which is associated with a different set of properties.

```ts
type Shape = 
  | { kind: "circle", radius: number }
  | { kind: "rectangle", width: number, height: number }
  | { kind: "triangle", sideA: number, sideB: number, sideC: number };

function area(s: Shape) {
  switch (s.kind) {
    case "circle":
      return Math.PI * s.radius ** 2;
    case "rectangle":
      return s.width * s.height;
    case "triangle":
      // use Heron's formula to calculate the area of the triangle
      const p = (s.sideA + s.sideB + s.sideC) / 2;
      return Math.sqrt(p * (p - s.sideA) * (p - s.sideB) * (p - s.sideC));
  }
}

const circle = { kind: "circle", radius: 2 };
const rectangle = { kind: "rectangle", width: 2, height: 3 };
const triangle = { kind: "triangle", sideA: 3, sideB: 4, sideC: 5 };

console.log(area(circle)); // 12.566370614359172
console.log(area(rectangle)); // 6
console.log(area(triangle)); // 6
```

In this example, the `Shape` type is a discriminated union that consists of three possible types: a `circle`, a `rectangle`, and a `triangle`. Each of these types has a kind field that specifies the type of the shape, and additional fields that hold the relevant dimensions. The area function takes a Shape as an argument and uses a switch statement to determine the type of the shape and calculate its area accordingly.

Similar to this, we can use Discriminated unions for Parsed Transactions. It allows us narrow down the properties of a parsed tx object based on the `action` property.
