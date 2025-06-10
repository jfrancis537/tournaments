import { AuthAPIConstants } from "@common/Constants/AuthAPIConstants";
import { User } from "@common/Models/User";
import { HttpStatusError } from "../Errors/HttpStatusError";

export namespace AuthAPI {


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