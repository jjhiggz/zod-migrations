/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/ban-ts-comment */
import { z, type AnyZodObject, type ZodSchema } from "zod";
import type {
  FillableObject,
  Mutator,
  NonMergeObject,
  RenameManyReturn,
} from "./types/types";
import { addProp, mapKeys, merge, omit, pipe, unique } from "remeda";

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

const addNestedArray = <
  Shape extends FillableObject,
  Schema extends ZodSchema,
  Path extends string,
  Migrator extends ZodMigrations<any, any, any>
>({
  path,
  currentSchema: schema,
  nestedMigrator,
}: {
  path: Path;
  currentSchema: Schema;
  nestedMigrator: Migrator;
}) => {
  const up = ({ input }: { input: Shape }) => {
    if (!Array.isArray((input as any)[path])) {
      return addProp(input, path, [] as ZodMigratorEndShape<Migrator>[]);
    } else {
      return merge(input, {
        [path]: (input as any)[path].map(nestedMigrator.transform),
      } as Shape & ObjectWith<Path, ZodMigratorEndShape<Migrator>[]>);
    }
  };

  return {
    tag: "addNestedArray",
    up,
    // @ts-ignore
    isValid: ({ input, renames }) => {
      return getAllValidRenames(renames, path).some((rename) => {
        const atPath = (input as any)[rename];
        if (Array.isArray(atPath)) {
          if (atPath.length === 0) return true;
          return atPath.every((val) => {
            try {
              // @ts-ignore
              return isValid(nestedMigrator.transform(val), schema);
              // eslint-disable-next-line @typescript-eslint/no-unused-vars
            } catch (_e) {
              return false;
            }
          });
        } else {
          return false;
        }
      });
    },
    rewritePaths: (input) => [...input, { path, schema, nestedMigrator }],
    beforeMutate: ({ paths }) => {
      if (paths.find((pathData) => pathData.path === path))
        throw new Error(`'${path}' already exists in your JsonEvolver`);
    },
    nestedMigrator: {
      migrator: nestedMigrator,
      path,
      type: "array",
    },
    rewriteRenames: defaultRewriteRenames,
  } satisfies Mutator<Shape, ReturnType<typeof up>>;
};

const addNestedPath = <
  Shape extends FillableObject,
  Migrator extends ZodMigrations<any, any, any>,
  Schema extends ZShape<ZodMigratorEndShape<Migrator>>,
  Path extends string
>({
  path,
  currentSchema,
  defaultStartingVal,
  nestedMigrator,
}: {
  path: Path;
  defaultStartingVal: ZodMigratorStartShape<Migrator>;
  currentSchema: Schema;
  nestedMigrator: ZodMigrations<any, any, any>;
}) => {
  const up = ({ input }: { input: Shape }) => {
    return addProp(
      input,
      path,
      nestedMigrator.transform((input as any)?.[path] ?? defaultStartingVal)
    ) as Shape & ObjectWith<Path, z.infer<typeof currentSchema>>;
  };

  return {
    tag: "addNested",
    up,
    // @ts-ignore
    isValid: ({ input }) => {
      try {
        return isValid(nestedMigrator.transform(input?.[path]), currentSchema);
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
      } catch (e) {
        return false;
      }
    },
    rewritePaths: (input) => [
      ...input,
      { path, schema: currentSchema, nestedMigrator },
    ],
    beforeMutate: ({ paths }) => {
      if (paths.find((pathData) => pathData.path === path))
        throw new Error(`'${path}' already exists in your JsonEvolver`);
    },
    nestedMigrator: {
      migrator: nestedMigrator,
      path,
      type: "object",
    },
    rewriteRenames: defaultRewriteRenames,
  } satisfies Mutator<Shape, ReturnType<typeof up>>;
};

const removeOne = <Shape extends FillableObject, Path extends keyof Shape>(
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
    rewritePaths: (paths) => [...paths, ...Object.keys(schema.shape)],
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
      const values = Object.values(renames) as string[];
      return [...paths, ...values].filter((p) =>
        Object.keys(renames).includes(p)
      );
    },
  } satisfies Mutator<Shape, RenameManyReturn<Shape, Renames>>;
};

export const mutators = {
  add,
  addMany,
  removeOne,
  removeMany,
  rename,
  renameMany,
};
