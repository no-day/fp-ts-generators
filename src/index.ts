/** @since 1.0.0 */

import { Seed, seedMax } from '@no-day/fp-ts-lcg';
import * as lcg from '@no-day/fp-ts-lcg';
import { State } from 'fp-ts/State';
import * as state from 'fp-ts/State';
import { pipe } from 'fp-ts/function';
import { sequenceT } from 'fp-ts/Apply';
import * as apply from 'fp-ts/Apply';
import * as array from 'fp-ts/Array';

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

const clamp: (a: number, b: number) => (c: number) => number = (a, b) => (
  c
) => {
  const [min, max] = a < b ? [a, b] : [b, a];

  const diff = max - min;

  return min + (c % (diff + 1));
};

/**
 * Create a random generator which chooses uniformly distributed integers from
 * the closed interval `[a, b]`. Note that very large intervals (above 2^32)
 * will cause a loss of uniformity.
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
 *       gen.vector(4),
 *       gen.generate({ seed: gen.mkSeed(42) })
 *     ),
 *     [43, 2075653, 1409598201, 1842888923]
 *   );
 */

export const lcgStep: Gen<number> = (s) => [
  lcg.unSeed(s.newSeed),
  { newSeed: lcg.lcgNext(s.newSeed), size: s.size },
];

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
 *       gen.vector(4),
 *       gen.generate({ seed: gen.mkSeed(42) })
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
 *       gen.record({ foo: gen.int(), bar: gen.int(), baz: gen.int() }),
 *       gen.vector(4),
 *       gen.generate({ seed: gen.mkSeed(42) })
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
export const record = apply.sequenceS(state.state);

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
 *       gen.tuple(gen.int(), gen.int()),
 *       gen.vector(4),
 *       gen.generate({ seed: gen.mkSeed(42) })
 *     ),
 *     [
 *       [-57, 27],
 *       [-25, 22],
 *       [-14, 73],
 *       [-64, -84],
 *     ]
 *   );
 */
export const tuple = apply.sequenceT(state.state);

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
 *     pipe(gen.vector(8)(gen.int()), gen.generate({ seed: gen.mkSeed(42) })),
 *     [-57, 27, -25, 22, -14, 73, -64, -84]
 *   );
 */
export const vector = (size: number) => <T>(gen: Gen<T>): Gen<Array<T>> =>
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
export const generate: (opts: {
  seed: Seed;
  size?: Size;
}) => <T>(gen: Gen<T>) => T = ({ seed, size = 10 }) => (gen) =>
  evalGen({ newSeed: seed, size })(gen);
