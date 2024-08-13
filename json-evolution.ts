import { z, ZodSchema } from "zod";
import type { FillableObject, Mutator, UpsertProp } from "./types";
import { mutators } from "./mutators";
import type { ObjectWith } from "./types/ObjectWith";
import type { Simplify } from "type-fest";

export const schemaEvolutionCountTag = "__json_evolver_schema_evolution_count";
export const versionTag = "__json_evolver_version";

export class JsonEvolver<Shape extends FillableObject> {
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
  private paths: string[] = [];

  /**
   * An array of tuples of the registered nested paths
   */
  private nestedPaths: [keyof Shape, JsonEvolver<any>][] = [];

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
    nestedPaths: [keyof Shape, JsonEvolver<any>][];
    paths: string[];
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
    return new JsonEvolver<NewShape>({
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
    if (this.paths.includes(path)) {
      throw new Error(`'${path}' already exists in your JsonEvolver`);
    } else this.paths.push(path);

    return this.mutate<Shape & ObjectWith<Path, z.infer<S>>>(() =>
      // @ts-ignore
      mutators.add({ path, schema, defaultVal })
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
    this.paths = this.paths.filter((pathName) => pathName !== source);
    if (this.paths.includes(destination)) {
      throw new Error(
        `Cannot rename '${
          source as string
        }' to  '${destination}' because it already exists in your schema`
      );
    } else {
      this.paths.push(destination);
    }

    return this.mutate(() => mutators.rename(source, destination));
  };

  /**
   * Removes a key from your schema
   */
  remove = <SourceKey extends keyof Shape>(source: SourceKey) => {
    this.paths = this.paths.filter((pathName) => pathName !== source);

    return this.mutate(() => mutators.removeOne(source));
  };

  mutate = <T extends object>(createMutator: () => Mutator<Shape, T>) => {
    const mutator = createMutator();
    this.mutators.push(mutator);

    return this.next<T>();
  };

  /**
   * Transform any previous version of your data into the most modern form
   */
  transform = (input: any): Shape => {
    const zevoVersion = input[schemaEvolutionCountTag] ?? 0;

    const firstInvalidMutationIndex = (() => {
      if (zevoVersion) return 0;
      return this.mutators.findIndex((mutator, i) => {
        return !mutator.isValid(input);
      });
    })();

    if (firstInvalidMutationIndex === -1 && !zevoVersion) return input;

    const mutators = zevoVersion
      ? this.mutators.slice(zevoVersion)
      : this.mutators.slice(firstInvalidMutationIndex);

    for (let mutator of mutators) {
      this.transformsAppliedCount = this.transformsAppliedCount + 1;
      input = mutator.up(input);
    }
    return input;
  };

  /**
   * register a nested schema
   */
  register = <T extends FillableObject>(
    key: keyof Shape,
    jsonEvolution: JsonEvolver<T>
  ) => {
    this.nestedPaths.push([key, jsonEvolution]);
    return this.next<Shape>();
  };

  /**
   * stringify your schema for when you store it in your database
   */
  stringify = (rawInput: any, path: string[] = []): any => {
    const input = structuredClone(rawInput);

    if (Array.isArray(input)) {
      return input.map((val) => this.stringify(val, [...path]));
    }

    if (Object(input) === input) {
      const registeredPath = this.nestedPaths.find(
        (nestedPath) => nestedPath[0] === path.join("/")
      );
      const entries = Object.entries(input).map(([key, value]) => {
        return [key, this.stringify(value, [...path, key])];
      });

      const fullObject = Object.fromEntries([...entries]);

      if (path.length === 0) {
        fullObject[schemaEvolutionCountTag] = this.schemaEvolutionCount;
        return JSON.stringify(fullObject, null, 2);
      } else if (registeredPath) {
        fullObject[schemaEvolutionCountTag] =
          registeredPath[1].schemaEvolutionCount;
        return fullObject;
      }
    }

    return input;
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
      this.transform,
      (schema as any).passthrough() as typeof schema
    );
  };
}

export const createJsonEvolver = <T extends {}>(_input: {
  schema: ZodSchema<T>;
}) => {
  return new JsonEvolver<T>();
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
  evolver: JsonEvolver<any>;
  schema: ZodSchema;
  expect: (input: any) => any;
  startData: any;
  customTestCase?: { input: any; output: any }[];
}) => {
  const metaData = evolver.__get_private_data();

  const safeSchema = evolver.safeSchema(schema);

  const checkSchema = (input: any) => {
    const result = safeSchema.safeParse(input).success;
    if (!result) console.log(`invalid input`, input);
    expect(result).toBe(true);
  };

  const checkValidOutput = ([input, output]: [any, any]) => {
    const result = safeSchema.parse(input);
    if (!result) console.log(`invalid input`, input);
    expect(result).toEqual(output);
  };

  checkSchema(startData);
  let currentData = startData;

  for (let mutator of metaData.mutators) {
    currentData = mutator.up(currentData);
    checkSchema(startData);
  }

  for (let testCase of customTestCase) {
    checkValidOutput([testCase.input, testCase.output]);
  }
};
