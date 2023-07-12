import { decrypt, encrypt } from '../src/utils/crypto';

describe('Crypto', () => {
  const secretPhrase = 'humble patch void reunion inside size sun crack grab key arrest wolf';
  const password = ";2m'XYkrXbR,Qn9";
  const cipher =
    '26f5875bf3617d553b449cf27a56937041d5ba2eaa845bbd53681bca2eb924c6vsaDqUncRuHb+oYm0mIYatEurzt/5/jLDDmc58Cv8uYzGzquDJH72SHJmnHKwUfZLAH52ndhiIGlWirpcR4RcMJPsQN7vfWQF8/drwexlGI=';
  test('encrypt', () => {
    const encryptedSecret = encrypt(secretPhrase, password);
    expect(encryptedSecret).toBeTruthy();
  });

  test('decrypt', () => {
    const decryptedSecret = decrypt(cipher, password);
    expect(decryptedSecret).toEqual(secretPhrase);
  });
});
