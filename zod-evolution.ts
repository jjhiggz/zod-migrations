import { z, ZodSchema } from "zod";
import type { ObjectWith } from "./types/ObjectWith";
import { type Merge } from "ts-toolbelt/out/Object/Merge";
import type { NestedKeyOf } from "./types/NestedKeyOf";
type FillableObject = Merge<{}, {}>;

const zevoVersionTag = "_zevo_version";

export class JsonEvolver<Shape extends FillableObject> {
  zevo_version: number;
  transforms: ((input: any) => any)[] = [];
  nestedPaths: [NestedKeyOf<Shape>, JsonEvolver<any>][] = [];

  constructor(input?: {
    _zevo_version: number;
    transforms: ((input: any) => any)[];
    nestedPaths: [NestedKeyOf<Shape>, JsonEvolver<any>][];
  }) {
    if (input) {
      const { _zevo_version = 1, transforms } = input;
      this.zevo_version = _zevo_version;
      this.transforms = transforms;
      this.nestedPaths = input.nestedPaths;
    } else {
      this.transforms = [];
      this.zevo_version = 1;
      this.nestedPaths = [];
    }
  }

  next = <NewShape extends FillableObject>() => {
    return new JsonEvolver<NewShape>({
      _zevo_version: this.zevo_version + 1,
      transforms: this.transforms,
      // @ts-ignore
      nestedPaths: this.nestedPaths,
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
        return JSON.stringify(fullObject, null, 2);
      } else if (registeredPath) {
        fullObject[zevoVersionTag] = registeredPath[1].zevo_version;
        return fullObject;
      }
    }

    return input;
  };
}
