/** @since 1.0.0 */

import { Seed, seedMax, seedMin } from '@no-day/fp-ts-lcg';
import * as lcg from '@no-day/fp-ts-lcg';
import { State } from 'fp-ts/State';
import * as state from 'fp-ts/State';
import { pipe } from 'fp-ts/function';
import { sequenceT } from 'fp-ts/Apply';
import * as apply from 'fp-ts/Apply';
import * as array from 'fp-ts/Array';
import * as option from 'fp-ts/Option';
import { NonEmptyArray } from 'fp-ts/lib/NonEmptyArray';

// -------------------------------------------------------------------------------------
// Re-export
// -------------------------------------------------------------------------------------

export {
  /**
   * Creates a seed to that's needed for the random generator
   *
   * @since 1.0.0
   * @category Util
   */
  mkSeed,
  /**
   * Minimum possible seed value
   *
   * @since 1.0.0
   * @category Util
   */
  seedMin,
  /**
   * Maximum possible seed value
   *
   * @since 1.0.0
   * @category Util
   */
  seedMax,
} from '@no-day/fp-ts-lcg';

// -------------------------------------------------------------------------------------
// Model
// -------------------------------------------------------------------------------------

/**
 * The meaning of size depends on the particular generator used.
 *
 * @since 1.0.0
 * @category Model
 */
export type Size = number;

/**
 * The state of the random generator monad.
 *
 * @since 1.0.0
 * @category Model
 */
export type GenState = { newSeed: Seed; size: Size };

/**
 * The random generator monad
 *
 * @since 1.0.0
 * @category Model
 */
export type Gen<T> = State<GenState, T>;

// -------------------------------------------------------------------------------------
// Internal
// -------------------------------------------------------------------------------------

const clamp: (a: number, b: number) => (c: number) => number = (a, b) => (c) => {
  const [min, max] = a < b ? [a, b] : [b, a];

  const diff = max - min;

  return min + (c % (diff + 1));
};

/**
 * Create a random generator which chooses uniformly distributed integers from the closed interval `[a, b]`. Note that
 * very large intervals (above 2^32) will cause a loss of uniformity.
 *
 * @since 1.0.0
 * @category Constructors
 */
const chooseInt: (a: number, b: number) => Gen<number> = (a, b) => {
  const choose31BitPosNumber: Gen<number> = lcgStep;

  const choose32BitPosNumber: Gen<number> = pipe(
    sequenceT(state.state)(
      pipe(
        choose31BitPosNumber,
        state.map((_) => _ * 2)
      ),
      choose31BitPosNumber
    ),
    state.map(([a, b]) => a + b)
  );

  return pipe(lcgStep, state.map(clamp(a, b)));
};

const saveIntervalInt = 2 ** 32;

const maxSaveInt = saveIntervalInt / 2;

const minSaveInt = -maxSaveInt;

const seedDiff = seedMax - seedMin;

/** A random generator which approximates a uniform random variable on `[0, 1]` */
const uniform = <T>(): Gen<number> =>
  pipe(
    lcgStep,
    state.map((n) => n - seedMin / seedDiff)
  );

// -------------------------------------------------------------------------------------
// Constructors
// -------------------------------------------------------------------------------------

/**
 * A random generator which simply outputs the current seed.
 *
 * @since 1.0.0
 * @category Constructors
 * @example
 *   import * as gen from '@no-day/fp-ts-generators';
 *   import { pipe } from 'fp-ts/function';
 *
 *   assert.deepStrictEqual(
 *     pipe(
 *       gen.lcgStep,
 *
 *       gen.generateSample({ count: 4, seed: gen.mkSeed(42) })
 *     ),
 *     [43, 2075653, 1409598201, 1842888923]
 *   );
 */

export const lcgStep: Gen<number> = (s) => [lcg.unSeed(s.newSeed), { newSeed: lcg.lcgNext(s.newSeed), size: s.size }];

/**
 * Generates a pseudo random integer in a given interval
 *
 * @since 1.0.0
 * @category Constructors
 * @example
 *   import * as gen from '@no-day/fp-ts-generators';
 *   import { pipe } from 'fp-ts/function';
 *
 *   assert.deepStrictEqual(
 *     pipe(
 *       gen.int({ min: -10, max: 10 }),
 *
 *       gen.generateSample({ count: 4, seed: gen.mkSeed(42) })
 *     ),
 *     [-9, 3, 8, -2]
 *   );
 */
export const int = ({
  min = -100,
  max = 100,
}: {
  min?: number;
  max?: number;
} = {}): Gen<number> => chooseInt(min, max);

