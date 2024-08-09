1. Add a enum mapping

should look something like this

```ts
const evoSchema = new JSON_EVOLUTION()
    .add({
        name: "status,"
        schema: z.enum("active", "inactive", "poorly-named"),
        default: "inactive"
    })
    .changeEnum({
        path: "status",
        type: "remove",
        values: [
            { name: "poorly-named", defaultTo: "inactive" }
        ]
    })
    .changeEnum({
        path: "status",
        type: "add",
        values: ["in-progress"]
    })
    .changeEnum({
        path: "status,"
        type: "change",
        values: {
            "active": "todo",
            "inactive": "done",
        }
    })
```

2. Remove a field

```ts
const evoSchema = new JSON_EVOLUTION()
    .add({
        name: "status,"
        schema: z.enum("active", "inactive", "poorly-named"),
        default: "inactive"
    })
    .remove({
        path: "status"
    })
```
