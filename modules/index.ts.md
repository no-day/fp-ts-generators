---
title: index.ts
nav_order: 1
parent: Modules
---

## index overview

Added in v1.0.0

---

<h2 class="text-delta">Table of contents</h2>

- [Constructors](#constructors)
  - [int](#int)
  - [lcgStep](#lcgstep)
  - [oneOf](#oneof)
  - [recordOf](#recordof)
  - [tupleOf](#tupleof)
  - [vectorOf](#vectorof)
- [Destructors](#destructors)
  - [evalGen](#evalgen)
  - [generate](#generate)
  - [generateSample](#generatesample)
- [Model](#model)
  - [Gen (type alias)](#gen-type-alias)
  - [GenState (type alias)](#genstate-type-alias)
  - [Size (type alias)](#size-type-alias)
- [Util](#util)
  - [mkSeed](#mkseed)
  - [seedMax](#seedmax)
  - [seedMin](#seedmin)

---

# Constructors

## int

Generates a pseudo random integer in a given interval

**Signature**

```ts
export declare const int: ({ min, max }?: { min?: number; max?: number }) => Gen<number>
```

**Example**

```ts
import * as gen from '@no-day/fp-ts-generators'
import { pipe } from 'fp-ts/function'

assert.deepStrictEqual(
  pipe(
    gen.int({ min: -10, max: 10 }),

    gen.generateSample({ count: 4, seed: gen.mkSeed(42) })
  ),
  [-9, 3, 8, -2]
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
import * as gen from '@no-day/fp-ts-generators'
import { pipe } from 'fp-ts/function'

assert.deepStrictEqual(
  pipe(
    gen.lcgStep,

    gen.generateSample({ count: 4, seed: gen.mkSeed(42) })
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
import * as gen from '@no-day/fp-ts-generators'
import { pipe } from 'fp-ts/function'

assert.deepStrictEqual(
  pipe(
    gen.oneOf([gen.int({ min: 10, max: 20 }), gen.int({ min: 50, max: 60 })]),

    gen.generateSample({ count: 6, seed: gen.mkSeed(42) })
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
import * as gen from '@no-day/fp-ts-generators'
import { pipe } from 'fp-ts/function'

assert.deepStrictEqual(
  pipe(
    gen.recordOf({ foo: gen.int(), bar: gen.int(), baz: gen.int() }),

    gen.generateSample({ count: 4, seed: gen.mkSeed(42) })
  ),
  [
    {
      bar: 27,
      baz: -25,
      foo: -57,
    },
    {
      bar: -14,
      baz: 73,
      foo: 22,
    },
    {
      bar: -84,
      baz: -13,
      foo: -64,
    },
    {
      bar: 36,
      baz: -6,
      foo: 50,
    },
  ]
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
import * as gen from '@no-day/fp-ts-generators'
import { pipe } from 'fp-ts/function'

assert.deepStrictEqual(
  pipe(
    gen.tupleOf(gen.int(), gen.int()),

    gen.generateSample({ count: 4, seed: gen.mkSeed(42) })
  ),
  [
    [-57, 27],
    [-25, 22],
    [-14, 73],
    [-64, -84],
  ]
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
import * as gen from '@no-day/fp-ts-generators'
import { pipe } from 'fp-ts/function'

assert.deepStrictEqual(
  pipe(
    gen.vectorOf(6)(gen.int()),

    gen.generateSample({ count: 4, seed: gen.mkSeed(42) })
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
