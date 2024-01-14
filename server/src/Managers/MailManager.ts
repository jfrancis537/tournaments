import nodemailer, { Transporter } from 'nodemailer';
import { EnvironmentVariables } from '../Utilities/EnvironmentVariables';
import Mail from 'nodemailer/lib/mailer';

class MailManager {

  private readonly transporter: Transporter;
  private readonly verifiedPromise: Promise<boolean>;

  constructor() {
    this.transporter = nodemailer.createTransport({
      host: 'smtp.gmail.com',
      port: 465,
      secure: true,
      auth: {
        user: EnvironmentVariables.EMAIL_USERNAME,
        pass: EnvironmentVariables.EMAIL_PASSWORD
      }
    });

    this.verifiedPromise = new Promise((resolve) => {
      this.transporter.verify((err, success) => {
        if (err) {
          resolve(false);
        } else if (success) {
          resolve(true);
        }
        resolve(false);
      })
    });
  }

  public get ready(): Promise<boolean> {
    return this.verifiedPromise;
  }

  public async sendEmail(message: Mail.Options): Promise<boolean> {

    if(!EnvironmentVariables.ENABLE_EMAIL)
    {
      return false;
    }

    if (!(await this.ready)) {
      return false;
    }

    return new Promise((resolve) => {
      this.transporter.sendMail(message, (err, info) => {
        if (err) {
          resolve(false);
        } else {
          // TODO something with info.
          resolve(true);
        }
      })
    });
  }

}

const instance = new MailManager();
export { instance as MailManager }