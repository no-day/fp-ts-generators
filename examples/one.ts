import { sequenceT } from "fp-ts/lib/Apply";
import { pipe } from "fp-ts/lib/function";
import { record, chooseInt, generate, mkSeed, tuple } from "../src";
import * as state from "fp-ts/State";

for (let i = 0; i <= 1000; i++) {
  const seed = mkSeed(i);

  pipe(
    record({
      foo: chooseInt(5, 10),
      bar: tuple(chooseInt(5, 10), chooseInt(-100, 100)),
      baz: record({
        foo: chooseInt(5, 10),
        bar: tuple(chooseInt(5, 10), chooseInt(-100, 100)),
      }),
    }),
    generate({ seed, size: 100 }),
    _ => JSON.stringify(_, null, 2),
    _ => console.log(_)
  );
}
