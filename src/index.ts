/** @since 0.1.0 */

import { Seed, seedMax, seedMin } from '@no-day/fp-ts-lcg';
import * as lcg from '@no-day/fp-ts-lcg';
import { State } from 'fp-ts/State';
import * as state from 'fp-ts/State';
import { flow, pipe } from 'fp-ts/function';
import { sequenceT } from 'fp-ts/Apply';
import * as apply from 'fp-ts/Apply';
import * as array from 'fp-ts/Array';
import * as option from 'fp-ts/Option';
import { NonEmptyArray } from 'fp-ts/lib/NonEmptyArray';

// --------------------------------------------------------------------------------------------------------------------
// Re-export
// --------------------------------------------------------------------------------------------------------------------

export {
  /**
   * Creates a seed to that's needed for the random generator
   *
   * @since 0.1.0
   * @category Util
   */
  mkSeed,
  /**
   * Minimum possible seed value
   *
   * @since 0.1.0
   * @category Util
   */
  seedMin,
  /**
   * Maximum possible seed value
   *
   * @since 0.1.0
   * @category Util
   */
  seedMax,
} from '@no-day/fp-ts-lcg';

export {
  /**
   * @since 0.1.0
   * @category Instances
   */
  Functor,
  /**
   * @since 0.1.0
   * @category Functor
   */
  map,
  /**
   * @since 0.1.0
   * @category Instances
   */
  Applicative,
  /**
   * @since 0.1.0
   * @category Applicative
   */
  of,
  /**
   * @since 0.1.0
   * @category Applicative
   */
  ap,
  /**
   * @since 0.1.0
   * @category Instances
   */
  Monad,
  /**
   * @since 0.1.0
   * @category Monad
   */
  chain,
  /**
   * @since 0.1.0
   * @category Utils
   */
  bind,
  /**
   * @since 0.1.0
   * @category Utils
   */
  bindTo,
} from 'fp-ts/State';

// --------------------------------------------------------------------------------------------------------------------
// Model
// --------------------------------------------------------------------------------------------------------------------

/**
 * The meaning of size depends on the particular generator used.
 *
 * @since 0.1.0
 * @category Model
 */
export type Size = number;

/**
 * The state of the random generator monad.
 *
 * @since 0.1.0
 * @category Model
 */
export type GenState = { newSeed: Seed; size: Size };

/**
 * The random generator monad
 *
 * @since 0.1.0
 * @category Model
 */
export type Gen<T> = State<GenState, T>;

// --------------------------------------------------------------------------------------------------------------------
// Internal
// --------------------------------------------------------------------------------------------------------------------

const clamp: (a: number, b: number) => (c: number) => number = (a, b) => (c) => {
  const [min, max] = a < b ? [a, b] : [b, a];

  const diff = max - min;

  return min + (c % (diff + 1));
};

/**
 * A generator that returns its current size.
 *
 * @category Constructors
 */
export const sized: Gen<number> = state.gets((genState) => genState.size);

/** Create a random generator which uses the generator state explicitly. */
const stateful: <T>(f: (genState: GenState) => Gen<T>) => Gen<T> = (f) => (s) => f(s)(s);

/**
 * Create a random generator which chooses uniformly distributed integers from the closed interval `[a, b]`. Note that
 * very large intervals (above 2^32) will cause a loss of uniformity.
 *
 * @since 0.1.0
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

// --------------------------------------------------------------------------------------------------------------------
// Constructors
// --------------------------------------------------------------------------------------------------------------------

/**
 * A random generator which simply outputs the current seed.
 *
 * @since 0.1.0
 * @category Constructors
 * @example
 *   import { mkSeed, generateSample, lcgStep } from '@no-day/fp-ts-generators';
 *   import { pipe } from 'fp-ts/function';
 *
 *   assert.deepStrictEqual(
 *     pipe(
 *       lcgStep,
 *
 *       generateSample({ count: 4, seed: mkSeed(42) })
 *     ),
 *     [43, 2075653, 1409598201, 1842888923]
 *   );
 */

