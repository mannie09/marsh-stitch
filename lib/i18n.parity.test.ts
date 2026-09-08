import { describe, expect, it } from "vitest";
import {
  COLOR_TOKEN_TEXT, FAB_MENU_TABS, KIND_TEXT, LANGS, NAV_TABS, SEED_TEXT, TEXT_TOKEN_TEXT,
  SWIPE_TEXT, TAB_LABELS, TRANSITION_TEXT, UI, t, type UIKey,
} from "./i18n";
import { KIND_ORDER, LANG_FONT, SWIPE_DIRS, TRANSITIONS } from "./tokens";

const ui: Record<UIKey, Record<string, string>> = UI;
const keys = Object.keys(ui) as UIKey[];
const languages = LANGS.map(({ key }) => key);
const sortedKeys = (value: object) => Object.keys(value).sort();

function nonemptyStrings(value: unknown, path: string): void {
  if (value !== null && typeof value === "object") {
    expect(Object.keys(value).length, path).toBeGreaterThan(0);
    for (const [key, child] of Object.entries(value)) nonemptyStrings(child, `${path}.${key}`);
  } else {
    expect(typeof value, path).toBe("string");
    expect((value as string).trim(), path).not.toBe("");
  }
}

describe("UI dictionary completeness", () => {
  it.each(LANGS)("makes the legacy-to-expressive width change explicit in $key", ({ key: lang }) => {
    expect(t("railLegacy", lang)).toContain("80dp");
    expect(t("railUpgrade", lang)).toContain("96dp");
    expect(t("railUpgrade", lang)).toContain("Expressive");
    expect(t("railLegacy", lang)).not.toBe(t("railCollapsed", lang));
  });

  it("offers English as the supported language with a nonblank display label", () => {
    expect([...languages].sort()).toEqual(["en"]);
    for (const { key, label } of LANGS) nonemptyStrings(label, `LANGS.${key}`);
  });

  it("gives every main UI key an English string", () => {
    for (const key of keys) expect(sortedKeys(ui[key]), key).toEqual(["en"]);
  });

  it.each(LANGS)("returns a nonblank translation for every UI key in $key", ({ key: lang }) => {
    for (const key of keys) {
      const stored = ui[key][lang];
      nonemptyStrings(stored, `UI.${key}.${lang}`);
      expect(t(key, lang), `${key}.${lang}`).toBe(stored);
    }
  });
});

const dictionaries = { KIND_TEXT, SEED_TEXT, TAB_LABELS, FAB_MENU_TABS, NAV_TABS, TRANSITION_TEXT, SWIPE_TEXT };
for (const [name, table] of Object.entries(dictionaries)) {
  describe(`${name} parity`, () => {
    it("covers English", () => {
      expect(sortedKeys(table)).toEqual(["en"]);
    });

    it.each(LANGS)("has nonblank strings in $key", ({ key: lang }) => {
      nonemptyStrings(table[lang], `${name}.${lang}`);
    });
  });
}

describe("dictionary coverage of editor tokens", () => {
  it.each(LANGS)("covers every kind, transition and swipe in $key", ({ key: lang }) => {
    expect(sortedKeys(KIND_TEXT[lang])).toEqual([...KIND_ORDER].sort());
    expect(sortedKeys(TRANSITION_TEXT[lang])).toEqual(TRANSITIONS.map(({ key }) => key).sort());
    expect(sortedKeys(SWIPE_TEXT[lang])).toEqual(SWIPE_DIRS.map(({ key }) => key).sort());
  });

  it("has nonblank localized color-token keys", () => {
    for (const [lang, labels] of Object.entries(COLOR_TOKEN_TEXT)) {
      nonemptyStrings(labels, `COLOR_TOKEN_TEXT.${lang}`);
    }
    for (const [lang, labels] of Object.entries(TEXT_TOKEN_TEXT)) {
      nonemptyStrings(labels, `TEXT_TOKEN_TEXT.${lang}`);
    }
  });

  it("has valid icons for navigation and FAB tabs", () => {
    for (const table of [NAV_TABS, FAB_MENU_TABS]) {
      for (const tab of table.en) {
        expect(typeof tab.icon).toBe("string");
      }
    }
  });
});

describe("LANG_FONT coverage", () => {
  it("has exactly one entry for English", () => {
    expect(sortedKeys(LANG_FONT)).toEqual(["en"]);
  });

  it("deliberately requires no extra font for English", () => {
    expect(LANG_FONT.en).toBeNull();
  });
});
