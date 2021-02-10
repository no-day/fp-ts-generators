---
title: index.ts
nav_order: 1
parent: Modules
---

## index overview

Added in v1.0.0

---

<h2 class="text-delta">Table of contents</h2>

- [constructors](#constructors)
  - [lcgStep](#lcgstep)
- [model](#model)
  - [Gen (type alias)](#gen-type-alias)
  - [GenState (type alias)](#genstate-type-alias)
  - [Size (type alias)](#size-type-alias)

---

# constructors

## lcgStep

A random generator which simply outputs the current seed.

**Signature**

```ts
export declare const lcgStep: Gen<number>
```

Added in v1.0.0

# model

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
