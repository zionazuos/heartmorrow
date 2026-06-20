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

  // --- Shared / reused labels ---------------------------------------------
  'common.cancel': 'Cancel',
  'common.saving': 'Saving…',
  'common.off': 'Off',
  'common.enabling': 'Enabling…',

  // --- Settings → Language -------------------------------------------------
  'settings.language.kicker': 'Display',
  'settings.language.title': 'Language',
  'settings.language.lede':
    'Choose the interface language. Note: characters speak whatever language your LLM is prompted in — this setting only translates the app’s own text.',
  'settings.language.label': 'Interface language',

  // --- Settings → page head ------------------------------------------------
  'settings.head.kicker': 'The control desk',
  'settings.head.title': 'Settings',
  'settings.head.lede':
    'Configure your local OpenAI-compatible endpoint (LM Studio, Ollama, llama.cpp, …). The browser never calls the model directly — the local server does.',
  'settings.saved': 'Settings saved.',

  // --- Settings → Mode -----------------------------------------------------
  'settings.mode.kicker': 'How you play',
  'settings.mode.title': 'Mode',
  'settings.mode.playStrong': 'Play mode',
  'settings.mode.creatorStrong': 'Creator mode',
  'settings.mode.ledeSuffix': ' Also in Phone → Settings.',
  'settings.mode.playDesc': ' hides creation/editing tools (no deleting characters mid-game). ',
  'settings.mode.creatorDesc': ' shows them.',
  'settings.mode.playBtn': 'Play mode',
  'settings.mode.creatorBtn': 'Creator mode',

  // --- Settings → Adult content (NSFW) ------------------------------------
  'settings.nsfw.kicker': 'Maturity',
  'settings.nsfw.title': 'Adult content (NSFW)',
  'settings.nsfw.lede':
    'When enabled, the model may generate mature/explicit content during dates — but only once your relationship with a character is advanced enough. Propositioning a stranger or acquaintance will still make them walk out.',
  'settings.nsfw.on': 'Adult content ON',
  'settings.nsfw.disable': 'Disable',
  'settings.nsfw.enable': 'Enable adult content…',
  'settings.nsfw.hint':
    'Best paired with an abliterated / “uncensored” model. A censored or safety-tuned model may still refuse explicit content even with this toggle on.',

  // --- Settings → Tragic outcomes -----------------------------------------
  'settings.tragic.kicker': 'Heavy themes',
  'settings.tragic.title': 'Tragic outcomes (self-harm)',
  'settings.tragic.lede':
    'When enabled, sustained, severe mistreatment of someone who loved you (repeated heartbreak, cheating, cruelty) can spiral — with many clear warnings and chances to stop — into a character taking their own life, permanently memorializing them. The act is never depicted. Leaving them be or treating them kindly always pulls them back. Off by default.',
  'settings.tragic.on': 'Tragic outcomes ON',
  'settings.tragic.disable': 'Disable',
  'settings.tragic.enable': 'Enable tragic outcomes…',

  // --- Settings → Your persona --------------------------------------------
  'settings.persona.kicker': 'Who you are',
  'settings.persona.title': 'Your persona',
  'settings.persona.lede':
    'How characters see you — your name, pronouns, and notes are shared with everyone you meet.',
  'settings.persona.name': 'Your name',
  'settings.persona.pronouns': 'Your pronouns',
  'settings.persona.gender': 'Your gender',
  'settings.persona.genderHint': 'Separate from pronouns.',
  'settings.persona.sexuality': 'Your sexuality',
  'settings.persona.sexualityHint': 'Decides which characters a romance can deepen with.',
  'settings.persona.notes': 'Persona notes',
  'settings.persona.notesHint': 'Optional — anything you want characters to know about you.',
  'settings.persona.save': 'Save persona',
  'settings.persona.saved': 'Saved ✓',

  // --- Settings → Connection console --------------------------------------
  'settings.console.sub': 'Local model link',
  'settings.console.title': 'Connection console',
  'settings.console.endpointSet': 'Endpoint set',
  'settings.console.noEndpoint': 'No endpoint',
  'settings.console.connection': 'Connection',
  'settings.console.baseUrl': 'Base URL',
  'settings.console.baseUrlHint': 'e.g. http://localhost:1234/v1',
  'settings.console.apiKey': 'API key',
  'settings.console.apiKeySetHint': 'A key is set. Leave blank to keep it.',
  'settings.console.apiKeyHint': 'Optional for local servers.',
  'settings.console.apiKeySetPlaceholder': '•••••••• (unchanged)',
  'settings.console.apiKeyPlaceholder': 'optional',
  'settings.console.model': 'Model',
  'settings.console.visionModel': 'Vision model',
  'settings.console.visionModelHint':
    'Optional — used for image-based generation (e.g. drafting a character from a portrait). Leave blank to reuse the model above.',
  'settings.console.visionModelPlaceholder': '(same as model)',
  'settings.console.loadModels': 'Load models from /v1/models',
  'settings.console.loadingModels': 'Loading…',
  'settings.console.generation': 'Generation',
  'settings.console.temperature': 'Temperature: {value}',
  'settings.console.maxTokens': 'Max tokens',
  'settings.console.structuredMode': 'Structured output mode',
  'settings.console.structuredModeHint': 'json_object works with most local servers.',
  'settings.console.omitSchema': 'Drop schema from prompt',
  'settings.console.omitSchemaHint':
    'Perf test for json_schema mode only: the grammar already enforces the shape, so the duplicated schema text in the prompt is redundant. Skipping it shrinks the prompt (faster prefill). No effect in json_object / prompt_only.',
  'settings.console.omitSchemaLabel': 'Skip the duplicate schema text (json_schema mode)',
  'settings.console.endpointMode': 'Endpoint mode',
  'settings.console.endpointModeHint': 'responses is reserved for future use.',
  'settings.console.retryLimit': 'Structured retry limit',
  'settings.console.retryLimitHint': 'Retries after a malformed/invalid structured response.',
  'settings.console.cadence': 'Live date feedback',
  'settings.console.cadenceHint':
    "How often a date reads how your last message landed (updates the vibe + their expression). 'Every message' is most responsive; 'periodic' keeps replies snappier with one fewer model call per turn.",
  'settings.console.cadenceEvery': 'Every message',
  'settings.console.cadencePeriodic': 'Periodically (lighter)',
  'settings.console.save': 'Save settings',
  'settings.console.test': 'Test connection',
  'settings.console.testing': 'Testing…',

  // --- Settings → Health banner -------------------------------------------
  'settings.health.connected': 'Connected!',
  'settings.health.failed': 'Failed.',
  'settings.health.sample': 'Sample reply: ',
  'settings.health.models': 'Models: ',

  // --- Settings → NSFW confirmation modal ---------------------------------
  'settings.nsfwModal.kicker': 'Please confirm',
  'settings.nsfwModal.title': 'Enable adult (NSFW) content',
  'settings.nsfwModal.intro':
    'This is a private, local, single-user game. Content is generated by your own local model and never leaves your machine. To continue, please confirm both of the following:',
  'settings.nsfwModal.ackContent':
    'I understand that with adult content enabled, the local model may generate explicit, sexual, or otherwise inappropriate material, and that DSim does not filter or guarantee its output.',
  'settings.nsfwModal.ackAge': 'I affirm that I am of legal age to view adult content in my jurisdiction.',
  'settings.nsfwModal.hint':
    'Best paired with an abliterated / “uncensored” model — a censored model may still refuse even with this on. Adult content is only ever generated once your relationship with a character is advanced enough; propositioning a stranger or acquaintance will still make them walk out.',
  'settings.nsfwModal.confirm': 'Enable adult content',

  // --- Settings → Tragic confirmation modal -------------------------------
  'settings.tragicModal.kicker': 'Please read carefully',
  'settings.tragicModal.title': 'Enable tragic outcomes',
  'settings.tragicModal.intro':
    'This adds a heavy, optional consequence: if you repeatedly and severely mistreat a character who became deeply attached to you — and ignore the escalating warnings, including a worried friend reaching out — they may take their own life and be permanently memorialized. The act itself is never shown. Being kind, giving them space, or simply stopping always pulls them back from it.',
  'settings.tragicModal.ack':
    'I understand this content deals with suicide as a consequence of in-game abuse, and I want it enabled. I can turn it off at any time.',
  'settings.tragicModal.confirm': 'Enable tragic outcomes',
} as const;

/** A union of every valid message key — used to type `t()` and the locales. */
export type MessageKey = keyof typeof en;
