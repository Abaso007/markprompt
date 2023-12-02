/* eslint-disable @typescript-eslint/no-explicit-any */
import { describe, expect, it } from 'vitest';

import {
  arrayEquals,
  extractGithubRepo,
  removeConsecutiveDuplicates,
  removeSchema,
  safeParseInt,
  safeParseIntOrUndefined,
  safeParseJSON,
} from './utils.nodeps';

const customComparison = (obj1: any, obj2: any): boolean => {
  return obj1.id === obj2.id;
};

describe('utils.nodeps', () => {
  describe('arrayEquals', () => {
    it('should return true for equal arrays with default comparison', () => {
      const arr1 = [1, 2, 3];
      const arr2 = [1, 2, 3];
      const result = arrayEquals(arr1, arr2);
      expect(result).toBe(true);
    });
    it('should return false for arrays with different lengths', () => {
      const arr1 = [1, 2, 3];
      const arr2 = [1, 2];
      const result = arrayEquals(arr1, arr2);
      expect(result).toBe(false);
    });
    it('should return true for equal arrays with custom comparison', () => {
      const arr1 = [{ id: 1 }, { id: 2 }];
      const arr2 = [{ id: 2 }, { id: 1 }];
      const result = arrayEquals(arr1, arr2, customComparison);
      expect(result).toBe(true);
    });
    it('should return false for arrays with different elements', () => {
      const arr1 = [{ id: 1 }, { id: 2 }];
      const arr2 = [{ id: 2 }, { id: 3 }];
      const result = arrayEquals(arr1, arr2, customComparison);
      expect(result).toBe(false);
    });
  });

  describe('safeParseInt', () => {
    it('should parse a string into an int', () => {
      expect(safeParseInt('123', 0)).toBe(123);
      expect(safeParseInt('0123', 0)).toBe(123);
      expect(safeParseInt('2.3', 0)).toBe(2);
    });
    it('should fallback to default value when it is not a string', () => {
      expect(safeParseInt(undefined, 345)).toBe(345);
      expect(safeParseInt(null, 345)).toBe(345);
    });
    it('should callback to default value', () => {
      expect(safeParseInt('abc', 234)).toBe(234);
    });
  });

  describe('safeParseInt', () => {
    it('should parse a string into an int', () => {
      expect(safeParseInt('123', 234)).toBe(123);
      expect(safeParseInt('blabla', 234)).toBe(234);
      expect(safeParseInt(1 as any, 234)).toBe(234);
    });
  });

  describe('safeParseIntOrUndefined', () => {
    it('should parse a string into an int', () => {
      expect(safeParseIntOrUndefined('123')).toBe(123);
    });
    it('should return undefined on non-string input', () => {
      expect(safeParseIntOrUndefined(undefined)).toBe(undefined);
      expect(safeParseIntOrUndefined('blabla')).toBe(undefined);
      expect(safeParseIntOrUndefined(123 as any)).toBe(undefined);
    });
  });

  describe('safeParseJSON', () => {
    it('should parse a JSON string', () => {
      expect(safeParseJSON(1 as any, { status: 'error' })).toStrictEqual({
        status: 'error',
      });
      expect(
        safeParseJSON('{ "a": 1, "b" : { "c": "d" } }', {
          status: 'error',
        }),
      ).toStrictEqual({ a: 1, b: { c: 'd' } });
      expect(
        safeParseJSON('non-json', {
          status: 'error',
        }),
      ).toStrictEqual({ status: 'error' });
    });
  });

  describe('removeSchema', () => {
    it('should remove schema', () => {
      expect(removeSchema('https://markprompt.com')).toBe('markprompt.com');
      expect(removeSchema('ftp://example.com')).toBe('example.com');
      expect(removeSchema('http://acme.com')).toBe('acme.com');
      expect(removeSchema('globex.com')).toBe('globex.com');
    });
  });

  describe('extractGithubRepo', () => {
    it('should extract owner and repo', () => {
      expect(
        extractGithubRepo('https://github.com/motifland/markprompt'),
      ).toStrictEqual({ owner: 'motifland', repo: 'markprompt', branch: null });
    });
    it('should extract owner, repo and branch', () => {
      expect(
        extractGithubRepo('https://github.com/motifland/markprompt/tree/test'),
      ).toStrictEqual({
        owner: 'motifland',
        repo: 'markprompt',
        branch: 'test',
      });
    });
  });

  describe('removeConsecutiveDuplicates', () => {
    it('should remove return an empty array if given an empty array', () => {
      expect(removeConsecutiveDuplicates([])).toEqual([]);
    });
    it('should remove consecutive duplicates for primitive type array', () => {
      expect(
        removeConsecutiveDuplicates([1, 2, 2, 3, 2, 2, 2, 1, 1, 2]),
      ).toEqual([1, 2, 3, 2, 1, 2]);
    });
    it('should remove consecutive duplicates for primitive type array', () => {
      const A = { name: 'a', value: 1, extra: 'abc' };
      const B = { name: 'b', value: 2, extra: '123' };
      expect(
        removeConsecutiveDuplicates(
          [A, A, B, A, B, B],
          (e1, e2) => e1.name === e2.name && e1.value === e2.value,
        ),
      ).toStrictEqual([A, B, A, B]);
    });
  });
});
