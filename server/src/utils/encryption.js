const CryptoJS = require('crypto-js');
const { encryptionKey } = require('../config/env');

const encrypt = (text) => {
  return CryptoJS.AES.encrypt(text, encryptionKey).toString();
};

const decrypt = (cipherText) => {
  const bytes = CryptoJS.AES.decrypt(cipherText, encryptionKey);
  return bytes.toString(CryptoJS.enc.Utf8);
};

module.exports = { encrypt, decrypt };
