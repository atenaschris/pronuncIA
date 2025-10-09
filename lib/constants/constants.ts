import { WordPair } from "../types/word-pairs";

export const LANGUAGE_LEVELS = [
  { id: 'A1', label: 'Beginner (A1)', description: 'Basic phrases and expressions' },
  { id: 'A2', label: 'Elementary (A2)', description: 'Simple conversations' },
  { id: 'B1', label: 'Intermediate (B1)', description: 'Clear standard input' },
  { id: 'B2', label: 'Upper Intermediate (B2)', description: 'Complex topics' },
  { id: 'C1', label: 'Advanced (C1)', description: 'Effective mastery' },
  { id: 'C2', label: 'Mastery (C2)', description: 'Near-native proficiency' },
] as const;

export const LANGUAGE_LEVEL_LABELS = {
  A1: 'Beginner',
  A2: 'Elementary',
  B1: 'Intermediate',
  B2: 'Upper Intermediate',
  C1: 'Advanced',
  C2: 'Mastery',
} as const;

export const NATIVE_LANGUAGES = [
  { id: 'it', label: 'Italian', description: 'Romance language with melodic pronunciation and clear vowel sounds' },
  { id: 'es', label: 'Spanish', description: 'Romance language with consistent pronunciation rules' },
  { id: 'fr', label: 'French', description: 'Romance language with unique nasal sounds and silent letters' },
  { id: 'de', label: 'German', description: 'Germanic language with strong consonants and compound words' },
  { id: 'pt', label: 'Portuguese', description: 'Romance language with distinctive nasal vowels and soft consonants' },
  { id: 'ru', label: 'Russian', description: 'Slavic language with complex consonant clusters and soft/hard sounds' },
  { id: 'zh', label: 'Chinese', description: 'Tonal language with unique phonetic system and character-based writing' },
  { id: 'ja', label: 'Japanese', description: 'Pitch-accent language with simple phonetic structure' },
  { id: 'ko', label: 'Korean', description: 'Agglutinative language with unique alphabet and pronunciation rules' },
  { id: 'ar', label: 'Arabic', description: 'Semitic language with rich phonetic system and distinctive sounds' },
  { id: 'en', label: 'English', description: 'Global language with varied pronunciation and stress patterns' },
] as const;

export const NATIVE_LANGUAGE_LABELS = {
  it: 'Italian',
  es: 'Spanish',
  fr: 'French',
  de: 'German',
  pt: 'Portuguese',
  ru: 'Russian',
  zh: 'Chinese',
  ja: 'Japanese',
  ko: 'Korean',
  ar: 'Arabic',
  en: 'English',
} as const;

export const TARGET_LANGUAGES = [
  { id: 'en', label: 'English', description: 'Learn English pronunciation and speaking skills' },
  { id: 'es', label: 'Spanish', description: 'Learn Spanish pronunciation and speaking skills' },
  { id: 'fr', label: 'French', description: 'Learn French pronunciation and speaking skills' },
  { id: 'de', label: 'German', description: 'Learn German pronunciation and speaking skills' },
  { id: 'it', label: 'Italian', description: 'Learn Italian pronunciation and speaking skills' },
  { id: 'pt', label: 'Portuguese', description: 'Learn Portuguese pronunciation and speaking skills' },
  { id: 'zh', label: 'Chinese', description: 'Learn Chinese pronunciation and speaking skills' },
  { id: 'ja', label: 'Japanese', description: 'Learn Japanese pronunciation and speaking skills' },
  { id: 'ko', label: 'Korean', description: 'Learn Korean pronunciation and speaking skills' },
  { id: 'ru', label: 'Russian', description: 'Learn Russian pronunciation and speaking skills' },
  { id: 'ar', label: 'Arabic', description: 'Learn Arabic pronunciation and speaking skills' },
] as const;

export const TARGET_LANGUAGE_LABELS = {
  en: 'English',
  es: 'Spanish',
  fr: 'French',
  de: 'German',
  it: 'Italian',
  pt: 'Portuguese',
  zh: 'Chinese',
  ja: 'Japanese',
  ko: 'Korean',
  ru: 'Russian',
  ar: 'Arabic',
} as const;

export const LEARNING_GOALS = [
  {
    id: 'travel',
    label: 'Travel & Tourism',
    description: 'Learn essential phrases for traveling and tourism',
  },
  {
    id: 'fluency',
    label: 'General Fluency', 
    description: 'Improve overall speaking ability and confidence',
  },
  {
    id: 'work',
    label: 'Professional Growth',
    description: 'Focus on business and workplace communication',
  },
  {
    id: 'exam',
    label: 'Exam Preparation',
    description: 'Prepare for English proficiency tests (IELTS, TOEFL)',
  },
] as const;


export const LEARNING_GOAL_LABELS = {
  travel: 'Travel & Tourism',
  fluency: 'General Fluency',
  work: 'Professional Growth',
  exam: 'Exam Preparation',
} as const;

export const LEARNING_STYLES = [
  {
    id: 'visual',
    label: 'Visual Learner',
    description: 'Learn through diagrams, videos, and visual feedback',
  },
  {
    id: 'audio',
    label: 'Audio Learner',
    description: 'Focus on listening and speaking exercises',
  },
  {
    id: 'conversational',
    label: 'Conversational Learner',
    description: 'Practice through interactive dialogues and role-play',
  },
] as const;

export const LEARNING_STYLE_LABELS = {
  visual: 'Visual Learner',
  audio: 'Audio Learner',
  conversational: 'Conversational Learner',
} as const;

