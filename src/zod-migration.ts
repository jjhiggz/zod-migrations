/* eslint-disable @typescript-eslint/ban-ts-comment */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { z, ZodSchema } from "zod";
import type {
  FillableObject,
  Mutator,
  NonMergeObject,
  PathData,
  RenameManyReturn,
} from "./types/types";
import { mutators } from "./mutators";
import type { ObjectWith } from "./types/ObjectWith";
import type { Merge, Simplify } from "type-fest";
import { omit } from "remeda";

export const schemaEvolutionCountTag = "__zod_migration_schema_evolution_count";
export const versionTag = "__zod_migration_version";

// What I need is all current paths, and I need to know
// pathData:  { nestedMigrator?: ZodMigrations , schema: zodSchema, path: string,  } | string

export class ZodMigrations<Shape extends FillableObject> {
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
  private nestedPaths: [keyof Shape, ZodMigrations<any>][] = [];

  /**
   * A map of all the versions. Each version maps to a `schemaEvolutionCount` so that way we
   * know which ones to skip per version
   */
  private versions: Map<number, number> = new Map();

  /**
   * For use in testing to see how many transforms were applied to generate the schema
   */
  private transformsAppliedCount: number = 0;

  /**
   * You probably don't need to use this but it's important internally to create new instances
   */
  constructor(input?: {
    schemaEvolutionCount: number;
    mutators: Mutator<any, any>[];
    nestedPaths: [keyof Shape, ZodMigrations<any>][];
    paths: PathData[];
    versions: Map<number, number>;
  }) {
    if (input) {
      const { schemaEvolutionCount = 1, mutators: mutators, paths } = input;
      this.schemaEvolutionCount = schemaEvolutionCount;
      this.mutators = mutators;
      this.nestedPaths = input.nestedPaths;
      this.paths = paths;
      this.versions = input.versions;
    } else {
      this.mutators = [];
      this.schemaEvolutionCount = 0;
      this.nestedPaths = [];
      this.paths = [];
      this.versions = new Map();
      this.transformsAppliedCount = 0;
    }
  }

