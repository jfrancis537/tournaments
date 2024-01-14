import crypto from 'crypto';

export async function generateToken(): Promise<string> {
  return new Promise((resolve, reject) => {
    crypto.randomBytes(48, (err, buf) => {
      if (err) {
        reject(err);
      }
      resolve(buf.toString('hex'));
    });
  })
}

export function generateTokenSync(): string {
  return crypto.randomBytes(80).toString('hex');
}