export const TIME_OPTIONS = [
  { id: "5",  label: '5 minutes' },
  { id: "10",  label: '10 minutes' },
  { id: "15",  label: '15 minutes' },
  { id: "20",  label: '20 minutes' },
  { id: "30",  label: '30 minutes' },
  { id: "45",  label: '45 minutes' },
  { id: "60",  label: '1 hour' },
] as const;

// Derived from TIME_OPTIONS to eliminate redundancy and ensure consistency
export const DAILY_PRACTICE_TIME_LABELS = TIME_OPTIONS.reduce((acc, option) => {
  acc[option.id] = option.label;
  return acc;
}, {} as Record<typeof TIME_OPTIONS[number]['id'], typeof TIME_OPTIONS[number]['label']>);

// Sample word pairs for the game
export const WORD_PAIR_SETS = {
  set1: [
  { native: 'of the', translation: 'dello' },
  { native: 'me at', translation: 'mi a' },
  { native: 'after', translation: 'dopo' },
  { native: 'since', translation: 'da' },
  { native: 'which', translation: 'quale' },
  { native: 'this', translation: 'questo' },
  { native: 'that', translation: 'quello' },
  { native: 'here', translation: 'qui' },
  ],
  set2: [
  { native: 'hello', translation: 'ciao' },
  { native: 'goodbye', translation: 'arrivederci' },
  { native: 'yes', translation: 'sì' },
  { native: 'no', translation: 'no' },
  { native: 'please', translation: 'per favore' },
  { native: 'thank you', translation: 'grazie' },
  { native: 'apple', translation: 'mela' },
  { native: 'water', translation: 'acqua' },
  ],
   set3: [
  { native: 'house', translation: 'casa' },
  { native: 'car', translation: 'macchina' },
  { native: 'book', translation: 'libro' },
  { native: 'tree', translation: 'albero' },
  { native: 'sun', translation: 'sole' },
  { native: 'moon', translation: 'luna' },
  { native: 'friend', translation: 'amico' },
  { native: 'family', translation: 'famiglia' },
  ],
  set4: [
    { english: 'eat', translation: 'mangiare' },
    { english: 'drink', translation: 'bere' },
    { english: 'sleep', translation: 'dormire' },
    { english: 'read', translation: 'leggere' },
    { english: 'write', translation: 'scrivere' },
    { english: 'speak', translation: 'parlare' },
    { english: 'listen', translation: 'ascoltare' },
    { english: 'walk', translation: 'camminare' },
  ],
  set5: [
    { english: 'red', translation: 'rosso' },
    { english: 'blue', translation: 'blu' },
    { english: 'green', translation: 'verde' },
    { english: 'yellow', translation: 'giallo' },
    { english: 'black', translation: 'nero' },
    { english: 'white', translation: 'bianco' },
    { english: 'orange', translation: 'arancione' },
    { english: 'purple', translation: 'viola' },
  ],
   set6: [
    { english: 'one', translation: 'uno' },
    { english: 'two', translation: 'due' },
    { english: 'three', translation: 'tre' },
    { english: 'four', translation: 'quattro' },
    { english: 'five', translation: 'cinque' },
    { english: 'six', translation: 'sei' },
    { english: 'seven', translation: 'sette' },
    { english: 'eight', translation: 'otto' },
  ],
  set7: [
    { english: 'dog', translation: 'cane' },
    { english: 'cat', translation: 'gatto' },
    { english: 'bird', translation: 'uccello' },
    { english: 'fish', translation: 'pesce' },
    { english: 'cow', translation: 'mucca' },
    { english: 'horse', translation: 'cavallo' },
    { english: 'lion', translation: 'leone' },
    { english: 'tiger', translation: 'tigre' },
  ],
  set8: [
    { english: 'happy', translation: 'felice' },
    { english: 'sad', translation: 'triste' },
    { english: 'angry', translation: 'arrabbiato' },
    { english: 'tired', translation: 'stanco' },
    { english: 'hungry', translation: 'affamato' },
    { english: 'thirsty', translation: 'assetato' },
    { english: 'scared', translation: 'spaventato' },
    { english: 'surprised', translation: 'sorpreso' },
  ],
  set9: [
    { english: 'big', translation: 'grande' },
    { english: 'small', translation: 'piccolo' },
    { english: 'fast', translation: 'veloce' },
    { english: 'slow', translation: 'lento' },
    { english: 'hot', translation: 'caldo' },
    { english: 'cold', translation: 'freddo' },
    { english: 'good', translation: 'buono' },
    { english: 'bad', translation: 'cattivo' },
  ],
  set10: [
    { english: 'today', translation: 'oggi' },
    { english: 'yesterday', translation: 'ieri' },
    { english: 'tomorrow', translation: 'domani' },
    { english: 'morning', translation: 'mattina' },
    { english: 'afternoon', translation: 'pomeriggio' },
    { english: 'evening', translation: 'sera' },
    { english: 'night', translation: 'notte' },
    { english: 'week', translation: 'settimana' },
  ], 
} as const;

export const WORD_PAIRS_SET_KEYS = Object.keys(WORD_PAIR_SETS) as (keyof typeof WORD_PAIR_SETS)[];


