import crypto from 'crypto';

import RegistrationConfirmationTemplate from '../Templates/RegistrationConfirmation';

import { AuthAPIConstants, ConfirmAccountResult, LoginResult, RegistrationResult } from "@common/Constants/AuthAPIConstants";
import { Lazy } from "@common/Utilities/Lazy";
import { Database } from "../Database/Database";
import { DatabaseError, DatabaseErrorType } from "../Database/DatabaseError";
import { DateTime } from "luxon";
import { User } from "@common/Models/User";
import { Validators } from "@common/Utilities/Validators";
import { EnvironmentVariables } from "../Utilities/EnvironmentVariables";
import { MailManager } from "./MailManager";
import { generateToken } from '../Utilities/Crypto';

class UserManager {

  public async registerUser(request: AuthAPIConstants.AccountRegistrationRequest) {
    if (await Database.instance.hasUser(request.email)) {
      return RegistrationResult.FAILED_USER_EXISTS;
    }

    if (!Validators.password(request.password)) {
      return RegistrationResult.FAILED_BAD_PASSWORD;
    }

    if (!Validators.email(request.email)) {
      return RegistrationResult.FAILED_BAD_EMAIL;
    }

    if (await Database.instance.findUser({ email: request.email }) !== undefined) {
      return RegistrationResult.FAILED_EMAIL_EXISTS;
    }

    const salt = crypto.randomBytes(32).toString('hex');
    const hash = this.generateHash(request.password, salt);
    console.log(`------------------Registration--------------\nPassword:${request.password}\nHash: ${hash}\nSalt: ${salt}\n-------------------------------------`);
    try {
      const record = await Database.instance.addUser({
        email: request.email,
        createdDate: DateTime.now().toString(),
        role: EnvironmentVariables.IS_DEVELOPMENT ? 'admin' : 'user',
        hash,
        salt,
        registrationToken: await generateToken()
      });

      const confirmUrl = `https://${EnvironmentVariables.HOST}/account/confirm/${record.registrationToken!}`;
      const body = RegistrationConfirmationTemplate(confirmUrl);

      // TODO Do something when the email is successfully sent
      MailManager.sendEmail({
        sender: EnvironmentVariables.EMAIL_SENDER,
        to: record.email,
        subject: 'Confirm Registration',
        html: body
      }).then(success => {
        if (!success) {
          console.error('Failed to send an email to: ' + record.email);
        }
      });

      return RegistrationResult.SUCCESS;
    } catch (err) {
      if (err instanceof DatabaseError) {
        switch (err.type) {
          case DatabaseErrorType.ExistingRecord:
            return RegistrationResult.FAILED_USER_EXISTS;
          case DatabaseErrorType.MissingRecord:
          default:
            // This should be impossible for a registration
            return RegistrationResult.FAILED_UNK
        }
      }
      return RegistrationResult.FAILED_UNK;
    }
  }

  public async loginUser(request: AuthAPIConstants.LoginRequest): Promise<[LoginResult, Readonly<User> | undefined]> {
    try {
      const user = await Database.instance.getUser(request.email);
      console.log(user);
      if (!user) {
        return [LoginResult.INVALID_CREDENTIALS, undefined];
      }
      // Users with a registration code are pending.
      if (user.registrationToken) {
        console.log("Reg Token Failure");
        return [LoginResult.INVALID_CREDENTIALS, undefined];
      }
      const hashToCheck = this.generateHash(request.password, user.salt);
      if (hashToCheck !== user.hash) {
        console.log(`--------------Login-----------------\nTo Check: ${hashToCheck}`);
        console.log(`${request.password}\nHash: ${user.hash}\nSalt: ${user.salt}\n-------------------------------------`);
        return [LoginResult.INVALID_CREDENTIALS, undefined];
      }
      return [LoginResult.SUCCESS, {
        email: user.email,
        role: user.role
      }];
    } catch (err) {
      if (err instanceof DatabaseError) {
        if (err.type === DatabaseErrorType.MissingRecord) {
          console.log("No such user.");
          return [LoginResult.INVALID_CREDENTIALS, undefined];
        }
      }
      return [LoginResult.SERVER_ERROR, undefined];
    }

  }

  public async confirmUser(token: string) {
    try {
      await Database.instance.confirmUser(token);
      return ConfirmAccountResult.SUCCESS;
    } catch (err) {
      console.error(err);
      if (err instanceof DatabaseError) {
        return ConfirmAccountResult.NO_SUCH_USER;
      } else {
        return ConfirmAccountResult.SERVER_ERROR;
      }
    }
  }

  private generateHash(password: string, salt: string) {
    return crypto.pbkdf2Sync(password, salt, 10000, 512, 'sha512').toString('utf-8');
  }
}

const instance = new Lazy(() => new UserManager());
export { instance as UserManager };