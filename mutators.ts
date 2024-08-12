import {
  z,
  ZodObject,
  ZodString,
  type AnyZodObject,
  type ZodSchema,
} from "zod";
import type { FillableObject, Mutator } from "./types";
import { addProp, mapKeys, merge, omit, pipe } from "remeda";

const isValid = (input: any, zodSchema: AnyZodObject) =>
  zodSchema.safeParse(input).success;

const add = <
  Shape extends FillableObject,
  Schema extends ZodSchema,
  Path extends string
>({
  path,
  schema,
  defaultVal,
}: {
  path: Path;
  defaultVal: z.infer<Schema>;
  schema: Schema;
}) => {
  const up = (input: Shape) => {
    return addProp(input, path, defaultVal);
  };

  return {
    up,
    isValid: (input: unknown) => isValid(input?.[path], schema),
  } satisfies Mutator<Shape, ReturnType<typeof up>>;
};

const removeOne = <Shape extends object, Path extends keyof Shape>(
  path: Path
) => {
  const up = (input: Shape) => {
    return omit(input, [path]);
  };

  return {
    up,
    isValid: (input) => !(path in input),
  } satisfies Mutator<Shape, ReturnType<typeof up>>;
};

const removeMany = <Shape extends object, K extends keyof Shape>(
  paths: ReadonlyArray<K>
) => {
  const up = (input: Shape) => {
    return omit(input, paths);
  };

  return {
    up,
    isValid: () => false,
  } satisfies Mutator<Shape, ReturnType<typeof up>>;
};

const rename = <
  Shape extends object,
  SourceKey extends keyof Shape,
  Destination extends string
>(
  source: SourceKey,
  destination: Destination
) => {
  const up = (input: Shape) => {
    const value = input[source];
    return pipe(input, omit([source]), addProp(destination, value));
  };

  return {
    up,
    // @ts-ignore
    isValid: (input) => source in input && !destination in input,
  } satisfies Mutator<Shape, ReturnType<typeof up>>;
};

const addMany = <
  Shape extends FillableObject,
  Schema extends ZodSchema<any, any, any>
>({
  defaultValues,
}: {
  defaultValues: z.infer<Schema>;
  schema: Schema;
}) => {
  const up = (input: Shape) => {
    return merge(input, defaultValues);
  };

  return {
    up,
    isValid: (input) => {
      return false;
    },
  } satisfies Mutator<Shape, ReturnType<typeof up>>;
};

export const mutators = {
  add,
  addMany,
  removeOne,
  removeMany,
  rename,
};
