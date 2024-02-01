import crypto from 'crypto';

export function generateToken(): Promise<string> {
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

export function generateRegistrationCode(): Promise<string> {
  return new Promise((resolve,reject) => {
    crypto.randomBytes(4,(err,buffer) => {
      if(err)
      {
        reject(err);
        return;
      }
      resolve(buffer.toString('hex').substring(0, 5).toUpperCase());
    })
  });
}