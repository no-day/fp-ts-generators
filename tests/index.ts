import { pipe } from "fp-ts/lib/function";
import * as $ from "../src";
import * as fc from "fast-check";

describe("lcgStep", () => {
  it("returns the given seed", () => {
    fc.property(fc.integer({ min: $.seedMin, max: $.seedMax }), n => {
      pipe($.lcgStep, $.generate({ seed: $.mkSeed(n), size: 3 }), _ =>
        expect(_).toBe(n)
      );
    });
  });
});
