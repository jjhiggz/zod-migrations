/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/ban-ts-comment */
import { z, ZodObject, type AnyZodObject, type ZodSchema } from "zod";
import type {
  FillableObject,
  Mutator,
  NonMergeObject,
  RenameManyReturn,
} from "./types/types";
import { addProp, mapKeys, merge, omit, pipe, unique } from "remeda";
import { ZodMigrations } from "./zod-migration";

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
    rewritePaths: (input) => [...input, { path, schema }],
    beforeMutate: ({ paths }) => {
      if (paths.some((pathData) => pathData.path === path))
        throw new Error(`'${path}' already exists in your JsonEvolver`);
    },
  } satisfies Mutator<Shape, ReturnType<typeof up>>;
};

const addNestedPath = <
  Shape extends FillableObject,
  Schema extends ZodSchema,
  Path extends string
>({
  path,
  schema,
  defaultVal,
  nestedMigrator,
}: {
  path: Path;
  defaultVal: z.infer<Schema>;
  schema: Schema;
  nestedMigrator: ZodMigrations<any>;
}) => {
  const up = (input: Shape) => {
    return addProp(input, path, defaultVal);
  };

  return {
    tag: "addNested",
    up,
    // @ts-ignore
    isValid: (input: unknown) => isValid(input?.[path], schema),
    rewritePaths: (input) => [...input, { path, schema, nestedMigrator }],
    beforeMutate: ({ paths }) => {
      if (paths.find((pathData) => pathData.path === path))
        throw new Error(`'${path}' already exists in your JsonEvolver`);
    },
    nestedMigrator: {
      migrator: nestedMigrator,
      path,
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
      input.filter((pathInEvolver) => pathInEvolver.path !== path),
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
      if (paths.some((pathData) => pathData.path === destination)) {
        // @ts-ignore
        throw new Error(
          `Cannot rename '${
            source as string
          }' to  '${destination}' because it already exists in your schema`
        );
      }
    },
    rewritePaths: (paths) => {
      const existingPathData = paths.find(
        (pathData) => pathData.path === source
      );

      if (!existingPathData) {
        throw new Error(
          `Trying to rewrite ${source.toString()} to ${destination} but cannot find ${source.toString()} in paths array`
        );
      }

      const result = [
        ...paths,
        { ...existingPathData, path: destination },
      ].filter((p) => p.path !== source);

      return result;
    },
  } satisfies Mutator<Shape, ReturnType<typeof up>>;
};

const addMany = <
  Shape extends FillableObject,
  Schema extends ZodObject<NonMergeObject<Shape>, any, any>
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
      entries.every((entry) => {
        const key = entry[0];
        const schema = entry[1];
        // @ts-ignore
        return schema?.safeParse(input?.[key]).success;
      });
      return false;
    },
    beforeMutate: () => {
      // Do nothing, should be accounted for
    },

    // @ts-ignore
    rewritePaths: (paths) => {
      const newPaths = Object.entries(schema.shape).map(([path, schema]) => ({
        path,
        schema,
      }));

      return [...paths, ...newPaths];
    },
  } satisfies Mutator<Shape, ReturnType<typeof up>>;
};

const renameMany = <
  Shape extends FillableObject,
  Renames extends Partial<Readonly<Record<keyof Shape, string>>>
>({
  renames,
}: {
  renames: Renames;
}) => {
  const up = (input: Shape) => {
    const result = mapKeys(input, (key) => {
      // @ts-ignore
      return key in renames ? renames[key as any] : key;
    }) as RenameManyReturn<Shape, Renames>;

    return result;
  };

  return {
    tag: "renameMany",
    up,
    isValid: (input) => {
      return Object.entries(renames).every(([source, destination]) => {
        return (
          (destination as keyof typeof input) in input && !(source in input)
        );
      });
    },
    beforeMutate: () => {
      if (unique(Object.values(rename)).length > Object.values(rename).length) {
        throw new Error("Cannot do multiple renames to the same value");
      }
      Object.values(rename).forEach((destinationKey) => {
        Object.keys(rename).forEach((sourceKey) => {
          if (sourceKey === destinationKey) {
            throw new Error(
              `Cannot set source ${sourceKey} to destination ${destinationKey} in one migration`
            );
          }
        });
      });
      // Do nothing, should be accounted for
    },
    rewritePaths: (paths) => {
      const keys = Object.keys(renames) as (keyof typeof renames)[];

      return paths.map((pathData) => {
        return {
          ...pathData,
          path: keys.includes(pathData.path as any)
            ? renames[pathData.path as keyof typeof renames]!
            : pathData.path!,
        };
      });
    },
  } satisfies Mutator<Shape, RenameManyReturn<Shape, Renames>>;
};

export const mutators = {
  add,
  addMany,
  addNestedPath,
  removeOne,
  removeMany,
  rename,
  renameMany,
};
