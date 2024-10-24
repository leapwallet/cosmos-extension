let SpeculosHttpTransport: any;
let useSpeculosTransport = false;

export function setUseSpeculosTransport(use: boolean) {
  useSpeculosTransport = use;
}

export function getUseSpeculosTransport() {
  return useSpeculosTransport;
}

export function setSpeculosTransport(httpTransport: any) {
  SpeculosHttpTransport = httpTransport;
}

export async function getSpeculosTransport() {
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  //@ts-ignore
  if (window.TRANSPORT_API_PORT !== undefined) {
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    //@ts-ignore
    const speculosTransport = await SpeculosHttpTransport.open({ apiPort: window.TRANSPORT_API_PORT });
    return speculosTransport;
  }
}
