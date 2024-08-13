// src/zod-migration.ts
import { z } from "zod";

// src/mutators.ts
import { addProp, mapKeys, merge, omit, pipe, unique } from "remeda";
var isValid = (input, zodSchema) => zodSchema.safeParse(input).success;
var add = ({
  path,
  schema,
  defaultVal
}) => {
  const up = (input) => {
    return addProp(input, path, defaultVal);
  };
  return {
    tag: "add",
    up,
    // @ts-ignore
    isValid: (input) => isValid(input == null ? void 0 : input[path], schema),
    rewritePaths: (input) => [...input, path],
    beforeMutate: ({ paths }) => {
      if (paths.includes(path))
        throw new Error(`'${path}' already exists in your JsonEvolver`);
    }
  };
};
var removeOne = (path) => {
  const up = (input) => {
    return omit(input, [path]);
  };
  return {
    up,
    tag: "removeOne",
    isValid: (input) => !(path in input),
    rewritePaths: (input) => input.filter((pathInEvolver) => pathInEvolver !== path),
    beforeMutate: () => {
    }
  };
};
var removeMany = (paths) => {
  const up = (input) => {
    return omit(input, paths);
  };
  return {
    tag: "removeMany",
    up,
    isValid: () => false,
    beforeMutate: () => {
    },
    rewritePaths: (input) => input.filter((pathInEvolver) => !paths.includes(pathInEvolver))
  };
};
var rename = (source, destination) => {
  const up = (input) => {
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
        throw new Error(
          `Cannot rename '${source}' to  '${destination}' because it already exists in your schema`
        );
      }
    },
    rewritePaths: (paths) => {
      return [...paths, destination].filter((p) => p !== source);
    }
  };
};
var addMany = ({
  defaultValues,
  schema
}) => {
  const up = (input) => {
    return merge(input, defaultValues);
  };
  return {
    tag: "addMany",
    up,
    isValid: (input) => {
      const entries = Object.entries(schema.shape);
      entries.every((entry) => {
        const key = entry[0];
        const schema2 = entry[1];
        return schema2 == null ? void 0 : schema2.safeParse(input == null ? void 0 : input[key]).success;
      });
      return false;
    },
    beforeMutate: () => {
    },
    // @ts-ignore
    rewritePaths: (paths) => [...paths, ...Object.keys(schema.shape)]
  };
};
var renameMany = ({
  renames
}) => {
  const up = (input) => {
    const result = mapKeys(input, (key) => {
      return key in renames ? renames[key] : key;
    });
    return result;
  };
  return {
    tag: "renameMany",
    up,
    isValid: (input) => {
      return Object.entries(renames).every(([source, destination]) => {
        return destination in input && !(source in input);
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
    },
    rewritePaths: (paths) => {
      const values = Object.values(renames);
      return [...paths, ...values].filter(
        (p) => Object.keys(renames).includes(p)
      );
    }
  };
};
var mutators = {
  add,
  addMany,
  removeOne,
  removeMany,
  rename,
  renameMany
};

// src/zod-migration.ts
var schemaEvolutionCountTag = "__zod_migration_schema_evolution_count";
var versionTag = "__zod_migration_version";
var ZodMigrations = class _ZodMigrations {
  /**
   * You probably don't need to use this but it's important internally to create new instances
   */
  constructor(input) {
    /**
     * The transforms for this schema
     */
    this.mutators = [];
    /**
     * The paths that are registered according to your schema count
     */
    this.paths = [];
    /**
     * An array of tuples of the registered nested paths
     */
    this.nestedPaths = [];
    /**
     * A map of all the versions. Each version maps to a `schemaEvolutionCount` so that way we
     * know which ones to skip per version
     */
    this.versions = /* @__PURE__ */ new Map();
    /**
     * For use in testing to see how many transforms were applied to generate the schema
     */
    this.transformsAppliedCount = 0;
    /**
     * Returns the next instance in the chain... See [Fluent Interfaces](https://en.wikipedia.org/wiki/Fluent_interface)
     */
    this.next = () => {
      return new _ZodMigrations({
        schemaEvolutionCount: this.schemaEvolutionCount + 1,
        mutators: this.mutators,
        // @ts-ignore
        nestedPaths: this.nestedPaths,
        paths: this.paths,
        versions: this.versions
      });
    };
    /**
     * Adds a key to your schema
     */
    this.add = ({
      path,
      schema,
      defaultVal
    }) => {
      return this.mutate(
        () => (
          // @ts-ignore
          mutators.add({ path, schema, defaultVal })
        )
      );
    };
    /**
     * Renames a key in your schema
     */
    this.rename = ({
      source,
      destination
    }) => {
      return this.mutate(() => mutators.rename(source, destination));
    };
    /**
     * Removes a key from your schema
     */
    this.remove = (source) => {
      this.paths = this.paths.filter((pathName) => pathName !== source);
      return this.mutate(() => mutators.removeOne(source));
    };
    this.mutate = (createMutator) => {
      const mutator = createMutator(void 0);
      mutator.beforeMutate({
        paths: this.paths
      });
      this.paths = mutator.rewritePaths(this.paths);
      this.mutators.push(mutator);
      return this.next();
    };
    /**
     * Transform any previous version of your data into the most modern form
     */
    this.transform = (input) => {
      var _a;
      const zevoVersion = (_a = input[schemaEvolutionCountTag]) != null ? _a : 0;
      const firstInvalidMutationIndex = (() => {
        if (zevoVersion) return 0;
        return this.mutators.findIndex((mutator) => {
          return !mutator.isValid(input);
        });
      })();
      if (firstInvalidMutationIndex === -1 && !zevoVersion) return input;
      const mutators2 = zevoVersion ? this.mutators.slice(zevoVersion) : this.mutators.slice(firstInvalidMutationIndex);
      for (const mutator of mutators2) {
        this.transformsAppliedCount = this.transformsAppliedCount + 1;
        input = mutator.up(input);
      }
      return input;
    };
    /**
     * register a nested schema
     */
    this.register = (key, jsonEvolution) => {
      this.nestedPaths.push([key, jsonEvolution]);
      return this.next();
    };
    /**
     * stringify your schema for when you store it in your database
     */
    this.stringify = (rawInput, path = []) => {
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
          fullObject[schemaEvolutionCountTag] = registeredPath[1].schemaEvolutionCount;
          return fullObject;
        }
      }
      return input;
    };
    /**
     * release a version of your schema
     */
    this.releaseVersion = (version) => {
      const maxVersion = Math.max(...this.versions.keys());
      if (version < maxVersion) {
        throw new Error(`Please use a version greater than ${maxVersion}`);
      }
      this.versions = this.versions.set(version, this.schemaEvolutionCount);
      return this;
    };
    /**
     * create a safe schema from a strict schema
     */
    this.safeSchema = (schema) => {
      return z.preprocess(
        this.transform,
        schema.passthrough()
      );
    };
    if (input) {
      const { schemaEvolutionCount = 1, mutators: mutators2, paths } = input;
      this.schemaEvolutionCount = schemaEvolutionCount;
      this.mutators = mutators2;
      this.nestedPaths = input.nestedPaths;
      this.paths = paths;
      this.versions = input.versions;
    } else {
      this.mutators = [];
      this.schemaEvolutionCount = 0;
      this.nestedPaths = [];
      this.paths = [];
      this.versions = /* @__PURE__ */ new Map();
      this.transformsAppliedCount = 0;
    }
  }
  __get_private_data() {
    return {
      schemaEvolutionCount: this.schemaEvolutionCount,
      mutators: this.mutators,
      paths: this.paths,
      nestedPaths: this.nestedPaths,
      versions: this.versions,
      transformsAppliedCount: this.transformsAppliedCount
    };
  }
};
var createJsonEvolver = (_input) => {
  return new ZodMigrations();
};
var testAllVersions = ({
  evolver,
  schema,
  expect,
  startData,
  customTestCase = []
}) => {
  const metaData = evolver.__get_private_data();
  const safeSchema = evolver.safeSchema(schema);
  const checkSchema = (input) => {
    const result = safeSchema.safeParse(input).success;
    if (!result) console.log(`invalid input checkSchema`, input);
    expect(result).toBe(true);
  };
  const checkValidOutput = ([input, output]) => {
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
export {
  ZodMigrations,
  createJsonEvolver,
  mutators,
  schemaEvolutionCountTag,
  testAllVersions,
  versionTag
};
//# sourceMappingURL=index.js.map