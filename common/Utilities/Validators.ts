const emailRgx = /^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/;

export namespace Validators {

  export function password(password: string): boolean {
    return password.length >= 12;
  }

  export function email(email: string) {
    return emailRgx.test(email);
  }
}
