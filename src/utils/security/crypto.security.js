import CryptoJS from "crypto-js";

const secret_key = process.env.ENK_SECRET_KEY;

export const generatEncryption = async ({
  plaintext = "",
  secret_key = "",
} = {}) => {
  return CryptoJS.AES.encrypt(plaintext, secret_key).toString();
};

export const decryptEncryption = async ({
  ciphertext = "",
  secret_key = "",
} = {}) => {
  return CryptoJS.AES.decrypt(ciphertext, secret_key).toString(
    CryptoJS.enc.Utf8
  );
};
