type GenericHandler<T> = (options: T) => void;

export class Action<T> {

  private handlers: Set<GenericHandler<T>>
  private blocked: boolean;

  constructor() {
    this.handlers = new Set();
    this.blocked = false;
  }

  invoke(options: T) {
    if (!this.blocked) {
      for (let handler of this.handlers) {
        handler(options);
      }
    }
  }

  addListener(func: GenericHandler<T>) {
    this.handlers.add(func);
    return () => this.removeListener(func);
  }

  removeListener(func: GenericHandler<T>) {
    this.handlers.delete(func);
  }

  setBlocked(state: boolean): boolean {
    let prev = this.blocked;
    this.blocked = state;
    return prev;
  }
}