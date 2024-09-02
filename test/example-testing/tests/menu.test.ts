import { describe, expect, it } from "vitest";
import { diff } from "json-diff-ts";
import { SectionV3 } from "../section.setup";
import { SectionGroupV1, SectionGroupV3 } from "../section-group.setup";
import { MenuV1, MenuV2, MenuV4, menuMigrator } from "../menu.setup";

import { ItemV2 } from "../item.setup";

const testCases = [
  {
    input: { id: "m1", name: "m1", type: "MENU" } satisfies MenuV1,
    output: {
      id: "m1",
      name: "m1",
      type: "MENU",
      sectionGroups: [],
      sectionHeaderFontFamily: "Default Font",
      sectionHeaderFontSize: 12,
    } satisfies MenuV4,
  },
  {
    input: {
      id: "m1",
      name: "m1n",
      type: "MENU",
      sectionGroups: [
        {
          id: "sg1",
          name: "sg1n",
          type: "SECTION_GROUP",
        } satisfies SectionGroupV1,
      ],
    } satisfies MenuV2,
    output: {
      id: "m1",
      name: "m1n",
      type: "MENU",
      sectionGroups: [
        {
          id: "sg1",
          name: "sg1n",
          type: "SECTION_GROUP",
          sectionHeaderFontFamily: "Default Font",
          sectionHeaderFontSize: 12,
          sections: [],
        },
      ],
      sectionHeaderFontFamily: "Default Font",
      sectionHeaderFontSize: 12,
    } satisfies MenuV4,
  },
  {
    input: {
      id: "m1",
      name: "m1n",
      type: "MENU",
      sectionGroups: [
        {
          id: "sg1",
          name: "sg1n",
          type: "SECTION_GROUP",
          subheaderFontFamily: "Arial",
          subheaderFontSize: 13,
          sections: [
            {
              id: "s1",
              name: "s1n",
              subheaderFontFamily: "Arial",
              subheaderFontSize: 13,
              type: "SECTION",
              items: [
                {
                  id: "i1",
                  name: "i1n",
                  type: "ITEM",
                  paragraphFontFamily: "Arial",
                  paragraphFontSize: 13,
                },
              ] satisfies ItemV2[],
            } satisfies SectionV3,
          ],
        },
      ] satisfies SectionGroupV3[],
    } satisfies MenuV2,
    output: {
      id: "m1",
      name: "m1n",
      type: "MENU",
      sectionHeaderFontFamily: "Default Font",
      sectionHeaderFontSize: 12,
      sectionGroups: [
        {
          id: "sg1",
          name: "sg1n",
          type: "SECTION_GROUP",
          sectionHeaderFontFamily: "Arial",
          sectionHeaderFontSize: 13,
          sections: [
            {
              id: "s1",
              name: "s1n",
              sectionHeaderFontFamily: "Arial",
              sectionHeaderFontSize: 13,
              type: "SECTION",
              items: [
                {
                  id: "i1",
                  name: "i1n",
                  type: "ITEM",

                  itemDescriptionFontFamily: "Arial",
                  itemDescriptionFontSize: 13,
                },
              ],
            },
          ],
        },
      ],
    } satisfies MenuV4,
  },
];

describe("run", () => {
  it("should pass all test cases", () => {
    const selectedTag = false;
    const filteredTestCases = testCases.filter((testCase) => {
      if (selectedTag) {
        //@ts-expect-error this is fine
        return testCase.tag === selectedTag;
      }
      return true;
    });
    for (const { output, input } of filteredTestCases) {
      const result = menuMigrator.transform(input);

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
