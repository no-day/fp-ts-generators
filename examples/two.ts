import { Gen, generateSample, char, string, mkSeed, oneOf } from '../src';
import * as gen from '../src';
import * as assert from 'assert';
import { pipe } from 'fp-ts/function';

// However, the full power comes into play with the instances that the library provides.

// Let's define our generators in a bit more granular way.
const genName: Gen<string> = pipe(
  gen.bindTo('firstLetter')(char({ from: 'A', to: 'Z' })),
  gen.bind('restLetters', () => string({ from: 'a', to: 'z' })),
  gen.map((_) => `${_.firstLetter}${_.restLetters}`)
);

// We'll use this seed throughout the module
const seed = mkSeed(42);

// That's nice, Now already strings that look a bit more like names.
assert.deepStrictEqual(pipe(genName, generateSample({ seed })), [
  'Rlfpinbks',
  'W',
  'J',
  'Bpwamu',
  'Kubfdlql',
  'Jlqq',
  'Fhcuxoqmtls',
  'U',
  'Matftv',
  'Kkazgkvz',
]);

// But let's go a bit further and define a full name
const genFullName: Gen<string> = pipe(
  gen.bindTo('firstName')(genName),
  gen.bind('lastName', () => genName),
  gen.map((_) => `${_.firstName} ${_.lastName}`)
);

// Let's see. That would be already a bit more realistically looking.
assert.deepStrictEqual(pipe(genFullName, generateSample({ seed })), [
  'Rlfpinbks W',
  'J Bpwamu',
  'Kubfdlql Jlqq',
  'Fhcuxoqmtls U',
  'Matftv Kkazgkvz',
  'Tjgldf Wxtw',
  'Mbfmg Tcebmgcjzo',
  'Xikyzqsf Aifts',
  'Id Ihzxk',
  'Hrl Rdabhczxnl',
]);

// Or maybe some of our persons are doctors or professors
const genFullNamePrefixed: Gen<string> = pipe(
  gen.bindTo('prefix')(oneOf([gen.of('Dr. '), gen.of('Prof. '), gen.of('')])),
  gen.bind('name', () => genFullName),
  gen.map((_) => `${_.prefix}${_.name}`)
);

// And so on :)
assert.deepStrictEqual(pipe(genFullNamePrefixed, generateSample({ seed })), [
  'Prof. V Fi',
  'Dr. B Sajeb',
  'P Auknubf',
  'L Lflqqfehcu',
  'Prof. Omtlsugmb Aftv',
  'E Agkvztgjgld',
  'Wxtw Mbfmg',
  'Prof. Nebmgcjzo Xikyzqsf',
  'Dr. Nftsitdiv Hxkhkr',
  'Dr. Rdabhczxnl Knmejjelt',
]);
