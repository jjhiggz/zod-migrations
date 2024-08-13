import * as type_fest from 'type-fest';
import { Simplify } from 'type-fest';
import { ZodSchema, z } from 'zod';
import { Merge } from 'ts-toolbelt/out/Object/Merge';

type Mutator<Shape, ReturnShape> = {
    tag: string;
    up: (input: Shape) => ReturnShape;
    isValid: (input: Shape) => boolean;
    rewritePaths: (input: string[]) => string[];
    beforeMutate: ({ paths }: {
        paths: string[];
    }) => any;
};
type FillableObject = Merge<{}, {}>;
type NonMergeObject<MergeObject> = Record<string, any> & Partial<Record<keyof MergeObject, never>>;
type RenameManyReturn<Shape extends Record<PropertyKey, any>, Renames extends Readonly<Partial<Record<keyof Shape, string>>>> = {
    [K in keyof Renames as Renames[K] extends string ? Renames[K] : never]: K extends keyof Shape ? Shape[K] : never;
} & Omit<Shape, keyof Renames>;

type ObjectWith<K extends string, V> = {
    [key in K | never]: V;
};

declare const schemaEvolutionCountTag = "__zod_migration_schema_evolution_count";
declare const versionTag = "__zod_migration_version";
declare class ZodMigrations<Shape extends FillableObject> {
    /**
     * The amount of evolutions the schema has had since the beginning
     */
    private schemaEvolutionCount;
    /**
     * The transforms for this schema
     */
    private mutators;
    /**
     * The paths that are registered according to your schema count
     */
    private paths;
    /**
     * An array of tuples of the registered nested paths
     */
    private nestedPaths;
    /**
     * A map of all the versions. Each version maps to a `schemaEvolutionCount` so that way we
     * know which ones to skip per version
     */
    private versions;
    /**
     * For use in testing to see how many transforms were applied to generate the schema
     */
    private transformsAppliedCount;
    /**
     * You probably don't need to use this but it's important internally to create new instances
     */
    constructor(input?: {
        schemaEvolutionCount: number;
        mutators: Mutator<any, any>[];
        nestedPaths: [keyof Shape, ZodMigrations<any>][];
        paths: string[];
        versions: Map<number, number>;
    });
    /**
     * Returns the next instance in the chain... See [Fluent Interfaces](https://en.wikipedia.org/wiki/Fluent_interface)
     */
    next: <NewShape extends FillableObject>() => ZodMigrations<NewShape>;
    /**
     * Adds a key to your schema
     */
    add: <S extends ZodSchema, Path extends string>({ path, schema, defaultVal, }: {
        path: Path;
        defaultVal: z.infer<S>;
        schema: S;
    }) => ZodMigrations<Shape & ObjectWith<Path, z.TypeOf<S>>>;
    /**
     * Renames a key in your schema
     */
    rename: <SourceKey extends keyof Shape, DestinationKey extends string>({ source, destination, }: {
        source: SourceKey;
        destination: DestinationKey;
    }) => ZodMigrations<Omit<Omit<Shape, SourceKey>, DestinationKey> & ((type_fest.IsLiteral<DestinationKey> extends true ? ((type_fest.IsNever<DestinationKey> extends true ? false : DestinationKey extends any ? [DestinationKey] extends [DestinationKey] ? false : true : never) extends infer Result ? boolean extends Result ? true : Result : never) extends true ? false : true : false) extends true ? { -readonly [P in DestinationKey]-?: Shape[SourceKey]; } : (Omit<Shape, SourceKey> extends infer T_1 ? { -readonly [P_1 in keyof T_1 as P_1 extends DestinationKey ? P_1 : never]: Shape[SourceKey] | Omit<Shape, SourceKey>[P_1]; } : never) & { -readonly [P_2 in DestinationKey as P_2 extends Exclude<keyof Shape, SourceKey> ? never : P_2]?: Shape[SourceKey] | undefined; }) extends infer T ? { [KeyType in keyof T]: (Omit<Omit<Shape, SourceKey>, DestinationKey> & ((type_fest.IsLiteral<DestinationKey> extends true ? ((type_fest.IsNever<DestinationKey> extends true ? false : DestinationKey extends any ? [DestinationKey] extends [DestinationKey] ? false : true : never) extends infer Result ? boolean extends Result ? true : Result : never) extends true ? false : true : false) extends true ? { -readonly [P in DestinationKey]-?: Shape[SourceKey]; } : (Omit<Shape, SourceKey> extends infer T_1 ? { -readonly [P_1 in keyof T_1 as P_1 extends DestinationKey ? P_1 : never]: Shape[SourceKey] | Omit<Shape, SourceKey>[P_1]; } : never) & { -readonly [P_2 in DestinationKey as P_2 extends Exclude<keyof Shape, SourceKey> ? never : P_2]?: Shape[SourceKey] | undefined; }))[KeyType]; } : never>;
    /**
     * Removes a key from your schema
     */
    remove: <SourceKey extends keyof Shape>(source: SourceKey) => ZodMigrations<Omit<Shape, SourceKey>>;
    mutate: <T extends object>(createMutator: (_input: Shape) => Mutator<Shape, T>) => ZodMigrations<T>;
    /**
     * Transform any previous version of your data into the most modern form
     */
    transform: (input: any) => Shape;
    /**
     * register a nested schema
     */
    register: <T extends FillableObject>(key: keyof Shape, jsonEvolution: ZodMigrations<T>) => ZodMigrations<Shape>;
    /**
     * stringify your schema for when you store it in your database
     */
    stringify: (rawInput: any, path?: string[]) => any;
    /**
     * release a version of your schema
     */
    releaseVersion: (version: number) => this;
    __get_private_data(): {
        schemaEvolutionCount: number;
        mutators: Mutator<any, any>[];
        paths: string[];
        nestedPaths: [keyof Shape, ZodMigrations<any>][];
        versions: Map<number, number>;
        transformsAppliedCount: number;
    };
    /**
     * create a safe schema from a strict schema
     */
    safeSchema: <Z extends ZodSchema<Simplify<Shape>, any, any>>(schema: Z) => Simplify<Shape> extends z.infer<Z> ? Z : never;
}
declare const createJsonEvolver: <T extends object>(_input: {
    schema: ZodSchema<T>;
}) => ZodMigrations<T>;
/***
  It's not a perfect test but it at least let's you know if your data will become the valid shape
  Technically we need to check that appropriate data is preserved as well
 */
