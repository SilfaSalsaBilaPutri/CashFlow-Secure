// src/lib/crypto.ts
import CryptoJS from "crypto-js";

const SECRET_KEY = process.env.REACT_APP_SECRET_KEY || "default-secret-key"; // Ganti dengan secret key yang aman

// Enkripsi data
export const encryptData = (data: string): string => {
  return CryptoJS.AES.encrypt(data, SECRET_KEY).toString();
};

// Dekripsi data
export const decryptData = (ciphertext: string): string => {
  const bytes = CryptoJS.AES.decrypt(ciphertext, SECRET_KEY);
  return bytes.toString(CryptoJS.enc.Utf8);
};
