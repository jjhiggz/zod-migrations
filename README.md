# Zod Migrations

Zod Migratins is like database migrations but for your zod schemas.

The idea for this library came from [This Article](https://www.inkandswitch.com/cambria/). If you're interested in the differences between this and Cambria, I've written a little bit about that [here](#differences-between-this-and-cambria).

## The Problem This Solves

The problem with unstructured data is that our business logic is often tied to the structure of the data, even if that structure is not enforced by the database. This means that when the structure of the data changes, we need to update our business logic to match. This can be a pain, especially if the data is being used in multiple places in our codebase.

For example, let's say that we are storing a person object in our database as a JSON blob (probably not a great idea btw, unless you have a good reason... at Remenu.io we did).

```json
{
  "name": "John Doe",
  "age": 30,
  "email": ""
}
```

At the time we wrote this code, the type for a `Person` object might look something like this:

```ts
type Person = {
  name: string;
  age: number;
  email: string;
};
```

And a function that uses this object might look like this:

```tsx
function PersonCard({ person }: { person: Person }) {
  return (
    <div>
      <h1>{person.name}</h1>
      <p>{person.age}</p>
      <p>{person.email}</p>
    </div>
  );
}
```

Now let's say our boss says that we need to add a `phone` field to the `Person` object. And we need to change having a name to having a first name and a last name.

Now our `Person` object looks like this:

```ts
type Person = {
  firstName: string;
  lastName: string;
  age: number;
  email: string;
  phone: string;
};
```

So in change we update our `PersonCard` function to look like this:

```tsx
function PersonCard({ person }: { person: Person }) {
  return (
    <div>
      <h1>
        {person.firstName} {person.lastName}
      </h1>
      <p>{person.age}</p>
      <p>{person.email}</p>
      <p>{person.phone}</p>
    </div>
  );
}
```

but UH OH, we forgot to update the database! Now we have a bunch of `Person` objects in the database that are missing the `phone` field and have a `name` field instead of `firstName` and `lastName`.

There are other solutions to this problem, that you can look at [here](#other-solutions), but this library is a solution that I think is pretty cool.

## How This Library Solves This Problem

This library allows you to define a schema for your JSON data using, and build a transformer for it using a `ZodMigrator` instance. My favorite way of thinking about a `ZodMigrator` instance is that it is like a migration file for your JSON data.

Here is an example of how you might use this library to solve the problem above:

### Step 1: Define Your Schema

Your zod schema should ALWAYS look like the current state of your data. This is because the schema is used to validate the data, and if the schema doesn't match the data, then the data is invalid.

At first our zod schema might look like this:

```ts
const personSchema = z.object({
  name: z.string(),
  age: z.number(),
  email: z.string(),
});
```

But after the changes, it should look like this:

```ts
const personSchema = z.object({
  firstName: z.string(),
  lastName: z.string(),
  age: z.number(),
  email: z.string(),
  phone: z.string(),
});
```

Let's change our diction a little bit here and separate person schema into 2 schemas. One for the initial person object, and one for the CURRENT person object.

```ts
const initialPersonSchema = z.object({
  name: z.string(),
  age: z.number(),
  email: z.string(),
});

const currentPersonSchema = z.object({
  firstName: z.string(),
  lastName: z.string(),
  age: z.number(),
  email: z.string(),
  phone: z.string(),
});
```

now we need to build a `ZodMigrator` instance that transforms the `initialPersonSchema` to the `currentPersonSchema`

```ts
const personMigrator = createZodMigrator({
  startingSchema: initialPersonSchema,
  endingSchema: currentPersonSchema,
});
```

This is not yet a valid `ZodMigrator` instance, because we haven't told the migrator how to evolve an old shape yet. You can assert this in your typesystem by doing something like this:

```ts
import { ZodMigratorCurrentShape } from "zod-migrations";
import { Equals } from "ts-toolbelt"; // or use your type equality checker

type CurrentEvolution = ZodMigratorCurrentShape<typeof personMigrator>;
type CurrentSchema = ZodMigrationSchema<typeof personMigrator>;

function assertValidMigrator(): 1 {
  // Should be red if you don't tell your migrator how to evolve an old shape
  return 1 as Equals<CurrentEvolution, CurrentSchema>;
}
```

Or we've also provided a utility that accomplishes this for you

```ts
import { IsZodMigratorValid } from "zod-migrations";

function assertValidMigrator(): true {
  return true as IsZodMigratorValid<typeof personMigrator>;
}
```

In our case we...

_note: we're doing this as a change and not a drop so we can set the new value for first name to be the old value for name_

1. renamed the `name` field to `firstName`

2. Added a `lastName` field defaulting to an empty string

3. Added a `phone` field defaulting to an empty string

To Evolve our schema we can simply do this:

```ts
const personMigrator = createZodMigrator({
  startingSchema: initialPersonSchema,
  endingSchema: currentPersonSchema,
})
  .rename({
    source: "name",
    destination: "firstName",
  })
  .addMany({
    defaultValues: {
      lastName: "",
      phone: "",
    },
    schema: z.object({
      lastName: z.string(),
      phone: z.string(),
    }),
  });
```

_note: now you should see your validation function have no static errors_

### Transforming Data

We can now use the `personMigrator` instance to transform our data from any valid old shape to the new shape.

```ts
personMigrator.transform({
  name: "Jon",
  age: 30,
  email: "jon@jon.com",
}); // { firstName: "Jon", lastName: "", age: 30, email: "jon@jon.com", phone: "" }
```

### Making a Version Safe Schema

Manually we can create a version safe schema simply by doing this:

```ts
const versionSafePersonSchema = z.preprocess(
  // this will take any old version of the person object and transform it to the new version
  personMigrator.transform,
  personSchema
);
```

Now if we parse with our `versionSafePersonSchema` we can be sure that the data will be in the correct format before parsing. All older versions of the data will be transformed to the new version before being parsed.

```ts
versionSafePersonSchema.parse({
  name: "Jon",
  age: 30,
  email: "jon@doe.com",
}); // { firstName: "Jon", lastName: "", age: 30, email: "jon@doe.com", phone: "" }

versionSafePersonSchema.parse({
  firstName: "Jon",
  lastName: "Jon",
  age: 30,
  email: "jon@doe.com",
  phone: "555-555-5555",
}); // { firstName: "Jon", lastName: Doe"", age: 30, email: "jon@doe.com", phone: "555-555-5555" }
```

For convenience, we can also use the built in `safeSchema` method to do this for us. This method should also return never if the migrator is not valid, meaning that you'll get typesafety here as well. Note: it can be a bit harder to debug the error this way, which is why for now I reccomend using the `IsZodMigratorValid`, `CurrentZodMigratorShape` and `z.infer` utilities.

```ts
const versionSafePersonSchema = personMigrator.safeSchema();
```

## Performance Raw

This library works by applying a series of transformation objects that we call `Mutators`, each mutator has some properties that define how it transforms the data. But the long story short is that when you dump an input in to be transformed, we take EACH mutator and figure out:

1. Does this mutator need to be applied to this data? (isValid method)
2. Does this mutator specify any renames that might affect other mutators? (rewriteRenames method)
3. How does this mutator affect the paths of the data? (rewritePaths method)
4. How does this mutator migrate FORWARD? (up method)
5. Is there any code we need to evaluate before we register the mutator? (beforeMutate method)

When we register the mutators we apply like so:

```ts
function registerMutator(mutator: Mutator) {
  mutator.beforeMutate({
    paths: this.paths,
  });

  this.paths = mutator.rewritePaths(this.paths);
  this.renames = mutator.rewriteRenames({ renames: this.renames });

  this.mutators.push(mutator);
}
```

Then when we transform the data we do something like this:

```ts
transform(input){
  const mutators = this.mutators.filter(getAllInvalidMutators);

  for (let mutator of mutators) {
    input = mutator.up(input);
  }
}
```

This is a very simple way to do things, and it's not quite optimized for performance. But it's likely that it will be fine for many use cases. If you're a performance junkie, but as you're about to see, if you care about performance, we can gain alot of performance gains by using the stringify method (not stable yet).

## Performance With Stringify

The way that this library works is by applying a series of transformations to the data. If you want you can just apply ALL transformations to every object, it's not optimized but will likely be fine in most cases, but if you're a performance junkie there's a trick we use to speed things up.

The `ZodMigrator` instance has a `stringify` method that tags the data with a version number. This version number is used to determine if the data needs to be transformed. If the version number is the same or higher than the cycle of the transformations, then the data does not need to be transformed.

Under the hood it works like this:

```ts
const personMigrator = new ZodMigrator()
  // Set Up the Initial Fields
  .add({
    path: "name",
    schema: z.string(),
    default: "",
  }) // version 1
  .add({
    path: "age",
    schema: z.number(),
    default: 0,
  }) // version 2
  .add({
    path: "email",
    schema: z.string(),
    default: "",
  }) // version 3
  .rename({
    source: "name",
    destination: "firstName",
  }) // version 4
  .add({
    path: "lastName",
    schema: z.string(),
    default: "",
  }) // version 5
  .add({
    path: "phone",
    schema: z.string(),
    default: "",
  }); // version 6
```

When we store our data we can tag it with the version number that we are on. This way we can avoid transforming the data if it is already in the correct format:

```ts
await storeJSONData(personMigrator.stringify(data));
```

which will store data something like this

```json
{
    "name": "Jon",
    "age": 30,
    "email": "jon@jon.com"
    "_zevo_version": 3
}
```

Then when we retrieve data, we just need to make sure we don't strip out that `_zevo_version` field with zod, so we have to modify our schema to look like this:

```ts
const versionSafePersonSchema = z.preprocess(
  personMigrator.transform,
  personSchema.passthrough() // let's other keys in
);
```

and now, we have a more performant transformer!

## Nested Schemas

In many of our workflows, we already have nested zod schemas that are decoupled from each other. It doesn't always make sense to have a single schema that represents the entire object. In these cases, you can use the `register` method to transform nested objects.

This library was built with [Remenu.io](https://remenu.io) in mind, and we use it to transform our JSON data before parsing it with zod. We have found it to be a very useful tool for managing changes to our JSON data.

Our data structure looks a little bit like this:

```ts
const itemSchema = z.object({
  id: z.string(),
  name: z.string(),
  price: z.number(),
});
const menuSchema = z.object({
  id: z.string(),
  name: z.string(),
  items: z.array(itemSchema),
});
```

To account for changes to the `itemSchema` we can use the `register` method to transform the `itemSchema` according to it's own `ZodMigrator` that way these schemas can evolve independently kind of like tables in a database.

```ts
const itemEvolver = new ZodMigrator()
  .add({
    path: "id",
    schema: z.string(),
    defaultVal: "",
  })
  .add({
    path: "name",
    schema: z.string(),
    defaultVal: "",
  })
  .add({
    path: "price",
    schema: z.number(),
    defaultVal: 0,
  });

const menuEvolver = new ZodMigrator()
  .add({
    path: "id",
    schema: z.string(),
    defaultVal: "",
  })
  .add({
    path: "name",
    schema: z.string(),
    defaultVal: "",
  })
  .addNestedArray({
    path: "items",
    schema: z.array(itemSchema),
  });
```

## Future Goals

1. Add a enum mapping

should look something like this

```ts
const evoSchema = createZodMigrations({
  startingSchema,
  endingSchema,
})
  .add({
    name: "status",
    schema: z.enum("active", "inactive", "poorly-named"),
    default: "inactive",
  })
  .changeEnum({
    path: "status",
    type: "remove",
    values: [{ name: "poorly-named", defaultTo: "inactive" }],
  })
  .changeEnum({
    path: "status",
    type: "add",
    values: ["in-progress"],
  })
  .changeEnum({
    path: "status",
    type: "change",
    values: {
      active: "todo",
      inactive: "done",
    },
  });
```

2. Backwards Transformations

Right now transforms only go forward, but in theory there's a use case to have backwards transforms as well. In other words, if this is to be used in distributed systems, it's possible that you might want to transform data back to a previous version from a newer version as well.

It may be nice for some folks to have something like this available:

```ts
const evoSchema = createZodMigrations({...})
  .add({
    name: "name",
    schema: z.string(),
    default: "",
  })
  .add({
    name: "age",
    schema: z.number(),
    default: 0,
  })
  .remove("age")
  .upTo(2);
```

This would represent the Zod Migrator before age got removed. Then your transformer would take a version 3 object and transform it back to a version 2 object.

```json
{
  "name": "Jon"
}
// Turns into
{
  "name": "Jon",
  "age": 0
}
```

This could be super useful in distributed applications where you might want to transform data back to a previous version.

3.  Inline with down migrations, for distributed systems, it might be nice to have a way to publish a string that can build a ZodMigrator. This way you can serve a migrator pattern on an endpoint to keep your servers / clients in sync with each other.

Perhaps a format that looks something like this:

```yaml
restaurant
    - add:
        path: name
        defaultValue: ""
        zodType: string
    - addNestedArray:
        schema: item
        path: items
item
    - add:
        path: name
        defaultValue: ""
        zodType: string

```

## Differences Between This and Cambria

Cambria is a library for defining transformations, this is a library for defining transformations. The difference is with Zod Migrator you define your transformations using zod schemas, which is a library for defining schemas. This means that you can use the same schema to validate your data and transform it.

This means:

1. You can use the same schema to validate your data and transform it
2. Everything is done as code, so you don't have to set up a build step

### How Cambria Tracks Changes

Cambria tracks changes by using a graph data structure to represent the shape of the data. This is a very powerful way to track changes, but it is also very complex.

The Pros:

- Cambria doesn't need to use tags to know which transformations to skip
- Cambria can track changes to nested objects very smoothly
- Allows you to do more powerful changes

For example you can do things like this very smoothly in Cambria

go from this

```json
{
  "name": "jon",
  "stuff": {
    "age": 1,
    "graduationYear": 2011
  }
}
```

to this with one migration

```json
{
  "name": "jon",
  "age": 1,
  "graduationYear": 2011
}
```

The Cons:

- Cambria doesn't output a static type
- Barely anybody uses Cambria (as of writing this, same as my library btw)

## How Zod Migrator Tracks Changes

Zod Migrator uses a much simpler approach to track changes, which is to apply a series of transformations to the data, then run those transformations back and forth to get the final result. But in order to know which changes to skip, it tags the data with a version number.

The Pros:

- Zod Migrator outputs a static type
- Zod Migrator may be simpler to understand
- The thought process is similar to up/down migrations
- Allows you to think of nested schemas as objects that evolve independently

_note: this may not always be a good thing, but in my case, since I'm using this to sync JSON with SQL tables, I think it's a good thing_

The Cons:

- Although it can track changes to nested objects, my guess is that it's not nearly as smooth
- Some Schema changes may still result in breaking changes (For example, I haven't tested aggressivly with changing nested schemas)
