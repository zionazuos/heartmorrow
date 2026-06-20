import type { MessageKey } from './en';

/**
 * Brazilian Portuguese catalogue. Typed as a full `Record<MessageKey, string>`
 * so TypeScript fails the build if a key from `en` is missing here.
 */
export const ptBR: Record<MessageKey, string> = {
  // --- App shell / navigation ---------------------------------------------
  'nav.home': 'Início',
  'nav.people': 'Pessoas',
  'nav.world': 'Mundo',
  'nav.date': 'Encontro',
  'nav.phone': 'Celular',
  'nav.settings': 'Ajustes',
  'nav.switchWorld': 'Trocar de mundo',
  'nav.worldsShort': 'Mundos',
  'nav.debug': 'Depuração',
  'app.dateInProgress.title': 'Em um encontro com {name}',
  'app.dateInProgress.label': 'Encontro em andamento com {name}',

  // --- Settings → Language -------------------------------------------------
  'settings.language.kicker': 'Exibição',
  'settings.language.title': 'Idioma',
  'settings.language.lede':
    'Escolha o idioma da interface. Observação: os personagens falam o idioma com que a sua LLM é instruída — este ajuste traduz apenas os textos do próprio app.',
  'settings.language.label': 'Idioma da interface',
};
