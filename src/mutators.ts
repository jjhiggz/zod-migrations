/* eslint-disable @typescript-eslint/ban-ts-comment */
/* eslint-disable @typescript-eslint/no-explicit-any */

import { z, ZodObject, ZodSchema, type AnyZodObject } from "zod";
import type {
  FillableObject,
  Mutator,
  RenameOutput,
  ZodMigratorEndShape,
  ZodMigratorStartShape,
  ZShape,
} from "./types/types";
import { addProp, mapKeys, merge, omit, pipe, reverse, unique } from "remeda";
import { ZodMigrations } from "./zod-migration";
import { ObjectWith } from "./types/ObjectWith";
import { NonMergeObject, RenameManyReturn } from "./types/external-types";

const isValid = (input: any, zodSchema: AnyZodObject) =>
  zodSchema.safeParse(input).success;

const defaultRewriteRenames: Mutator<any, any>["rewriteRenames"] = ({
  renames,
}) => renames;

export const getValidRenames = (renames: [string, string][], path: string) => {
  const chain = [path];
  let prevPath = path;
  for (const rename of renames) {
    if (rename[0] === prevPath) {
      chain.push(rename[1]);
      prevPath = rename[1];
    }
  }

  let currPath = path;

  for (const rename of reverse(renames)) {
    if (rename[1] === currPath) {
      chain.push(rename[0]);
      currPath = rename[0];
    }
  }

  return unique(chain);
};

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
  const up = ({ input }: { input: Shape }) => {
    return addProp(input, path, defaultVal);
  };

  return {
    tag: "add",
    up,
    // @ts-ignore
    isValid: ({ input, renames }) => {
      return getValidRenames(renames, path).some((path) => {
        // @ts-ignore
        return isValid(input?.[path], schema);
      });
    },
    rewritePaths: (input) => [...input, { path, schema }],
    beforeMutate: ({ paths }) => {
      if (paths.some((pathData) => pathData.path === path))
        throw new Error(`'${path}' already exists in your JsonEvolver`);
    },
    rewriteRenames: defaultRewriteRenames,
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
      return getValidRenames(renames, path).some((rename) => {
        const atPath = (input as any)[rename];
        if (Array.isArray(atPath)) {
          if (atPath.length === 0) return true;
          // @ts-ignore
          return atPath.every((val) => isValid(val, schema));
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
    );
  };

  return {
    tag: "addNested",
    up,
    // @ts-ignore
    isValid: ({ input }) => isValid(input?.[path], currentSchema),
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
  const up = ({ input }: { input: Shape }) => {
    return omit(input, [path]);
  };

  return {
    up,
    tag: "removeOne",
    isValid: ({ input }) => !(path in input),
    rewritePaths: (input) =>
      input.filter((pathInEvolver) => pathInEvolver.path !== path),
    beforeMutate: ({ paths }) => {
      if (!paths.some((pathData) => pathData.path === path)) {
        throw new Error(`Path ${path.toString()} not found`);
      }
    },
    rewriteRenames: ({ renames }) => {
      const relatedRenames = getValidRenames(renames, path as string);
      return renames.filter(
        ([renameKey]) => !relatedRenames.includes(renameKey)
      );
    },
  } satisfies Mutator<Shape, ReturnType<typeof up>>;
};

const removeMany = <Shape extends FillableObject, K extends keyof Shape>(
  paths: ReadonlyArray<K>
) => {
  const up = ({ input }: { input: Shape }) => {
    return omit(input, paths);
  };

  return {
    tag: "removeMany",
    up,
    isValid: () => false,
    beforeMutate: () => {
      // do nothing, inputs parsed in typesystem
    },
    rewritePaths: (paths) =>
      paths.filter((pathInEvolver) => !paths.includes(pathInEvolver as any)),
    rewriteRenames: defaultRewriteRenames,
  } satisfies Mutator<Shape, ReturnType<typeof up>>;
};

const rename = <
  Shape extends FillableObject,
  SourceKey extends keyof Shape,
  Destination extends string
>(
  source: SourceKey,
  destination: Destination
) => {
  const up = ({ input }: { input: Shape }) => {
    const value = input[source];
    return pipe(
      input,
      omit([source]),
      addProp(destination, value)
    ) as any as RenameOutput<Shape, SourceKey, Destination>;
  };

  return {
    up,
    tag: "rename",
    // @ts-ignore
    isValid: ({ input }) => {
      return destination in input;
    },
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
    rewriteRenames: ({ renames }) => {
      return [...renames, [source as string, destination]];
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
  const up = ({ input }: { input: Shape }) => {
    return merge(input, defaultValues);
  };

  return {
    tag: "addMany",
    up,
    isValid: ({ input, renames }) => {
      const entries = Object.entries((schema as any).shape);

      return entries.every((entry) => {
        const schemaAtEntry = schema.shape[entry[0]];
        return getValidRenames(renames, entry[0]).some((rename) => {
          const key = rename;
          // @ts-ignore
          return schemaAtEntry?.safeParse(input?.[key]).success;
        });
      });
    },
    beforeMutate: ({ paths }) => {
      const keys = Object.keys(schema.shape);
      const keysWithConflict = keys.filter((key) => {
        return paths.some((path) => path.path === key);
      });

      if (keysWithConflict.length) {
        throw new Error(
          `These keys conflict with existing keys in your path: ${keysWithConflict.join(
            ","
          )}`
        );
      }
    },

    // @ts-ignore
    rewritePaths: (paths) => {
      const newPaths = Object.entries(schema.shape).map(([path, schema]) => ({
        path,
        schema,
      }));

      return [...paths, ...newPaths];
    },
    rewriteRenames: defaultRewriteRenames,
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
  const up = ({ input }: { input: Shape }) => {
    const result = mapKeys(input, (key) => {
      // @ts-ignore
      return key in renames ? renames[key as any] : key;
    }) as RenameManyReturn<Shape, Renames>;

    return result;
  };

  return {
    tag: "renameMany",
    up,
    isValid: ({ input }) => {
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
    rewriteRenames: ({ renames: currentRenames }) => [
      ...currentRenames,
      ...(Object.entries(renames) as [string, string][]),
    ],
  } satisfies Mutator<Shape, RenameManyReturn<Shape, Renames>>;
};

export const mutators = {
  add,
  addMany,
  addNestedPath,
  addNestedArray,
  removeOne,
  removeMany,
  rename,
  renameMany,
};
