import { z, ZodObject, ZodSchema } from "zod";
import type { ObjectWith } from "./types/ObjectWith";
import { type Merge } from "ts-toolbelt/out/Object/Merge";
import type { NestedKeyOf } from "./types/NestedKeyOf";
type FillableObject = Merge<{}, {}>;

export type GetJsonEvolverShape<T extends JsonEvolver<any>> = ReturnType<
  T["transform"]
>;

export const schemaEvolutionCountTag = "__json_evolver_schema_evolution_count";
export const versionTag = "__json_evolver_version";

export class JsonEvolver<Shape extends FillableObject> {
  schemaEvolutionCount: number;
  transforms: ((input: any) => any)[] = [];
  paths: string[] = [];
  nestedPaths: [NestedKeyOf<Shape>, JsonEvolver<any>][] = [];
  // Which tags correspond with which
  versions: Map<number, number> = new Map();
  transformsAppliedCount: number = 0;

  constructor(input?: {
    schemaEvolutionCount: number;
    transforms: ((input: any) => any)[];
    nestedPaths: [NestedKeyOf<Shape>, JsonEvolver<any>][];
    paths: string[];
    tags: Map<number, number>;
  }) {
    if (input) {
      const { schemaEvolutionCount = 1, transforms, paths } = input;
      this.schemaEvolutionCount = schemaEvolutionCount;
      this.transforms = transforms;
      this.nestedPaths = input.nestedPaths;
      this.paths = paths;
      this.versions = input.tags;
    } else {
      this.transforms = [];
      this.schemaEvolutionCount = 0;
      this.nestedPaths = [];
      this.paths = [];
      this.versions = new Map();
      this.transformsAppliedCount = 0;
    }
  }

  next = <NewShape extends FillableObject>() => {
    return new JsonEvolver<NewShape>({
      schemaEvolutionCount: this.schemaEvolutionCount + 1,
      transforms: this.transforms,
      // @ts-ignore
      nestedPaths: this.nestedPaths,
      paths: this.paths,
    });
  };

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

  rename = <
    SourceKey extends NestedKeyOf<Shape>,
    DestinationKey extends string
  >({
    source,
    destination,
  }: {
    source: SourceKey;
    destination: DestinationKey;
  }) => {
    this.paths = this.paths.filter((pathName) => pathName !== source);
    if (this.paths.includes(destination)) {
      throw new Error(
        `Cannot rename '${source}' to  '${destination}' because it already exists in your schema`
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

  remove = <SourceKey extends NestedKeyOf<Shape>>(source: SourceKey) => {
    this.paths = this.paths.filter((pathName) => pathName !== source);

    const transform = (input: any) => {
      delete input[source];
      return input;
    };

    this.transforms.push(transform);

    return this.next<Omit<Shape, SourceKey>>();
  };

  transform = (input: any): Shape => {
    const zevoVersion = input[schemaEvolutionCountTag];

    const forwardTransforms = zevoVersion
      ? this.transforms.slice(zevoVersion)
      : this.transforms;

    for (let transformFn of forwardTransforms) {
      this.transformsAppliedCount = this.transformsAppliedCount + 1;
      input = transformFn(input);
    }
    return input;
  };

  register = <T extends FillableObject>(
    key: NestedKeyOf<Shape>,
    jsonEvolution: JsonEvolver<T>
  ) => {
    this.nestedPaths.push([key, jsonEvolution]);
    return this.next<Shape>();
  };

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

  releaseVersion = (version: number) => {
    const maxVersion = Math.max(...this.versions.keys());

    if (version < maxVersion) {
      throw new Error(`Please use a version greater than ${maxVersion}`);
    }

    this.versions = this.versions.set(version, this.schemaEvolutionCount);

    return this;
  };

  safeSchema = (schema: ZodSchema<Shape, any, any>) => {
    return z.preprocess(
      this.transform,
      (schema as any).passthrough() as typeof schema
    );
  };
}