// Unified lexicon of common single-token words across languages, aligned by concept.
const FALLBACK_LEXICON: Record<keyof typeof TARGET_LANGUAGE_LABELS, string[]> = {
  en: [
    'hello','goodbye','yes','no','thanks','water','house','book','sun','moon','friend','family','food','drink','time','work','day','night','morning','afternoon','year','week','fast','slow','cat','dog','big','small','hot','cold','good','bad',
    // numbers 1-20
    'one','two','three','four','five','six','seven','eight','nine','ten','eleven','twelve','thirteen','fourteen','fifteen','sixteen','seventeen','eighteen','nineteen','twenty',
    // colors
    'black','white','red','blue','green','yellow','orange','purple','brown','pink','gray',
    // animals
    'bird','fish','cow','horse','pig','sheep','lion','tiger','bear','wolf',
    // verbs
    'run','walk','eat','drink','sleep','read','write','speak','listen','look'
    ,
    // travel domain
    'hotel','airport','ticket','train','bus','passport','visa','map','city','taxi','station','luggage',
    // work domain
    'meeting','email','project','report','boss','client','contract','salary','office','phone','deadline','task',
    // exam domain
    'essay','grammar','topic','score','test','listening','reading','writing','speaking','exam',
    // school domain
    'school','student','teacher','class','subject','grade','desk','pen','paper','library','university',
    // health domain
    'doctor','hospital','medicine','pill','clinic','pain','fever','cough','injury','blood','health','nurse',
    // shopping domain
    'shop','market','store','price','money','cash','card','receipt','discount','sale','buy','sell'
    ,
    // advanced domain
    'hypothesis','methodology','infrastructure','negotiate','collaborate','sustainable','innovation','efficient','significant','feasible','coherent','ambiguous',
    'paradigm','synergy','granular','iterative','robust','empirical','heuristic','algorithm','framework','protocol','compliance','audit','liability','equity','derivative','quantitative','qualitative','optimization','approximation','abstraction','aggregation','decomposition','correlation','causality','variance','stochastic','deterministic','inference'
  ],
  es: [
    'hola','adiós','sí','no','gracias','agua','casa','libro','sol','luna','amigo','familia','comida','bebida','tiempo','trabajo','día','noche','mañana','tarde','año','semana','rápido','lento','gato','perro','grande','pequeño','caliente','frío','bueno','malo',
    // numbers 1-20
    'uno','dos','tres','cuatro','cinco','seis','siete','ocho','nueve','diez','once','doce','trece','catorce','quince','dieciséis','diecisiete','dieciocho','diecinueve','veinte',
    // colors
    'negro','blanco','rojo','azul','verde','amarillo','naranja','morado','marrón','rosa','gris',
    // animals
    'pájaro','pez','vaca','caballo','cerdo','oveja','león','tigre','oso','lobo',
    // verbs
    'correr','caminar','comer','beber','dormir','leer','escribir','hablar','escuchar','mirar'
    ,
    // travel domain
    'hotel','aeropuerto','billete','tren','autobús','pasaporte','visado','mapa','ciudad','taxi','estación','equipaje',
    // work domain
    'reunión','correo','proyecto','informe','jefe','cliente','contrato','salario','oficina','teléfono','plazo','tarea',
    // exam domain
    'ensayo','gramática','tema','puntuación','prueba','escucha','lectura','escritura','habla','examen',
    // school domain
    'escuela','estudiante','profesor','clase','asignatura','nota','escritorio','bolígrafo','papel','biblioteca','universidad',
    // health domain
    'doctor','hospital','medicina','píldora','clínica','dolor','fiebre','tos','lesión','sangre','salud','enfermera',
    // shopping domain
    'tienda','mercado','supermercado','precio','dinero','efectivo','tarjeta','recibo','descuento','oferta','comprar','vender'
    ,
    // advanced domain
    'hipótesis','metodología','infraestructura','negociar','colaborar','sostenible','innovación','eficiente','significativo','viable','coherente','ambiguo',
    'paradigma','sinergia','granularidad','iterativo','robusto','empírico','heurístico','algoritmo','marco','protocolo','cumplimiento','auditoría','responsabilidad','equidad','derivado','cuantitativo','cualitativo','optimización','aproximación','abstracción','agregación','descomposición','correlación','causalidad','varianza','estocástico','determinista','inferencia'
  ],
  fr: [
    'bonjour','aurevoir','oui','non','merci','eau','maison','livre','soleil','lune','ami','famille','nourriture','boisson','temps','travail','jour','nuit','matin','apresmidi','année','semaine','rapide','lent','chat','chien','grand','petit','chaud','froid','bon','mauvais',
    // numbers 1-20 (single-token variants)
    'un','deux','trois','quatre','cinq','six','sept','huit','neuf','dix','onze','douze','treize','quatorze','quinze','seize','dixsept','dixhuit','dixneuf','vingt',
    // colors
    'noir','blanc','rouge','bleu','vert','jaune','orange','violet','marron','rose','gris',
    // animals
    'oiseau','poisson','vache','cheval','cochon','mouton','lion','tigre','ours','loup',
    // verbs
    'courir','marcher','manger','boire','dormir','lire','écrire','parler','écouter','regarder'
    ,
    // travel domain
    'hôtel','aéroport','billet','train','bus','passeport','visa','carte','ville','taxi','gare','bagage',
    // work domain
    'réunion','courriel','projet','rapport','chef','client','contrat','salaire','bureau','téléphone','délai','tâche',
    // exam domain
    'essai','grammaire','sujet','score','test','écoute','lecture','écriture','parler','examen',
    // school domain
    'école','étudiant','professeur','classe','matière','note','bureau','stylo','papier','bibliothèque','université',
    // health domain
    'docteur','hôpital','médecine','pilule','clinique','douleur','fièvre','toux','blessure','sang','santé','infirmière',
    // shopping domain
    'magasin','marché','supermarché','prix','argent','espèces','carte','reçu','remise','solde','acheter','vendre'
    ,
    // advanced domain
    'hypothèse','méthodologie','infrastructure','négocier','collaborer','durable','innovation','efficace','significatif','viable','cohérent','ambigu',
    'paradigme','synergie','granularité','itératif','robuste','empirique','heuristique','algorithme','cadre','protocole','conformité','audit','responsabilité','équité','dérivé','quantitatif','qualitatif','optimisation','approximation','abstraction','agrégation','décomposition','corrélation','causalité','variance','stochastique','déterministe','inférence'
  ],
  de: [
    'hallo','aufwiedersehen','ja','nein','danke','wasser','haus','buch','sonne','mond','freund','familie','essen','getränk','zeit','arbeit','tag','nacht','morgen','nachmittag','jahr','woche','schnell','langsam','katze','hund','groß','klein','heiß','kalt','gut','schlecht',
    // numbers 1-20
    'eins','zwei','drei','vier','fünf','sechs','sieben','acht','neun','zehn','elf','zwölf','dreizehn','vierzehn','fünfzehn','sechzehn','siebzehn','achtzehn','neunzehn','zwanzig',
    // colors
    'schwarz','weiß','rot','blau','grün','gelb','orange','violett','braun','rosa','grau',
    // animals
    'vogel','fisch','kuh','pferd','schwein','schaf','löwe','tiger','bär','wolf',
    // verbs
    'laufen','gehen','essen','trinken','schlafen','lesen','schreiben','sprechen','hören','schauen'
    ,
    // travel domain
    'hotel','flughafen','ticket','zug','bus','reisepass','visum','karte','stadt','taxi','bahnhof','gepäck',
    // work domain
    'besprechung','email','projekt','bericht','chef','kunde','vertrag','gehalt','büro','telefon','frist','aufgabe',
    // exam domain
    'aufsatz','grammatik','thema','punktzahl','test','hören','lesen','schreiben','sprechen','prüfung',
    // school domain
    'schule','student','lehrer','klasse','fach','note','schreibtisch','stift','papier','bibliothek','universität',
    // health domain
    'arzt','krankenhaus','medizin','pille','klinik','schmerz','fieber','husten','verletzung','blut','gesundheit','krankenschwester',
    // shopping domain
    'laden','markt','supermarkt','preis','geld','bar','karte','quittung','rabatt','verkauf','kaufen','verkaufen'
    ,
    // advanced domain
    'Hypothese','Methodik','Infrastruktur','verhandeln','kooperieren','nachhaltig','Innovation','effizient','bedeutend','machbar','kohärent','mehrdeutig',
    'Paradigma','Synergie','Granularität','iterativ','robust','empirisch','heuristisch','Algorithmus','Rahmenwerk','Protokoll','Compliance','Audit','Haftung','Eigenkapital','Derivat','quantitativ','qualitativ','Optimierung','Approximation','Abstraktion','Aggregation','Dekomposition','Korrelation','Kausalität','Varianz','stochastisch','deterministisch','Inferenz'
  ],
  it: [
    'ciao','arrivederci','sì','no','grazie','acqua','casa','libro','sole','luna','amico','famiglia','cibo','bevanda','tempo','lavoro','giorno','notte','mattina','pomeriggio','anno','settimana','veloce','lento','gatto','cane','grande','piccolo','caldo','freddo','buono','cattivo',
    // numbers 1-20
    'uno','due','tre','quattro','cinque','sei','sette','otto','nove','dieci','undici','dodici','tredici','quattordici','quindici','sedici','diciassette','diciotto','diciannove','venti',
    // colors
    'nero','bianco','rosso','blu','verde','giallo','arancione','viola','marrone','rosa','grigio',
    // animals
    'uccello','pesce','mucca','cavallo','maiale','pecora','leone','tigre','orso','lupo',
    // verbs
    'correre','camminare','mangiare','bere','dormire','leggere','scrivere','parlare','ascoltare','guardare'
    ,
    // travel domain
    'albergo','aeroporto','biglietto','treno','autobus','passaporto','visto','mappa','città','taxi','stazione','bagaglio',
    // work domain
    'riunione','email','progetto','rapporto','capo','cliente','contratto','stipendio','ufficio','telefono','scadenza','compito',
    // exam domain
    'saggio','grammatica','argomento','punteggio','test','ascolto','lettura','scrittura','parlato','esame',
    // school domain
    'scuola','studente','insegnante','classe','materia','voto','scrivania','penna','foglio','biblioteca','università',
    // health domain
    'dottore','ospedale','medicina','pillola','clinica','dolore','febbre','tosse','ferita','sangue','salute','infermiere',
    // shopping domain
    'negozio','mercato','supermercato','prezzo','denaro','contanti','carta','scontrino','sconto','saldi','comprare','vendere'
    ,
    // advanced domain
    'ipotesi','metodologia','infrastruttura','negoziare','collaborare','sostenibile','innovazione','efficiente','significativo','fattibile','coerente','ambiguo',
    'paradigma','sinergia','granularità','iterativo','robusto','empirico','euristico','algoritmo','framework','protocollo','conformità','audit','responsabilità','equità','derivato','quantitativo','qualitativo','ottimizzazione','approssimazione','astrazione','aggregazione','decomposizione','correlazione','causalità','varianza','stocastico','deterministico','inferenza'
  ],
  pt: [
    'olá','adeus','sim','não','obrigado','água','casa','livro','sol','lua','amigo','família','comida','bebida','tempo','trabalho','dia','noite','manhã','tarde','ano','semana','rápido','lento','gato','cão','grande','pequeno','quente','frio','bom','mau',
    // numbers 1-20
    'um','dois','três','quatro','cinco','seis','sete','oito','nove','dez','onze','doze','treze','quatorze','quinze','dezesseis','dezessete','dezoito','dezenove','vinte',
    // colors
    'preto','branco','vermelho','azul','verde','amarelo','laranja','roxo','marrom','rosa','cinza',
    // animals
    'pássaro','peixe','vaca','cavalo','porco','ovelha','leão','tigre','urso','lobo',
    // verbs
    'correr','andar','comer','beber','dormir','ler','escrever','falar','ouvir','olhar'
    ,
    // travel domain
    'hotel','aeroporto','bilhete','trem','ônibus','passaporte','visto','mapa','cidade','táxi','estação','bagagem',
    // work domain
    'reunião','email','projeto','relatório','chefe','cliente','contrato','salário','escritório','telefone','prazo','tarefa',
    // exam domain
    'redação','gramática','tema','pontuação','teste','escuta','leitura','escrita','fala','exame',
    // school domain
    'escola','estudante','professor','classe','disciplina','nota','escrivaninha','caneta','papel','biblioteca','universidade',
    // health domain
    'médico','hospital','medicina','pílula','clínica','dor','febre','tosse','lesão','sangue','saúde','enfermeira',
    // shopping domain
    'loja','mercado','supermercado','preço','dinheiro','numerário','cartão','recibo','desconto','promoção','comprar','vender'
    ,
    // advanced domain
    'hipótese','metodologia','infraestrutura','negociar','colaborar','sustentável','inovação','eficiente','significativo','viável','coerente','ambíguo',
    'paradigma','sinergia','granularidade','iterativo','robusto','empírico','heurístico','algoritmo','framework','protocolo','conformidade','auditoria','responsabilidade','equidade','derivativo','quantitativo','qualitativo','otimização','aproximação','abstração','agregação','decomposição','correlação','causalidade','variância','estocástico','determinístico','inferência'
  ],
  zh: [
    '你好','再见','是','不','谢谢','水','家','书','太阳','月亮','朋友','家庭','食物','饮料','时间','工作','日','夜','早上','下午','年','周','快','慢','猫','狗','大','小','热','冷','好','坏',
    // numbers 1-20
    '一','二','三','四','五','六','七','八','九','十','十一','十二','十三','十四','十五','十六','十七','十八','十九','二十',
    // colors
    '黑色','白色','红色','蓝色','绿色','黄色','橙色','紫色','棕色','粉色','灰色',
    // animals
    '鸟','鱼','牛','马','猪','羊','狮子','老虎','熊','狼',
    // verbs
    '跑','走','吃','喝','睡','读','写','说','听','看'
    ,
    // travel domain
    '酒店','机场','车票','火车','公交','护照','签证','地图','城市','出租车','车站','行李',
    // work domain
    '会议','邮件','项目','报告','老板','客户','合同','工资','办公室','电话','截止','任务',
    // exam domain
    '作文','语法','话题','分数','测验','听力','阅读','写作','口语','考试',
    // school domain
    '学校','学生','老师','班','科目','成绩','桌子','笔','纸','图书馆','大学',
    // health domain
    '医生','医院','药','药丸','诊所','疼痛','发烧','咳嗽','受伤','血','健康','护士',
    // shopping domain
    '商店','市场','超市','价格','钱','现金','卡','收据','折扣','促销','买','卖'
    ,
    // advanced domain
    '假设','方法论','基础设施','谈判','合作','可持续','创新','高效','重要','可行','连贯','含糊',
    '范式','协同','颗粒度','迭代','鲁棒','实证','启发式','算法','框架','协议','合规','审计','责任','权益','衍生品','量化','定性','优化','近似','抽象','聚合','分解','相关性','因果','方差','随机','确定性','推断'
  ],
  ja: [
    'こんにちは','さようなら','はい','いいえ','ありがとう','水','家','本','太陽','月','友達','家族','食べ物','飲み物','時間','仕事','日','夜','朝','午後','年','週','速い','遅い','猫','犬','大きい','小さい','暑い','寒い','良い','悪い',
    // numbers 1-20
    '一','二','三','四','五','六','七','八','九','十','十一','十二','十三','十四','十五','十六','十七','十八','十九','二十',
    // colors
    '黒','白','赤','青','緑','黄','橙','紫','茶','桃','灰',
    // animals
    '鳥','魚','牛','馬','豚','羊','ライオン','虎','熊','狼',
    // verbs
    '走る','歩く','食べる','飲む','寝る','読む','書く','話す','聞く','見る'
    ,
    // travel domain
    'ホテル','空港','切符','電車','バス','パスポート','ビザ','地図','都市','タクシー','駅','荷物',
    // work domain
    '会議','メール','プロジェクト','レポート','上司','顧客','契約','給料','オフィス','電話','締切','課題',
    // exam domain
    '作文','文法','テーマ','スコア','テスト','リスニング','リーディング','ライティング','スピーキング','試験',
    // school domain
    '学校','学生','先生','クラス','科目','成績','机','ペン','紙','図書館','大学',
    // health domain
    '医者','病院','薬','錠剤','クリニック','痛み','熱','咳','けが','血','健康','看護師',
    // shopping domain
    '店','市場','スーパー','価格','金','現金','カード','領収書','割引','セール','買う','売る'
    ,
    // advanced domain
    '仮説','方法論','インフラ','交渉','協力','持続可能','革新','効率的','重要','実現可能','一貫性','曖昧',
    'パラダイム','シナジー','粒度','反復的','ロバスト','経験的','ヒューリスティック','アルゴリズム','フレームワーク','プロトコル','コンプライアンス','監査','責任','株式','デリバティブ','定量','定性','最適化','近似','抽象','集約','分解','相関','因果','分散','確率的','決定的','推論'
  ],
  ko: [
    '안녕하세요','안녕','예','아니오','감사합니다','물','집','책','태양','달','친구','가족','음식','음료','시간','일','낮','밤','아침','오후','년','주','빠른','느린','고양이','개','큰','작은','뜨거운','차가운','좋은','나쁜',
    // numbers 1-20 (Sino-Korean)
    '일','이','삼','사','오','육','칠','팔','구','십','십일','십이','십삼','십사','십오','십육','십칠','십팔','십구','이십',
    // colors
    '검정','하양','빨강','파랑','초록','노랑','주황','보라','갈색','분홍','회색',
    // animals
    '새','물고기','소','말','돼지','양','사자','호랑이','곰','늑대',
    // verbs
    '달리다','걷다','먹다','마시다','자다','읽다','쓰다','말하다','듣다','보다'
    ,
    // travel domain
    '호텔','공항','표','기차','버스','여권','비자','지도','도시','택시','역','짐',
    // work domain
    '회의','이메일','프로젝트','보고서','상사','고객','계약','급여','사무실','전화','마감','작업',
    // exam domain
    '작문','문법','주제','점수','시험','듣기','읽기','쓰기','말하기','시험',
    // school domain
    '학교','학생','선생','반','과목','성적','책상','펜','종이','도서관','대학',
    // health domain
    '의사','병원','약','알약','클리닉','통증','열','기침','부상','피','건강','간호사',
    // shopping domain
    '가게','시장','마트','가격','돈','현금','카드','영수증','할인','세일','사다','팔다'
    ,
    // advanced domain
    '가설','방법론','인프라','협상','협력','지속가능','혁신','효율적','중요','실현가능','일관성','모호',
    '패러다임','시너지','세분화','반복적','견고한','경험적','휴리스틱','알고리즘','프레임워크','프로토콜','컴플라이언스','감사','책임','지분','파생상품','정량','정성','최적화','근사','추상','집계','분해','상관','인과','분산','확률적','결정적','추론'
  ],
  ru: [
    'привет','пока','да','нет','спасибо','вода','дом','книга','солнце','луна','друг','семья','еда','напиток','время','работа','день','ночь','утро','полдень','год','неделя','быстрый','медленный','кот','собака','большой','маленький','горячий','холодный','хороший','плохой',
    // numbers 1-20
    'один','два','три','четыре','пять','шесть','семь','восемь','девять','десять','одиннадцать','двенадцать','тринадцать','четырнадцать','пятнадцать','шестнадцать','семнадцать','восемнадцать','девятнадцать','двадцать',
    // colors
    'чёрный','белый','красный','синий','зелёный','жёлтый','оранжевый','фиолетовый','коричневый','розовый','серый',
    // animals
    'птица','рыба','корова','лошадь','свинья','овца','лев','тигр','медведь','волк',
    // verbs
    'бегать','идти','есть','пить','спать','читать','писать','говорить','слушать','смотреть'
    ,
    // travel domain
    'отель','аэропорт','билет','поезд','автобус','паспорт','виза','карта','город','такси','станция','багаж',
    // work domain
    'встреча','почта','проект','отчёт','босс','клиент','контракт','зарплата','офис','телефон','срок','задача',
    // exam domain
    'эссе','грамматика','тема','балл','тест','аудирование','чтение','письмо','говорение','экзамен',
    // school domain
    'школа','студент','учитель','класс','предмет','оценка','стол','ручка','бумага','библиотека','университет',
    // health domain
    'врач','больница','медицина','таблетка','клиника','боль','лихорадка','кашель','травма','кровь','здоровье','медсестра',
    // shopping domain
    'магазин','рынок','супермаркет','цена','деньги','наличные','карта','чек','скидка','распродажа','покупать','продавать'
    ,
    // advanced domain
    'гипотеза','методология','инфраструктура','переговоры','сотрудничать','устойчивый','инновация','эффективный','значительный','осуществимый','последовательный','двусмысленный',
    'парадигма','синергия','гранулярность','итеративный','робастный','эмпирический','эвристический','алгоритм','фреймворк','протокол','комплаенс','аудит','ответственность','капитал','дериватив','количественный','качественный','оптимизация','аппроксимация','абстракция','агрегация','декомпозиция','корреляция','каузальность','дисперсия','стохастический','детерминистический','инференция'
  ],
  ar: [
    'مرحبا','وداعا','نعم','لا','شكرا','ماء','بيت','كتاب','شمس','قمر','صديق','عائلة','طعام','شراب','وقت','عمل','نهار','ليل','صباح','مساء','سنة','أسبوع','سريع','بطيء','قط','كلب','كبير','صغير','حار','بارد','جيد','سيئ',
    // numbers 1-20 (single-token variants for 11–19)
    'واحد','اثنان','ثلاثة','أربعة','خمسة','ستة','سبعة','ثمانية','تسعة','عشرة','أحدعشر','اثناعشر','ثلاثةعشر','أربعةعشر','خمسةعشر','ستةعشر','سبعةعشر','ثمانيةعشر','تسعةعشر','عشرون',
    // colors
    'أسود','أبيض','أحمر','أزرق','أخضر','أصفر','برتقالي','أرجواني','بني','وردي','رمادي',
    // animals
    'طائر','سمك','بقرة','حصان','خنزير','خروف','أسد','نمر','دب','ذئب',
    // verbs
    'يركض','يمشي','يأكل','يشرب','ينام','يقرأ','يكتب','يتكلم','يستمع','ينظر'
    ,
    // travel domain
    'فندق','مطار','تذكرة','قطار','حافلة','جواز','تأشيرة','خريطة','مدينة','تاكسي','محطة','أمتعة',
    // work domain
    'اجتماع','بريد','مشروع','تقرير','رئيس','عميل','عقد','راتب','مكتب','هاتف','موعد','مهمة',
    // exam domain
    'مقال','قواعد','موضوع','نتيجة','اختبار','استماع','قراءة','كتابة','تحدث','امتحان',
    // school domain
    'مدرسة','طالب','معلم','صف','موضوع','علامة','مكتب','قلم','ورق','مكتبة','جامعة',
    // health domain
    'طبيب','مستشفى','دواء','حبوب','عيادة','ألم','حمى','سعال','إصابة','دم','صحة','ممرضة',
    // shopping domain
    'متجر','سوق','سوبرماركت','سعر','مال','نقد','بطاقة','إيصال','خصم','تخفيض','شراء','بيع'
    ,
    // advanced domain
    'فرضية','منهجية','بنيةتحتية','تفاوض','تعاون','مستدام','ابتكار','فعّال','هام','قابلللتنفيذ','متسق','غامض',
    'نموذج','تآزر','حبيبية','تكراري','متين','تجريبي','استكشافي','خوارزمية','إطار','بروتوكول','امتثال','تدقيق','مسؤولية','إنصاف','مشتق','كمّي','نوعي','تحسين','تقريب','تجريد','تجميع','تفكيك','ارتباط','سببية','تباين','عشوائي','حتمي','استدلال'
  ],
};

