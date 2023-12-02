// Browser-dependent utilities. Cannot run on edge runtimes.
import { stringify } from 'json5';
import {
  filter,
  isArray,
  isEmpty,
  isNull,
  isPlainObject,
  isString,
  isUndefined,
  map,
  mapValues,
  pickBy,
} from 'lodash-es';

import { Json } from '@/types/supabase';
import { MarkpromptConfig } from '@/types/types';

import { DEFAULT_MARKPROMPT_CONFIG } from './constants';
import { parse } from './schema';

export const getMarkpromptConfigOrDefault = (
  markpromptConfig: Json | undefined,
): MarkpromptConfig => {
  return (markpromptConfig ||
    parse(DEFAULT_MARKPROMPT_CONFIG)) as MarkpromptConfig;
};

export const propsObjectToJSXPropsString = (props: any): string | undefined => {
  const propStrings = [];

  if (!isPlainObject(props)) {
    return undefined;
  }

  if (isEmpty(props)) {
    return undefined;
  }

  for (const key of Object.keys(props)) {
    const propValue = props[key];
    let propString;
    if (isString(propValue)) {
      propString = `${key}="${propValue}"`;
    } else {
      propString = `${key}={${stringify(propValue, null, 2)}}`;
    }
    propStrings.push(propString);
  }

  return propStrings.join('\n');
};

export function pruneEmpty(object: any) {
  if (isString(object)) {
    return _sanitizeString(object);
  }
  if (isArray(object)) {
    return _sanitizeArray(object);
  }
  if (isPlainObject(object)) {
    return _sanitizeObject(object);
  }
  return object;
}

const _sanitizeString = (string: any): any => {
  return isEmpty(string) ? null : string;
};

const _sanitizeArray = (array: any): any => {
  return filter(map(array, pruneEmpty), _isProvided);
};

const _sanitizeObject = (object: any): any => {
  return pickBy(mapValues(object, pruneEmpty), _isProvided);
};

const _isProvided = (value: any): any => {
  const typeIsNotSupported =
    !isNull(value) &&
    !isUndefined(value) &&
    !isString(value) &&
    !isArray(value) &&
    !isPlainObject(value);
  return typeIsNotSupported || !isEmpty(value);
};
