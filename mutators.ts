import { z, type AnyZodObject, type ZodSchema } from "zod";
import type { FillableObject, Mutator, NonMergeObject } from "./types";
import { addProp, merge, omit, pipe } from "remeda";

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
    tag: "add",
    up,
    // @ts-ignore
    isValid: (input: unknown) => isValid(input?.[path], schema),
    rewritePaths: (input) => [...input, path],
    beforeMutate: ({ paths }) => {
      if (paths.includes(path))
        throw new Error(`'${path}' already exists in your JsonEvolver`);
    },
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
    tag: "removeOne",
    isValid: (input) => !(path in input),
    rewritePaths: (input) =>
      input.filter((pathInEvolver) => pathInEvolver !== path),
    beforeMutate: () => {
      // do nothing, inputs parsed in typesystem
    },
  } satisfies Mutator<Shape, ReturnType<typeof up>>;
};

const removeMany = <Shape extends object, K extends keyof Shape>(
  paths: ReadonlyArray<K>
) => {
  const up = (input: Shape) => {
    return omit(input, paths);
  };

  return {
    tag: "removeMany",
    up,
    isValid: () => false,
    beforeMutate: () => {
      // do nothing, inputs parsed in typesystem
    },
    rewritePaths: (input) =>
      input.filter((pathInEvolver) => !paths.includes(pathInEvolver as any)),
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
    tag: "rename",
    // @ts-ignore
    isValid: (input) => destination in input && !(source in input),
    beforeMutate: ({ paths }) => {
      if (paths.includes(destination)) {
        // @ts-ignore
        throw new Error(
          `Cannot rename '${
            source as string
          }' to  '${destination}' because it already exists in your schema`
        );
      }
    },
    rewritePaths: (paths) => {
      return [...paths, destination].filter((p) => p !== source);
    },
  } satisfies Mutator<Shape, ReturnType<typeof up>>;
};

const addMany = <
  Shape extends FillableObject,
  Schema extends ZodSchema<NonMergeObject<Shape>, any, any>
>({
  defaultValues,
  schema,
}: {
  defaultValues: z.infer<Schema>;
  schema: Schema;
}) => {
  const up = (input: Shape) => {
    return merge(input, defaultValues);
  };

  return {
    tag: "addMany",
    up,
    isValid: (input) => {
      const entries = Object.entries((schema as any).shape);
      return false;
    },
    beforeMutate: () => {
      // Do nothing, should be accounted for
    },
    // @ts-ignore
    rewritePaths: (paths) => [...paths, ...Object.keys(schema.shape)],
  } satisfies Mutator<Shape, ReturnType<typeof up>>;
};

export const mutators = {
  add,
  addMany,
  removeOne,
  removeMany,
  rename,
};
