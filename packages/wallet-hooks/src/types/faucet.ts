export type FaucetSecurityType = 'hcaptcha' | 'recaptcha';

export type Faucet = {
  title: string;
  description: string;
  url: string;
  network: 'mainnet' | 'testnet';
  method: 'GET' | 'POST';
  security?: {
    type: FaucetSecurityType;
    key: string;
  };
  payloadSchema?: {
    type: 'url-encoded' | 'form-data' | 'json';
    schema: {
      address: string;
      [key: string]: string;
    };
  };
  payloadResolution: Record<string, any>;
};
