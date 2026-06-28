/** 设计规范预览：逐项流式揭示队列 */

import { SHADOW_FIELDS, THEME_COLOR_FIELDS, FUNCTIONAL_COLOR_TYPES, FUNCTIONAL_COLOR_FIELDS, AUXILIARY_COLOR_FIELDS, NEUTRAL_COLOR_FIELDS } from './semanticDesignSpec.js';

export const SPEC_REVEAL_INTERVAL_MS = 90;

export function buildSpecRevealQueue(spec) {
  if (!spec) return [];

  const keys = [];
  if (spec.name) keys.push('header:name');
  if (spec.description) keys.push('header:desc');

  THEME_COLOR_FIELDS.forEach((field) => {
    if (spec.theme?.[field.key]) keys.push(`theme:${field.key}`);
  });

  FUNCTIONAL_COLOR_TYPES.forEach((type) => {
    FUNCTIONAL_COLOR_FIELDS.forEach((field) => {
      if (spec.functional?.[type.key]?.[field.key]) {
        keys.push(`functional:${type.key}:${field.key}`);
      }
    });
  });

  AUXILIARY_COLOR_FIELDS.forEach((field) => {
    if (spec.auxiliary?.[field.key]) keys.push(`auxiliary:${field.key}`);
  });

  NEUTRAL_COLOR_FIELDS.forEach((field) => {
    if (spec.neutral?.light?.[field.key]) keys.push(`neutral:light:${field.key}`);
  });

  NEUTRAL_COLOR_FIELDS.forEach((field) => {
    if (spec.neutral?.dark?.[field.key]) keys.push(`neutral:dark:${field.key}`);
  });

  SHADOW_FIELDS.forEach((field) => {
    if (spec.shadows?.[field.key]) keys.push(`shadow:${field.key}`);
  });

  (spec.strokes || []).forEach((stroke) => keys.push(`stroke:${stroke.key}`));
  (spec.spacing || []).forEach((space) => keys.push(`spacing:${space.key}`));
  (spec.radius || []).forEach((radius) => keys.push(`radius:${radius.key}`));
  (spec.typography || []).forEach((_, idx) => keys.push(`typography:${idx}`));

  return keys;
}