  /**
   * Returns the next instance in the chain... See [Fluent Interfaces](https://en.wikipedia.org/wiki/Fluent_interface)
   */
  next = <NewShape extends FillableObject>() => {
    return new ZodMigrations<NewShape>({
      schemaEvolutionCount: this.schemaEvolutionCount + 1,
      mutators: this.mutators,
      // @ts-ignore
      nestedPaths: this.nestedPaths,
      paths: this.paths,
      versions: this.versions,
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
    return this.mutate<Shape & ObjectWith<Path, z.infer<S>>>(() =>
      // @ts-ignore
      mutators.add({ path, schema, defaultVal })
    );
  };

  /**
   * Add Nested Path
   */
  addNested = <S extends ZodSchema, Path extends string>({
    path,
    schema,
    defaultVal,
    nestedMigrator,
  }: {
    path: Path;
    defaultVal: z.infer<S>;
    schema: S;
    nestedMigrator: ZodMigrations<any>;
  }) => {
    return this.mutate<Shape & ObjectWith<Path, z.infer<S>>>(() =>
      // @ts-ignore
      mutators.addNestedPath({ path, schema, defaultVal, nestedMigrator })
    );
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
  addMany = <Schema extends ZodSchema<NonMergeObject<Shape>, any, any>>({
    defaultValues,
    schema,
  }: {
    schema: Schema;
    defaultValues: z.infer<Schema>;
  }) => {
    return this.mutate<Merge<Shape, z.infer<Schema>>>(() =>
      // @ts-ignore
      mutators.addMany({ defaultValues, schema })
    );
  };

  /**
   * Renames a key in your schema
   */
  rename = <SourceKey extends keyof Shape, DestinationKey extends string>({
    source,
    destination,
  }: {
    source: SourceKey;
    destination: DestinationKey;
  }) => {
    return this.mutate(() => mutators.rename(source, destination));
  };

  /**
   *  renames many keys at the same time
   *
   *
   */
  renameMany = <Renames extends Partial<Readonly<Record<keyof Shape, string>>>>(
    renames: Renames
  ) => {
    return this.mutate<RenameManyReturn<Shape, Renames>>(() =>
      mutators.renameMany<Shape, Renames>({ renames })
    );
  };

  /**
   * Removes a key from your schema
   */
  remove = <SourceKey extends keyof Shape>(source: SourceKey) => {
    this.paths = this.paths.filter((pathData) => pathData.path !== source);

    return this.mutate(() => mutators.removeOne(source));
  };

  mutate = <T extends object>(
    createMutator: (_input: Shape) => Mutator<Shape, T>
  ) => {
    const mutator = createMutator(undefined as any as Shape);

    mutator.beforeMutate({
      paths: this.paths,
    });

    this.paths = mutator.rewritePaths(this.paths);

    this.mutators.push(mutator);

    return this.next<T>() as ZodMigrations<T>;
  };

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
  ): Shape => {
    const schemaEvolutionCount = input[schemaEvolutionCountTag] ?? null;

    if (strip) {
      input = this.stripTags(input);
    }

    const firstInvalidMutationIndex = (() => {
      if (schemaEvolutionCount) return 0;

      return this.mutators.findIndex((mutator) => {
        return !mutator.isValid(input);
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
      if (mutator.nestedMigrator) {
        input = mutator.up(input);
        input[mutator.nestedMigrator.path] =
          mutator.nestedMigrator.migrator.transform(
            input[mutator.nestedMigrator.path]
          );
      } else {
        input = mutator.up(input);
      }
    }

    return input;
  };

  preStringify = (rawInput: any): any => {
    const input = structuredClone(rawInput);

    input[schemaEvolutionCountTag] = this.schemaEvolutionCount;

    this.paths.forEach((pathData) => {
      if (pathData.nestedMigrator) {
        const valueAtPath = input[pathData.path];

        input[pathData.path] =
          pathData.nestedMigrator.preStringify(valueAtPath);
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
    };
  }

  /**
   * create a safe schema from a strict schema
   */
  safeSchema = <Z extends ZodSchema<Simplify<Shape>, any, any>>(
    schema: Z
  ): Simplify<Shape> extends z.infer<Z> ? Z : never => {
    // @ts-ignore
    return z.preprocess(
      (input) => this.transform(input),
      (schema as any).passthrough() as typeof schema
    );
  };

  __clone = () => {
    return new ZodMigrations({
      mutators: [...this.mutators],
      nestedPaths: [...this.nestedPaths],
      paths: [...this.paths],
      schemaEvolutionCount: this.schemaEvolutionCount,
      versions: this.versions,
    });
  };
}

export const createZodMigrations = <T extends object>(_input: {
  schema: ZodSchema<T>;
}) => {
  // @ts-ignore
  const pathData: PathData[] = Object.keys(_input.schema.shape ?? {}).map(
    (path) => ({
      path,
      // @ts-ignore
      schema: _input.schema.shape[path],
      nestedMigrator: null,
    })
  );

  return new ZodMigrations<T>({
    mutators: [],
    nestedPaths: [],
    paths: pathData,
    schemaEvolutionCount: 0,
    versions: new Map(),
  });
};

/***
  It's not a perfect test but it at least let's you know if your data will become the valid shape
  Technically we need to check that appropriate data is preserved as well
 */
export const testAllVersions = ({
  evolver,
  schema,
  expect,
  startData,
  customTestCase = [],
}: {
  evolver: ZodMigrations<any>;
  schema: ZodSchema;
  expect: (input: any) => any;
  startData: any;
  customTestCase?: { input: any; output: any }[];
}) => {
  const metaData = evolver.__get_private_data();

  const safeSchema = evolver.safeSchema(schema);

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
    currentData = mutator.up(currentData);
    checkSchema(currentData);
  }

  for (const testCase of customTestCase) {
    checkValidOutput([testCase.input, testCase.output]);
  }
};
