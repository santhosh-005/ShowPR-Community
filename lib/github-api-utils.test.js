const assert = require("node:assert/strict");
const { readFileSync } = require("node:fs");
const { join } = require("node:path");
const test = require("node:test");
const vm = require("node:vm");

function loadGenerateMonthRanges(nowIso) {
  const source = readFileSync(join(__dirname, "github-api-utils.js"), "utf8");
  const match = source.match(
    /function generateMonthRanges\(monthCount = 6\) \{[\s\S]*?\n\}/,
  );

  assert.ok(match, "generateMonthRanges function should exist");

  const RealDate = Date;
  class FixedDate extends RealDate {
    constructor(...args) {
      if (args.length === 0) {
        super(nowIso);
        return;
      }

      super(...args);
    }

    static now() {
      return new RealDate(nowIso).getTime();
    }
  }

  const sandbox = {
    Date: FixedDate,
    module: { exports: {} },
  };

  vm.runInNewContext(`${match[0]}\nmodule.exports = generateMonthRanges;`, sandbox);
  return sandbox.module.exports;
}

function fromSandbox(value) {
  return JSON.parse(JSON.stringify(value));
}

test("generateMonthRanges returns current and previous month ranges", () => {
  const generateMonthRanges = loadGenerateMonthRanges("2026-06-15T12:00:00Z");

  assert.deepEqual(fromSandbox(generateMonthRanges(3)), [
    {
      start: "2026-06-01",
      end: "2026-06-30",
      monthName: "Jun",
      year: 2026,
      monthIndex: 6,
    },
    {
      start: "2026-05-01",
      end: "2026-05-31",
      monthName: "May",
      year: 2026,
      monthIndex: 5,
    },
    {
      start: "2026-04-01",
      end: "2026-04-30",
      monthName: "Apr",
      year: 2026,
      monthIndex: 4,
    },
  ]);
});

test("generateMonthRanges handles year rollover from January", () => {
  const generateMonthRanges = loadGenerateMonthRanges("2026-01-10T12:00:00Z");

  assert.deepEqual(fromSandbox(generateMonthRanges(3)), [
    {
      start: "2026-01-01",
      end: "2026-01-31",
      monthName: "Jan",
      year: 2026,
      monthIndex: 1,
    },
    {
      start: "2025-12-01",
      end: "2025-12-31",
      monthName: "Dec",
      year: 2025,
      monthIndex: 12,
    },
    {
      start: "2025-11-01",
      end: "2025-11-30",
      monthName: "Nov",
      year: 2025,
      monthIndex: 11,
    },
  ]);
});

test("generateMonthRanges returns an empty array for zero months", () => {
  const generateMonthRanges = loadGenerateMonthRanges("2026-06-15T12:00:00Z");

  assert.deepEqual(fromSandbox(generateMonthRanges(0)), []);
});