export const lcgStep: Gen<number> = (s) => [lcg.unSeed(s.newSeed), { newSeed: lcg.lcgNext(s.newSeed), size: s.size }];

/**
 * A random generator which approximates a uniform random variable on `[0, 1]`
 *
 * @since 0.1.0
 * @category Constructors
 * @example
 *   import { mkSeed, generateSample, uniform } from '@no-day/fp-ts-generators';
 *   import * as gen from '@no-day/fp-ts-generators';
 *   import { pipe } from 'fp-ts/function';
 *
 *   const formatFloat = (digits: number) => (n: number) => Math.round(n * 10 ** digits) / 10 ** digits;
 *
 *   assert.deepStrictEqual(
 *     pipe(
 *       uniform(),
 *       gen.map(formatFloat(4)),
 *
 *       generateSample({ count: 10, seed: mkSeed(42) })
 *     ),
 *     [0, 0.001, 0.6564, 0.8582, 0.3393, 0.6221, 0.1567, 0.144, 0.1144, 0.305]
 *   );
 */
export const uniform = <T>(): Gen<number> =>
  pipe(
    lcgStep,
    state.map((n) => (n - seedMin) / seedDiff)
  );

/**
 * Applies `lcg.perturb` to the the seed.
 *
 * @category Combinators
 */
export function perturb(d: number): Gen<void> {
  return state.modify(({ newSeed, size }) => ({
    newSeed: lcg.lcgPertub(d)(newSeed),
    size,
  }));
}

/**
 * Generates a pseudo random integer in a given interval
 *
 * @since 0.1.0
 * @category Constructors
 * @example
 *   import { mkSeed, generateSample, int } from '@no-day/fp-ts-generators';
 *   import { pipe } from 'fp-ts/function';
 *
 *   assert.deepStrictEqual(
 *     pipe(
 *       int({ min: -10, max: 10 }),
 *
 *       generateSample({ count: 10, seed: mkSeed(42) })
 *     ),
 *     [-9, 3, 8, -2, -2, -8, -4, 3, -7, -10]
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
 * Generates a pseudo random float in a given interval
 *
 * @since 0.1.0
 * @category Constructors
 * @example
 *   import { mkSeed, generateSample, float } from '@no-day/fp-ts-generators';
 *   import * as gen from '@no-day/fp-ts-generators';
 *   import { pipe } from 'fp-ts/function';
 *
 *   const formatFloat = (digits: number) => (n: number) => Math.round(n * 10 ** digits) / 10 ** digits;
 *
 *   assert.deepStrictEqual(
 *     pipe(
 *       float({ min: -10, max: 10 }),
 *       gen.map(formatFloat(4)),
 *
 *       generateSample({ count: 10, seed: mkSeed(42) })
 *     ),
 *     [-10, -9.9807, 3.1279, 7.1632, -3.2143, 2.4419, -6.8668, -7.1208, -7.7128, -3.9007]
 *   );
 */
export const float = ({
  min = -100.0,
  max = 100.0,
}: {
  min?: number;
  max?: number;
} = {}): Gen<number> => {
  const diff = Math.abs(max - min);

  return pipe(
    uniform(),
    state.map((n) => min + n * diff)
  );
};

/**
 * Generates a pseudo random struct if generators are provided for each field
 *
 * @since 0.1.0
 * @category Constructors
 * @example
 *   import { mkSeed, generateSample, structOf, boolean, int } from '@no-day/fp-ts-generators';
 *   import { pipe } from 'fp-ts/function';
 *
 *   assert.deepStrictEqual(
 *     pipe(
 *       structOf({ bar: boolean, baz: int(), foo: int() }),
 *
 *       generateSample({ count: 4, seed: mkSeed(42) })
 *     ),
 *     [
 *       {
 *         bar: true,
 *         baz: 27,
 *         foo: -25,
 *       },
 *       {
 *         bar: true,
 *         baz: -14,
 *         foo: 73,
 *       },
 *       {
 *         bar: true,
 *         baz: -84,
 *         foo: -13,
 *       },
 *       {
 *         bar: false,
 *         baz: 36,
 *         foo: -6,
 *       },
 *     ]
 *   );
 */
