# fp-ts-generators

A seeded pseudorandom number generator.

<!-- AUTO-GENERATED-CONTENT:START (TOC) -->

- [What it is](#what-it-is)
- [What it's not](#what-its-not)
- [Install](#install)
- [Documentation](#documentation)
- [Example](#example)
- [JavaScript usage](#javascript-usage)
- [Inspiration](#inspiration)
<!-- AUTO-GENERATED-CONTENT:END -->

# What it is

`fp-ts-generators` is a library that's only purpose is pseudo random data generation. It can be useful in many fields, e.g. in generative art, mocking APIs or as well as property based testing.

With combinators like

```ts
recordOf({ foo: int(), bar: boolean });
```

and a given seed, we can deterministically generate random looking data.

# What it's not

This library is not a testing library in the style of quick-check. However, a testing library can be built on top of this package.

# Install

Uses `fp-ts` as a peer dependency.

```bash
npm install fp-ts @no-day/fp-ts-generators
```

# Documentation

- [API Docs](https://no-day.github.io/fp-ts-generators/modules/index.ts.html)

# Example

```ts
import {
  Gen,
  generateSample,
  recordOf,
  boolean,
  char,
  string,
  int,
  generate,
  mkSeed,
  arrayOf,
  float,
} from '@no-day/fp-ts-generators';
import * as assert from 'assert';
import { pipe } from 'fp-ts/function';

// Let's first of all define a type for which we want to generate some pseudo random data
type Person = {
  name: string;
  age: number;
  hobbies: string[];
  details: { active: boolean; trusted: boolean };
  height: number;
};

// And let's define a specific generator for that type:
const genPerson: Gen<Person> = recordOf({
  name: string(),
  age: int({ min: 0, max: 100 }),
  hobbies: arrayOf(string()),
  height: float({ min: 0.0, max: 2.0 }),
  details: recordOf({ active: boolean, trusted: boolean }),
});

assert.deepStrictEqual(
  pipe(
    genPerson,
    // Here we generate 3 samples with the given seed `42`.
    // The result will always be the same.
    generateSample({ count: 3, seed: mkSeed(42), size: 5 })
  ),
  [
    {
      age: 84,
      details: {
        active: false,
        trusted: true,
      },
      height: 0.6403711704913259,
      hobbies: [':noq0', 'h}I=', '<U', ';A', ''],
      name: '}',
    },
    {
      age: 9,
      details: {
        active: true,
        trusted: true,
      },
      height: 1.988632641722106,
      hobbies: [],
      name: 'Y',
    },
    {
      age: 80,
      details: {
        active: true,
        trusted: false,
      },
      height: 0.16447428536086742,
      hobbies: ['{@3 ', '=)nr', 'ue', 'oK[*', 'IC'],
      name: ' (8',
    },
  ]
);
```

See the `examples` folder for more usage demos.

# JavaScript usage

The library can be used in plain JavaScript as well, you'll find a demo in the examples folder, too.

# Inspiration

Parts of this library are ported from [purescript-quickcheck](https://github.com/purescript/purescript-quickcheck).
