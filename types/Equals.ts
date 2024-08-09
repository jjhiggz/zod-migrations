import type { Extends } from "ts-toolbelt/out/Any/Extends";

export type Equals<K, V> = Extends<K, V> extends 1 ? Extends<V, K> : 0;
