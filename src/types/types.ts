/* eslint-disable @typescript-eslint/no-explicit-any */
import type { ZodMigrations } from "../zod-migration";
import { ZodObject, ZodSchema } from "zod";
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
    type: "object" | "array";
  };
};

export type PathData = {
  path: string;
  nestedMigrator?: ZodMigrations<any, any, any>;
  schema: ZodSchema<any>;
};

export type ZShape<Shape extends object> = ZodObject<any, any, any, Shape>;

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

type UpsertProp<Type, Key extends string, Value> = {
  // @ts-expect-error This helps optimize perf
  [P in keyof Type | Key]: P extends Key ? Value : Type[P];
};

export type RenameOutput<
  T,
  Source extends keyof T,
  Destination extends string
> = Omit<UpsertProp<T, Destination, T[Source]>, Source>;