/**
 * Generates a pseudo random record if generators are provided for each field
 *
 * @since 1.0.0
 * @category Constructors
 * @example
 *   import * as gen from '@no-day/fp-ts-generators';
 *   import { pipe } from 'fp-ts/function';
 *
 *   assert.deepStrictEqual(
 *     pipe(
 *       gen.recordOf({ foo: gen.int(), bar: gen.int(), baz: gen.int() }),
 *
 *       gen.generateSample({ count: 4, seed: gen.mkSeed(42) })
 *     ),
 *     [
 *       {
 *         bar: 27,
 *         baz: -25,
 *         foo: -57,
 *       },
 *       {
 *         bar: -14,
 *         baz: 73,
 *         foo: 22,
 *       },
 *       {
 *         bar: -84,
 *         baz: -13,
 *         foo: -64,
 *       },
 *       {
 *         bar: 36,
 *         baz: -6,
 *         foo: 50,
 *       },
 *     ]
 *   );
 */
export const recordOf = apply.sequenceS(state.state);

/**
 * Generates a pseudo random tuple if generators are provided for each position
 *
 * @since 1.0.0
 * @category Constructors
 * @example
 *   import * as gen from '@no-day/fp-ts-generators';
 *   import { pipe } from 'fp-ts/function';
 *
 *   assert.deepStrictEqual(
 *     pipe(
 *       gen.tupleOf(gen.int(), gen.int()),
 *
 *       gen.generateSample({ count: 4, seed: gen.mkSeed(42) })
 *     ),
 *     [
 *       [-57, 27],
 *       [-25, 22],
 *       [-14, 73],
 *       [-64, -84],
 *     ]
 *   );
 */
export const tupleOf = apply.sequenceT(state.state);

/**
 * Generates a pseudo random array of a fixed size
 *
 * @since 1.0.0
 * @category Constructors
 * @example
 *   import * as gen from '@no-day/fp-ts-generators';
 *   import { pipe } from 'fp-ts/function';
 *
 *   assert.deepStrictEqual(
 *     pipe(
 *       gen.vectorOf(6)(gen.int()),
 *
 *       gen.generateSample({ count: 4, seed: gen.mkSeed(42) })
 *     ),
 *     [
 *       [-57, 27, -25, 22, -14, 73],
 *       [-64, -84, -13, 50, 36, -6],
 *       [16, -62, 76, -8, -44, 96],
 *       [88, 48, 0, -37, -53, 23],
 *     ]
 *   );
 */
export const vectorOf = (size: number) => <T>(gen: Gen<T>): Gen<Array<T>> =>
  pipe(
    array.replicate(size, gen),
    array.reduce<Gen<T>, Gen<T[]>>(state.of([] as T[]), (accum, gen) =>
      pipe(
        accum,
        state.chain((accum_) =>
          pipe(
            gen,
            state.map((gen_) => array.snoc(accum_, gen_))
          )
        )
      )
    )
  );

/**
 * Create a random generator which selects and executes a random generator from a non-empty array of random generators
 * with uniform probability.
 *
 * @since 1.0.0
 * @category Constructors
 * @example
 *   import * as gen from '@no-day/fp-ts-generators';
 *   import { pipe } from 'fp-ts/function';
 *
 *   assert.deepStrictEqual(
 *     pipe(
 *       gen.oneOf([gen.int({ min: 10, max: 20 }), gen.int({ min: 50, max: 60 })]),
 *
 *       gen.generateSample({ count: 6, seed: gen.mkSeed(42) })
 *     ),
 *     [58, 57, 55, 60, 12, 10]
 *   );
 */
export const oneOf = <T>(gens: NonEmptyArray<Gen<T>>): Gen<T> =>
  pipe(
    chooseInt(
      0,
      pipe(
        gens,
        (xs) => xs.length,
        (n) => n - 1
      )
    ),
    state.chain((n) =>
      pipe(
        array.lookup(n)(gens),
        option.getOrElse((): any => {
          throw new Error('Internal inconsistency.');
        })
      )
    )
  );

// -------------------------------------------------------------------------------------
// Destructors
// -------------------------------------------------------------------------------------

/**
 * Run a random generator
 *
 * @since 1.0.0
 * @category Destructors
 */
export const evalGen = state.evaluate;

/**
 * Run a random generator with a given seed and size.
 *
 * @since 1.0.0
 * @category Destructors
 */
export const generate: (opts: { seed: Seed; size?: Size }) => <T>(gen: Gen<T>) => T = ({ seed, size = 10 }) => (gen) =>
  evalGen({ newSeed: seed, size })(gen);

/**
 * Run a random generator with a given seed and size. Produces an array of results, configured by count.
 *
 * @since 1.0.0
 * @category Destructors
 */
export const generateSample: (opts: { seed: Seed; size?: Size; count?: number }) => <T>(gen: Gen<T>) => T[] = ({
  seed,
  size = 10,
  count = 10,
}) => (gen) => pipe(gen, vectorOf(count), generate({ seed, size }));
