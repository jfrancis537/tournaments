import { AuthAPIConstants, LoginResult, RegistrationResult } from "@common/Constants/AuthAPIConstants";
import { Lazy } from "@common/Utilities/Lazy";
import { Database } from "../Database/Database";
import { DatabaseError, DatabaseErrorType } from "../Database/DatabaseError";
import crypto from 'crypto';
import { DateTime } from "luxon";
import { User } from "@common/Models/User";
import { Validators } from "@common/Utilities/Validators";

class UserManager {
  public async registerUser(request: AuthAPIConstants.AccountRegistrationRequest) {
    if (await Database.instance.hasUser(request.username)) {
      return RegistrationResult.FAILED_USER_EXISTS;
    }

    if (!Validators.password(request.password)) {
      return RegistrationResult.FAILED_BAD_PASSWORD;
    }

    if (!Validators.username(request.username)) {
      return RegistrationResult.FAILED_BAD_USERNAME;
    }

    if (!Validators.email(request.email)) {
      return RegistrationResult.FAILED_BAD_EMAIL;
    }

    const salt = crypto.randomBytes(32).toString('hex');
    const hash = this.generateHash(request.password, salt);
    try {
      Database.instance.addUser({
        username: request.username,
        email: request.email,
        createdDate: DateTime.now().toString(),
        role: 'user',
        hash,
        salt,
        state: 'pending'
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
      const user = await Database.instance.getUser(request.username);
      if (!user) {
        return [LoginResult.INVALID_CREDENTIALS, undefined];
      }
      const hashToCheck = this.generateHash(request.password, user.salt);
      if (hashToCheck !== user.hash) {
        return [LoginResult.INVALID_CREDENTIALS, undefined];
      }
      return [LoginResult.SUCCESS, {
        username: user.username,
        email: user.email,
        role: user.role
      }];
    } catch (err) {
      if (err instanceof DatabaseError) {
        if (err.type === DatabaseErrorType.MissingRecord) {
          return [LoginResult.INVALID_CREDENTIALS, undefined];
        }
      }
      return [LoginResult.SERVER_ERROR, undefined];
    }

  }

  private generateHash(password: string, salt: string) {
    return crypto.pbkdf2Sync(password, salt, 10000, 512, 'sha512').toString('base64');
  }
}

const instance = new Lazy(() => new UserManager());
export { instance as UserManager };