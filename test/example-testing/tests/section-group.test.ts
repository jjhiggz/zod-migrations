import { describe, expect, it } from "vitest";
import { SectionV2, SectionV3, SectionV4 } from "../section.setup";
import { diff } from "json-diff-ts";
import {
  SectionGroupV1,
  SectionGroupV2,
  SectionGroupV3,
  SectionGroupV4,
  sectionGroupMigrator,
} from "../section-group.setup";

import { ItemV1, ItemV2, ItemV3 } from "../item.setup";

const testCases = [
  {
    input: {
      id: "1",
      name: "sg-1",
      type: "SECTION_GROUP",
    } satisfies SectionGroupV1,
    output: {
      id: "1",
      name: "sg-1",
      type: "SECTION_GROUP",
      sectionHeaderFontFamily: "Default Font",
      sectionHeaderFontSize: 12,
      sections: [],
    } satisfies SectionGroupV4,
  },
  {
    input: {
      id: "1",
      name: "sg-1",
      sections: [
        {
          id: "1",
          name: "s-1",
          items: [
            { id: "1", name: "i-1", type: "ITEM" },
            { id: "1", name: "i-1", type: "ITEM" },
          ] satisfies ItemV1[],
          type: "SECTION",
        },
        {
          id: "1",
          name: "s-1",
          items: [] satisfies ItemV1[],
          type: "SECTION",
        },
      ] satisfies SectionV2[],
      type: "SECTION_GROUP",
    } satisfies SectionGroupV2,
    output: {
      id: "1",
      name: "sg-1",
      type: "SECTION_GROUP",
      sectionHeaderFontFamily: "Default Font",
      sectionHeaderFontSize: 12,
      sections: [
        {
          id: "1",
          name: "s-1",
          sectionHeaderFontFamily: "Default Font",
          sectionHeaderFontSize: 12,
          items: [
            {
              id: "1",
              name: "i-1",
              type: "ITEM",
              itemDescriptionFontFamily: "Default Font",
              itemDescriptionFontSize: 12,
            },
            {
              id: "1",
              name: "i-1",
              type: "ITEM",
              itemDescriptionFontFamily: "Default Font",
              itemDescriptionFontSize: 12,
            },
          ] satisfies ItemV3[],
          type: "SECTION",
        },
        {
          id: "1",
          name: "s-1",
          sectionHeaderFontFamily: "Default Font",
          sectionHeaderFontSize: 12,
          items: [] satisfies ItemV3[],
          type: "SECTION",
        },
      ] satisfies SectionV4[],
    } satisfies SectionGroupV4,
  },
  {
    input: {
      id: "1",
      name: "sg-1",
      sections: [
        {
          id: "1",
          name: "s-1",
          items: [
            {
              id: "1",
              name: "i-1",
              type: "ITEM",
              paragraphFontFamily: "Arial",
              paragraphFontSize: 13,
            },
            {
              id: "1",
              name: "i-1",
              type: "ITEM",
              paragraphFontFamily: "Arial",
              paragraphFontSize: 14,
            },
          ] satisfies ItemV2[],
          type: "SECTION",
        },
        {
          id: "1",
          name: "s-1",
          items: [] satisfies ItemV2[],
          type: "SECTION",
        },
      ] satisfies SectionV2[],
      type: "SECTION_GROUP",
    } satisfies SectionGroupV2,
    output: {
      id: "1",
      name: "sg-1",
      type: "SECTION_GROUP",
      sectionHeaderFontFamily: "Default Font",
      sectionHeaderFontSize: 12,
      sections: [
        {
          id: "1",
          name: "s-1",
          sectionHeaderFontFamily: "Default Font",
          sectionHeaderFontSize: 12,
          items: [
            {
              id: "1",
              name: "i-1",
              type: "ITEM",
              itemDescriptionFontFamily: "Arial",
              itemDescriptionFontSize: 13,
            },
            {
              id: "1",
              name: "i-1",
              type: "ITEM",
              itemDescriptionFontFamily: "Arial",
              itemDescriptionFontSize: 14,
            },
          ] satisfies ItemV3[],
          type: "SECTION",
        },
        {
          id: "1",
          name: "s-1",
          sectionHeaderFontFamily: "Default Font",
          sectionHeaderFontSize: 12,
          items: [] satisfies ItemV3[],
          type: "SECTION",
        },
      ] satisfies SectionV4[],
    } satisfies SectionGroupV4,
  },
  {
    tag: "fuck",
    input: {
      id: "1",
      name: "sg-1",
      subheaderFontFamily: "Arial",
      subheaderFontSize: 13,
      sections: [
        {
          id: "1",
          name: "s-1",
          type: "SECTION",
          subheaderFontFamily: "Arial",
          subheaderFontSize: 13,
          items: [
            {
              id: "1",
              name: "i-1",
              type: "ITEM",
              paragraphFontFamily: "Arial",
              paragraphFontSize: 13,
            },
            {
              id: "1",
              name: "i-1",
              type: "ITEM",
              paragraphFontFamily: "Arial",
              paragraphFontSize: 14,
            },
          ] satisfies ItemV2[],
        },
        {
          id: "1",
          name: "s-1",
          subheaderFontFamily: "Times",
          subheaderFontSize: 14,
          items: [] satisfies ItemV2[],
          type: "SECTION",
        },
      ] satisfies SectionV3[],
      type: "SECTION_GROUP",
    } satisfies SectionGroupV3,
    output: {
      id: "1",
      name: "sg-1",
      type: "SECTION_GROUP",
      sectionHeaderFontFamily: "Arial",
      sectionHeaderFontSize: 13,
      sections: [
        {
          id: "1",
          name: "s-1",
          sectionHeaderFontFamily: "Arial",
          sectionHeaderFontSize: 13,
          items: [
            {
              id: "1",
              name: "i-1",
              type: "ITEM",
              itemDescriptionFontFamily: "Arial",
              itemDescriptionFontSize: 13,
            },
            {
              id: "1",
              name: "i-1",
              type: "ITEM",
              itemDescriptionFontFamily: "Arial",
              itemDescriptionFontSize: 14,
            },
          ] satisfies ItemV3[],
          type: "SECTION",
        },
        {
          id: "1",
          name: "s-1",
          sectionHeaderFontFamily: "Times",
          sectionHeaderFontSize: 14,
          items: [] satisfies ItemV3[],
          type: "SECTION",
        },
      ] satisfies SectionV4[],
    } satisfies SectionGroupV4,
  },
];

describe("run", () => {
  it("should pass all test cases", () => {
    const selectedTag = "fuck";
    const filteredTestCases = testCases.filter((testCase) => {
      if (selectedTag) {
        return testCase.tag === selectedTag;
      }
      return true;
    });
    for (const { output, input } of filteredTestCases) {
      const result = sectionGroupMigrator.transform(input);

      try {
        expect(result).toEqual(output);
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
      } catch (_e) {
        console.log("result", result);
        console.log("expected", output);
        console.log(JSON.stringify(diff(result, output), null, 2));
        expect(true).toBe(false);
      }
    }
  });
});
