export function autobind<T extends Function>(target: object, propertyKey: string, descriptor: TypedPropertyDescriptor<T>): TypedPropertyDescriptor<T> | void {

    if (!descriptor || typeof descriptor.value !== 'function' || !target) {
      throw new Error("autobind decorator can only be used with class memeber functions");
    }
  
    return {
      configurable: true,
      get(this: T): T {
        const boundFunc = descriptor.value!.bind(this);
        Object.defineProperty(this, propertyKey, {
          value: boundFunc,
          configurable: true,
          writable: true
        });
        return boundFunc;
      }
    }
  }