declare const testAllVersions: ({ evolver, schema, expect, startData, customTestCase, }: {
    evolver: ZodMigrations<any>;
    schema: ZodSchema;
    expect: (input: any) => any;
    startData: any;
    customTestCase?: {
        input: any;
        output: any;
    }[];
}) => void;

declare const mutators: {
    add: <Shape extends FillableObject, Schema extends ZodSchema, Path extends string>({ path, schema, defaultVal, }: {
        path: Path;
        defaultVal: z.infer<Schema>;
        schema: Schema;
    }) => {
        tag: string;
        up: (input: Shape) => Omit<Shape, Path> & ((type_fest.IsLiteral<Path> extends true ? ((type_fest.IsNever<Path> extends true ? false : Path extends any ? [Path] extends [Path] ? false : true : never) extends infer Result ? boolean extends Result ? true : Result : never) extends true ? false : true : false) extends true ? { -readonly [P in Path]-?: z.TypeOf<Schema>; } : { -readonly [P_1 in keyof Shape as P_1 extends Path ? P_1 : never]: z.TypeOf<Schema> | Shape[P_1]; } & { -readonly [P_2 in Path as P_2 extends keyof Shape ? never : P_2]?: z.TypeOf<Schema> | undefined; }) extends infer T ? { [KeyType in keyof T]: (Omit<Shape, Path> & ((type_fest.IsLiteral<Path> extends true ? ((type_fest.IsNever<Path> extends true ? false : Path extends any ? [Path] extends [Path] ? false : true : never) extends infer Result ? boolean extends Result ? true : Result : never) extends true ? false : true : false) extends true ? { -readonly [P in Path]-?: z.TypeOf<Schema>; } : { -readonly [P_1 in keyof Shape as P_1 extends Path ? P_1 : never]: z.TypeOf<Schema> | Shape[P_1]; } & { -readonly [P_2 in Path as P_2 extends keyof Shape ? never : P_2]?: z.TypeOf<Schema> | undefined; }))[KeyType]; } : never;
        isValid: (input: unknown) => boolean;
        rewritePaths: (input: string[]) => string[];
        beforeMutate: ({ paths }: {
            paths: string[];
        }) => void;
    };
    addMany: <Shape extends FillableObject, Schema extends ZodSchema<NonMergeObject<Shape>, any, any>>({ defaultValues, schema, }: {
        defaultValues: z.infer<Schema>;
        schema: Schema;
    }) => {
        tag: string;
        up: (input: Shape) => (type_fest.PickIndexSignature<Shape> extends infer T_1 ? { [Key in keyof T_1 as Key extends keyof type_fest.PickIndexSignature<z.TypeOf<Schema>> ? never : Key]: type_fest.PickIndexSignature<Shape>[Key]; } : never) & type_fest.PickIndexSignature<z.TypeOf<Schema>> & (type_fest.OmitIndexSignature<Shape> extends infer T_2 ? { [Key_1 in keyof T_2 as Key_1 extends keyof type_fest.OmitIndexSignature<z.TypeOf<Schema>> ? never : Key_1]: type_fest.OmitIndexSignature<Shape>[Key_1]; } : never) & type_fest.OmitIndexSignature<z.TypeOf<Schema>> extends infer T ? { [KeyType in keyof T]: ((type_fest.PickIndexSignature<Shape> extends infer T_1 ? { [Key in keyof T_1 as Key extends keyof type_fest.PickIndexSignature<z.TypeOf<Schema>> ? never : Key]: type_fest.PickIndexSignature<Shape>[Key]; } : never) & type_fest.PickIndexSignature<z.TypeOf<Schema>> & (type_fest.OmitIndexSignature<Shape> extends infer T_2 ? { [Key_1 in keyof T_2 as Key_1 extends keyof type_fest.OmitIndexSignature<z.TypeOf<Schema>> ? never : Key_1]: type_fest.OmitIndexSignature<Shape>[Key_1]; } : never) & type_fest.OmitIndexSignature<z.TypeOf<Schema>>)[KeyType]; } : never;
        isValid: (input: Shape) => false;
        beforeMutate: () => void;
        rewritePaths: (paths: string[]) => string[];
    };
    removeOne: <Shape extends object, Path extends keyof Shape>(path: Path) => {
        up: (input: Shape) => Omit<Shape, Path>;
        tag: string;
        isValid: (input: Shape) => boolean;
        rewritePaths: (input: string[]) => string[];
        beforeMutate: () => void;
    };
    removeMany: <Shape extends object, K extends keyof Shape>(paths: ReadonlyArray<K>) => {
        tag: string;
        up: (input: Shape) => Omit<Shape, K>;
        isValid: () => false;
        beforeMutate: () => void;
        rewritePaths: (input: string[]) => string[];
    };
    rename: <Shape extends object, SourceKey extends keyof Shape, Destination extends string>(source: SourceKey, destination: Destination) => {
        up: (input: Shape) => Omit<Omit<Shape, SourceKey>, Destination> & ((type_fest.IsLiteral<Destination> extends true ? ((type_fest.IsNever<Destination> extends true ? false : Destination extends any ? [Destination] extends [Destination] ? false : true : never) extends infer Result ? boolean extends Result ? true : Result : never) extends true ? false : true : false) extends true ? { -readonly [P in Destination]-?: Shape[SourceKey]; } : (Omit<Shape, SourceKey> extends infer T_1 ? { -readonly [P_1 in keyof T_1 as P_1 extends Destination ? P_1 : never]: Shape[SourceKey] | Omit<Shape, SourceKey>[P_1]; } : never) & { -readonly [P_2 in Destination as P_2 extends Exclude<keyof Shape, SourceKey> ? never : P_2]?: Shape[SourceKey] | undefined; }) extends infer T ? { [KeyType in keyof T]: (Omit<Omit<Shape, SourceKey>, Destination> & ((type_fest.IsLiteral<Destination> extends true ? ((type_fest.IsNever<Destination> extends true ? false : Destination extends any ? [Destination] extends [Destination] ? false : true : never) extends infer Result ? boolean extends Result ? true : Result : never) extends true ? false : true : false) extends true ? { -readonly [P in Destination]-?: Shape[SourceKey]; } : (Omit<Shape, SourceKey> extends infer T_1 ? { -readonly [P_1 in keyof T_1 as P_1 extends Destination ? P_1 : never]: Shape[SourceKey] | Omit<Shape, SourceKey>[P_1]; } : never) & { -readonly [P_2 in Destination as P_2 extends Exclude<keyof Shape, SourceKey> ? never : P_2]?: Shape[SourceKey] | undefined; }))[KeyType]; } : never;
        tag: string;
        isValid: (input: Shape) => boolean;
        beforeMutate: ({ paths }: {
            paths: string[];
        }) => void;
        rewritePaths: (paths: string[]) => string[];
    };
    renameMany: <Shape extends FillableObject, Renames extends Partial<Readonly<Record<keyof Shape, string>>>>({ renames, }: {
        renames: Renames;
    }) => {
        tag: string;
        up: (input: Shape) => RenameManyReturn<Shape, Renames>;
        isValid: (input: Shape) => boolean;
        beforeMutate: () => void;
        rewritePaths: (paths: string[]) => string[];
    };
};

export { ZodMigrations, createJsonEvolver, mutators, schemaEvolutionCountTag, testAllVersions, versionTag };
