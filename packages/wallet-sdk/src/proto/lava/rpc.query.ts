import { grpc } from '@improbable-eng/grpc-web';
import { NodeHttpTransport } from '@improbable-eng/grpc-web-node-http-transport';
export const createGrpcWebClient = async ({ endpoint }: { endpoint: string }) => {
  endpoint = endpoint.replace(/\/*$/, '');
  const { GrpcWebImpl } = await import('./query.rpc.Query');
  let grpcWeb;
  if (typeof document !== 'undefined') {
    grpcWeb = new GrpcWebImpl(endpoint, {
      transport: grpc.CrossBrowserHttpTransport({
        withCredentials: false,
      }),
    });
  } else if (typeof navigator !== 'undefined' && navigator.product === 'ReactNative') {
    grpcWeb = new GrpcWebImpl(endpoint, {
      transport: NodeHttpTransport(),
    });
  } else {
    grpcWeb = new GrpcWebImpl(endpoint, {
      transport: NodeHttpTransport(),
    });
  }
  return {
    lavanet: {
      lava: {
        dualstaking: new (await import('./query.rpc.Query')).QueryClientImpl(grpcWeb),
      },
    },
  };
};
