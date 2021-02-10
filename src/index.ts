/**
 * @since 1.0.0
 */

import { Seed, seedMax } from "@no-day/fp-ts-lcg";
import * as lcg from "@no-day/fp-ts-lcg";
import { State } from "fp-ts/State";
import * as state from "fp-ts/State";
import { pipe } from "fp-ts/lib/function";
import { sequenceT } from "fp-ts/lib/Apply";
import * as apply from "fp-ts/lib/Apply";
export { Seed, mkSeed, seed, seedMin, seedMax } from "@no-day/fp-ts-lcg";

// -------------------------------------------------------------------------------------
// model
// -------------------------------------------------------------------------------------

/**
 * The meaning of size depends on the particular generator used.
 *
 * @category model
 * @since 1.0.0
 */
export type Size = number;

/**
 * The state of the random generator monad.
 *
 * @category model
 * @since 1.0.0
 */
export type GenState = { newSeed: Seed; size: Size };

/**
 * The random generator monad
 *
 * @category model
 * @since 1.0.0
 */
export type Gen<T> = State<GenState, T>;

// -------------------------------------------------------------------------------------
// constructors
// -------------------------------------------------------------------------------------

/**
 * A random generator which simply outputs the current seed.
 *
 * @category constructors
 * @since 1.0.0
 */
export const lcgStep: Gen<number> = s => [
  lcg.unSeed(s.newSeed),
  { newSeed: lcg.lcgNext(s.newSeed), size: s.size },
];

/**
 * Create a random generator which chooses uniformly distributed
 * integers from the closed interval `[a, b]`.
 * Note that very large intervals (above 32^2) will cause a loss of uniformity.
 *
 * @category constructors
 * @since 1.0.0
 */
export const chooseInt: (a: number, b: number) => Gen<number> = (a, b) => {
  const choose31BitPosNumber: Gen<number> = lcgStep;

  const choose32BitPosNumber: Gen<number> = pipe(
    sequenceT(state.state)(
      pipe(
        choose31BitPosNumber,
        state.map(_ => _ * 2)
      ),
      choose31BitPosNumber
    ),
    state.map(([a, b]) => a + b)
  );

  return pipe(lcgStep, state.map(clamp(a, b)));
};

const clamp: (a: number, b: number) => (c: number) => number = (a, b) => c => {
  const [min, max] = a < b ? [a, b] : [b, a];

  const diff = max - min;

  return min + (c % (diff + 1));
};

export const record = apply.sequenceS(state.state);

export const tuple = apply.sequenceT(state.state);

// -------------------------------------------------------------------------------------
// destructors
// -------------------------------------------------------------------------------------

/**
 * Run a random generator
 *
 * @category destructors
 * @since 1.0.0
 */
export const evalGen = state.evaluate;

/**
 * Run a random generator with a given seed and size.
 *
 * @category destructors
 * @since 1.0.0
 */
export const generate: (opts: {
  seed: Seed;
  size: Size;
}) => <T>(gen: Gen<T>) => T = ({ seed, size }) => gen =>
  evalGen({ newSeed: seed, size })(gen);
