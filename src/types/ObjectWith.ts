export type ObjectWith<K extends string, V> = {
  [key in K | never]: V;
};
