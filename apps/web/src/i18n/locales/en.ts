/**
 * English message catalogue — the SOURCE of truth for the UI text.
 *
 * Keys are flat, dot-namespaced strings (e.g. `nav.home`). Values may contain
 * `{placeholder}` tokens that are filled in at render time via `t(key, params)`.
 *
 * To add a string: add it here first, then add the same key to every other
 * locale (TypeScript will flag any locale that is missing a key). To translate
 * a screen, replace its hardcoded text with `t('some.key')` and add the keys.
 */
export const en = {
  // --- App shell / navigation ---------------------------------------------
  'nav.home': 'Home',
  'nav.people': 'People',
  'nav.world': 'World',
  'nav.date': 'Date',
  'nav.phone': 'Phone',
  'nav.settings': 'Settings',
  'nav.switchWorld': 'Switch world',
  'nav.worldsShort': 'Worlds',
  'nav.debug': 'Debug',
  'app.dateInProgress.title': 'On a date with {name}',
  'app.dateInProgress.label': 'Date in progress with {name}',

  // --- Settings → Language -------------------------------------------------
  'settings.language.kicker': 'Display',
  'settings.language.title': 'Language',
  'settings.language.lede':
    'Choose the interface language. Note: characters speak whatever language your LLM is prompted in — this setting only translates the app’s own text.',
  'settings.language.label': 'Interface language',
} as const;

/** A union of every valid message key — used to type `t()` and the locales. */
export type MessageKey = keyof typeof en;
