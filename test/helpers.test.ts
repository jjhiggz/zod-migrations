import { describe, expect, it } from "vitest";
import { getValidRenames } from "../src/mutators";

describe("getValidRenames", () => {
  it("should find one valid rename", () => {
    expect(getValidRenames([["name", "firstName"]], "name")).toEqual([
      "name",
      "firstName",
    ]);
  });

  it("should work if I rename twice", () => {
    expect(
      getValidRenames(
        [
          ["name", "firstName"],
          ["firstName", "name"],
        ],
        "name"
      )
    ).toEqual(["name", "firstName"]);
  });

  it("should work with multiple renames", () => {
    expect(
      getValidRenames(
        [
          ["name", "name2"],
          ["name2", "name3"],
        ],
        "name"
      )
    ).toEqual(["name", "name2", "name3"]);
  });
});
