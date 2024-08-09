# json-evolver

JSON Evolver is like migrations but for your zod schemas.

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

Now let's say our dickhead boss says that we need to add a `phone` field to the `Person` object. And we need to change having a name to having a first name and a last name.

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

This library allows you to define a schema for your JSON data using, and build a transformer for it using a `JsonEvolver` instance. My favorite way of thinking about a `JsonEvolver` instance is that it is like a migration file for your JSON data.

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

But now, alongside each change that we make to our schema, we need to make a corresponding change to our `JsonEvolver` instance.

In our case we...

1. Changed the `name` field to `firstName`

_note: we're doing this as a change and not a drop so we can set the new value for first name to be the old value for name_

2. Added a `lastName` field defaulting to an empty string

3. Added a `phone` field defaulting to an empty string

```ts
const personEvolver = new JsonEvolver()
  // Set Up the Initial Fields
  .add({
    path: "name",
    schema: z.string(),
    default: "",
  })
  .add({
    path: "age",
    schema: z.number(),
    default: 0,
  })
  .add({
    path: "email",
    schema: z.string(),
    default: "",
  })
  // rename the name field to firstName after our boss asks us to
  .rename({
    source: "name",
    destination: "firstName",
  })
  .add({
    path: "lastName",
    schema: z.string(),
    default: "",
  })
  .add({
    path: "phone",
    schema: z.string(),
    default: "",
  });
```

### Ok fine, but what it do though?

The purpose of building that `personEvolver` instance is so that you can use a `transform` function to transform your data from one schema to another.

Here is an example of how you might use the `personEvolver` instance to transform a `Person` object from the old schema to the new schema:

```ts
const personSchema = z.object({
  firstName: z.string(),
  lastName: z.string(),
  age: z.number(),
  email: z.string(),
  phone: z.string(),
});

const versionSafePersonSchema = z.preprocess(
  // this will take any old version of the person object and transform it to the new version
  personEvolver.transform,
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

## Performance

The way that this library works is by applying a series of transformations to the data. If you want you can just apply ALL transformations to every object, it's not optimized but will likely be fine in most cases, but if you're a performance junkie there's a trick we use to speed things up.

The `JsonEvolver` instance has a `stringify` method that tags the data with a version number. This version number is used to determine if the data needs to be transformed. If the version number is the same or higher than the cycle of the transformations, then the data does not need to be transformed.

Under the hood it works like this:

```ts
const personEvolver = new JsonEvolver()
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
await storeJSONData(personEvolver.stringify(data));
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
  personEvolver.transform,
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

To account for changes to the `itemSchema` we can use the `register` method to transform the `itemSchema` according to it's own `JsonEvolver` that way these schemas can evolve independently kind of like tables in a database.

```ts
const itemEvolver = new JsonEvolver()
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

const menuEvolver = new JsonEvolver()
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
    path: "items",
    schema: z.array(itemSchema),
    defaultVal: [],
  })
  .register("items", itemEvolver);
```

## Future Goals

1. Add a enum mapping

should look something like this

```ts
const evoSchema = new JSON_EVOLUTION()
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

2. Remove a field

```ts
const evoSchema = new JSON_EVOLUTION()
  .add({
    name: "status",
    schema: z.enum("active", "inactive", "poorly-named"),
    default: "inactive",
  })
  .remove({
    path: "status",
  });
```

3. Add splitting transformation

```ts
const splitter = (firstName) => {
  const [firstName, lastName] = firstName.split(" ");
  return {
    firstName: firstName ?? "",
    lastName: lastName ?? "",
  };
};

const evoSchema = new JSON_EVOLUTION()
  .add({
    name: "name",
    schema: z.string(),
    default: "",
  })
  .split({
    path: "name",
    newFieldsSchema: z.object({
      firstName: z.string(),
      lastName: z.string(),
    }),
    splitBy: splitter,
  });
```
