---
title: index.ts
nav_order: 1
parent: Modules
---

## index overview

Added in v1.0.0

---

<h2 class="text-delta">Table of contents</h2>

- [Applicative](#applicative)
  - [ap](#ap)
  - [of](#of)
- [Constructors](#constructors)
  - [arrayOf](#arrayof)
  - [boolean](#boolean)
  - [char](#char)
  - [float](#float)
  - [int](#int)
  - [lcgStep](#lcgstep)
  - [oneOf](#oneof)
  - [recordOf](#recordof)
  - [string](#string)
  - [tupleOf](#tupleof)
  - [uniform](#uniform)
  - [vectorOf](#vectorof)
- [Destructors](#destructors)
  - [evalGen](#evalgen)
  - [generate](#generate)
  - [generateSample](#generatesample)
- [Functor](#functor)
  - [map](#map)
- [Instances](#instances)
  - [Applicative](#applicative-1)
  - [Functor](#functor-1)
  - [Monad](#monad)
- [Model](#model)
  - [Gen (type alias)](#gen-type-alias)
  - [GenState (type alias)](#genstate-type-alias)
  - [Size (type alias)](#size-type-alias)
- [Monad](#monad-1)
  - [chain](#chain)
- [Util](#util)
  - [mkSeed](#mkseed)
  - [seedMax](#seedmax)
  - [seedMin](#seedmin)
- [Utils](#utils)
  - [bind](#bind)
  - [bindTo](#bindto)

---

# Applicative

## ap

**Signature**

```ts
export declare const ap: <E, A>(fa: State<E, A>) => <B>(fab: State<E, (a: A) => B>) => State<E, B>
```

Added in v1.0.0

## of

**Signature**

```ts
export declare const of: <E, A>(a: A) => State<E, A>
```

Added in v1.0.0

# Constructors

## arrayOf

Generates a pseudo random array

**Signature**

```ts
export declare const arrayOf: <T>(gen: Gen<T>) => Gen<T[]>
```

**Example**

```ts
import { mkSeed, generateSample, arrayOf, int } from '@no-day/fp-ts-generators'
import { pipe } from 'fp-ts/function'

assert.deepStrictEqual(
  pipe(
    arrayOf(int()),

    generateSample({ count: 10, size: 5, seed: mkSeed(42) })
  ),
  [[27], [22, -14, 73], [-84, -13, 50], [-6, 16, -62, 76], [-44, 96], [48, 0], [], [23, 75, -63, -71, 64], [], [-83]]
)
```

Added in v1.0.0

## boolean

A pseudo random boolean

**Signature**

```ts
export declare const boolean: Gen<boolean>
```

**Example**

```ts
import { mkSeed, generateSample, boolean } from '@no-day/fp-ts-generators'
import { pipe } from 'fp-ts/function'

assert.deepStrictEqual(
  pipe(
    boolean,

    generateSample({ seed: mkSeed(42) })
  ),
  [true, true, true, true, true, false, true, true, false, false]
)
```

Added in v1.0.0

## char

A pseudo random character

**Signature**

```ts
export declare const char: ({ from, to }?: { from?: string; to?: string }) => Gen<string>
```

**Example**

```ts
import { mkSeed, generateSample, char } from '@no-day/fp-ts-generators'
import { pipe } from 'fp-ts/function'

assert.deepStrictEqual(
  pipe(
    char(),

    generateSample({ count: 20, seed: mkSeed(42) })
  ),
  ['K', '}', 'l', 'i', 'C', ':', 'n', 'o', 'q', '0', '{', 'h', '}', 'I', '=', 'o', '<', 'U', 'Z', ';']
)

assert.deepStrictEqual(
  pipe(
    char({ from: 'a', to: 'z' }),

    generateSample({ count: 20, seed: mkSeed(42) })
  ),
  ['r', 'v', 'l', 'f', 'p', 'i', 'n', 'b', 'k', 's', 'w', 'a', 'j', 'e', 'b', 'q', 'p', 'w', 'a', 'm']
)
```

Added in v1.0.0

## float

Generates a pseudo random float in a given interval

**Signature**

```ts
export declare const float: ({ min, max }?: { min?: number; max?: number }) => Gen<number>
```

**Example**

```ts
import { mkSeed, generateSample, float } from '@no-day/fp-ts-generators'
import * as gen from '@no-day/fp-ts-generators'
import { pipe } from 'fp-ts/function'

const formatFloat = (digits: number) => (n: number) => Math.round(n * 10 ** digits) / 10 ** digits

assert.deepStrictEqual(
  pipe(
    float({ min: -10, max: 10 }),
    gen.map(formatFloat(4)),

    generateSample({ count: 10, seed: mkSeed(42) })
  ),
  [-10, -9.9807, 3.1279, 7.1632, -3.2143, 2.4419, -6.8668, -7.1208, -7.7128, -3.9007]
)
```

Added in v1.0.0

## int

Generates a pseudo random integer in a given interval

**Signature**

```ts
export declare const int: ({ min, max }?: { min?: number; max?: number }) => Gen<number>
```

**Example**

```ts
import { mkSeed, generateSample, int } from '@no-day/fp-ts-generators'
import { pipe } from 'fp-ts/function'

assert.deepStrictEqual(
  pipe(
    int({ min: -10, max: 10 }),

    generateSample({ count: 10, seed: mkSeed(42) })
  ),
  [-9, 3, 8, -2, -2, -8, -4, 3, -7, -10]
)
```

Added in v1.0.0

## lcgStep

A random generator which simply outputs the current seed.

**Signature**

```ts
export declare const lcgStep: Gen<number>
```

**Example**

```ts
import { mkSeed, generateSample, lcgStep } from '@no-day/fp-ts-generators'
import { pipe } from 'fp-ts/function'

assert.deepStrictEqual(
  pipe(
    lcgStep,

    generateSample({ count: 4, seed: mkSeed(42) })
  ),
  [43, 2075653, 1409598201, 1842888923]
)
```

Added in v1.0.0

## oneOf

Create a random generator which selects and executes a random generator from a non-empty array of random generators
with uniform probability.

**Signature**

```ts
export declare const oneOf: <T>(gens: NonEmptyArray<Gen<T>>) => Gen<T>
```

**Example**

```ts
import { mkSeed, generateSample, oneOf, int } from '@no-day/fp-ts-generators'
import { pipe } from 'fp-ts/function'

assert.deepStrictEqual(
  pipe(
    oneOf([int({ min: 10, max: 20 }), int({ min: 50, max: 60 })]),

    generateSample({ count: 6, seed: mkSeed(42) })
  ),
  [58, 57, 55, 60, 12, 10]
)
```

Added in v1.0.0

## recordOf

Generates a pseudo random record if generators are provided for each field

**Signature**

```ts
export declare const recordOf: <E, NER>(
  r: (keyof NER extends never ? never : NER) & Record<string, State<E, any>>
) => State<E, { [K in keyof NER]: [NER[K]] extends [State<any, infer A>] ? A : never }>
```

**Example**

```ts
import { mkSeed, generateSample, recordOf, boolean, int } from '@no-day/fp-ts-generators'
import { pipe } from 'fp-ts/function'

assert.deepStrictEqual(
  pipe(
    recordOf({ bar: boolean, baz: int(), foo: int() }),

    generateSample({ count: 4, seed: mkSeed(42) })
  ),
  [
    {
      bar: true,
      baz: 27,
      foo: -25,
    },
    {
      bar: true,
      baz: -14,
      foo: 73,
    },
    {
      bar: true,
      baz: -84,
      foo: -13,
    },
    {
      bar: false,
      baz: 36,
      foo: -6,
    },
  ]
)
```

Added in v1.0.0

## string

A pseudo random string

**Signature**

```ts
export declare const string: ({ from, to }?: { from?: string; to?: string }) => Gen<string>
```

**Example**

```ts
import { mkSeed, generateSample, string } from '@no-day/fp-ts-generators'
import { pipe } from 'fp-ts/function'

assert.deepStrictEqual(
  pipe(
    string({ from: 'a', to: 'z' }),

    generateSample({ count: 10, seed: mkSeed(42) })
  ),

  ['vlfpinbksw', '', 'ebqpwa', 'uknubf', 'lq', 'jflq', 'fehcuxoqm', 'lsug', 'bat', 't']
)
```

Added in v1.0.0

## tupleOf

Generates a pseudo random tuple if generators are provided for each position

**Signature**

```ts
export declare const tupleOf: <E, T>(
  ...t: T & { readonly 0: State<E, any> }
) => State<E, { [K in keyof T]: [T[K]] extends [State<E, infer A>] ? A : never }>
```

**Example**

```ts
import { mkSeed, generateSample, tupleOf, int, boolean } from '@no-day/fp-ts-generators'
import { pipe } from 'fp-ts/function'

assert.deepStrictEqual(
  pipe(
    tupleOf(int(), boolean),

    generateSample({ count: 4, seed: mkSeed(42) })
  ),
  [
    [-57, true],
    [-25, true],
    [-14, false],
    [-64, true],
  ]
)
```

Added in v1.0.0

## uniform

A random generator which approximates a uniform random variable on `[0, 1]`

**Signature**

```ts
export declare const uniform: <T>() => Gen<number>
```

**Example**

```ts
import { mkSeed, generateSample, uniform } from '@no-day/fp-ts-generators'
import * as gen from '@no-day/fp-ts-generators'
import { pipe } from 'fp-ts/function'

const formatFloat = (digits: number) => (n: number) => Math.round(n * 10 ** digits) / 10 ** digits

assert.deepStrictEqual(
  pipe(
    uniform(),
    gen.map(formatFloat(4)),

    generateSample({ count: 10, seed: mkSeed(42) })
  ),
  [0, 0.001, 0.6564, 0.8582, 0.3393, 0.6221, 0.1567, 0.144, 0.1144, 0.305]
)
```

Added in v1.0.0

## vectorOf

Generates a pseudo random array of a fixed size

**Signature**

```ts
export declare const vectorOf: (size: number) => <T>(gen: Gen<T>) => Gen<T[]>
```

**Example**

```ts
import { mkSeed, generateSample, vectorOf, int } from '@no-day/fp-ts-generators'
import { pipe } from 'fp-ts/function'

assert.deepStrictEqual(
  pipe(
    vectorOf(6)(int()),

    generateSample({ count: 4, seed: mkSeed(42) })
  ),
  [
    [-57, 27, -25, 22, -14, 73],
    [-64, -84, -13, 50, 36, -6],
    [16, -62, 76, -8, -44, 96],
    [88, 48, 0, -37, -53, 23],
  ]
)
```

Added in v1.0.0

# Destructors

## evalGen

Run a random generator

**Signature**

```ts
export declare const evalGen: <S>(s: S) => <A>(ma: State<S, A>) => A
```

Added in v1.0.0

## generate

Run a random generator with a given seed and size.

**Signature**

```ts
export declare const generate: (opts: { seed: Seed; size?: number }) => <T>(gen: Gen<T>) => T
```

Added in v1.0.0

## generateSample

Run a random generator with a given seed and size. Produces an array of results, configured by count.

**Signature**

```ts
export declare const generateSample: (opts: { seed: Seed; size?: number; count?: number }) => <T>(gen: Gen<T>) => T[]
```

Added in v1.0.0

# Functor

## map

**Signature**

```ts
export declare const map: <A, B>(f: (a: A) => B) => <E>(fa: State<E, A>) => State<E, B>
```

Added in v1.0.0

# Instances

## Applicative

**Signature**

```ts
export declare const Applicative: Applicative2<'State'>
```

Added in v1.0.0

## Functor

**Signature**

```ts
export declare const Functor: Functor2<'State'>
```

Added in v1.0.0

## Monad

**Signature**

```ts
export declare const Monad: Monad2<'State'>
```

Added in v1.0.0

# Model

## Gen (type alias)

The random generator monad

**Signature**

```ts
export type Gen<T> = State<GenState, T>
```

Added in v1.0.0

## GenState (type alias)

The state of the random generator monad.

**Signature**

```ts
export type GenState = { newSeed: Seed; size: Size }
```

Added in v1.0.0

## Size (type alias)

The meaning of size depends on the particular generator used.

**Signature**

```ts
export type Size = number
```

Added in v1.0.0

# Monad

## chain

**Signature**

```ts
export declare const chain: <E, A, B>(f: (a: A) => State<E, B>) => (ma: State<E, A>) => State<E, B>
```

Added in v1.0.0

# Util

## mkSeed

Creates a seed to that's needed for the random generator

**Signature**

```ts
export declare const mkSeed: (n: number) => Seed
```

Added in v1.0.0

## seedMax

Maximum possible seed value

**Signature**

```ts
export declare const seedMax: number
```

Added in v1.0.0

## seedMin

Minimum possible seed value

**Signature**

```ts
export declare const seedMin: number
```

Added in v1.0.0

# Utils

## bind

**Signature**

```ts
export declare const bind: <N extends string, A, S, B>(
  name: Exclude<N, keyof A>,
  f: (a: A) => State<S, B>
) => (fa: State<S, A>) => State<S, { [K in N | keyof A]: K extends keyof A ? A[K] : B }>
```

Added in v1.0.0

## bindTo

**Signature**

```ts
export declare const bindTo: <N extends string>(name: N) => <S, A>(fa: State<S, A>) => State<S, { [K in N]: A }>
```

Added in v1.0.0
