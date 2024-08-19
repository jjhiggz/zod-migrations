/* eslint-disable @typescript-eslint/ban-ts-comment */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { z, ZodObject, ZodSchema } from "zod";
import type {
  Mutator,
  PathData,
  RenameOutput,
  ZodMigratorEndShape,
  ZodMigratorStartShape,
  ZShape,
} from "./types/types";
import { getValidRenames, mutators } from "./mutators";
import type { ObjectWith } from "./types/ObjectWith";
import type { Merge } from "type-fest";
import { omit } from "remeda";
import { NonMergeObject, RenameManyReturn } from "./types/external-types";

export const schemaEvolutionCountTag = "__zod_migration_schema_evolution_count";
export const versionTag = "__zod_migration_version";

// What I need is all current paths, and I need to know
// pathData:  { nestedMigrator?: ZodMigrations , schema: zodSchema, path: string,  } | string

export class ZodMigrations<
  StartingShape extends object,
  CurrentShape extends object,
  EndingShape extends object
> {
  /**
   * The amount of evolutions the schema has had since the beginning
   */
  private schemaEvolutionCount: number;

  /**
   * The transforms for this schema
   */
  private mutators: Mutator<any, any>[] = [];

  /**
   * The paths that are registered according to your schema count
   */
  private paths: PathData[] = [];

  /**
   * An array of tuples of the registered nested paths
   */
  private nestedPaths: [keyof CurrentShape, ZodMigrations<any, any, any>][] =
    [];

  /**
   * A map of all the versions. Each version maps to a `schemaEvolutionCount` so that way we
   * know which ones to skip per version
   */
  private versions: Map<number, number> = new Map();

  /**
   * For use in testing to see how many transforms were applied to generate the schema
   */
  private transformsAppliedCount: number = 0;

  private startingSchema: ZShape<StartingShape>;
  private endingSchema: ZShape<EndingShape>;
  private renames: [string, string][];

  /**
   * You probably don't need to use this but it's important internally to create new instances
   */
  constructor(input?: {
    schemaEvolutionCount: number;
    mutators: Mutator<any, any>[];
    nestedPaths: [keyof CurrentShape, ZodMigrations<any, any, any>][];
    paths: PathData[];
    versions: Map<number, number>;
    startingSchema: ZodObject<any, any, any, StartingShape>;
    endingSchema: ZodObject<any, any, any, EndingShape>;
    renames: [string, string][];
  }) {
    if (input) {
      const { schemaEvolutionCount = 1, mutators: mutators, paths } = input;
      this.schemaEvolutionCount = schemaEvolutionCount;
      this.mutators = mutators;
      this.nestedPaths = input.nestedPaths;
      this.paths = paths;
      this.versions = input.versions;
      this.startingSchema = input.startingSchema;
      this.endingSchema = input.endingSchema;
      this.renames = input.renames;
    } else {
      this.mutators = [];
      this.schemaEvolutionCount = 0;
      this.nestedPaths = [];
      this.paths = [];
      this.versions = new Map();
      this.transformsAppliedCount = 0;
      this.startingSchema = z.object({}) as ZShape<any>;
      this.endingSchema = z.object({}) as ZShape<any>;
      this.renames = [];
    }
  }

  /**
   * Returns the next instance in the chain... See [Fluent Interfaces](https://en.wikipedia.org/wiki/Fluent_interface)
   */
  next = <NewShape extends object>() => {
    return new ZodMigrations<StartingShape, NewShape, EndingShape>({
      schemaEvolutionCount: this.schemaEvolutionCount + 1,
      mutators: this.mutators,
      // @ts-ignore
      nestedPaths: this.nestedPaths,
      paths: this.paths,
      versions: this.versions,
      endingSchema: this.endingSchema,
      startingSchema: this.startingSchema,
      renames: this.renames,
    });
  };

  /**
   * Adds a key to your schema
   */
  add = <S extends ZodSchema, Path extends string>({
    path,
    schema,
    defaultVal,
  }: {
    path: Path;
    defaultVal: z.infer<S>;
    schema: S;
  }) => {
    return this.mutate<CurrentShape & ObjectWith<Path, z.infer<S>>>(() =>
      // @ts-ignore
      mutators.add({ path, schema, defaultVal })
    );
  };

  /**
   * Add Nested Path
   */
  addNested = <
    S extends ZShape<ZodMigratorEndShape<Migrator>>,
    Path extends string,
    Migrator extends ZodMigrations<any, any, any>
  >({
    path,
    currentSchema,
    defaultStartingVal,
    nestedMigrator,
  }: {
    path: Path;
    defaultStartingVal: ZodMigratorStartShape<Migrator>;
    currentSchema: S;
    nestedMigrator: Migrator;
  }) => {
    // @ts-ignore
    return this.mutate<CurrentShape & ObjectWith<Path, z.infer<S>>>(() => {
      return mutators.addNestedPath({
        path,
        currentSchema,
        defaultStartingVal: defaultStartingVal,
        nestedMigrator,
      });
    });
  };

  /**
   * Add Nested Path
   */
  addNestedArray = <
    Schema extends ZodSchema,
    Path extends string,
    Migrator extends ZodMigrations<any, any, any>
  >({
    path,
    schema,
    nestedMigrator,
  }: {
    path: Path;
    schema: Schema;
    nestedMigrator: Migrator;
  }) => {
    // @ts-ignore
    return this.mutate<CurrentShape & ObjectWith<Path, z.infer<S>>>(() => {
      return mutators.addNestedArray({
        path,
        currentSchema: schema,
        nestedMigrator,
      });
    });
  };

  /**
   * ```ts
   * const migrations = new ZodMigrations().addMany({
   *  schema: z.object({
   *    cheese: z.string(),
   *    apples: z.array(z.string()),
   *  }),
   *  defaultValues: {
   *    cheese: "cheddar",
   *    apples: ["granny smith", "red delicious"]
   *  },
   * });
   * ```
   */
  addMany = <Schema extends ZodSchema<NonMergeObject<CurrentShape>, any, any>>({
    defaultValues,
    schema,
  }: {
    schema: Schema;
    defaultValues: z.infer<Schema>;
  }) => {
    return this.mutate<Merge<CurrentShape, z.infer<Schema>>>(() =>
      // @ts-ignore
      mutators.addMany({ defaultValues, schema })
    );
  };

  /**
   * Renames a key in your schema
   */
  rename = <
    SourceKey extends keyof CurrentShape,
    DestinationKey extends string
  >({
    source,
    destination,
  }: {
    source: SourceKey;
    destination: DestinationKey;
  }) => {
    this.renames.push([source as string, destination]);
    return this.mutate<
      RenameOutput<CurrentShape, SourceKey, DestinationKey>
      // @ts-ignore
    >(() => mutators.rename(source, destination));
  };

  /**
   *  renames many keys at the same time
   *
   *
   */
  renameMany = <
    Renames extends Partial<Readonly<Record<keyof CurrentShape, string>>>
  >(
    renames: Renames
  ) => {
    Object.entries(renames).forEach(([source, destination]) => {
      this.renames.push([source, destination as string]);
    });

    return this.mutate<RenameManyReturn<CurrentShape, Renames>>(() =>
      mutators.renameMany<CurrentShape, Renames>({ renames })
    );
  };

  /**
   * Removes a key from your schema
   */
  remove = <SourceKey extends keyof CurrentShape>(source: SourceKey) => {
    this.paths = this.paths.filter((pathData) => pathData.path !== source);

    return this.mutate(() => mutators.removeOne(source));
  };

  mutate = <T extends object>(
    createMutator: (_input: CurrentShape) => Mutator<CurrentShape, T>
  ) => {
    const mutator = createMutator(undefined as any as CurrentShape);

    mutator.beforeMutate({
      paths: this.paths,
    });

    this.paths = mutator.rewritePaths(this.paths);

    this.mutators.push(mutator);

    return this.next<T>() as ZodMigrations<StartingShape, T, EndingShape>;
  };

  private __getDebugData() {
    const privateData = this.__get_private_data();
    return {
      mutators: privateData.mutators.map((mutator) => ({
        tag: mutator.tag,
        hasNestedMigrator: !!mutator.nestedMigrator,
        nestedMigratorPath: mutator.nestedMigrator?.path,
      })),
      paths: privateData.paths.map((path) => {
        return {
          path: path.path,
          hasNestedMigrator: !!path.nestedMigrator,
        };
      }),
      renames: this.renames,
    };
  }
  stripTags = (input: any) => {
    const schemaEvolutionCount = input[schemaEvolutionCountTag] ?? null;
    const versionTagVal = input[versionTag] ?? null;

    if (schemaEvolutionCount !== null) {
      input = omit(input, [schemaEvolutionCountTag]);
    }

    if (versionTagVal !== null) {
      input = omit(input, [versionTag]);
    }
    return input;
  };

  /**
   * Transform any previous version of your data into the most modern form
   */
  transform = (
    input: any,
    { strip }: { strip: boolean } = { strip: true }
  ): EndingShape => {
    const schemaEvolutionCount = input[schemaEvolutionCountTag] ?? null;

    if (strip) {
      input = this.stripTags(input);
    }

    const firstInvalidMutationIndex = (() => {
      if (schemaEvolutionCount) return 0;

      return this.mutators.findIndex((mutator) => {
        if (mutator.nestedMigrator) {
          return !mutator.nestedMigrator.migrator
            .__get_private_data()
            .endingSchema.safeParse(input).success;
        } else {
          return !mutator.isValid({
            input,
            paths: this.paths.map((path) => path.path),
            renames: this.renames,
          });
        }
      });
    })();

    if (firstInvalidMutationIndex === -1 && !schemaEvolutionCount) return input;

    const mutators = schemaEvolutionCount
      ? this.mutators.filter((mutator, index) => {
          if (mutator.nestedMigrator) {
            return true;
          }
          return index >= schemaEvolutionCount;
        })
      : this.mutators.slice(firstInvalidMutationIndex);

    for (const mutator of mutators) {
      this.transformsAppliedCount = this.transformsAppliedCount + 1;
      input = mutator.up({
        input,
        renames: this.renames,
        paths: this.paths.map((path) => path.path),
      });
    }

    return input;
  };

  preStringify = (rawInput: any): any => {
    const input = structuredClone(rawInput);

    input[schemaEvolutionCountTag] = this.schemaEvolutionCount;

    const mutatorsWithNestedMigrators = this.mutators.filter(
      (mutator) => mutator.nestedMigrator
    );

    mutatorsWithNestedMigrators.forEach((mutator) => {
      const renames = getValidRenames(
        this.renames,
        mutator.nestedMigrator!.path
      );
      for (const rename of renames) {
        const valueAtPath = input[rename];
        if (valueAtPath) {
          console.log(mutator.tag);
          if (mutator.tag === "addNestedArray") {
            input[rename] = input?.[rename]?.map((value: any) => {
              return mutator.nestedMigrator!.migrator.preStringify(value);
            });
          }
          if (mutator.tag === "addNested") {
            input[rename] =
              mutator.nestedMigrator!.migrator.preStringify(valueAtPath);
          }
        }
      }
    });

    return input;
  };

  /**
   * stringify your schema for when you store it in your database
   */
  stringify = (rawInput: any): any => {
    return JSON.stringify(this.preStringify(rawInput));
  };

  /**
   * release a version of your schema
   */
  releaseVersion = (version: number) => {
    const maxVersion = Math.max(...this.versions.keys());

    if (version < maxVersion) {
      throw new Error(`Please use a version greater than ${maxVersion}`);
    }

    this.versions = this.versions.set(version, this.schemaEvolutionCount);

    return this;
  };

  __get_private_data() {
    return {
      schemaEvolutionCount: this.schemaEvolutionCount,
      mutators: this.mutators,
      paths: this.paths,
      nestedPaths: this.nestedPaths,
      versions: this.versions,
      transformsAppliedCount: this.transformsAppliedCount,
      endingSchema: this.endingSchema,
      startingSchema: this.startingSchema,
      renames: this.renames,
    };
  }

  __get_current_shape(): CurrentShape {
    return "dummy" as any as CurrentShape;
  }

  __get_start_shape(): StartingShape {
    return "dummy" as any as StartingShape;
  }

  /**
   * create a safe schema from a strict schema
   */
  safeSchema = (): ZodSchema<EndingShape> => {
    if (!this.__get_private_data().endingSchema) {
      throw new Error(
        "Cannot create a safe schema unless you provide an ending schema"
      );
    }

    // @ts-ignore
    return z.preprocess(
      (input) => this.transform(input),
      this.endingSchema.passthrough()
    );
  };

  __clone = () => {
    return new ZodMigrations<StartingShape, CurrentShape, EndingShape>({
      mutators: [...this.mutators],
      nestedPaths: [...this.nestedPaths],
      paths: [...this.paths],
      schemaEvolutionCount: this.schemaEvolutionCount,
      versions: this.versions,
      startingSchema: this.startingSchema,
      endingSchema: this.endingSchema,
      renames: this.renames,
    });
  };
}

