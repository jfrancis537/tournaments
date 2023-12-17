import { autobind } from './Decorators';
import {SocketName} from './SocketName';

export interface SocketLike {
  emit: (event: SocketName, data: string) => void;
  on: (event: SocketName, handler: (data: string) => void) => void;
}

type GenericHandler<T> = (options: T) => void;

export class SocketAction<T> {

  private handlers: Set<GenericHandler<T>>
  private socket: SocketLike;
  private eventName: SocketName;
  private serializer?: (val: T) => string;
  private deserializer?: (val: any) => T;

  constructor(
    eventName: SocketName,
    socket: SocketLike,
    serializer?: (val: T) => string,
    deserializer?: (val: any) => T
  ) {
    this.handlers = new Set();
    this.eventName = eventName;
    this.socket = socket;
    this.socket.on(eventName, this.onReceive);
    this.deserializer = deserializer;
    this.serializer = serializer;
  }

  invoke(options: T) {
    let toSend: string;
    if (this.serializer) {
      toSend = this.serializer(options);
    } else {
      toSend = JSON.stringify(options);
    }
    this.socket.emit(this.eventName, toSend);
  }

  addListener(func: GenericHandler<T>) {
    this.handlers.add(func);
    return () => this.removeListener(func);
  }

  removeListener(func: GenericHandler<T>) {
    this.handlers.delete(func);
  }

  @autobind
  private onReceive(value: string) {
    let result: T;
    if (this.deserializer) {
      result = this.deserializer(JSON.parse(value));
    } else {
      result = JSON.parse(value);
    }
    for (let handler of this.handlers) {
      handler(result);
    }
  }
}