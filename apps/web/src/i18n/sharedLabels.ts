import type { TFunc } from './index';
import type { MessageKey } from './locales/en';

/**
 * Translation helpers for the enum label maps that live in `@dsim/shared`
 * (GENDER_LABELS, RELATIONSHIP_STAT_LABELS, SEASONS, …). Those stay English in
 * the shared package because the SERVER feeds them to the LLM; here we map the
 * same enum keys onto the UI's `vocab.*` catalogue so the display is localized.
 *
 * Each helper takes the enum value/key (as the shared maps use it) and returns
 * the translated label; an unknown key falls back to English (then the key
 * itself) via the t() lookup, so a new enum value never renders blank.
 */
const key = (group: string, value: string) => `vocab.${group}.${value}` as MessageKey;

export const genderLabel = (t: TFunc, v: string) => t(key('gender', v));
export const sexualityLabel = (t: TFunc, v: string) => t(key('sexuality', v));
export const relStyleLabel = (t: TFunc, v: string) => t(key('relStyle', v));
export const linkLabel = (t: TFunc, v: string) => t(key('link', v));
export const statusLabel = (t: TFunc, v: string) => t(key('status', v));
export const datingStatLabel = (t: TFunc, v: string) => t(key('datingStat', v));
export const relStatLabel = (t: TFunc, v: string) => t(key('relStat', v));
export const phaseLabel = (t: TFunc, v: string) => t(key('phase', v));
export const weatherLabel = (t: TFunc, v: string) => t(key('weather', v));
export const sectorLabel = (t: TFunc, v: string) => t(key('sector', v));
export const propCatLabel = (t: TFunc, v: string) => t(key('propCat', v));
export const cadenceLabel = (t: TFunc, v: string) => t(key('cadence', v));
export const cadencePer = (t: TFunc, v: string) => t(key('cadencePer', v));
export const intentLabel = (t: TFunc, v: string) => t(key('intent', v));
export const seasonLabel = (t: TFunc, v: string) => t(key('season', v));
export const dayLabel = (t: TFunc, v: string) => t(key('day', v));
