import { z, ZodSchema } from "zod";
import type { ObjectWith } from "./types/ObjectWith";
import { type Merge } from "ts-toolbelt/out/Object/Merge";
import type { Equals } from "./types/Equals";
type FillableObject = Merge<{}, {}>;

export type GetJsonEvolverShape<T extends JsonEvolver<any>> = ReturnType<
  T["transform"]
>;

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
  private transforms: ((input: any) => any)[] = [];

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
    transforms: ((input: any) => any)[];
    nestedPaths: [keyof Shape, JsonEvolver<any>][];
    paths: string[];
    versions: Map<number, number>;
  }) {
    if (input) {
      const { schemaEvolutionCount = 1, transforms, paths } = input;
      this.schemaEvolutionCount = schemaEvolutionCount;
      this.transforms = transforms;
      this.nestedPaths = input.nestedPaths;
      this.paths = paths;
      this.versions = input.versions;
    } else {
      this.transforms = [];
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
      transforms: this.transforms,
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

    const transform = (input: any) => {
      const result = schema.safeParse(input[path]);
      if (!result.success) input[path] = defaultVal;
      return input;
    };

    this.transforms.push(transform);

    return this.next<Shape & ObjectWith<Path, typeof defaultVal>>();
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

    const transform = (input: any) => {
      input[destination] = input[source];
      delete input[source];
      return input;
    };

    this.transforms.push(transform);

    return this.next<
      // @ts-ignore
      Omit<Shape, SourceKey> & ObjectWith<DestinationKey, Shape[SourceKey]>
    >();
  };

  /**
   * Removes a key from your schema
   */
  remove = <SourceKey extends keyof Shape>(source: SourceKey) => {
    this.paths = this.paths.filter((pathName) => pathName !== source);

    const transform = (input: any) => {
      delete input[source];
      return input;
    };

    this.transforms.push(transform);

    return this.next<Omit<Shape, SourceKey>>();
  };

  /**
   * Transform any previous version of your data into the most modern form
   */
  transform = (input: any): Shape => {
    const zevoVersion = input[schemaEvolutionCountTag] ?? 0;

    const forwardTransforms = zevoVersion
      ? this.transforms.slice(zevoVersion)
      : this.transforms;

    for (let transformFn of forwardTransforms) {
      this.transformsAppliedCount = this.transformsAppliedCount + 1;
      input = transformFn(input);
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
      transforms: this.transforms,
      paths: this.paths,
      nestedPaths: this.nestedPaths,
      versions: this.versions,
      transformsAppliedCount: this.transformsAppliedCount,
    };
  }

  /**
   * create a safe schema from a strict schema
   */
  safeSchema = <Z extends ZodSchema<Shape, any, any>>(
    schema: Z
  ): Shape extends z.infer<Z> ? Z : never => {
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
