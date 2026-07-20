import assert from "node:assert/strict";
import test from "node:test";
import { validateSettings } from "./settings-validator.js";

test("Successfully validates correct settings object", () => {
  const validSettings = {
    theme: "light",
    excludedRepos: ["repo1", "repo2"],
    layout: "list",
    badgeStyle: "flat-square",
    _cache: { some: "cache" }
  };
  
  const cleaned = validateSettings(validSettings);
  
  assert.equal(cleaned.theme, "light");
  assert.deepEqual(cleaned.excludedRepos, ["repo1", "repo2"]);
  assert.equal(cleaned.layout, "list");
  assert.equal(cleaned.badgeStyle, "flat-square");
  assert.deepEqual(cleaned._cache, { some: "cache" });
});

test("Applies default settings if values are missing", () => {
  const cleaned = validateSettings({});
  
  assert.equal(cleaned.theme, "dark");
  assert.deepEqual(cleaned.excludedRepos, []);
  assert.equal(cleaned.layout, "grid");
  assert.equal(cleaned.badgeStyle, "flat");
  assert.equal(cleaned._cache, undefined);
});

test("Throws error for invalid settings data types", () => {
  assert.throws(() => validateSettings(null), /Settings must be a valid JSON object/);
  assert.throws(() => validateSettings({ theme: 123 }), /Theme setting must be a string/);
  assert.throws(() => validateSettings({ excludedRepos: "not-an-array" }), /Excluded repositories must be an array/);
  assert.throws(() => validateSettings({ excludedRepos: [123] }), /All entries in excludedRepos must be strings/);
  assert.throws(() => validateSettings({ layout: "invalid-layout" }), /Layout must be one of/);
  assert.throws(() => validateSettings({ badgeStyle: "fancy-style" }), /Badge style must be one of/);
});

test("Strips out unknown properties", () => {
  const settingsWithExtras = {
    theme: "dark",
    unsupportedKey: "hacker-input"
  };
  
  const cleaned = validateSettings(settingsWithExtras);
  assert.equal(cleaned.unsupportedKey, undefined, "Unsupported keys must be stripped out");
});