export const createZodMigrations = <
  EndingShape extends object,
  StartingShape extends object
>(_input: {
  endingSchema: ZShape<EndingShape>;
  startingSchema: ZShape<StartingShape>;
}) => {
  const pathData: PathData[] = Object.keys(
    _input.startingSchema.shape ?? {}
  ).map((path) => ({
    path,
    schema: _input.startingSchema.shape[path],
    nestedMigrator: undefined,
  }));

  return new ZodMigrations<StartingShape, StartingShape, EndingShape>({
    mutators: [],
    nestedPaths: [],
    paths: pathData,
    schemaEvolutionCount: 0,
    versions: new Map(),
    startingSchema: _input.startingSchema,
    endingSchema: _input.endingSchema,
    renames: [],
  });
};

/***
  It's not a perfect test but it at least let's you know if your data will become the valid shape
  Technically we need to check that appropriate data is preserved as well
 */
export const testAllVersions = ({
  evolver,
  expect,
  startData,
  customTestCase = [],
}: {
  evolver: ZodMigrations<any, any, any>;
  schema: ZodSchema;
  expect: (input: any) => any;
  startData: any;
  customTestCase?: { input: any; output: any }[];
}) => {
  const metaData = evolver.__get_private_data();

  const safeSchema = evolver.safeSchema();

  const checkSchema = (input: any) => {
    const result = safeSchema.safeParse(input).success;
    if (!result) console.log(`invalid input checkSchema`, input);
    expect(result).toBe(true);
  };

  const checkValidOutput = ([input, output]: [any, any]) => {
    const result = safeSchema.parse(input);
    if (!result) console.log(`invalid input`, input, `for output`, output);
    expect(result).toEqual(output);
  };

  checkSchema(startData);
  let currentData = startData;

  for (const mutator of metaData.mutators) {
    currentData = mutator.up({
      input: currentData,
      paths: metaData.paths.map((path) => path.path),
      renames: metaData.renames,
    });
    checkSchema(currentData);
  }

  for (const testCase of customTestCase) {
    checkValidOutput([testCase.input, testCase.output]);
  }
};