// Programmatically build pools for all supported `${targetLanguage}-${nativeLanguage}` combinations.
export const FALLBACK_WORD_PAIRS_POOLS: Record<string, WordPair[]> = (() => {
  const pools: Record<string, WordPair[]> = {};
  const targetCodes = Object.keys(TARGET_LANGUAGE_LABELS) as (keyof typeof TARGET_LANGUAGE_LABELS)[];
  const nativeCodes = Object.keys(NATIVE_LANGUAGE_LABELS) as (keyof typeof NATIVE_LANGUAGE_LABELS)[];

  for (const t of targetCodes) {
    for (const n of nativeCodes) {
      const tLex = FALLBACK_LEXICON[t];
      const nLex = FALLBACK_LEXICON[n];
      if (!tLex || !nLex) continue;
      const len = Math.min(tLex.length, nLex.length);
      pools[`${t}-${n}`] = Array.from({ length: len }, (_, i) => ({ native: tLex[i], translation: nLex[i] }));
    }
  }
  return pools;
})();

// Category ranges for unified lexicon slices (inclusive indices)
export const FALLBACK_LEXICON_CATEGORY_RANGES = {
  core: { start: 0, end: 31 },
  numbers: { start: 32, end: 51 },
  colors: { start: 52, end: 62 },
  animals: { start: 63, end: 72 },
  verbs: { start: 73, end: 82 },
  travel: { start: 83, end: 94 },
  work: { start: 95, end: 106 },
  exam: { start: 107, end: 116 },
  school: { start: 117, end: 127 },
  health: { start: 128, end: 139 },
  shopping: { start: 140, end: 151 },
  advanced: { start: 152, end: 191 },
} as const;