export const structOf = apply.sequenceS(state.state);

/**
 * Generates a pseudo random record if generators are provided for each field
 *
 * @deprecated Use `structOf` instead
 * @since 0.1.0
 * @category Constructors
 * @example
 *   import { mkSeed, generateSample, recordOf, boolean, int } from '@no-day/fp-ts-generators';
 *   import { pipe } from 'fp-ts/function';
 *
 *   assert.deepStrictEqual(
 *     pipe(
 *       recordOf({ bar: boolean, baz: int(), foo: int() }),
 *
 *       generateSample({ count: 4, seed: mkSeed(42) })
 *     ),
 *     [
 *       {
 *         bar: true,
 *         baz: 27,
 *         foo: -25,
 *       },
 *       {
 *         bar: true,
 *         baz: -14,
 *         foo: 73,
 *       },
 *       {
 *         bar: true,
 *         baz: -84,
 *         foo: -13,
 *       },
 *       {
 *         bar: false,
 *         baz: 36,
 *         foo: -6,
 *       },
 *     ]
 *   );
 */
export const recordOf = apply.sequenceS(state.state);

/**
 * Generates a pseudo random tuple if generators are provided for each position
 *
 * @since 0.1.0
 * @category Constructors
 * @example
 *   import { mkSeed, generateSample, tupleOf, int, boolean } from '@no-day/fp-ts-generators';
 *   import { pipe } from 'fp-ts/function';
 *
 *   assert.deepStrictEqual(
 *     pipe(
 *       tupleOf(int(), boolean),
 *
 *       generateSample({ count: 4, seed: mkSeed(42) })
 *     ),
 *     [
 *       [-57, true],
 *       [-25, true],
 *       [-14, false],
 *       [-64, true],
 *     ]
 *   );
 */
export const tupleOf = apply.sequenceT(state.state);

/**
 * Generates a pseudo random array of a fixed size
 *
 * @since 0.1.0
 * @category Constructors
 * @example
 *   import { mkSeed, generateSample, vectorOf, int } from '@no-day/fp-ts-generators';
 *   import { pipe } from 'fp-ts/function';
 *
 *   assert.deepStrictEqual(
 *     pipe(
 *       vectorOf(6)(int()),
 *
 *       generateSample({ count: 4, seed: mkSeed(42) })
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
 * Generates a pseudo random array
 *
 * @since 0.1.0
 * @category Constructors
 * @example
 *   import { mkSeed, generateSample, arrayOf, int } from '@no-day/fp-ts-generators';
 *   import { pipe } from 'fp-ts/function';
 *
 *   assert.deepStrictEqual(
 *     pipe(
 *       arrayOf(int()),
 *
 *       generateSample({ count: 10, size: 5, seed: mkSeed(42) })
 *     ),
 *     [
 *       [27],
 *       [22, -14, 73],
 *       [-84, -13, 50],
 *       [-6, 16, -62, 76],
 *       [-44, 96],
 *       [48, 0],
 *       [],
 *       [23, 75, -63, -71, 64],
 *       [],
 *       [-83],
 *     ]
 *   );
 */

export const arrayOf = <T>(gen: Gen<T>): Gen<Array<T>> =>
  pipe(
    sized,
    state.chain((size) => chooseInt(0, size)),
    state.chain((size) => vectorOf(size)(gen))
  );

