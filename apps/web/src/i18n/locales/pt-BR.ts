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

  // --- Dashboard (Home) ----------------------------------------------------
  'dash.hero.eyebrow': 'Um almanaque do coração à luz de lampião',
  'dash.greeting.morning': 'Bom dia',
  'dash.greeting.afternoon': 'Boa tarde',
  'dash.greeting.evening': 'Boa noite',
  'dash.greeting.night': 'Ainda acordado',
  'dash.greeting.fallback': 'Bem-vindo de volta',
  'dash.line.morning': 'Um novo dia começa. Com quem você vai passá-lo?',
  'dash.line.afternoon': 'A tarde é sua — reserve um tempinho para alguém.',
  'dash.line.evening': 'As luzes estão acesas. Uma boa hora para um encontro.',
  'dash.line.night': 'A noite está tranquila. Mande uma mensagem ou descanse até amanhã.',
  'dash.line.fallback': 'Escolha alguém e veja aonde a noite leva.',
  'dash.hud.status': 'Status do almanaque',
  'dash.hud.world': 'Mundo',
  'dash.hud.dayHour': 'Dia · Hora',
  'dash.hud.day': 'Dia {day}',
  'dash.hud.calendar': 'Calendário',
  'dash.hud.weekend': 'fim de semana',
  'dash.hud.energy': 'Energia',
  'dash.hud.energyTitle': '{value}/{max} de energia',
  'dash.circle.kicker': 'Seu círculo',
  'dash.circle.title': 'Pessoas na sua vida',
  'dash.circle.seeEveryone': 'Ver todos',
  'dash.empty.title': 'Ninguém por aqui ainda',
  'dash.empty.createLede': 'Crie alguém para começar a sua história.',
  'dash.empty.createBtn': 'Criar um personagem',
  'dash.empty.playLede': 'Mude para o modo Criador nos Ajustes do celular para adicionar pessoas.',
  'dash.people.newCharacter': 'Novo personagem',
  'dash.people.new': 'Novo',
  'dash.people.morePrefixOne': 'Há mais {count} pessoa disponível — vá para a ',
  'dash.people.morePrefixMany': 'Há mais {count} pessoas disponíveis — vá para a ',
  'dash.people.dateTabLink': 'aba Encontro',
  'dash.people.moreSuffix': ' para ver a lista completa.',
  'dash.quick.kicker': 'Acesso rápido',
  'dash.quick.title': 'Para onde hoje à noite?',
  'dash.tile.date.title': 'Encontro',
  'dash.tile.date.desc': 'Passe uma noite com alguém.',
  'dash.tile.phone.title': 'Celular',
  'dash.tile.phone.desc': 'Mensagens, e-mails, presentes e lembranças.',
  'dash.tile.people.title': 'Pessoas',
  'dash.tile.people.desc': 'Todo mundo que você conhece.',
  'dash.tile.settings.title': 'Ajustes',
  'dash.tile.settings.desc': 'Sua persona e preferências.',

  // --- Settings → Language -------------------------------------------------
  'settings.language.kicker': 'Exibição',
  'settings.language.title': 'Idioma',
  'settings.language.lede':
    'Escolha o idioma da interface. Observação: os personagens falam o idioma com que a sua LLM é instruída — este ajuste traduz apenas os textos do próprio app.',
  'settings.language.label': 'Idioma da interface',
};
