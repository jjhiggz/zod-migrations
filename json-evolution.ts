import { z, ZodSchema } from "zod";
import type { ObjectWith } from "./types/ObjectWith";
import { type Merge } from "ts-toolbelt/out/Object/Merge";
import type { NestedKeyOf } from "./types/NestedKeyOf";
type FillableObject = Merge<{}, {}>;

export const zevoVersionTag = "_zevo_version";

export class JsonEvolver<Shape extends FillableObject> {
  zevo_version: number;
  transforms: ((input: any) => any)[] = [];
  paths: string[] = [];
  nestedPaths: [NestedKeyOf<Shape>, JsonEvolver<any>][] = [];

  constructor(input?: {
    _zevo_version: number;
    transforms: ((input: any) => any)[];
    nestedPaths: [NestedKeyOf<Shape>, JsonEvolver<any>][];
    paths: string[];
  }) {
    if (input) {
      const { _zevo_version = 1, transforms, paths } = input;
      this.zevo_version = _zevo_version;
      this.transforms = transforms;
      this.nestedPaths = input.nestedPaths;
      this.paths = paths;
    } else {
      this.transforms = [];
      this.zevo_version = 0;
      this.nestedPaths = [];
      this.paths = [];
    }
  }

  next = <NewShape extends FillableObject>() => {
    return new JsonEvolver<NewShape>({
      _zevo_version: this.zevo_version + 1,
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
      const zevoVersion = input[zevoVersionTag];
      if (zevoVersion >= this.zevo_version) {
        return input;
      }
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
      const zevoVersion = input[zevoVersionTag];
      if (zevoVersion >= this.zevo_version) {
        return input;
      }
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
      const zevoVersion = input[zevoVersionTag];
      if (zevoVersion >= this.zevo_version) {
        return input;
      }
      delete input[source];
      return input;
    };

    this.transforms.push(transform);

    return this.next<Omit<Shape, SourceKey>>();
  };

  transform = (input: any): Shape => {
    for (let transformFn of this.transforms) {
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
        fullObject[zevoVersionTag] = this.zevo_version;
        return JSON.stringify(fullObject, null, 2);
      } else if (registeredPath) {
        fullObject[zevoVersionTag] = registeredPath[1].zevo_version;
        return fullObject;
      }
    }

    return input;
  };
}
