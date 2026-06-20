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

  // --- Dashboard (Home) ----------------------------------------------------
  'dash.hero.eyebrow': 'A lamplit almanac of the heart',
  'dash.greeting.morning': 'Good morning',
  'dash.greeting.afternoon': 'Good afternoon',
  'dash.greeting.evening': 'Good evening',
  'dash.greeting.night': 'Still up',
  'dash.greeting.fallback': 'Welcome back',
  'dash.line.morning': 'A fresh day is open. Who will you spend it with?',
  'dash.line.afternoon': 'The afternoon is yours — make a little time for someone.',
  'dash.line.evening': 'The lamps are lit. A fine hour for a date.',
  'dash.line.night': 'The night is quiet. Send a text, or rest until tomorrow.',
  'dash.line.fallback': 'Pick someone, and see where the evening goes.',
  'dash.hud.status': 'Almanac status',
  'dash.hud.world': 'World',
  'dash.hud.dayHour': 'Day · Hour',
  'dash.hud.day': 'Day {day}',
  'dash.hud.calendar': 'Calendar',
  'dash.hud.weekend': 'weekend',
  'dash.hud.energy': 'Energy',
  'dash.hud.energyTitle': '{value}/{max} energy',
  'dash.circle.kicker': 'Your circle',
  'dash.circle.title': 'People in your life',
  'dash.circle.seeEveryone': 'See everyone',
  'dash.empty.title': 'No one here yet',
  'dash.empty.createLede': 'Create someone to begin your story.',
  'dash.empty.createBtn': 'Create a character',
  'dash.empty.playLede': "Switch to Creator mode in the phone's Settings to add people.",
  'dash.people.newCharacter': 'New character',
  'dash.people.new': 'New',
  'dash.people.morePrefixOne': 'There is {count} more person available — head to the ',
  'dash.people.morePrefixMany': 'There are {count} more people available — head to the ',
  'dash.people.dateTabLink': 'Date tab',
  'dash.people.moreSuffix': ' to see the full list.',
  'dash.quick.kicker': 'Quick launch',
  'dash.quick.title': 'Where to tonight?',
  'dash.tile.date.title': 'Date',
  'dash.tile.date.desc': 'Spend an evening with someone.',
  'dash.tile.phone.title': 'Phone',
  'dash.tile.phone.desc': 'Messages, mail, gifts, and keepsakes.',
  'dash.tile.people.title': 'People',
  'dash.tile.people.desc': 'Everyone you know.',
  'dash.tile.settings.title': 'Settings',
  'dash.tile.settings.desc': 'Your persona and preferences.',

  // --- Settings → Language -------------------------------------------------
  'settings.language.kicker': 'Display',
  'settings.language.title': 'Language',
  'settings.language.lede':
    'Choose the interface language. Note: characters speak whatever language your LLM is prompted in — this setting only translates the app’s own text.',
  'settings.language.label': 'Interface language',
} as const;

/** A union of every valid message key — used to type `t()` and the locales. */
export type MessageKey = keyof typeof en;
