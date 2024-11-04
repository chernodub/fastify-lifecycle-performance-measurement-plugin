/**
 * A utility type to make all properties of a type mutable.
 */
export type Mutable<T> = {
  -readonly [P in keyof T]: T[P];
};
