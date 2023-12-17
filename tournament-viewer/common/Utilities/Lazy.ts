export class Lazy<T> {

  private ctor?: () => T;
  private instance_?: T;

  constructor(ctor: () => T)
  {
    this.ctor = ctor;
  }

  public get instance() {
    if(!this.instance_)
    {
      this.instance_ = this.ctor!();
      this.ctor = undefined;
    }
    return this.instance_;
  }
} 