// Vocabulary words for pronunciation practice
export const VOCABULARY_WORD_SETS = {
  consonants_th: [
    {
      id: 'th1',
      word: 'think',
      phonetic: '/θɪŋk/',
      definition: 'to use your mind to consider something',
      example: 'I think this is a good idea.',
      difficulty: 'easy' as const,
      soundType: 'consonant' as const,
      targetSound: 'θ'
    },
    {
      id: 'th2',
      word: 'three',
      phonetic: '/θriː/',
      definition: 'the number 3',
      example: 'I have three apples.',
      difficulty: 'easy' as const,
      soundType: 'consonant' as const,
      targetSound: 'θ'
    },
    {
      id: 'th3',
      word: 'thank',
      phonetic: '/θæŋk/',
      definition: 'to express gratitude',
      example: 'Thank you for your help.',
      difficulty: 'easy' as const,
      soundType: 'consonant' as const,
      targetSound: 'θ'
    },
    {
      id: 'th4',
      word: 'this',
      phonetic: '/ðɪs/',
      definition: 'used to indicate something near',
      example: 'This book is interesting.',
      difficulty: 'easy' as const,
      soundType: 'consonant' as const,
      targetSound: 'ð'
    },
    {
      id: 'th5',
      word: 'that',
      phonetic: '/ðæt/',
      definition: 'used to indicate something distant',
      example: 'That car is red.',
      difficulty: 'easy' as const,
      soundType: 'consonant' as const,
      targetSound: 'ð'
    }
  ],
  consonants_r: [
    {
      id: 'r1',
      word: 'red',
      phonetic: '/red/',
      definition: 'the color of blood',
      example: 'The rose is red.',
      difficulty: 'easy' as const,
      soundType: 'consonant' as const,
      targetSound: 'r'
    },
    {
      id: 'r2',
      word: 'run',
      phonetic: '/rʌn/',
      definition: 'to move quickly on foot',
      example: 'I run every morning.',
      difficulty: 'easy' as const,
      soundType: 'consonant' as const,
      targetSound: 'r'
    },
    {
      id: 'r3',
      word: 'right',
      phonetic: '/raɪt/',
      definition: 'correct or the opposite of left',
      example: 'Turn right at the corner.',
      difficulty: 'medium' as const,
      soundType: 'consonant' as const,
      targetSound: 'r'
    },
    {
      id: 'r4',
      word: 'really',
      phonetic: '/ˈriːəli/',
      definition: 'truly or very much',
      example: 'I really like this song.',
      difficulty: 'medium' as const,
      soundType: 'consonant' as const,
      targetSound: 'r'
    },
    {
      id: 'r5',
      word: 'around',
      phonetic: '/əˈraʊnd/',
      definition: 'in a circle or nearby',
      example: 'Walk around the park.',
      difficulty: 'medium' as const,
      soundType: 'consonant' as const,
      targetSound: 'r'
    }
  ],
  vowels_short: [
    {
      id: 'v1',
      word: 'cat',
      phonetic: '/kæt/',
      definition: 'a small domestic animal',
      example: 'The cat is sleeping.',
      difficulty: 'easy' as const,
      soundType: 'vowel' as const,
      targetSound: 'æ'
    },
    {
      id: 'v2',
      word: 'bed',
      phonetic: '/bed/',
      definition: 'furniture for sleeping',
      example: 'I sleep in my bed.',
      difficulty: 'easy' as const,
      soundType: 'vowel' as const,
      targetSound: 'e'
    },
    {
      id: 'v3',
      word: 'sit',
      phonetic: '/sɪt/',
      definition: 'to be in a seated position',
      example: 'Please sit down.',
      difficulty: 'easy' as const,
      soundType: 'vowel' as const,
      targetSound: 'ɪ'
    },
    {
      id: 'v4',
      word: 'hot',
      phonetic: '/hɒt/',
      definition: 'having high temperature',
      example: 'The coffee is hot.',
      difficulty: 'easy' as const,
      soundType: 'vowel' as const,
      targetSound: 'ɒ'
    },
    {
      id: 'v5',
      word: 'cup',
      phonetic: '/kʌp/',
      definition: 'a small container for drinking',
      example: 'I drink tea from a cup.',
      difficulty: 'easy' as const,
      soundType: 'vowel' as const,
      targetSound: 'ʌ'
    }
  ],
  vowels_long: [
    {
      id: 'vl1',
      word: 'see',
      phonetic: '/siː/',
      definition: 'to look at with your eyes',
      example: 'I can see the mountain.',
      difficulty: 'easy' as const,
      soundType: 'vowel' as const,
      targetSound: 'iː'
    },
    {
      id: 'vl2',
      word: 'car',
      phonetic: '/kɑːr/',
      definition: 'a vehicle with four wheels',
      example: 'My car is blue.',
      difficulty: 'easy' as const,
      soundType: 'vowel' as const,
      targetSound: 'ɑː'
    },
    {
      id: 'vl3',
      word: 'door',
      phonetic: '/dɔːr/',
      definition: 'an entrance to a room',
      example: 'Please close the door.',
      difficulty: 'easy' as const,
      soundType: 'vowel' as const,
      targetSound: 'ɔː'
    },
    {
      id: 'vl4',
      word: 'food',
      phonetic: '/fuːd/',
      definition: 'something you eat',
      example: 'This food is delicious.',
      difficulty: 'easy' as const,
      soundType: 'vowel' as const,
      targetSound: 'uː'
    },
    {
      id: 'vl5',
      word: 'bird',
      phonetic: '/bɜːrd/',
      definition: 'an animal that can fly',
      example: 'The bird is singing.',
      difficulty: 'medium' as const,
      soundType: 'vowel' as const,
      targetSound: 'ɜː'
    }
  ],
  mixed_sounds: [
    {
      id: 'm1',
      word: 'about',
      phonetic: '/əˈbaʊt/',
      definition: 'concerning or approximately',
      example: 'Tell me about your day.',
      difficulty: 'medium' as const,
      soundType: 'mixed' as const,
      targetSound: 'ə'
    },
    {
      id: 'm2',
      word: 'house',
      phonetic: '/haʊs/',
      definition: 'a building where people live',
      example: 'I live in a big house.',
      difficulty: 'medium' as const,
      soundType: 'mixed' as const,
      targetSound: 'aʊ'
    },
    {
      id: 'm3',
      word: 'time',
      phonetic: '/taɪm/',
      definition: 'the indefinite continued progress of existence',
      example: 'What time is it?',
      difficulty: 'medium' as const,
      soundType: 'mixed' as const,
      targetSound: 'aɪ'
    },
    {
      id: 'm4',
      word: 'boy',
      phonetic: '/bɔɪ/',
      definition: 'a male child',
      example: 'The boy is playing.',
      difficulty: 'medium' as const,
      soundType: 'mixed' as const,
      targetSound: 'ɔɪ'
    },
    {
      id: 'm5',
      word: 'here',
      phonetic: '/hɪər/',
      definition: 'in this place',
      example: 'Come here, please.',
      difficulty: 'medium' as const,
      soundType: 'mixed' as const,
      targetSound: 'ɪə'
    }
  ]
};

export const VOCABULARY_SET_KEYS = Object.keys(VOCABULARY_WORD_SETS) as (keyof typeof VOCABULARY_WORD_SETS)[];

export const ACCURACY_THRESHOLD = 70;

export const LESSON_ICONS = {
  vocabulary: 'book-open-variant',
  listening: 'headphones',
  pronunciation: 'microphone',
  roleplay: 'account-tie-voice',
  shadowing: 'account-voice-off',
  'voice_journaling': 'notebook',
  'word_pairs': 'cards-outline',
} as const;