/**
 * Create a random generator which selects and executes a random generator from a non-empty array of random generators
 * with uniform probability.
 *
 * @since 0.1.0
 * @category Constructors
 * @example
 *   import { mkSeed, generateSample, oneOf, int } from '@no-day/fp-ts-generators';
 *   import { pipe } from 'fp-ts/function';
 *
 *   assert.deepStrictEqual(
 *     pipe(
 *       oneOf([int({ min: 10, max: 20 }), int({ min: 50, max: 60 })]),
 *
 *       generateSample({ count: 6, seed: mkSeed(42) })
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

/**
 * A pseudo random boolean
 *
 * @since 0.1.0
 * @category Constructors
 * @example
 *   import { mkSeed, generateSample, boolean } from '@no-day/fp-ts-generators';
 *   import { pipe } from 'fp-ts/function';
 *
 *   assert.deepStrictEqual(
 *     pipe(
 *       boolean,
 *
 *       generateSample({ seed: mkSeed(42) })
 *     ),
 *     [true, true, true, true, true, false, true, true, false, false]
 *   );
 */
export const boolean: Gen<boolean> = oneOf([state.of(false), state.of(true)]);

/**
 * A pseudo random character
 *
 * @since 0.1.0
 * @category Constructors
 * @example
 *   import { mkSeed, generateSample, char } from '@no-day/fp-ts-generators';
 *   import { pipe } from 'fp-ts/function';
 *
 *   assert.deepStrictEqual(
 *     pipe(
 *       char(),
 *
 *       generateSample({ count: 20, seed: mkSeed(42) })
 *     ),
 *     ['K', '}', 'l', 'i', 'C', ':', 'n', 'o', 'q', '0', '{', 'h', '}', 'I', '=', 'o', '<', 'U', 'Z', ';']
 *   );
 *
 *   assert.deepStrictEqual(
 *     pipe(
 *       char({ from: 'a', to: 'z' }),
 *
 *       generateSample({ count: 20, seed: mkSeed(42) })
 *     ),
 *     ['r', 'v', 'l', 'f', 'p', 'i', 'n', 'b', 'k', 's', 'w', 'a', 'j', 'e', 'b', 'q', 'p', 'w', 'a', 'm']
 *   );
 */
export const char = ({ from = ' ', to = '~' }: { from?: string; to?: string } = {}): Gen<string> => {
  const fromInt = from.charCodeAt(0);
  const toInt = to.charCodeAt(0);

  return pipe(chooseInt(fromInt, toInt), state.map(String.fromCharCode));
};

/**
 * A pseudo random string
 *
 * @since 0.1.0
 * @category Constructors
 * @example
 *   import { mkSeed, generateSample, string } from '@no-day/fp-ts-generators';
 *   import { pipe } from 'fp-ts/function';
 *
 *   assert.deepStrictEqual(
 *     pipe(
 *       string({ from: 'a', to: 'z' }),
 *
 *       generateSample({ count: 10, seed: mkSeed(42) })
 *     ),
 *
 *     ['vlfpinbksw', '', 'ebqpwa', 'uknubf', 'lq', 'jflq', 'fehcuxoqm', 'lsug', 'bat', 't']
 *   );
 */
export const string = ({ from = ' ', to = '~' }: { from?: string; to?: string } = {}): Gen<string> =>
  pipe(
    arrayOf(char({ from, to })),
    state.map((_) => _.join(''))
  );

// --------------------------------------------------------------------------------------------------------------------
// Destructors
// --------------------------------------------------------------------------------------------------------------------

/**
 * Run a random generator
 *
 * @since 0.1.0
 * @category Destructors
 */
export const evalGen = state.evaluate;

/**
 * Run a random generator with a given seed and size.
 *
 * @since 0.1.0
 * @category Destructors
 */
export const generate: (opts: { seed: Seed; size?: Size }) => <T>(gen: Gen<T>) => T = ({ seed, size = 10 }) => (gen) =>
  evalGen({ newSeed: seed, size })(gen);

/**
 * Run a random generator with a given seed and size. Produces an array of results, configured by count.
 *
 * @since 0.1.0
 * @category Destructors
 */
export const generateSample: (opts: { seed: Seed; size?: Size; count?: number }) => <T>(gen: Gen<T>) => T[] = ({
  seed,
  size = 10,
  count = 10,
}) => (gen) => pipe(gen, vectorOf(count), generate({ seed, size }));
