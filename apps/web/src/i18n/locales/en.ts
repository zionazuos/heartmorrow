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
  'common.back': 'Back',
  'common.continue': 'Continue',
  'common.you': 'You',
  'common.new': 'New',
  'common.edit': 'Edit',
  'common.delete': 'Delete',
  'common.duplicate': 'Duplicate',

  // --- People (characters list) -------------------------------------------
  'people.head.kicker': 'The Almanac · Cast',
  'people.head.title': 'People',
  'people.head.lede': 'The hearts you keep close — every face you can call on for a date.',
  'people.empty.title': 'No one in your life yet',
  'people.empty.createLede': 'Bring someone into being to start dating.',
  'people.empty.createBtn': 'Create your first character',
  'people.empty.playLede': 'Switch to Creator mode (Phone → Settings) to add characters.',
  'people.soulsOne': 'soul in your almanac',
  'people.soulsMany': 'souls in your almanac',
  'people.inMemoriam': 'In memoriam',
  'people.noDesc': 'No description yet.',
  'people.remember': 'Remember',
  'people.date': 'Date',
  'people.unassigned.kicker': 'Not in any world',
  'people.unassigned.title': 'Unassigned characters',
  'people.unassigned.lede': "These belong to no world, so they don't show in any roster.",
  'people.unassigned.place': ' Place one into {world} to start dating them.',
  'people.unassigned.placeNoWorld': ' Enter a world to place them.',
  'people.moveTo': 'Move to {world}',
  'people.worldFallback': 'world',
  'people.delete.title': 'Delete {name}?',
  'people.delete.body': "This removes their memories and your relationship too. This can't be undone.",

  // --- World selector ------------------------------------------------------
  'world.select.eyebrow': 'A lamplit almanac of the heart',
  'world.select.title': 'Choose a world',
  'world.select.sub':
    'Each world is its own story — its own people, its own calendar, its own you. Step into one to begin, and come back here any time to switch.',
  'world.select.newTitle': 'Start a new world',
  'world.select.newSub': 'Set up a fresh story and persona',
  'world.select.empty': 'Your almanac is empty. Start your first world above to begin.',
  'world.delete.kicker': 'Delete world',
  'world.delete.title': 'Delete {name}?',
  'world.delete.body':
    'This permanently removes the world and everything in it — its people, your relationships, money, messages, and history. This cannot be undone.',
  'world.delete.confirm': 'Delete forever',
  'world.card.current': 'Currently playing',
  'world.card.day': 'Day',
  'world.card.people': 'People',
  'world.card.inCircle': 'in your circle',
  'world.card.phone': 'Phone',
  'world.card.unread': 'unread',
  'world.card.continue': 'Continue',
  'world.card.enter': 'Enter',
  'world.card.deleteWorld': 'Delete world',

  // --- New-world onboarding ------------------------------------------------
  'world.onb.stepLabel': 'New world · step {step} of 4',
  'world.onb.welcomeTitle': 'Welcome to {name}',
  'world.onb.yourWorldFallback': 'your world',
  'world.onb.step1Title': 'Set the scene',
  'world.onb.step2Title': 'Who are you here?',
  'world.onb.step3Title': 'Bring people in',
  'world.onb.step4Title': 'How it works',
  'world.onb.errNameRequired': 'Give your world a name to continue.',
  'world.onb.errChooseSource': 'Choose a world to start from.',
  'world.onb.modeFreshTitle': 'A fresh world',
  'world.onb.modeFreshSub': 'Start from a blank page',
  'world.onb.modeCloneTitle': 'Start from a save',
  'world.onb.modeCloneSub': 'Copy an existing world & its cast',
  'world.onb.cloneFlavor':
    'Pick a world to copy. Its setting, lore, and the people in it are duplicated into a brand-new save — your money, relationships, and history start fresh.',
  'world.onb.cloneNameLabel': 'Name your new save',
  'world.onb.cloneNamePlaceholder': 'e.g. The Lumen Quarter — take two',
  'world.onb.blankFlavor':
    'A world is the stage your story plays out on — a town, a season, a mood. You can flesh out its lore, locations, and people later; for now, just give it a name and a feeling.',
  'world.onb.nameLabel': 'World name',
  'world.onb.namePlaceholder': 'e.g. The Lumen Quarter',
  'world.onb.summaryLabel': 'A one-line summary',
  'world.onb.summaryHint': 'Optional — what kind of place is this?',
  'world.onb.summaryPlaceholder': 'A cozy arts district where neighbors become something more.',
  'world.onb.toneLabel': 'Tone',
  'world.onb.toneHint': 'Optional — the emotional key of the story.',
  'world.onb.tonePlaceholder': 'Warm, hopeful, character-driven romance.',
  'world.onb.creating': 'Creating…',
  'world.onb.personaFlavor':
    'This is a fresh start — a separate you, with your own money, keepsakes, and history in this world. Tell us who you are here.',
  'world.onb.yourName': 'Your name',
  'world.onb.yourNamePlaceholder': 'What should people call you?',
  'world.onb.pronouns': 'Pronouns',
  'world.onb.gender': 'Gender',
  'world.onb.genderHint': 'Separate from pronouns.',
  'world.onb.sexuality': 'Sexuality',
  'world.onb.sexualityHint': 'Decides which characters a romance can deepen with. Leave unspecified to date freely.',
  'world.onb.aboutYou': 'A little about you',
  'world.onb.aboutYouHint': 'Optional — a sentence or two the people you date will sense about you.',
  'world.onb.aboutYouPlaceholder': 'A sound engineer who just moved to town. A good listener; bad at sitting still.',
  'world.onb.importFlavor':
    "Know someone from another world you'd like to meet again? Copy them in as a fresh face — a new beginning, no history carried over. Skip this and your world stays as it is.",
  'world.onb.importEmpty':
    "You don't have anyone in other worlds to import yet. Skip ahead — you can always create people once you're in.",
  'world.onb.importFrom': 'From {world}',
  'world.onb.anotherWorld': 'Another world',
  'world.onb.importing': 'Importing…',
  'world.onb.importContinue': 'Import {count} & continue',
  'world.onb.skip': 'Skip',
  'world.onb.welcomeFlavor': 'The lamps are lit, {persona}. {summary} Here’s the shape of a day before you step in:',
  'world.onb.defaultSummary': 'A new chapter is yours to write.',
  'world.onb.howto.dates': 'Spend your days meeting people — dates and shared activities each cost a little energy.',
  'world.onb.howto.people':
    'Talk, and they remember. Relationships warm or cool over time, and drift if you neglect them.',
  'world.onb.howto.phone': 'Your phone holds texts, mail, and a living social feed that keeps moving as the days pass.',
  'world.onb.howto.shop': 'Buy gifts and keepsakes from the shop — your money and bag are yours alone in this world.',
  'world.onb.howto.recap':
    'When your energy is spent, end the day to rest, advance time, and see what happened around town.',
  'world.onb.howto.worlds':
    'Switch worlds any time from the selector — each one is a completely separate story and save.',
  'world.onb.meetHead': 'The people you could meet',
  'world.onb.blankCast': 'This world is a blank page — no one lives here yet. ',
  'world.onb.blankCastCreator': 'Once you step inside, head to People to create the characters who call it home.',
  'world.onb.blankCastPlay': 'Turn on Creator mode in the phone’s Settings to populate it with people to meet.',
  'world.onb.enter': 'Enter {name}',

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
