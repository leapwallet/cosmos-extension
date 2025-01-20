export async function getPointerContractInfo(token: string) {
  const BASE_URL = 'https://pointer.basementnodes.ca';

  const response = await fetch(BASE_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ address: token }),
  });

  const data = await response.json();
  return data?.[0];
}
