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
    hint: 'Подойди к компании Карины и поймай ритм: E или ✦ × 3',
    cardTitle: 'Тот самый танец',
    cardText: 'Никита пришёл в DOSKI с друзьями. Пока он танцевал с закрытыми глазами, друзья ушли с танцпола. Так он оказался рядом с Кариной и её тремя подругами. Карина позвала его танцевать с ними.',
    nextLabel: 'ВЫЙТИ НА УЛИЦУ',
    media: { type: 'video', src: '/assets/first-day.mp4', alt: 'Видео из первого дня знакомства', poster: '/assets/first-day-poster.png' },
  },
  {
    id: 'walk', title: 'Ночная прогулка',
    hint: 'Собери три цветка у ТЮЗа, затем подойди к Карине',
    cardTitle: 'Цветы и пальто',
    cardText: 'После клуба они вышли на улицу, а по дороге к Кифазу на Транспортной Никита подарил Карине цветы, сорванные у ТЮЗа, и отдал ей своё пальто.',
    nextLabel: 'ЗАЙТИ ПОЕСТЬ',
    media: { type: 'video', src: '/assets/flowers.mp4', alt: 'Никита собирает цветы', poster: '/assets/flowers-poster.png' },
  },
  {
    id: 'cafe', title: 'Кифаз / Транспортная',
    hint: 'Подойди к столику и нажми E или ✦',
    cardTitle: 'Первый разговор',
    cardText: 'Они посидели, поели и поговорили. Потом Карина уехала в общежитие, а Никита — домой. Их первый вечер закончился, но история уже началась.',
    nextLabel: 'НАСТУПИЛО УТРО',
    media: { type: 'image', src: '/assets/first-day.jpg', alt: 'Первое совместное фото Никиты и Карины' },
  },
  {
    id: 'morning', title: 'Сообщение наутро',
    hint: 'Подойди к телефону и отправь сообщение: E или ✦',
    cardTitle: '«Проснулись?»',
    cardText: 'Утром Никита написал Карине и её подругам, спросил, как они и проснулись ли. Они уже собирались гулять в парке. Впереди было ещё несколько встреч.',
    nextLabel: 'ПРОДОЛЖИТЬ ИСТОРИЮ',
    media: { type: 'image', src: '/assets/red-outfit.jpeg', alt: 'Карина на прогулке в первый день' },
  },
  {
    id: 'return', title: 'Снова в Омске',
    hint: 'Подойди к Карине и нажми E или ✦',
    cardTitle: 'Остаться вместе',
    cardText: 'После поездки в Рубцовск Карина собиралась переехать в Краснодар. Никита пригласил её и подругу в Омск. После приезда отношения стали ближе, и он предложил Карине остаться. Она вернулась в Омск.',
    nextLabel: 'К ФИНАЛУ',
    media: { type: 'video', src: '/assets/reunion.mp4', alt: 'Встреча Никиты и Карины после прилёта', poster: '/assets/reunion-poster.png' },
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
