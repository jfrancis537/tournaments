import { AuthAPIConstants, RegistrationResult } from "@common/Constants/AuthAPIConstants";
import { User } from "@common/Models/User";
import { HttpStatusError } from "../Errors/HttpStatusError";

export namespace AuthAPI {
  export async function login(username: string, password: string) {
    const body: AuthAPIConstants.LoginRequest = {
      username,
      password
    }
    const resp = await fetch(`${AuthAPIConstants.BASE_PATH}${AuthAPIConstants.LOGIN}`, {
      body: JSON.stringify(body),
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      }
    });
    if (!resp.ok) {
      if (resp.status >= 400 && resp.status < 500) {
        throw new HttpStatusError('Invalid Credentials', resp.status);
      } else if (resp.status >= 500) {
        throw new HttpStatusError('Server error, try again later.', resp.status);
      } else {
        throw new HttpStatusError('Unknown error occurred.', resp.status);
      }
    }

    const user: User = await resp.json();
    return user;
  }

  export async function logout() {
    const resp = await fetch(`${AuthAPIConstants.BASE_PATH}${AuthAPIConstants.LOGOUT}`, {
      method: 'POST'
    });

    if (!resp.ok) {
      throw new HttpStatusError('Failed to logout', resp.status);
    }
  }

  export async function register(request: AuthAPIConstants.AccountRegistrationRequest) {
    const resp = await fetch(`${AuthAPIConstants.BASE_PATH}${AuthAPIConstants.REGISTER}`, {
      method: 'PUT',
      body: JSON.stringify(request),
      headers: {
        'Content-Type': 'application/json'
      }
    });
    return await resp.json() as AuthAPIConstants.AccountRegistrationResponse;
  }

  export async function getCurrentUser() {
    const resp = await fetch(`${AuthAPIConstants.BASE_PATH}${AuthAPIConstants.CURRENT_USER}`);
    if (!resp.ok) {
      if (resp.status >= 400 && resp.status < 500) {
        throw new HttpStatusError('Not logged in.', resp.status);
      } else if (resp.status >= 500) {
        throw new HttpStatusError('Server error, try again later.', resp.status);
      } else {
        throw new HttpStatusError('Unknown error occurred.', resp.status);
      }
    }
    const user: User = await resp.json();
    return user;
  }
}