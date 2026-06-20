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

  // --- Shared / reused labels ---------------------------------------------
  'common.cancel': 'Cancelar',
  'common.saving': 'Salvando…',
  'common.off': 'Desligado',
  'common.enabling': 'Ativando…',
  'common.back': 'Voltar',
  'common.continue': 'Continuar',
  'common.you': 'Você',

  // --- World selector ------------------------------------------------------
  'world.select.eyebrow': 'Um almanaque do coração à luz de lampião',
  'world.select.title': 'Escolha um mundo',
  'world.select.sub':
    'Cada mundo é a sua própria história — suas próprias pessoas, seu próprio calendário, o seu próprio eu. Entre em um para começar e volte aqui quando quiser para trocar.',
  'world.select.newTitle': 'Começar um novo mundo',
  'world.select.newSub': 'Monte uma nova história e persona',
  'world.select.empty': 'Seu almanaque está vazio. Comece o seu primeiro mundo acima.',
  'world.delete.kicker': 'Excluir mundo',
  'world.delete.title': 'Excluir {name}?',
  'world.delete.body':
    'Isto remove permanentemente o mundo e tudo nele — suas pessoas, seus relacionamentos, dinheiro, mensagens e histórico. Não pode ser desfeito.',
  'world.delete.confirm': 'Excluir para sempre',
  'world.card.current': 'Jogando agora',
  'world.card.day': 'Dia',
  'world.card.people': 'Pessoas',
  'world.card.inCircle': 'no seu círculo',
  'world.card.phone': 'Celular',
  'world.card.unread': 'não lidas',
  'world.card.continue': 'Continuar',
  'world.card.enter': 'Entrar',
  'world.card.deleteWorld': 'Excluir mundo',

  // --- New-world onboarding ------------------------------------------------
  'world.onb.stepLabel': 'Novo mundo · passo {step} de 4',
  'world.onb.welcomeTitle': 'Bem-vindo a {name}',
  'world.onb.yourWorldFallback': 'seu mundo',
  'world.onb.step1Title': 'Defina o cenário',
  'world.onb.step2Title': 'Quem é você aqui?',
  'world.onb.step3Title': 'Traga pessoas',
  'world.onb.step4Title': 'Como funciona',
  'world.onb.errNameRequired': 'Dê um nome ao seu mundo para continuar.',
  'world.onb.errChooseSource': 'Escolha um mundo de partida.',
  'world.onb.modeFreshTitle': 'Um mundo novo',
  'world.onb.modeFreshSub': 'Comece de uma página em branco',
  'world.onb.modeCloneTitle': 'Começar de um save',
  'world.onb.modeCloneSub': 'Copie um mundo existente e seu elenco',
  'world.onb.cloneFlavor':
    'Escolha um mundo para copiar. Seu cenário, história e as pessoas nele são duplicados em um save novinho — seu dinheiro, relacionamentos e histórico começam do zero.',
  'world.onb.cloneNameLabel': 'Dê um nome ao seu novo save',
  'world.onb.cloneNamePlaceholder': 'ex.: O Bairro Lúmen — segunda tentativa',
  'world.onb.blankFlavor':
    'Um mundo é o palco onde a sua história acontece — uma cidade, uma estação, um clima. Você pode detalhar sua história, locais e pessoas depois; por ora, só dê um nome e um sentimento a ele.',
  'world.onb.nameLabel': 'Nome do mundo',
  'world.onb.namePlaceholder': 'ex.: O Bairro Lúmen',
  'world.onb.summaryLabel': 'Um resumo de uma linha',
  'world.onb.summaryHint': 'Opcional — que tipo de lugar é este?',
  'world.onb.summaryPlaceholder': 'Um aconchegante distrito das artes onde vizinhos viram algo mais.',
  'world.onb.toneLabel': 'Tom',
  'world.onb.toneHint': 'Opcional — a chave emocional da história.',
  'world.onb.tonePlaceholder': 'Romance caloroso, esperançoso, guiado pelos personagens.',
  'world.onb.creating': 'Criando…',
  'world.onb.personaFlavor':
    'Este é um recomeço — um você à parte, com seu próprio dinheiro, lembranças e histórico neste mundo. Conte quem você é aqui.',
  'world.onb.yourName': 'Seu nome',
  'world.onb.yourNamePlaceholder': 'Como as pessoas devem te chamar?',
  'world.onb.pronouns': 'Pronomes',
  'world.onb.gender': 'Gênero',
  'world.onb.genderHint': 'Separado dos pronomes.',
  'world.onb.sexuality': 'Sexualidade',
  'world.onb.sexualityHint':
    'Define com quais personagens um romance pode se aprofundar. Deixe sem especificar para namorar livremente.',
  'world.onb.aboutYou': 'Um pouco sobre você',
  'world.onb.aboutYouHint': 'Opcional — uma ou duas frases que as pessoas com quem você sair vão perceber sobre você.',
  'world.onb.aboutYouPlaceholder':
    'Um engenheiro de som que acabou de se mudar para a cidade. Bom ouvinte; péssimo em ficar parado.',
  'world.onb.importFlavor':
    'Conhece alguém de outro mundo que gostaria de reencontrar? Copie-o como um rosto novo — um recomeço, sem histórico anterior. Pule isto e o seu mundo permanece como está.',
  'world.onb.importEmpty':
    'Você ainda não tem ninguém em outros mundos para importar. Avance — você sempre pode criar pessoas depois de entrar.',
  'world.onb.importFrom': 'De {world}',
  'world.onb.anotherWorld': 'Outro mundo',
  'world.onb.importing': 'Importando…',
  'world.onb.importContinue': 'Importar {count} e continuar',
  'world.onb.skip': 'Pular',
  'world.onb.welcomeFlavor': 'As luzes estão acesas, {persona}. {summary} Veja como é um dia antes de você entrar:',
  'world.onb.defaultSummary': 'Um novo capítulo é seu para escrever.',
  'world.onb.howto.dates':
    'Passe os seus dias conhecendo pessoas — encontros e atividades em conjunto custam um pouco de energia.',
  'world.onb.howto.people':
    'Converse, e eles lembram. Os relacionamentos esquentam ou esfriam com o tempo, e se afastam se você os negligenciar.',
  'world.onb.howto.phone':
    'Seu celular guarda mensagens, e-mails e um feed social vivo que segue em movimento conforme os dias passam.',
  'world.onb.howto.shop':
    'Compre presentes e lembranças na loja — seu dinheiro e sua bolsa são só seus neste mundo.',
  'world.onb.howto.recap':
    'Quando a sua energia acabar, encerre o dia para descansar, avançar o tempo e ver o que aconteceu pela cidade.',
  'world.onb.howto.worlds':
    'Troque de mundo quando quiser pelo seletor — cada um é uma história e um save totalmente separados.',
  'world.onb.meetHead': 'As pessoas que você pode conhecer',
  'world.onb.blankCast': 'Este mundo é uma página em branco — ninguém mora aqui ainda. ',
  'world.onb.blankCastCreator': 'Assim que entrar, vá em Pessoas para criar os personagens que o chamam de lar.',
  'world.onb.blankCastPlay': 'Ative o modo Criador nos Ajustes do celular para povoá-lo com pessoas para conhecer.',
  'world.onb.enter': 'Entrar em {name}',

  // --- Settings → Language -------------------------------------------------
  'settings.language.kicker': 'Exibição',
  'settings.language.title': 'Idioma',
  'settings.language.lede':
    'Escolha o idioma da interface. Observação: os personagens falam o idioma com que a sua LLM é instruída — este ajuste traduz apenas os textos do próprio app.',
  'settings.language.label': 'Idioma da interface',

  // --- Settings → page head ------------------------------------------------
  'settings.head.kicker': 'A mesa de controle',
  'settings.head.title': 'Ajustes',
  'settings.head.lede':
    'Configure o seu endpoint local compatível com OpenAI (LM Studio, Ollama, llama.cpp, …). O navegador nunca chama o modelo diretamente — quem faz isso é o servidor local.',
  'settings.saved': 'Ajustes salvos.',

  // --- Settings → Mode -----------------------------------------------------
  'settings.mode.kicker': 'Como você joga',
  'settings.mode.title': 'Modo',
  'settings.mode.playStrong': 'Modo Jogo',
  'settings.mode.creatorStrong': 'Modo Criador',
  'settings.mode.ledeSuffix': ' Também disponível em Celular → Ajustes.',
  'settings.mode.playDesc': ' esconde as ferramentas de criação/edição (sem excluir personagens no meio do jogo). ',
  'settings.mode.creatorDesc': ' as mostra.',
  'settings.mode.playBtn': 'Modo Jogo',
  'settings.mode.creatorBtn': 'Modo Criador',

  // --- Settings → Adult content (NSFW) ------------------------------------
  'settings.nsfw.kicker': 'Maturidade',
  'settings.nsfw.title': 'Conteúdo adulto (NSFW)',
  'settings.nsfw.lede':
    'Quando ativado, o modelo pode gerar conteúdo maduro/explícito durante os encontros — mas apenas quando o seu relacionamento com o personagem estiver avançado o suficiente. Se propor algo a um estranho ou conhecido, ele ainda vai embora.',
  'settings.nsfw.on': 'Conteúdo adulto LIGADO',
  'settings.nsfw.disable': 'Desativar',
  'settings.nsfw.enable': 'Ativar conteúdo adulto…',
  'settings.nsfw.hint':
    'Funciona melhor com um modelo abliterated / “sem censura”. Um modelo censurado ou ajustado para segurança ainda pode recusar conteúdo explícito mesmo com esta opção ligada.',

  // --- Settings → Tragic outcomes -----------------------------------------
  'settings.tragic.kicker': 'Temas pesados',
  'settings.tragic.title': 'Desfechos trágicos (automutilação)',
  'settings.tragic.lede':
    'Quando ativado, o maltrato severo e prolongado de alguém que amava você (sofrimentos repetidos, traições, crueldade) pode evoluir — com muitos avisos claros e chances de parar — até um personagem tirar a própria vida, sendo memorializado permanentemente. O ato nunca é retratado. Deixá-lo em paz ou tratá-lo com gentileza sempre o traz de volta. Desligado por padrão.',
  'settings.tragic.on': 'Desfechos trágicos LIGADOS',
  'settings.tragic.disable': 'Desativar',
  'settings.tragic.enable': 'Ativar desfechos trágicos…',

  // --- Settings → Your persona --------------------------------------------
  'settings.persona.kicker': 'Quem é você',
  'settings.persona.title': 'Sua persona',
  'settings.persona.lede':
    'Como os personagens te veem — seu nome, pronomes e notas são compartilhados com todos que você conhece.',
  'settings.persona.name': 'Seu nome',
  'settings.persona.pronouns': 'Seus pronomes',
  'settings.persona.gender': 'Seu gênero',
  'settings.persona.genderHint': 'Separado dos pronomes.',
  'settings.persona.sexuality': 'Sua sexualidade',
  'settings.persona.sexualityHint': 'Define com quais personagens um romance pode se aprofundar.',
  'settings.persona.notes': 'Notas da persona',
  'settings.persona.notesHint': 'Opcional — qualquer coisa que você queira que os personagens saibam sobre você.',
  'settings.persona.save': 'Salvar persona',
  'settings.persona.saved': 'Salvo ✓',

  // --- Settings → Connection console --------------------------------------
  'settings.console.sub': 'Link com o modelo local',
  'settings.console.title': 'Console de conexão',
  'settings.console.endpointSet': 'Endpoint definido',
  'settings.console.noEndpoint': 'Sem endpoint',
  'settings.console.connection': 'Conexão',
  'settings.console.baseUrl': 'URL base',
  'settings.console.baseUrlHint': 'ex.: http://localhost:1234/v1',
  'settings.console.apiKey': 'Chave de API',
  'settings.console.apiKeySetHint': 'Uma chave está definida. Deixe em branco para mantê-la.',
  'settings.console.apiKeyHint': 'Opcional para servidores locais.',
  'settings.console.apiKeySetPlaceholder': '•••••••• (inalterada)',
  'settings.console.apiKeyPlaceholder': 'opcional',
  'settings.console.model': 'Modelo',
  'settings.console.visionModel': 'Modelo de visão',
  'settings.console.visionModelHint':
    'Opcional — usado para geração baseada em imagem (ex.: rascunhar um personagem a partir de um retrato). Deixe em branco para reutilizar o modelo acima.',
  'settings.console.visionModelPlaceholder': '(igual ao modelo)',
  'settings.console.loadModels': 'Carregar modelos de /v1/models',
  'settings.console.loadingModels': 'Carregando…',
  'settings.console.generation': 'Geração',
  'settings.console.temperature': 'Temperatura: {value}',
  'settings.console.maxTokens': 'Máx. de tokens',
  'settings.console.structuredMode': 'Modo de saída estruturada',
  'settings.console.structuredModeHint': 'json_object funciona com a maioria dos servidores locais.',
  'settings.console.omitSchema': 'Remover o schema do prompt',
  'settings.console.omitSchemaHint':
    'Teste de desempenho apenas para o modo json_schema: a gramática já impõe o formato, então o texto duplicado do schema no prompt é redundante. Removê-lo encurta o prompt (prefill mais rápido). Sem efeito em json_object / prompt_only.',
  'settings.console.omitSchemaLabel': 'Pular o texto duplicado do schema (modo json_schema)',
  'settings.console.endpointMode': 'Modo de endpoint',
  'settings.console.endpointModeHint': 'responses está reservado para uso futuro.',
  'settings.console.retryLimit': 'Limite de tentativas estruturadas',
  'settings.console.retryLimitHint': 'Tentativas após uma resposta estruturada malformada/inválida.',
  'settings.console.cadence': 'Feedback ao vivo do encontro',
  'settings.console.cadenceHint':
    "Com que frequência um encontro avalia como a sua última mensagem caiu (atualiza o clima + a expressão dele). 'Toda mensagem' é o mais responsivo; 'periodicamente' mantém as respostas mais ágeis com uma chamada a menos ao modelo por turno.",
  'settings.console.cadenceEvery': 'Toda mensagem',
  'settings.console.cadencePeriodic': 'Periodicamente (mais leve)',
  'settings.console.save': 'Salvar ajustes',
  'settings.console.test': 'Testar conexão',
  'settings.console.testing': 'Testando…',

  // --- Settings → Health banner -------------------------------------------
  'settings.health.connected': 'Conectado!',
  'settings.health.failed': 'Falhou.',
  'settings.health.sample': 'Resposta de exemplo: ',
  'settings.health.models': 'Modelos: ',

  // --- Settings → NSFW confirmation modal ---------------------------------
  'settings.nsfwModal.kicker': 'Confirme, por favor',
  'settings.nsfwModal.title': 'Ativar conteúdo adulto (NSFW)',
  'settings.nsfwModal.intro':
    'Este é um jogo privado, local e de usuário único. O conteúdo é gerado pelo seu próprio modelo local e nunca sai da sua máquina. Para continuar, confirme as duas afirmações abaixo:',
  'settings.nsfwModal.ackContent':
    'Entendo que, com o conteúdo adulto ativado, o modelo local pode gerar material explícito, sexual ou de outra forma inapropriado, e que o DSim não filtra nem garante a sua saída.',
  'settings.nsfwModal.ackAge': 'Afirmo que tenho idade legal para visualizar conteúdo adulto na minha jurisdição.',
  'settings.nsfwModal.hint':
    'Funciona melhor com um modelo abliterated / “sem censura” — um modelo censurado ainda pode recusar mesmo com isto ligado. O conteúdo adulto só é gerado quando o seu relacionamento com o personagem está avançado o suficiente; propor algo a um estranho ou conhecido ainda fará com que ele vá embora.',
  'settings.nsfwModal.confirm': 'Ativar conteúdo adulto',

  // --- Settings → Tragic confirmation modal -------------------------------
  'settings.tragicModal.kicker': 'Leia com atenção',
  'settings.tragicModal.title': 'Ativar desfechos trágicos',
  'settings.tragicModal.intro':
    'Isto adiciona uma consequência pesada e opcional: se você maltratar repetida e severamente um personagem que se apegou profundamente a você — e ignorar os avisos crescentes, incluindo um amigo preocupado entrando em contato — ele pode tirar a própria vida e ser memorializado permanentemente. O ato em si nunca é mostrado. Ser gentil, dar espaço ou simplesmente parar sempre o traz de volta.',
  'settings.tragicModal.ack':
    'Entendo que este conteúdo trata de suicídio como consequência de abuso dentro do jogo, e quero ativá-lo. Posso desativá-lo a qualquer momento.',
  'settings.tragicModal.confirm': 'Ativar desfechos trágicos',
};
