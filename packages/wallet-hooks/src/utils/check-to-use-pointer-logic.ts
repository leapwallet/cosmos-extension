import { getPointerContractInfo } from './get-pointer-contract-info';
import { isCW20Token } from './is-cw20-token';

/**
 * @param coinMinimalDenom Token to check for
 * @param cw20Tokens CW-20 minimal denoms list
 * @param checkForPointerType (Optional) Check for pointer type
 * @returns [hasToUsePointerLogic, pointerAddress, errorMsg]
 */
export async function checkToUsePointerLogic(
  coinMinimalDenom: string,
  cw20Tokens: string[],
  compassEvmToSeiMapping: Record<string, string>,
  compassSeiToEvmMapping: Record<string, string>,
  checkForPointerType?: 'CW20',
): Promise<[boolean, string, string]> {
  try {
    if (checkForPointerType === 'CW20' && coinMinimalDenom.toLowerCase().startsWith('0x')) {
      for (const evmAddress in compassEvmToSeiMapping) {
        if (evmAddress.toLowerCase() === coinMinimalDenom.toLowerCase()) {
          return [true, compassEvmToSeiMapping[evmAddress], ''];
        }
      }

      const pointerInfo = await getPointerContractInfo(coinMinimalDenom);

      if (pointerInfo) {
        const { isPointer, isBaseAsset, pointeeAddress, pointerAddress, pointerType } = pointerInfo;

        if (isPointer && pointerType === 'CW20' && pointeeAddress) {
          return [true, pointeeAddress, ''];
        }

        if (isBaseAsset && pointerType === 'ERC20' && pointerAddress) {
          return [true, pointerAddress, ''];
        }
      }
    } else {
      const aFactoryToken = coinMinimalDenom.toLowerCase().startsWith('factory/');
      const aCw20Token = isCW20Token(cw20Tokens, coinMinimalDenom);

      if (aFactoryToken || aCw20Token) {
        for (const seiAddress in compassSeiToEvmMapping) {
          if (seiAddress.toLowerCase() === coinMinimalDenom.toLowerCase()) {
            return [true, compassSeiToEvmMapping[seiAddress], ''];
          }
        }

        const pointerInfo = await getPointerContractInfo(coinMinimalDenom);

        if (pointerInfo?.pointerAddress) {
          return [true, pointerInfo?.pointerAddress, ''];
        } else {
          return [true, '', "Can't send the token. No pointer contract address found."];
        }
      } else if (coinMinimalDenom.toLowerCase().startsWith('0x')) {
        const pointerInfo = await getPointerContractInfo(coinMinimalDenom);

        if (pointerInfo?.isPointer) {
          return [true, coinMinimalDenom, ''];
        }
      }
    }
  } catch (error) {
    console.log('check-to-use-pointer-logic -- error', error);
  }

  return [false, '', ''];
}
