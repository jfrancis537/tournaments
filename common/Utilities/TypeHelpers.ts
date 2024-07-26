export type ValueOf<T> = T[keyof T];
export type Values<T> = ValueOf<T>[];