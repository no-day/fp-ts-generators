/**
 * @since 1.0.0
 */

import { Seed } from "@no-day/fp-ts-lcg";
import * as lcg from "@no-day/fp-ts-lcg";
import { State } from "fp-ts/State";
import * as state from "fp-ts/State";

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
// model
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
