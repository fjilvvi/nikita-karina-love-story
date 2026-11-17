export type Chapter = {
  id: string;
  number: string;
  title: string;
  subtitle: string;
};

export type StoryBeat = {
  id: string;
  title: string;
  hint: string;
  cardTitle: string;
  cardText: string;
  nextLabel: string;
  media?: { type: 'image' | 'video'; src: string; alt: string; poster?: string };
};

// All narrative facts below come from Nikita's transcript and supplied media.
export const story: StoryBeat[] = [
  {
    id: 'club', title: 'DOSKI / Омск',
    hint: 'Подойди к Карине: ритм и танец с видео ждут тебя',
    cardTitle: 'Тот самый танец',
    cardText: 'В тот вечер Никита пришёл в DOSKI с друзьями и танцевал, закрыв глаза. Он даже не заметил, как друзья ушли, а сам оказался рядом с Кариной и её тремя подругами. Карина первой позвала его танцевать вместе. Иногда целая история начинается с одного случайного шага.',
    nextLabel: 'ВЫЙТИ НА УЛИЦУ',
    media: { type: 'video', src: 'assets/first-day.mp4', alt: 'Видео из первого дня знакомства', poster: 'assets/first-day-poster.png' },
  },
  {
    id: 'walk', title: 'Ночная прогулка',
    hint: 'Собери три цветка у ТЮЗа, затем подойди к Карине и отдай пальто',
    cardTitle: 'Цветы и пальто',
    cardText: 'После клуба они вышли в омскую ночь и ещё немного побыли рядом. По дороге к Кифазу на Транспортной Никита сорвал для Карины цветы у ТЮЗа и отдал ей своё пальто. Такие маленькие жесты потом вспоминаются особенно тепло.',
    nextLabel: 'ЗАЙТИ ПОЕСТЬ',
    media: { type: 'video', src: 'assets/flowers.mp4', alt: 'Никита собирает цветы', poster: 'assets/flowers-poster.png' },
  },
  {
    id: 'cafe', title: 'Кифаз / Транспортная',
    hint: 'Сначала забери поднос у стойки слева, затем иди к столику справа',
    cardTitle: 'Первый разговор',
    cardText: 'В Кифазе они наконец смогли просто посидеть вместе: поели, поговорили и узнали друг друга чуть ближе. Позже Карина уехала в общежитие, а Никита — домой. Первый вечер подошёл к концу, но им уже было что вспоминать наутро.',
    nextLabel: 'НАСТУПИЛО УТРО',
    media: { type: 'image', src: 'assets/first-day.jpg', alt: 'Первое совместное фото Никиты и Карины' },
  },
  {
    id: 'morning', title: 'Сообщение наутро',
    hint: 'Подойди к телефону и собери сообщение',
    cardTitle: '«Проснулись?»',
    cardText: 'Наутро Никита написал Карине: спросил, как дела и проснулись ли они. Оказалось, она с подругами уже собиралась в парк. Впереди были новые встречи, а пока между ними появился простой и важный повод снова говорить.',
    nextLabel: 'К ВОЗВРАЩЕНИЮ',
    media: { type: 'image', src: 'assets/red-outfit.jpeg', alt: 'Карина на прогулке в первый день' },
  },
  {
    id: 'return', title: 'Снова в Омске',
    hint: 'Подойди к Карине и вспомни путь к этой встрече',
    cardTitle: 'Остаться вместе',
    cardText: 'После Рубцовска Карина собиралась переехать в Краснодар. Никита позвал её и подругу в Омск, и они приехали. За это время их отношения стали ближе. Никита предложил Карине остаться — и она вернулась в Омск, где началась их общая жизнь.',
    nextLabel: 'К ФИНАЛУ',
    media: { type: 'video', src: 'assets/reunion.mp4', alt: 'Встреча Никиты и Карины после прилёта', poster: 'assets/reunion-poster.png' },
  },
];

export const chapters: Chapter[] = [
  { id: 'club', number: '01', title: 'Танцпол', subtitle: 'Омск · DOSKI' },
  { id: 'walk', number: '02', title: 'Прогулка', subtitle: 'Цветы и пальто' },
  { id: 'cafe', number: '03', title: 'Первый вечер', subtitle: 'Кифаз на Транспортной' },
  { id: 'morning', number: '04', title: 'Наутро', subtitle: 'Первое сообщение' },
  { id: 'return', number: '05', title: 'Возвращение', subtitle: 'Остаться в Омске' },
  { id: 'final', number: '06', title: 'Навсегда', subtitle: 'Никита и Карина' },
];
