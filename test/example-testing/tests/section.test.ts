import { describe, expect, it } from "vitest";
import {
  sectionMigrator,
  SectionV1,
  SectionV2,
  SectionV3,
  SectionV4,
} from "../section.setup";
import { ItemV1, ItemV2, ItemV3 } from "../item.setup";

const testCases = [
  {
    tag: 1,
    input: {
      id: "1",
      name: "cool section",
      type: "SECTION",
    } satisfies SectionV1,
    output: {
      id: "1",
      name: "cool section",
      sectionHeaderFontFamily: "Default Font",
      sectionHeaderFontSize: 12,
      items: [],
      type: "SECTION",
    } satisfies SectionV4,
  },
  {
    tag: 2,
    input: {
      id: "1",
      name: "cool section",
      type: "SECTION",
      items: [
        {
          id: "i1",
          name: "i1",
          type: "ITEM",
        } satisfies ItemV1,
      ],
    } satisfies SectionV2,
    output: {
      id: "1",
      name: "cool section",
      type: "SECTION",
      sectionHeaderFontFamily: "Default Font",
      sectionHeaderFontSize: 12,
      items: [
        {
          id: "i1",
          name: "i1",
          type: "ITEM",
          itemDescriptionFontFamily: "Default Font",
          itemDescriptionFontSize: 12,
        },
      ],
    } satisfies SectionV4,
  },
  {
    tag: 3,
    input: {
      id: "1",
      name: "cool section",
      type: "SECTION",
      items: [
        {
          id: "i1",
          name: "i1",
          type: "ITEM",
          paragraphFontFamily: "Arial",
          paragraphFontSize: 13,
        } satisfies ItemV2,
      ],
    } satisfies SectionV2,
    output: {
      id: "1",
      name: "cool section",
      type: "SECTION",
      sectionHeaderFontFamily: "Default Font",
      sectionHeaderFontSize: 12,
      items: [
        {
          id: "i1",
          name: "i1",
          type: "ITEM",
          itemDescriptionFontFamily: "Arial",
          itemDescriptionFontSize: 13,
        },
      ],
    } satisfies SectionV4,
  },
  {
    tag: 4,
    input: {
      id: "1",
      name: "cool section",
      type: "SECTION",
      items: [
        {
          id: "i1",
          name: "i1",
          type: "ITEM",
          itemDescriptionFontFamily: "Arial",
          itemDescriptionFontSize: 13,
        } satisfies ItemV3,
      ],
    } satisfies SectionV2,
    output: {
      id: "1",
      name: "cool section",
      type: "SECTION",
      sectionHeaderFontFamily: "Default Font",
      sectionHeaderFontSize: 12,
      items: [
        {
          id: "i1",
          name: "i1",
          type: "ITEM",
          itemDescriptionFontFamily: "Arial",
          itemDescriptionFontSize: 13,
        },
      ],
    } satisfies SectionV4,
  },
  {
    tag: "fucked",
    input: {
      id: "1",
      name: "cool section",
      type: "SECTION",
      subheaderFontFamily: "Arial",
      subheaderFontSize: 13,
      items: [
        {
          id: "i1",
          name: "i1",
          type: "ITEM",
          itemDescriptionFontFamily: "Arial",
          itemDescriptionFontSize: 13,
        } satisfies ItemV3,
      ],
    } satisfies SectionV3,
    output: {
      id: "1",
      name: "cool section",
      type: "SECTION",
      sectionHeaderFontFamily: "Arial",
      sectionHeaderFontSize: 13,
      items: [
        {
          id: "i1",
          name: "i1",
          type: "ITEM",
          itemDescriptionFontFamily: "Arial",
          itemDescriptionFontSize: 13,
        },
      ],
    } satisfies SectionV4,
  },
];

describe("run", () => {
  it("should pass all test cases", () => {
    const tag = undefined;
    const filteredTestCases = testCases.filter((testCase) => {
      if (tag) {
        return testCase.tag === tag;
      } else {
        return true;
      }
    });

    for (const { output, input } of filteredTestCases) {
      const result = sectionMigrator.transform(input);

      try {
        expect(result).toEqual(output);
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
      } catch (_e) {
        expect(true).toBe(false);
      }
    }
  });
});
