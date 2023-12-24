const usernameRgx = /([a-zA-Z0-9_\-]{2,})/;
const emailRgx = /^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/;

export namespace Validators {

  export function password(password: string): boolean {
    return password.length >= 12;
  }

  export function username(username: string): boolean {

    return usernameRgx.test(username);
  }

  export function email(email: string) {
    return emailRgx.test(email);
  }
}
