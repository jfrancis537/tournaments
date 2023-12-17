export class HttpStatusError extends Error{
  
  public readonly status: number;

  constructor(msg: string, status: number) {
    super(msg);
    this.status = status;
  }
}