/* eslint-disable @typescript-eslint/no-explicit-any */
import type { ZodMigrations } from "../zod-migration";
import { ZodSchema } from "zod";
import { Equals } from "./Equals";
import { Simplify } from "type-fest";

export type Mutator<Shape, ReturnShape> = {
  tag: string; // "add" | "remove"
  up: (input: {
    input: Shape;
    renames: [string, string][];
    paths: string[];
  }) => ReturnShape; // "the function that transforms the original shape"
  isValid: ({
    input,
    renames,
    paths,
  }: {
    input: Shape;
    renames: [string, string][];
    paths: string[];
  }) => boolean;
  rewritePaths: (input: PathData[]) => PathData[];
  beforeMutate: ({ paths }: { paths: PathData[] }) => any;
  nestedMigrator?: {
    migrator: ZodMigrations<any, any, any>;
    path: string;
  };
};

export type PathData = {
  path: string;
  nestedMigrator?: ZodMigrations<any, any, any>;
  schema: ZodSchema<any>;
};

export type ZodMigratorEndShape<T extends ZodMigrations<any, any, any>> =
  Simplify<ReturnType<T["transform"]>>;

export type ZodMigratorCurrentShape<T extends ZodMigrations<any, any, any>> =
  Simplify<ReturnType<T["__get_current_shape"]>>;

export type ZodMigratorStartShape<T extends ZodMigrations<any, any, any>> =
  Simplify<ReturnType<T["__get_start_shape"]>>;

export type IsZodMigratorValid<T extends ZodMigrations<any, any, any>> = Equals<
  ZodMigratorCurrentShape<T>,
  ZodMigratorEndShape<T>
> extends 1
  ? true
  : false;

type UpsertPropRaw<Type, Key extends string, Value> = Omit<Type, Key> & {
  -readonly [P in Key]-?: Value;
}; // The key is either a broad type (`string`) or union of literals

export type RenameOutput<
  T,
  Source extends keyof T,
  Destination extends string
> = Omit<UpsertPropRaw<T, Destination, T[Source]>, Source>;
