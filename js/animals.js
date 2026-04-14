/* ============================================
   Animals - Fabeldieren met battle stats
   ============================================ */

const TYPES = {
    VUUR: 'vuur',
    WATER: 'water',
    NATUUR: 'natuur',
    MAGISCH: 'magisch',
    DUISTER: 'duister',
    LICHT: 'licht'
};

// Type effectiveness: type → { sterkTegen: [], zwakTegen: [] }
const TYPE_CHART = {
    [TYPES.VUUR]:    { strong: [TYPES.NATUUR, TYPES.DUISTER], weak: [TYPES.WATER] },
    [TYPES.WATER]:   { strong: [TYPES.VUUR], weak: [TYPES.NATUUR, TYPES.MAGISCH] },
    [TYPES.NATUUR]:  { strong: [TYPES.WATER, TYPES.DUISTER], weak: [TYPES.VUUR] },
    [TYPES.MAGISCH]: { strong: [TYPES.WATER, TYPES.LICHT], weak: [TYPES.DUISTER] },
    [TYPES.DUISTER]: { strong: [TYPES.MAGISCH], weak: [TYPES.NATUUR, TYPES.LICHT] },
    [TYPES.LICHT]:   { strong: [TYPES.DUISTER, TYPES.VUUR], weak: [TYPES.MAGISCH] }
};

function getTypeEffectiveness(attackType, defenseType) {
    const chart = TYPE_CHART[attackType];
    if (!chart) return 1;
    if (chart.strong.includes(defenseType)) return 1.5;
    if (chart.weak.includes(defenseType)) return 0.5;
    return 1;
}

const ANIMAL_DEFS = [
    {
        id: 'eenhoorn',
        name: 'Eenhoorn',
        emoji: '🦄',
        type: TYPES.LICHT,
        description: 'Een majestueuze eenhoorn met een glanzende hoorn.',
        food: 'Regenboogbloemen 🌈',
        baseHp: 45, baseAtk: 12, baseDef: 10, baseSpd: 14,
        moves: [
            { name: 'Hoornstoot', power: 20, type: TYPES.LICHT, emoji: '✨' },
            { name: 'Regenboogstraal', power: 30, type: TYPES.LICHT, emoji: '🌈' },
            { name: 'Genezend Licht', power: 0, type: TYPES.LICHT, emoji: '💖', heal: 20 },
            { name: 'Sterrenstorm', power: 40, type: TYPES.MAGISCH, emoji: '⭐' }
        ],
        areas: ['jungle', 'village'], rarity: 0.12, catchRate: 0.4
    },
    {
        id: 'draak',
        name: 'Draak',
        emoji: '🐉',
        type: TYPES.VUUR,
        description: 'Een vurige draak die vlammen spuwt!',
        food: 'Vuurstenen 🔥',
        baseHp: 55, baseAtk: 18, baseDef: 12, baseSpd: 10,
        moves: [
            { name: 'Vuurspuwen', power: 25, type: TYPES.VUUR, emoji: '🔥' },
            { name: 'Klauw', power: 18, type: TYPES.DUISTER, emoji: '🦖' },
            { name: 'Inferno', power: 45, type: TYPES.VUUR, emoji: '🌋' },
            { name: 'Drakenwoede', power: 35, type: TYPES.VUUR, emoji: '😤' }
        ],
        areas: ['volcano'], rarity: 0.08, catchRate: 0.25
    },
    {
        id: 'feniks',
        name: 'Feniks',
        emoji: '🔥',
        type: TYPES.VUUR,
        description: 'Een prachtige vuurvogel die herrijst uit de as.',
        food: 'Asstof & vlammen 🌋',
        baseHp: 40, baseAtk: 16, baseDef: 8, baseSpd: 18,
        moves: [
            { name: 'Vlammenwervel', power: 22, type: TYPES.VUUR, emoji: '🔥' },
            { name: 'Wedergeboorte', power: 0, type: TYPES.LICHT, emoji: '✨', heal: 25 },
            { name: 'Vuurdans', power: 35, type: TYPES.VUUR, emoji: '💃' },
            { name: 'Zonnestraal', power: 30, type: TYPES.LICHT, emoji: '☀️' }
        ],
        areas: ['volcano', 'jungle'], rarity: 0.06, catchRate: 0.3
    },
    {
        id: 'kitsune',
        name: 'Kitsune',
        emoji: '🦊',
        type: TYPES.MAGISCH,
        description: 'Een magische vos met meerdere staarten. Heel slim!',
        food: 'Tofu & rijstballen 🍙',
        baseHp: 38, baseAtk: 14, baseDef: 9, baseSpd: 20,
        moves: [
            { name: 'Vossenlist', power: 20, type: TYPES.MAGISCH, emoji: '🦊' },
            { name: 'Illusie', power: 28, type: TYPES.MAGISCH, emoji: '🎭' },
            { name: 'Staartklap', power: 15, type: TYPES.NATUUR, emoji: '💫' },
            { name: 'Geestenvuur', power: 38, type: TYPES.MAGISCH, emoji: '👻' }
        ],
        areas: ['jungle', 'cave'], rarity: 0.10, catchRate: 0.35
    },
    {
        id: 'mogwai',
        name: 'Mogwai',
        emoji: '🐰',
        type: TYPES.LICHT,
        description: 'Een schattig pluizig wezentje met grote ogen.',
        food: 'Fruit & koekjes 🍪',
        baseHp: 35, baseAtk: 10, baseDef: 12, baseSpd: 12,
        moves: [
            { name: 'Knuffelaanval', power: 15, type: TYPES.LICHT, emoji: '🤗' },
            { name: 'Schreeuw', power: 22, type: TYPES.MAGISCH, emoji: '📢' },
            { name: 'Lichtflits', power: 25, type: TYPES.LICHT, emoji: '💡' },
            { name: 'Bescherm', power: 0, type: TYPES.LICHT, emoji: '🛡️', heal: 15 }
        ],
        areas: ['village', 'jungle'], rarity: 0.18, catchRate: 0.5
    },
    {
        id: 'griffioen',
        name: 'Griffioen',
        emoji: '🦅',
        type: TYPES.NATUUR,
        description: 'Half adelaar, half leeuw — koninklijk en sterk!',
        food: 'Vers wild 🥩',
        baseHp: 50, baseAtk: 17, baseDef: 14, baseSpd: 15,
        moves: [
            { name: 'Duikvlucht', power: 28, type: TYPES.NATUUR, emoji: '🦅' },
            { name: 'Leeuwenklauw', power: 22, type: TYPES.NATUUR, emoji: '🦁' },
            { name: 'Windvlaag', power: 18, type: TYPES.MAGISCH, emoji: '💨' },
            { name: 'Koninklijke Aanval', power: 42, type: TYPES.NATUUR, emoji: '👑' }
        ],
        areas: ['cave', 'volcano'], rarity: 0.05, catchRate: 0.2
    },
    {
        id: 'pegasus',
        name: 'Pegasus',
        emoji: '🐴',
        type: TYPES.LICHT,
        description: 'Een vliegend paard met zilveren vleugels.',
        food: 'Wolkengras ☁️',
        baseHp: 42, baseAtk: 13, baseDef: 11, baseSpd: 22,
        moves: [
            { name: 'Hemelse Trap', power: 20, type: TYPES.LICHT, emoji: '🐴' },
            { name: 'Wolkenstorm', power: 30, type: TYPES.WATER, emoji: '⛈️' },
            { name: 'Vleugelslag', power: 25, type: TYPES.NATUUR, emoji: '🪶' },
            { name: 'Zilveren Gloed', power: 0, type: TYPES.LICHT, emoji: '🌟', heal: 22 }
        ],
        areas: ['jungle'], rarity: 0.04, catchRate: 0.2
    },
    {
        id: 'zeemeermin',
        name: 'Zeemeermin',
        emoji: '🧜',
        type: TYPES.WATER,
        description: 'Een betoverende zeemeermin die prachtig kan zingen.',
        food: 'Zeewier & parels 🌊',
        baseHp: 44, baseAtk: 14, baseDef: 10, baseSpd: 16,
        moves: [
            { name: 'Watergolf', power: 22, type: TYPES.WATER, emoji: '🌊' },
            { name: 'Sirenenzang', power: 30, type: TYPES.MAGISCH, emoji: '🎶' },
            { name: 'Bubbels', power: 18, type: TYPES.WATER, emoji: '🫧' },
            { name: 'Vloedgolf', power: 40, type: TYPES.WATER, emoji: '🌊' }
        ],
        areas: ['cave'], rarity: 0.06, catchRate: 0.3
    },
    {
        id: 'hydra',
        name: 'Hydra',
        emoji: '🐍',
        type: TYPES.DUISTER,
        description: 'Een angstaanjagende meerkoppige slang!',
        food: 'Drie porties vlees 🥩',
        baseHp: 60, baseAtk: 20, baseDef: 15, baseSpd: 8,
        moves: [
            { name: 'Drievoudige Beet', power: 32, type: TYPES.DUISTER, emoji: '🐍' },
            { name: 'Gifspuwen', power: 25, type: TYPES.DUISTER, emoji: '☠️' },
            { name: 'Staartslag', power: 20, type: TYPES.NATUUR, emoji: '💥' },
            { name: 'Verslinden', power: 45, type: TYPES.DUISTER, emoji: '😈' }
        ],
        areas: ['cave', 'volcano'], rarity: 0.03, catchRate: 0.15
    },
    {
        id: 'gremlin',
        name: 'Gremlin',
        emoji: '👹',
        type: TYPES.DUISTER,
        description: 'Een ondeugende gremlin die van chaos houdt!',
        food: 'Insecten 🦗',
        baseHp: 36, baseAtk: 15, baseDef: 8, baseSpd: 19,
        moves: [
            { name: 'Kattenkwaad', power: 20, type: TYPES.DUISTER, emoji: '😈' },
            { name: 'Sluipbeet', power: 28, type: TYPES.DUISTER, emoji: '👹' },
            { name: 'Chaos', power: 35, type: TYPES.MAGISCH, emoji: '🌀' },
            { name: 'Valstrik', power: 18, type: TYPES.NATUUR, emoji: '🪤' }
        ],
        areas: ['cave', 'village'], rarity: 0.12, catchRate: 0.4
    },
    {
        id: 'bakunawa',
        name: 'Bakunawa',
        emoji: '🌙',
        type: TYPES.WATER,
        description: 'Een mythische maandraak. Mysterieus en krachtig!',
        food: 'Maanvissen 🐟',
        baseHp: 52, baseAtk: 19, baseDef: 13, baseSpd: 14,
        moves: [
            { name: 'Maanbeet', power: 28, type: TYPES.WATER, emoji: '🌙' },
            { name: 'Nachtgolf', power: 32, type: TYPES.DUISTER, emoji: '🌑' },
            { name: 'Getijde', power: 38, type: TYPES.WATER, emoji: '🌊' },
            { name: 'Maansverduistering', power: 48, type: TYPES.DUISTER, emoji: '🌑' }
        ],
        areas: ['cave'], rarity: 0.02, catchRate: 0.1
    },
    // ===== NIEUWE FABELDIEREN =====
    {
        id: 'cerberus',
        name: 'Cerberus',
        emoji: '🐕',
        type: TYPES.DUISTER,
        description: 'De driekoppige helhond, bewaker van de onderwereld.',
        food: 'Schimmenvlees 🦴',
        baseHp: 65, baseAtk: 22, baseDef: 16, baseSpd: 9,
        moves: [
            { name: 'Drievoudige Beet', power: 35, type: TYPES.DUISTER, emoji: '🐕' },
            { name: 'Helvuur', power: 30, type: TYPES.VUUR, emoji: '🔥' },
            { name: 'Schaduwgehuil', power: 25, type: TYPES.DUISTER, emoji: '🌑' },
            { name: 'Wraakzuchtige Beet', power: 48, type: TYPES.DUISTER, emoji: '💀' }
        ],
        areas: ['cave'], rarity: 0.02, catchRate: 0.1
    },
    {
        id: 'minotaurus',
        name: 'Minotaurus',
        emoji: '🐂',
        type: TYPES.NATUUR,
        description: 'Een reusachtige stier-mens uit het labyrint.',
        food: 'Graan & hooi 🌾',
        baseHp: 58, baseAtk: 21, baseDef: 18, baseSpd: 6,
        moves: [
            { name: 'Hoorncharge', power: 30, type: TYPES.NATUUR, emoji: '🐂' },
            { name: 'Aardbeving', power: 35, type: TYPES.NATUUR, emoji: '💥' },
            { name: 'Verpletter', power: 40, type: TYPES.NATUUR, emoji: '🪨' },
            { name: 'Razende Storm', power: 50, type: TYPES.DUISTER, emoji: '😤' }
        ],
        areas: ['cave'], rarity: 0.03, catchRate: 0.15
    },
    {
        id: 'sprite',
        name: 'Bosgeest',
        emoji: '🧚',
        type: TYPES.NATUUR,
        description: 'Een klein feeachtig wezentje dat tussen de bomen leeft.',
        food: 'Dauwdruppels 💧',
        baseHp: 30, baseAtk: 8, baseDef: 7, baseSpd: 24,
        moves: [
            { name: 'Bladerregen', power: 18, type: TYPES.NATUUR, emoji: '🍃' },
            { name: 'Feeënstof', power: 22, type: TYPES.MAGISCH, emoji: '✨' },
            { name: 'Genezing', power: 0, type: TYPES.NATUUR, emoji: '💚', heal: 18 },
            { name: 'Wortelvang', power: 28, type: TYPES.NATUUR, emoji: '🌱' }
        ],
        areas: ['jungle'], rarity: 0.15, catchRate: 0.45
    },
    {
        id: 'yeti',
        name: 'Yeti',
        emoji: '🦍',
        type: TYPES.WATER,
        description: 'De grote sneeuwman van de bergen. Ziet er eng uit maar is lief!',
        food: 'IJsbessen ❄️',
        baseHp: 62, baseAtk: 17, baseDef: 20, baseSpd: 7,
        moves: [
            { name: 'IJsvuist', power: 28, type: TYPES.WATER, emoji: '🥶' },
            { name: 'Sneeuwstorm', power: 32, type: TYPES.WATER, emoji: '❄️' },
            { name: 'Brullen', power: 20, type: TYPES.DUISTER, emoji: '📢' },
            { name: 'Lawine', power: 42, type: TYPES.WATER, emoji: '🏔️' }
        ],
        areas: ['cave'], rarity: 0.04, catchRate: 0.2
    },
    {
        id: 'salamander',
        name: 'Vuursalamander',
        emoji: '🦎',
        type: TYPES.VUUR,
        description: 'Een gloeiende salamander die in vuur leeft.',
        food: 'Lavastenen 🌋',
        baseHp: 34, baseAtk: 14, baseDef: 9, baseSpd: 16,
        moves: [
            { name: 'Vuurstaart', power: 20, type: TYPES.VUUR, emoji: '🔥' },
            { name: 'Lavabal', power: 28, type: TYPES.VUUR, emoji: '🌋' },
            { name: 'Gloeiende Beet', power: 22, type: TYPES.VUUR, emoji: '🦎' },
            { name: 'Vuurmuur', power: 0, type: TYPES.VUUR, emoji: '🧱', heal: 16 }
        ],
        areas: ['volcano'], rarity: 0.14, catchRate: 0.45
    },
    {
        id: 'basilisk',
        name: 'Basilisk',
        emoji: '🐲',
        type: TYPES.DUISTER,
        description: 'De koning der slangen, met een versteenende blik!',
        food: 'Edelstenen 💎',
        baseHp: 48, baseAtk: 19, baseDef: 14, baseSpd: 11,
        moves: [
            { name: 'Versteende Blik', power: 30, type: TYPES.DUISTER, emoji: '👁️' },
            { name: 'Gifspuwen', power: 25, type: TYPES.DUISTER, emoji: '☠️' },
            { name: 'Staartslag', power: 22, type: TYPES.NATUUR, emoji: '🐍' },
            { name: 'Vernietiging', power: 45, type: TYPES.DUISTER, emoji: '💀' }
        ],
        areas: ['cave', 'volcano'], rarity: 0.04, catchRate: 0.18
    },
    {
        id: 'nymf',
        name: 'Waternimf',
        emoji: '💧',
        type: TYPES.WATER,
        description: 'Een sierlijke watergeest die in rivieren woont.',
        food: 'Waterlelies 🪷',
        baseHp: 38, baseAtk: 11, baseDef: 10, baseSpd: 18,
        moves: [
            { name: 'Waterstraal', power: 20, type: TYPES.WATER, emoji: '💧' },
            { name: 'Regenval', power: 25, type: TYPES.WATER, emoji: '🌧️' },
            { name: 'Genezende Bron', power: 0, type: TYPES.WATER, emoji: '💧', heal: 20 },
            { name: 'Tsunami', power: 38, type: TYPES.WATER, emoji: '🌊' }
        ],
        areas: ['jungle', 'cave'], rarity: 0.10, catchRate: 0.35
    },
    {
        id: 'golem',
        name: 'Steengolem',
        emoji: '🗿',
        type: TYPES.NATUUR,
        description: 'Een kolossale rots die tot leven is gekomen.',
        food: 'Mineralen 🪨',
        baseHp: 70, baseAtk: 16, baseDef: 25, baseSpd: 4,
        moves: [
            { name: 'Rotsstamp', power: 25, type: TYPES.NATUUR, emoji: '🗿' },
            { name: 'Steenworp', power: 30, type: TYPES.NATUUR, emoji: '🪨' },
            { name: 'Aardverschuiving', power: 40, type: TYPES.NATUUR, emoji: '💥' },
            { name: 'IJzeren Huid', power: 0, type: TYPES.NATUUR, emoji: '🛡️', heal: 25 }
        ],
        areas: ['cave', 'volcano'], rarity: 0.05, catchRate: 0.2
    },
    {
        id: 'sfinks',
        name: 'Sfinx',
        emoji: '🦁',
        type: TYPES.MAGISCH,
        description: 'De raadselachtige sfinx: half leeuw, half mens.',
        food: 'Mysterieuze kruiden 🌿',
        baseHp: 50, baseAtk: 16, baseDef: 14, baseSpd: 13,
        moves: [
            { name: 'Raadsel', power: 22, type: TYPES.MAGISCH, emoji: '❓' },
            { name: 'Klauwaanval', power: 28, type: TYPES.NATUUR, emoji: '🦁' },
            { name: 'Mentale Kracht', power: 35, type: TYPES.MAGISCH, emoji: '🧠' },
            { name: 'Woestijnstorm', power: 40, type: TYPES.NATUUR, emoji: '🏜️' }
        ],
        areas: ['volcano', 'cave'], rarity: 0.04, catchRate: 0.22
    },
    {
        id: 'wolpertinger',
        name: 'Wolpertinger',
        emoji: '🐇',
        type: TYPES.NATUUR,
        description: 'Een konijn met hertengewei en vleugels. Heel zeldzaam!',
        food: 'Alpenbloemen 🌸',
        baseHp: 36, baseAtk: 12, baseDef: 10, baseSpd: 20,
        moves: [
            { name: 'Geweistoot', power: 22, type: TYPES.NATUUR, emoji: '🦌' },
            { name: 'Vleugelwind', power: 18, type: TYPES.LICHT, emoji: '🪶' },
            { name: 'Snelle Sprong', power: 25, type: TYPES.NATUUR, emoji: '🐇' },
            { name: 'Bergecho', power: 32, type: TYPES.MAGISCH, emoji: '🏔️' }
        ],
        areas: ['jungle'], rarity: 0.06, catchRate: 0.3
    },
    {
        id: 'kraken',
        name: 'Kraken',
        emoji: '🐙',
        type: TYPES.WATER,
        description: 'Het gigantische zeemonster met tentakels van staal!',
        food: 'Walviskrill 🦐',
        baseHp: 68, baseAtk: 22, baseDef: 14, baseSpd: 6,
        moves: [
            { name: 'Tentakelslag', power: 28, type: TYPES.WATER, emoji: '🐙' },
            { name: 'Inktspuit', power: 22, type: TYPES.DUISTER, emoji: '🖤' },
            { name: 'Maalstroom', power: 38, type: TYPES.WATER, emoji: '🌊' },
            { name: 'Verpletterende Greep', power: 50, type: TYPES.WATER, emoji: '💀' }
        ],
        areas: ['cave'], rarity: 0.02, catchRate: 0.08
    },
    {
        id: 'djinn',
        name: 'Djinn',
        emoji: '🧞',
        type: TYPES.MAGISCH,
        description: 'Een machtige geest uit een magische lamp.',
        food: 'Wierook & specerijen 🪔',
        baseHp: 46, baseAtk: 18, baseDef: 10, baseSpd: 17,
        moves: [
            { name: 'Wensvuur', power: 25, type: TYPES.MAGISCH, emoji: '🧞' },
            { name: 'Zandstorm', power: 30, type: TYPES.NATUUR, emoji: '🏜️' },
            { name: 'Teleportatie', power: 0, type: TYPES.MAGISCH, emoji: '✨', heal: 20 },
            { name: 'Kosmische Kracht', power: 42, type: TYPES.MAGISCH, emoji: '🌌' }
        ],
        areas: ['volcano', 'cave'], rarity: 0.04, catchRate: 0.2
    },
    {
        id: 'alicorn',
        name: 'Alicorn',
        emoji: '🦄',
        type: TYPES.LICHT,
        description: 'Een eenhoorn met vleugels! Het zeldzaamste fabeldier.',
        food: 'Sterrenstof ⭐',
        baseHp: 55, baseAtk: 17, baseDef: 14, baseSpd: 18,
        moves: [
            { name: 'Regenboogvlucht', power: 30, type: TYPES.LICHT, emoji: '🌈' },
            { name: 'Heilig Schild', power: 0, type: TYPES.LICHT, emoji: '🛡️', heal: 28 },
            { name: 'Zonnevlam', power: 35, type: TYPES.VUUR, emoji: '☀️' },
            { name: 'Goddelijke Straal', power: 50, type: TYPES.LICHT, emoji: '💫' }
        ],
        areas: ['jungle'], rarity: 0.01, catchRate: 0.05
    },
    {
        id: 'trol',
        name: 'Bostrol',
        emoji: '👹',
        type: TYPES.NATUUR,
        description: 'Een grote lompe trol die onder bruggen woont.',
        food: 'Paddenstoelen 🍄',
        baseHp: 56, baseAtk: 18, baseDef: 16, baseSpd: 5,
        moves: [
            { name: 'Knots', power: 25, type: TYPES.NATUUR, emoji: '🏏' },
            { name: 'Keientrap', power: 30, type: TYPES.NATUUR, emoji: '🪨' },
            { name: 'Brullen', power: 20, type: TYPES.DUISTER, emoji: '📢' },
            { name: 'Verpletter', power: 42, type: TYPES.NATUUR, emoji: '💥' }
        ],
        areas: ['jungle', 'cave'], rarity: 0.08, catchRate: 0.3
    },
    {
        id: 'werwolf',
        name: 'Weerwolf',
        emoji: '🐺',
        type: TYPES.DUISTER,
        description: 'Bij volle maan verandert dit wezen in een beest!',
        food: 'Rauw vlees 🥩',
        baseHp: 48, baseAtk: 19, baseDef: 11, baseSpd: 18,
        moves: [
            { name: 'Wolvenbeet', power: 25, type: TYPES.DUISTER, emoji: '🐺' },
            { name: 'Maanlicht Huil', power: 22, type: TYPES.MAGISCH, emoji: '🌕' },
            { name: 'Klauwen', power: 32, type: TYPES.DUISTER, emoji: '🦊' },
            { name: 'Woeste Aanval', power: 42, type: TYPES.DUISTER, emoji: '😡' }
        ],
        areas: ['jungle', 'cave'], rarity: 0.05, catchRate: 0.22
    },
    {
        id: 'elfje',
        name: 'Elfje',
        emoji: '🧝',
        type: TYPES.MAGISCH,
        description: 'Een elegant wezen met puntige oren en magie.',
        food: 'Honingmelk 🍯',
        baseHp: 40, baseAtk: 15, baseDef: 9, baseSpd: 19,
        moves: [
            { name: 'Magische Pijl', power: 22, type: TYPES.MAGISCH, emoji: '🏹' },
            { name: 'Elven Lied', power: 0, type: TYPES.MAGISCH, emoji: '🎵', heal: 18 },
            { name: 'Natuur Woede', power: 30, type: TYPES.NATUUR, emoji: '🍃' },
            { name: 'Sterrenschot', power: 38, type: TYPES.MAGISCH, emoji: '⭐' }
        ],
        areas: ['jungle'], rarity: 0.07, catchRate: 0.32
    },
    {
        id: 'mantikoor',
        name: 'Mantikoor',
        emoji: '🦂',
        type: TYPES.VUUR,
        description: 'Leeuwenlichaam, schorpioenenstaart, vleermuisvleugels!',
        food: 'Woestijnhagedissen 🦎',
        baseHp: 52, baseAtk: 20, baseDef: 13, baseSpd: 12,
        moves: [
            { name: 'Giftsteek', power: 28, type: TYPES.DUISTER, emoji: '🦂' },
            { name: 'Vuurklauw', power: 25, type: TYPES.VUUR, emoji: '🔥' },
            { name: 'Vleugelstorm', power: 30, type: TYPES.NATUUR, emoji: '🦇' },
            { name: 'Verwoestende Charge', power: 44, type: TYPES.VUUR, emoji: '💥' }
        ],
        areas: ['volcano'], rarity: 0.04, catchRate: 0.18
    },
    // ===== WOESTIJN FABELDIEREN =====
    {
        id: 'scarabee',
        name: 'Goudscarabee',
        emoji: '🪲',
        type: TYPES.MAGISCH,
        description: 'Een glanzende kever met magische krachten uit de woestijn.',
        food: 'Woestijnzand & goud 🏜️',
        baseHp: 38, baseAtk: 14, baseDef: 16, baseSpd: 15,
        moves: [
            { name: 'Gouden Schild', power: 0, type: TYPES.MAGISCH, emoji: '🛡️', heal: 18 },
            { name: 'Zandwervel', power: 22, type: TYPES.NATUUR, emoji: '🌪️' },
            { name: 'Zonneglans', power: 28, type: TYPES.LICHT, emoji: '☀️' },
            { name: 'Piramidekracht', power: 38, type: TYPES.MAGISCH, emoji: '🔺' }
        ],
        areas: ['desert'], rarity: 0.12, catchRate: 0.38
    },
    {
        id: 'zandworm',
        name: 'Zandworm',
        emoji: '🪱',
        type: TYPES.NATUUR,
        description: 'Een gigantische worm die door het woestijnzand zwemt!',
        food: 'Ondergrondse kristallen 💎',
        baseHp: 62, baseAtk: 20, baseDef: 18, baseSpd: 5,
        moves: [
            { name: 'Verslinden', power: 32, type: TYPES.NATUUR, emoji: '😮' },
            { name: 'Zandgolf', power: 28, type: TYPES.NATUUR, emoji: '🏜️' },
            { name: 'Aardschok', power: 35, type: TYPES.NATUUR, emoji: '💥' },
            { name: 'Woestijnval', power: 45, type: TYPES.DUISTER, emoji: '🕳️' }
        ],
        areas: ['desert'], rarity: 0.04, catchRate: 0.18
    },
    {
        id: 'fenrir',
        name: 'Fenrir',
        emoji: '🐺',
        type: TYPES.DUISTER,
        description: 'De legendarische reuzenwolf uit de Noordse mythen.',
        food: 'Maanlichtvlees 🌙',
        baseHp: 58, baseAtk: 22, baseDef: 12, baseSpd: 16,
        moves: [
            { name: 'Schaduwbeet', power: 30, type: TYPES.DUISTER, emoji: '🐺' },
            { name: 'IJzige Huil', power: 25, type: TYPES.WATER, emoji: '🌕' },
            { name: 'Kettingbreuk', power: 35, type: TYPES.DUISTER, emoji: '⛓️' },
            { name: 'Ragnarok', power: 50, type: TYPES.DUISTER, emoji: '💀' }
        ],
        areas: ['desert', 'ice'], rarity: 0.02, catchRate: 0.1
    },
    // ===== MOERAS FABELDIEREN =====
    {
        id: 'kappa',
        name: 'Kappa',
        emoji: '🐢',
        type: TYPES.WATER,
        description: 'Een sluw waterwezen met een schotel op zijn hoofd.',
        food: 'Komkommers 🥒',
        baseHp: 42, baseAtk: 14, baseDef: 14, baseSpd: 13,
        moves: [
            { name: 'Waterstraal', power: 22, type: TYPES.WATER, emoji: '💧' },
            { name: 'Schildbash', power: 18, type: TYPES.NATUUR, emoji: '🛡️' },
            { name: 'Moerasval', power: 28, type: TYPES.WATER, emoji: '🏞️' },
            { name: 'Draaikolk', power: 38, type: TYPES.WATER, emoji: '🌀' }
        ],
        areas: ['swamp'], rarity: 0.10, catchRate: 0.35
    },
    {
        id: 'wisp',
        name: 'Dwaallicht',
        emoji: '🔮',
        type: TYPES.MAGISCH,
        description: 'Een mysterieus lichtje dat reizigers in het moeras verdwaalt.',
        food: 'Zielenvuur 👻',
        baseHp: 28, baseAtk: 16, baseDef: 6, baseSpd: 24,
        moves: [
            { name: 'Vlam Lokken', power: 20, type: TYPES.MAGISCH, emoji: '🔮' },
            { name: 'Geestenvlam', power: 28, type: TYPES.VUUR, emoji: '🔥' },
            { name: 'Verdwalen', power: 25, type: TYPES.MAGISCH, emoji: '🌫️' },
            { name: 'Zielenvuur', power: 42, type: TYPES.DUISTER, emoji: '👻' }
        ],
        areas: ['swamp', 'ruins'], rarity: 0.08, catchRate: 0.30
    },
    {
        id: 'slangenkoning',
        name: 'Slangenkoning',
        emoji: '🐍',
        type: TYPES.DUISTER,
        description: 'De koning van alle slangen, met giftige kroon.',
        food: 'Kikkers & ratten 🐸',
        baseHp: 52, baseAtk: 19, baseDef: 13, baseSpd: 15,
        moves: [
            { name: 'Gifbeet', power: 25, type: TYPES.DUISTER, emoji: '🐍' },
            { name: 'Giftige Kroon', power: 30, type: TYPES.DUISTER, emoji: '👑' },
            { name: 'Wurgen', power: 22, type: TYPES.NATUUR, emoji: '🐍' },
            { name: 'Dodelijk Gif', power: 44, type: TYPES.DUISTER, emoji: '☠️' }
        ],
        areas: ['swamp'], rarity: 0.05, catchRate: 0.22
    },
    // ===== IJSLAND FABELDIEREN =====
    {
        id: 'ijsdraak',
        name: 'IJsdraak',
        emoji: '🐉',
        type: TYPES.WATER,
        description: 'Een majestueuze draak van eeuwig ijs!',
        food: 'Bevroren kristallen ❄️',
        baseHp: 56, baseAtk: 19, baseDef: 14, baseSpd: 12,
        moves: [
            { name: 'IJsadem', power: 28, type: TYPES.WATER, emoji: '❄️' },
            { name: 'Bevriezing', power: 32, type: TYPES.WATER, emoji: '🥶' },
            { name: 'IJsklauw', power: 24, type: TYPES.NATUUR, emoji: '🐉' },
            { name: 'Blizzard', power: 45, type: TYPES.WATER, emoji: '🌨️' }
        ],
        areas: ['ice'], rarity: 0.03, catchRate: 0.15
    },
    {
        id: 'sneeuwuil',
        name: 'Sneeuwuil',
        emoji: '🦉',
        type: TYPES.LICHT,
        description: 'Een wijze uil met veren van sneeuw en sterren.',
        food: 'IJsmuizen ❄️',
        baseHp: 36, baseAtk: 15, baseDef: 10, baseSpd: 20,
        moves: [
            { name: 'Vleugelbries', power: 20, type: TYPES.LICHT, emoji: '🪶' },
            { name: 'Sterrenblik', power: 26, type: TYPES.MAGISCH, emoji: '⭐' },
            { name: 'IJswind', power: 28, type: TYPES.WATER, emoji: '🌬️' },
            { name: 'Noorderlicht', power: 40, type: TYPES.LICHT, emoji: '🌌' }
        ],
        areas: ['ice'], rarity: 0.08, catchRate: 0.32
    },
    {
        id: 'wendigo',
        name: 'Wendigo',
        emoji: '🦌',
        type: TYPES.DUISTER,
        description: 'Een angstaanjagend geestwezen uit de bevroren bossen.',
        food: 'Schaduwvlees 🌑',
        baseHp: 54, baseAtk: 21, baseDef: 11, baseSpd: 17,
        moves: [
            { name: 'Bevroren Klauw', power: 28, type: TYPES.DUISTER, emoji: '🦌' },
            { name: 'IJsgehuil', power: 25, type: TYPES.WATER, emoji: '🌬️' },
            { name: 'Zielenschreeuw', power: 32, type: TYPES.DUISTER, emoji: '😱' },
            { name: 'Eeuwige Kou', power: 46, type: TYPES.DUISTER, emoji: '❄️' }
        ],
        areas: ['ice'], rarity: 0.03, catchRate: 0.14
    },
    // ===== RUÏNES FABELDIEREN =====
    {
        id: 'gargoyle',
        name: 'Gargoyle',
        emoji: '🗿',
        type: TYPES.NATUUR,
        description: 'Een levend stenen standbeeld dat de ruïnes bewaakt.',
        food: 'Stenen & mos 🪨',
        baseHp: 55, baseAtk: 16, baseDef: 22, baseSpd: 6,
        moves: [
            { name: 'Steenworp', power: 24, type: TYPES.NATUUR, emoji: '🪨' },
            { name: 'Vleugelstamp', power: 28, type: TYPES.NATUUR, emoji: '🦇' },
            { name: 'Verstening', power: 30, type: TYPES.MAGISCH, emoji: '🗿' },
            { name: 'Stenen Oordeel', power: 42, type: TYPES.NATUUR, emoji: '⚖️' }
        ],
        areas: ['ruins'], rarity: 0.08, catchRate: 0.28
    },
    {
        id: 'medusa',
        name: 'Medusa',
        emoji: '🐍',
        type: TYPES.MAGISCH,
        description: 'De gevreesde vrouw met slangen als haar.',
        food: 'Versteende muizen 🐭',
        baseHp: 46, baseAtk: 18, baseDef: 12, baseSpd: 16,
        moves: [
            { name: 'Versteende Blik', power: 30, type: TYPES.MAGISCH, emoji: '👁️' },
            { name: 'Slangenbeet', power: 25, type: TYPES.DUISTER, emoji: '🐍' },
            { name: 'Gifschuiven', power: 28, type: TYPES.DUISTER, emoji: '☠️' },
            { name: 'Gorgon Woede', power: 45, type: TYPES.MAGISCH, emoji: '😱' }
        ],
        areas: ['ruins'], rarity: 0.04, catchRate: 0.18
    },
    {
        id: 'chimaera',
        name: 'Chimaera',
        emoji: '🦁',
        type: TYPES.VUUR,
        description: 'Leeuw, geit en slang in één verschrikkelijk beest!',
        food: 'Alles! 🍖',
        baseHp: 60, baseAtk: 21, baseDef: 15, baseSpd: 11,
        moves: [
            { name: 'Leeuwenbrul', power: 26, type: TYPES.NATUUR, emoji: '🦁' },
            { name: 'Vuurspuwen', power: 30, type: TYPES.VUUR, emoji: '🔥' },
            { name: 'Slangengif', power: 25, type: TYPES.DUISTER, emoji: '🐍' },
            { name: 'Drievoudige Furie', power: 48, type: TYPES.VUUR, emoji: '💥' }
        ],
        areas: ['ruins', 'desert'], rarity: 0.03, catchRate: 0.12
    }
];

function getAnimalDef(id) {
    return ANIMAL_DEFS.find(a => a.id === id);
}

function createPartyAnimal(id, level) {
    const def = getAnimalDef(id);
    if (!def) return null;
    level = level || 1;
    const lvlMult = 1 + (level - 1) * 0.12;
    return {
        id: def.id,
        nickname: def.name,
        level: level,
        xp: 0,
        xpNeeded: level * 25,
        hp: Math.round(def.baseHp * lvlMult),
        maxHp: Math.round(def.baseHp * lvlMult),
        atk: Math.round(def.baseAtk * lvlMult),
        def: Math.round(def.baseDef * lvlMult),
        spd: Math.round(def.baseSpd * lvlMult),
        happiness: 80,
        hunger: 80
    };
}

function getXpForLevel(level) {
    return level * 25;
}

function gainXp(animal, amount) {
    animal.xp += amount;
    const messages = [];
    while (animal.xp >= animal.xpNeeded && animal.level < 50) {
        animal.xp -= animal.xpNeeded;
        animal.level++;
        const def = getAnimalDef(animal.id);
        const lvlMult = 1 + (animal.level - 1) * 0.12;
        animal.maxHp = Math.round(def.baseHp * lvlMult);
        animal.hp = animal.maxHp;
        animal.atk = Math.round(def.baseAtk * lvlMult);
        animal.def = Math.round(def.baseDef * lvlMult);
        animal.spd = Math.round(def.baseSpd * lvlMult);
        animal.xpNeeded = getXpForLevel(animal.level);
        messages.push(`${animal.nickname} is nu level ${animal.level}! 🎉`);
    }
    return messages;
}

function getTypeEmoji(type) {
    const map = {
        [TYPES.VUUR]: '🔥',
        [TYPES.WATER]: '💧',
        [TYPES.NATUUR]: '🌿',
        [TYPES.MAGISCH]: '✨',
        [TYPES.DUISTER]: '🌑',
        [TYPES.LICHT]: '💡'
    };
    return map[type] || '❓';
}

function getTypeColor(type) {
    const map = {
        [TYPES.VUUR]: '#E53935',
        [TYPES.WATER]: '#29B6F6',
        [TYPES.NATUUR]: '#66BB6A',
        [TYPES.MAGISCH]: '#AB47BC',
        [TYPES.DUISTER]: '#5C5C8A',
        [TYPES.LICHT]: '#FFD700'
    };
    return map[type] || '#999';
}

// --- Pixel Art Sprite Drawing ---
// Draws a blocky pixel-art creature on a 64×64 canvas
function drawAnimalSprite(canvasId, animalId, flipped) {
    const c = document.getElementById(canvasId);
    const cx = c.getContext('2d');
    cx.clearRect(0, 0, 64, 64);
    if (flipped) {
        cx.save();
        cx.scale(-1, 1);
        cx.translate(-64, 0);
    }
    const P = 4; // pixel size (64/16 grid)
    function r(x, y, w, h, col) {
        cx.fillStyle = col;
        cx.fillRect(x * P, y * P, w * P, h * P);
    }

    switch(animalId) {
        case 'eenhoorn':
            // Horn
            r(7, 0, 2, 3, '#FFD700');
            r(8, 0, 1, 1, '#FFF59D');
            // Head
            r(5, 3, 6, 4, '#F5F5F5');
            // Eye
            r(8, 4, 2, 2, '#4A90D9');
            r(9, 4, 1, 1, '#1a1a2e');
            // Mane (rainbow)
            r(4, 3, 1, 5, '#E53935');
            r(3, 4, 1, 5, '#FF9800');
            r(2, 5, 1, 5, '#AB47BC');
            // Body
            r(4, 7, 8, 5, '#F5F5F5');
            r(4, 8, 8, 1, '#E0E0E0');
            // Legs
            r(5, 12, 2, 4, '#E0E0E0');
            r(9, 12, 2, 4, '#E0E0E0');
            // Hooves
            r(5, 15, 2, 1, '#795548');
            r(9, 15, 2, 1, '#795548');
            // Tail
            r(12, 8, 2, 1, '#E53935');
            r(13, 9, 2, 1, '#FF9800');
            r(12, 10, 2, 1, '#AB47BC');
            break;

        case 'draak':
            // Head
            r(4, 1, 6, 5, '#4CAF50');
            r(3, 2, 1, 2, '#4CAF50');
            // Horns
            r(4, 0, 2, 2, '#5D4037');
            r(9, 0, 2, 2, '#5D4037');
            // Eyes
            r(6, 2, 2, 2, '#FF6F00');
            r(7, 2, 1, 1, '#1a1a2e');
            // Mouth/nose
            r(3, 4, 2, 1, '#F44336');
            // Neck
            r(5, 6, 4, 2, '#388E3C');
            // Body
            r(3, 8, 10, 4, '#4CAF50');
            r(4, 9, 8, 2, '#66BB6A');
            // Belly
            r(5, 10, 5, 2, '#C8E6C9');
            // Wings
            r(1, 5, 3, 5, '#2E7D32');
            r(0, 6, 1, 3, '#2E7D32');
            r(12, 5, 3, 5, '#2E7D32');
            r(15, 6, 1, 3, '#2E7D32');
            // Wing membrane
            r(1, 6, 2, 3, '#43A047');
            r(13, 6, 2, 3, '#43A047');
            // Legs
            r(4, 12, 3, 3, '#388E3C');
            r(9, 12, 3, 3, '#388E3C');
            // Claws
            r(4, 14, 1, 1, '#5D4037');
            r(6, 14, 1, 1, '#5D4037');
            r(9, 14, 1, 1, '#5D4037');
            r(11, 14, 1, 1, '#5D4037');
            // Tail
            r(13, 10, 2, 1, '#4CAF50');
            r(14, 11, 2, 1, '#388E3C');
            // Fire breath hint
            r(2, 4, 1, 1, '#FF5722');
            r(1, 3, 1, 1, '#FF9800');
            break;

        case 'feniks':
            // Body
            r(5, 5, 6, 5, '#FF5722');
            r(6, 6, 4, 3, '#FF9800');
            // Head
            r(6, 2, 4, 4, '#FF9800');
            r(7, 3, 2, 2, '#FFCC80');
            // Eye
            r(8, 3, 1, 1, '#1a1a2e');
            // Beak
            r(10, 4, 2, 1, '#FFD700');
            // Crest
            r(6, 1, 1, 2, '#F44336');
            r(7, 0, 1, 2, '#FF5722');
            r(8, 1, 1, 1, '#FF9800');
            // Wings spread
            r(1, 4, 4, 3, '#F44336');
            r(0, 5, 2, 2, '#FF5722');
            r(11, 4, 4, 3, '#F44336');
            r(14, 5, 2, 2, '#FF5722');
            // Wing flames
            r(0, 4, 1, 1, '#FFD700');
            r(15, 4, 1, 1, '#FFD700');
            // Tail feathers
            r(4, 10, 2, 3, '#F44336');
            r(6, 10, 2, 4, '#FF5722');
            r(8, 10, 2, 3, '#F44336');
            r(5, 13, 1, 1, '#FFD700');
            r(7, 14, 1, 1, '#FFD700');
            r(9, 13, 1, 1, '#FFD700');
            // Feet
            r(6, 10, 1, 1, '#5D4037');
            r(9, 10, 1, 1, '#5D4037');
            break;

        case 'kitsune':
            // Ears
            r(4, 0, 2, 3, '#FF8F00');
            r(10, 0, 2, 3, '#FF8F00');
            r(4, 1, 1, 1, '#FFCC80');
            r(11, 1, 1, 1, '#FFCC80');
            // Head
            r(4, 3, 8, 4, '#FF8F00');
            r(5, 4, 6, 2, '#FFCC80');
            // Eyes
            r(5, 4, 2, 2, '#E53935');
            r(6, 4, 1, 1, '#1a1a2e');
            r(9, 4, 2, 2, '#E53935');
            r(10, 4, 1, 1, '#1a1a2e');
            // Nose
            r(7, 6, 2, 1, '#1a1a2e');
            // Body
            r(4, 7, 8, 5, '#FF8F00');
            r(5, 8, 6, 3, '#FFCC80');
            // Legs
            r(5, 12, 2, 3, '#FF8F00');
            r(9, 12, 2, 3, '#FF8F00');
            r(5, 14, 2, 1, '#1a1a2e');
            r(9, 14, 2, 1, '#1a1a2e');
            // Tails (3 tails!)
            r(12, 6, 2, 2, '#FF8F00');
            r(13, 5, 2, 2, '#FFCC80');
            r(12, 8, 2, 2, '#FF8F00');
            r(14, 7, 1, 2, '#FFCC80');
            r(12, 10, 2, 1, '#FF8F00');
            r(13, 9, 2, 1, '#FFCC80');
            break;

        case 'mogwai':
            // Ears
            r(3, 1, 3, 4, '#F5F5F5');
            r(10, 1, 3, 4, '#F5F5F5');
            r(4, 2, 1, 2, '#FFCDD2');
            r(11, 2, 1, 2, '#FFCDD2');
            // Head
            r(4, 4, 8, 5, '#F5F5F5');
            // Big eyes
            r(5, 5, 3, 3, '#4A90D9');
            r(8, 5, 3, 3, '#4A90D9');
            r(6, 5, 2, 2, '#1a1a2e');
            r(9, 5, 2, 2, '#1a1a2e');
            r(6, 5, 1, 1, '#F5F5F5');
            r(9, 5, 1, 1, '#F5F5F5');
            // Nose & mouth
            r(7, 8, 2, 1, '#FFCDD2');
            // Body
            r(4, 9, 8, 4, '#F5F5F5');
            r(5, 10, 6, 2, '#FFEBEE');
            // Arms
            r(3, 9, 1, 3, '#F5F5F5');
            r(12, 9, 1, 3, '#F5F5F5');
            // Feet
            r(5, 13, 2, 2, '#F5F5F5');
            r(9, 13, 2, 2, '#F5F5F5');
            break;

        case 'griffioen':
            // Eagle head
            r(5, 1, 5, 4, '#8D6E63');
            r(6, 2, 3, 2, '#A1887F');
            // Beak
            r(10, 3, 3, 1, '#FF8F00');
            r(10, 4, 2, 1, '#FFB300');
            // Eye
            r(8, 2, 2, 1, '#FFD700');
            r(9, 2, 1, 1, '#1a1a2e');
            // Body (lion)
            r(4, 5, 8, 6, '#FFB300');
            r(5, 6, 6, 4, '#FFCC80');
            // Wings
            r(1, 3, 4, 5, '#8D6E63');
            r(0, 4, 1, 3, '#795548');
            r(12, 3, 3, 5, '#8D6E63');
            r(15, 4, 1, 3, '#795548');
            // Wing detail
            r(2, 5, 2, 2, '#A1887F');
            r(12, 5, 2, 2, '#A1887F');
            // Legs (lion paws)
            r(5, 11, 2, 4, '#FFB300');
            r(9, 11, 2, 4, '#FFB300');
            r(5, 14, 2, 1, '#795548');
            r(9, 14, 2, 1, '#795548');
            // Tail
            r(12, 9, 3, 1, '#FFB300');
            r(14, 8, 2, 2, '#8D6E63');
            break;

        case 'pegasus':
            // Head
            r(6, 2, 5, 4, '#F5F5F5');
            // Eye
            r(9, 3, 2, 2, '#4A90D9');
            r(10, 3, 1, 1, '#1a1a2e');
            // Mane
            r(5, 2, 1, 5, '#B0BEC5');
            r(4, 3, 1, 4, '#90A4AE');
            // Ears
            r(7, 1, 2, 2, '#F5F5F5');
            r(8, 0, 1, 2, '#ECEFF1');
            // Body
            r(4, 6, 9, 5, '#F5F5F5');
            r(5, 7, 7, 3, '#ECEFF1');
            // Wings (silver)
            r(1, 3, 4, 5, '#90A4AE');
            r(0, 4, 2, 3, '#B0BEC5');
            r(12, 3, 3, 5, '#90A4AE');
            r(14, 4, 2, 3, '#B0BEC5');
            // Wing highlights
            r(2, 4, 2, 2, '#CFD8DC');
            r(12, 4, 2, 2, '#CFD8DC');
            // Legs
            r(5, 11, 2, 4, '#ECEFF1');
            r(10, 11, 2, 4, '#ECEFF1');
            // Hooves
            r(5, 14, 2, 1, '#78909C');
            r(10, 14, 2, 1, '#78909C');
            // Tail
            r(13, 8, 2, 1, '#B0BEC5');
            r(14, 7, 1, 3, '#90A4AE');
            break;

        case 'zeemeermin':
            // Hair
            r(4, 0, 8, 3, '#1B5E20');
            r(3, 1, 2, 5, '#1B5E20');
            r(11, 1, 2, 5, '#1B5E20');
            // Head
            r(5, 2, 6, 5, '#FDDCB5');
            // Eyes
            r(6, 4, 2, 1, '#29B6F6');
            r(9, 4, 2, 1, '#29B6F6');
            // Mouth
            r(7, 6, 2, 1, '#E57373');
            // Body/torso
            r(5, 7, 6, 3, '#FDDCB5');
            // Shell bra
            r(5, 7, 2, 2, '#AB47BC');
            r(9, 7, 2, 2, '#AB47BC');
            // Arms
            r(3, 7, 2, 4, '#FDDCB5');
            r(12, 7, 2, 4, '#FDDCB5');
            // Tail
            r(5, 10, 6, 3, '#29B6F6');
            r(6, 11, 4, 2, '#4FC3F7');
            // Fin
            r(3, 13, 4, 2, '#0288D1');
            r(9, 13, 4, 2, '#0288D1');
            r(4, 14, 2, 1, '#29B6F6');
            r(10, 14, 2, 1, '#29B6F6');
            break;

        case 'hydra':
            // Three heads
            r(2, 0, 3, 3, '#4A148C');
            r(6, 0, 3, 3, '#4A148C');
            r(10, 0, 3, 3, '#4A148C');
            // Eyes on each head
            r(3, 1, 1, 1, '#F44336');
            r(7, 1, 1, 1, '#F44336');
            r(11, 1, 1, 1, '#F44336');
            // Necks
            r(3, 3, 2, 3, '#6A1B9A');
            r(7, 3, 2, 3, '#6A1B9A');
            r(11, 3, 2, 3, '#6A1B9A');
            // Body
            r(3, 6, 10, 5, '#4A148C');
            r(4, 7, 8, 3, '#6A1B9A');
            // Belly
            r(5, 8, 6, 2, '#7B1FA2');
            // Legs
            r(4, 11, 3, 3, '#4A148C');
            r(9, 11, 3, 3, '#4A148C');
            // Claws
            r(4, 13, 1, 1, '#F44336');
            r(6, 13, 1, 1, '#F44336');
            r(9, 13, 1, 1, '#F44336');
            r(11, 13, 1, 1, '#F44336');
            // Tail
            r(13, 9, 2, 1, '#6A1B9A');
            r(14, 10, 2, 1, '#4A148C');
            break;

        case 'gremlin':
            // Ears (big pointy)
            r(2, 1, 3, 3, '#4CAF50');
            r(11, 1, 3, 3, '#4CAF50');
            r(3, 2, 1, 1, '#81C784');
            r(12, 2, 1, 1, '#81C784');
            // Head
            r(4, 3, 8, 5, '#4CAF50');
            // Eyes (big menacing)
            r(5, 4, 3, 2, '#FFEB3B');
            r(8, 4, 3, 2, '#FFEB3B');
            r(6, 4, 1, 1, '#F44336');
            r(9, 4, 1, 1, '#F44336');
            // Mouth (big grin)
            r(5, 7, 6, 1, '#1a1a2e');
            r(5, 7, 1, 1, '#F5F5F5');
            r(7, 7, 1, 1, '#F5F5F5');
            r(10, 7, 1, 1, '#F5F5F5');
            // Body
            r(5, 8, 6, 4, '#388E3C');
            r(6, 9, 4, 2, '#4CAF50');
            // Arms (long thin)
            r(3, 8, 2, 5, '#4CAF50');
            r(11, 8, 2, 5, '#4CAF50');
            r(2, 12, 2, 1, '#388E3C');
            r(12, 12, 2, 1, '#388E3C');
            // Legs
            r(6, 12, 2, 3, '#388E3C');
            r(8, 12, 2, 3, '#388E3C');
            r(6, 14, 2, 1, '#2E7D32');
            r(8, 14, 2, 1, '#2E7D32');
            break;

        case 'bakunawa':
            // Serpent body (curved)
            r(3, 2, 5, 4, '#1A237E');
            r(4, 3, 3, 2, '#283593');
            // Eye
            r(6, 3, 2, 2, '#FFF59D');
            r(7, 3, 1, 1, '#1a1a2e');
            // Moon crest
            r(4, 1, 3, 2, '#FFC107');
            r(5, 0, 1, 1, '#FFD700');
            // Coiled body
            r(2, 6, 12, 3, '#1A237E');
            r(3, 7, 10, 1, '#283593');
            r(1, 8, 3, 3, '#1A237E');
            r(10, 8, 5, 3, '#1A237E');
            r(1, 11, 14, 2, '#1A237E');
            r(2, 12, 12, 1, '#283593');
            // Belly pattern
            r(3, 7, 3, 1, '#3949AB');
            r(8, 7, 3, 1, '#3949AB');
            r(3, 12, 3, 1, '#3949AB');
            // Tail fin
            r(13, 10, 2, 2, '#0D47A1');
            r(14, 9, 2, 2, '#1565C0');
            // Whiskers
            r(2, 4, 1, 1, '#90CAF9');
            r(1, 5, 1, 1, '#90CAF9');
            break;

        case 'cerberus':
            // Three heads
            r(1, 1, 4, 3, '#37474F');
            r(6, 0, 4, 4, '#37474F');
            r(11, 1, 4, 3, '#37474F');
            // Eyes (red)
            r(3, 2, 1, 1, '#F44336');
            r(7, 1, 1, 1, '#F44336');
            r(9, 1, 1, 1, '#F44336');
            r(13, 2, 1, 1, '#F44336');
            // Mouths
            r(1, 3, 3, 1, '#B71C1C');
            r(6, 3, 4, 1, '#B71C1C');
            r(12, 3, 3, 1, '#B71C1C');
            // Necks
            r(2, 4, 3, 2, '#455A64');
            r(7, 4, 3, 2, '#455A64');
            r(11, 4, 3, 2, '#455A64');
            // Body
            r(3, 6, 10, 5, '#37474F');
            r(4, 7, 8, 3, '#455A64');
            // Legs
            r(4, 11, 3, 4, '#37474F');
            r(9, 11, 3, 4, '#37474F');
            r(4, 14, 3, 1, '#212121');
            r(9, 14, 3, 1, '#212121');
            // Tail (spiked)
            r(13, 8, 2, 1, '#37474F');
            r(14, 7, 2, 2, '#455A64');
            r(15, 6, 1, 1, '#F44336');
            break;

        case 'minotaurus':
            // Horns
            r(2, 0, 2, 3, '#795548');
            r(12, 0, 2, 3, '#795548');
            // Head
            r(4, 1, 8, 5, '#5D4037');
            r(5, 2, 6, 3, '#795548');
            // Eyes
            r(5, 3, 2, 2, '#F44336');
            r(9, 3, 2, 2, '#F44336');
            // Nose ring
            r(7, 5, 2, 1, '#FFD700');
            // Body (muscular)
            r(3, 6, 10, 6, '#5D4037');
            r(4, 7, 8, 4, '#795548');
            // Chest
            r(5, 7, 6, 3, '#8D6E63');
            // Arms
            r(1, 6, 2, 5, '#5D4037');
            r(13, 6, 2, 5, '#5D4037');
            r(0, 8, 1, 2, '#5D4037');
            r(15, 8, 1, 2, '#5D4037');
            // Fists
            r(1, 11, 2, 1, '#3E2723');
            r(13, 11, 2, 1, '#3E2723');
            // Legs
            r(5, 12, 3, 3, '#5D4037');
            r(8, 12, 3, 3, '#5D4037');
            // Hooves
            r(5, 14, 3, 1, '#3E2723');
            r(8, 14, 3, 1, '#3E2723');
            break;

        case 'sprite':
            // Wings (transparent-ish)
            r(2, 3, 3, 5, '#C8E6C9');
            r(11, 3, 3, 5, '#C8E6C9');
            r(1, 4, 2, 3, '#A5D6A7');
            r(13, 4, 2, 3, '#A5D6A7');
            // Body (tiny)
            r(6, 4, 4, 5, '#81C784');
            r(7, 5, 2, 3, '#A5D6A7');
            // Head
            r(6, 2, 4, 3, '#C8E6C9');
            // Eyes
            r(7, 3, 1, 1, '#1a1a2e');
            r(9, 3, 1, 1, '#1a1a2e');
            // Sparkles around
            r(3, 1, 1, 1, '#FFEB3B');
            r(12, 2, 1, 1, '#FFEB3B');
            r(1, 7, 1, 1, '#FFF59D');
            r(14, 6, 1, 1, '#FFF59D');
            r(5, 10, 1, 1, '#FFEB3B');
            r(10, 10, 1, 1, '#FFEB3B');
            // Legs
            r(7, 9, 1, 3, '#81C784');
            r(8, 9, 1, 3, '#81C784');
            // Feet
            r(6, 11, 2, 1, '#66BB6A');
            r(8, 11, 2, 1, '#66BB6A');
            break;

        case 'yeti':
            // Head
            r(4, 1, 8, 5, '#ECEFF1');
            r(5, 2, 6, 3, '#F5F5F5');
            // Fur tufts
            r(3, 0, 2, 2, '#CFD8DC');
            r(11, 0, 2, 2, '#CFD8DC');
            // Eyes
            r(5, 3, 2, 2, '#29B6F6');
            r(9, 3, 2, 2, '#29B6F6');
            r(6, 3, 1, 1, '#1a1a2e');
            r(10, 3, 1, 1, '#1a1a2e');
            // Mouth
            r(7, 5, 2, 1, '#90A4AE');
            // Body (big)
            r(2, 6, 12, 6, '#ECEFF1');
            r(3, 7, 10, 4, '#F5F5F5');
            // Belly
            r(5, 8, 6, 3, '#CFD8DC');
            // Arms
            r(0, 6, 2, 6, '#ECEFF1');
            r(14, 6, 2, 6, '#ECEFF1');
            // Fists
            r(0, 11, 2, 2, '#CFD8DC');
            r(14, 11, 2, 2, '#CFD8DC');
            // Legs
            r(4, 12, 3, 3, '#ECEFF1');
            r(9, 12, 3, 3, '#ECEFF1');
            r(4, 14, 3, 1, '#90A4AE');
            r(9, 14, 3, 1, '#90A4AE');
            break;

        case 'salamander':
            // Head
            r(3, 3, 5, 3, '#FF5722');
            r(4, 4, 3, 1, '#FF8A65');
            // Eye
            r(6, 4, 1, 1, '#FFEB3B');
            // Body
            r(4, 6, 8, 3, '#FF5722');
            r(5, 7, 6, 1, '#FF8A65');
            // Glow spots
            r(5, 6, 1, 1, '#FFD700');
            r(8, 7, 1, 1, '#FFD700');
            r(10, 6, 1, 1, '#FFD700');
            // Front legs
            r(3, 6, 1, 3, '#E64A19');
            r(2, 8, 1, 1, '#E64A19');
            // Back legs
            r(12, 7, 1, 3, '#E64A19');
            r(13, 9, 1, 1, '#E64A19');
            // Tail
            r(12, 8, 3, 1, '#FF5722');
            r(14, 7, 2, 1, '#FF8A65');
            r(15, 6, 1, 1, '#FF5722');
            // Tail flame
            r(15, 5, 1, 1, '#FFD700');
            break;

        case 'basilisk':
            // Head/crown
            r(4, 1, 6, 4, '#2E7D32');
            r(5, 0, 1, 2, '#FFD700');
            r(7, 0, 1, 1, '#FFD700');
            r(9, 0, 1, 2, '#FFD700');
            // Eyes (menacing)
            r(5, 2, 2, 2, '#FFEB3B');
            r(8, 2, 2, 2, '#FFEB3B');
            r(6, 2, 1, 1, '#F44336');
            r(9, 2, 1, 1, '#F44336');
            // Body (serpent)
            r(5, 5, 5, 3, '#1B5E20');
            r(6, 6, 3, 1, '#2E7D32');
            // Coils
            r(3, 7, 10, 3, '#1B5E20');
            r(4, 8, 8, 1, '#2E7D32');
            r(2, 10, 12, 2, '#1B5E20');
            r(3, 11, 10, 1, '#2E7D32');
            // Scales pattern
            r(4, 8, 1, 1, '#4CAF50');
            r(7, 8, 1, 1, '#4CAF50');
            r(10, 8, 1, 1, '#4CAF50');
            // Tail
            r(13, 10, 2, 1, '#2E7D32');
            r(14, 9, 2, 1, '#1B5E20');
            break;

        case 'nymf':
            // Hair (flowing water)
            r(3, 0, 10, 3, '#4FC3F7');
            r(2, 1, 2, 5, '#29B6F6');
            r(12, 1, 2, 5, '#29B6F6');
            // Head
            r(5, 2, 6, 5, '#FDDCB5');
            // Eyes
            r(6, 4, 2, 1, '#00BCD4');
            r(9, 4, 2, 1, '#00BCD4');
            // Mouth
            r(7, 6, 2, 1, '#E57373');
            // Body
            r(5, 7, 6, 4, '#81D4FA');
            r(6, 8, 4, 2, '#B3E5FC');
            // Arms
            r(3, 7, 2, 4, '#FDDCB5');
            r(11, 7, 2, 4, '#FDDCB5');
            // Water flowing from hands
            r(2, 10, 2, 2, '#4FC3F7');
            r(12, 10, 2, 2, '#4FC3F7');
            // Legs/water dress
            r(5, 11, 6, 4, '#4FC3F7');
            r(6, 12, 4, 3, '#29B6F6');
            r(4, 14, 2, 1, '#81D4FA');
            r(10, 14, 2, 1, '#81D4FA');
            break;

        case 'golem':
            // Head (small on big body)
            r(5, 1, 6, 4, '#78909C');
            r(6, 2, 4, 2, '#90A4AE');
            // Eyes
            r(6, 2, 2, 2, '#FFD700');
            r(9, 2, 1, 2, '#FFD700');
            r(7, 2, 1, 1, '#FF6F00');
            // Body (massive)
            r(2, 5, 12, 7, '#607D8B');
            r(3, 6, 10, 5, '#78909C');
            // Cracks/details
            r(5, 7, 1, 3, '#546E7A');
            r(8, 6, 1, 4, '#546E7A');
            r(10, 8, 1, 2, '#546E7A');
            // Crystal embedded
            r(6, 8, 2, 2, '#4CAF50');
            r(7, 9, 1, 1, '#81C784');
            // Arms (massive)
            r(0, 5, 2, 6, '#607D8B');
            r(14, 5, 2, 6, '#607D8B');
            r(0, 10, 2, 2, '#78909C');
            r(14, 10, 2, 2, '#78909C');
            // Legs
            r(4, 12, 3, 3, '#546E7A');
            r(9, 12, 3, 3, '#546E7A');
            r(4, 14, 3, 1, '#455A64');
            r(9, 14, 3, 1, '#455A64');
            break;

        case 'sfinks':
            // Head (human-like)
            r(5, 0, 6, 5, '#FDDCB5');
            // Headdress
            r(4, 0, 2, 3, '#FFB300');
            r(10, 0, 2, 3, '#FFB300');
            r(5, 0, 6, 1, '#FFD700');
            // Eyes
            r(6, 2, 2, 1, '#FF6F00');
            r(9, 2, 2, 1, '#FF6F00');
            // Nose & mouth
            r(7, 3, 2, 1, '#E8B896');
            r(7, 4, 2, 1, '#D4896A');
            // Body (lion)
            r(3, 5, 10, 5, '#FFB300');
            r(4, 6, 8, 3, '#FFC107');
            // Front paws
            r(3, 10, 3, 4, '#FFB300');
            r(10, 10, 3, 4, '#FFB300');
            r(2, 12, 2, 2, '#FFB300');
            r(12, 12, 2, 2, '#FFB300');
            // Tail
            r(13, 7, 2, 1, '#FFB300');
            r(14, 6, 2, 2, '#D4A04A');
            break;

        case 'wolpertinger':
            // Antlers
            r(3, 0, 1, 3, '#795548');
            r(2, 0, 1, 1, '#795548');
            r(11, 0, 1, 3, '#795548');
            r(12, 0, 1, 1, '#795548');
            // Head
            r(5, 2, 6, 4, '#8D6E63');
            r(6, 3, 4, 2, '#A1887F');
            // Eyes
            r(6, 3, 2, 2, '#E91E63');
            r(7, 3, 1, 1, '#1a1a2e');
            r(9, 3, 1, 1, '#1a1a2e');
            // Ears (long rabbit ears)
            r(4, 0, 2, 4, '#A1887F');
            r(10, 0, 2, 4, '#A1887F');
            r(5, 1, 1, 2, '#FFCDD2');
            r(10, 1, 1, 2, '#FFCDD2');
            // Body
            r(5, 6, 6, 4, '#8D6E63');
            r(6, 7, 4, 2, '#A1887F');
            // Wings
            r(2, 5, 3, 4, '#90CAF9');
            r(11, 5, 3, 4, '#90CAF9');
            r(1, 6, 2, 2, '#BBDEFB');
            r(13, 6, 2, 2, '#BBDEFB');
            // Legs
            r(6, 10, 2, 4, '#8D6E63');
            r(8, 10, 2, 4, '#8D6E63');
            r(6, 13, 2, 1, '#795548');
            r(8, 13, 2, 1, '#795548');
            // Fluffy tail
            r(11, 8, 2, 2, '#A1887F');
            break;

        case 'kraken':
            // Head (dome)
            r(4, 0, 8, 5, '#E53935');
            r(5, 1, 6, 3, '#EF5350');
            // Eyes
            r(5, 2, 2, 2, '#FFEB3B');
            r(9, 2, 2, 2, '#FFEB3B');
            r(6, 2, 1, 1, '#1a1a2e');
            r(10, 2, 1, 1, '#1a1a2e');
            // Body
            r(4, 5, 8, 4, '#C62828');
            r(5, 6, 6, 2, '#E53935');
            // Tentacles (8!)
            r(1, 8, 2, 4, '#C62828');
            r(0, 11, 2, 2, '#E53935');
            r(3, 9, 2, 3, '#C62828');
            r(2, 12, 1, 2, '#EF5350');
            r(5, 9, 2, 4, '#C62828');
            r(5, 13, 1, 2, '#EF5350');
            r(9, 9, 2, 4, '#C62828');
            r(10, 13, 1, 2, '#EF5350');
            r(11, 9, 2, 3, '#C62828');
            r(13, 12, 1, 2, '#EF5350');
            r(13, 8, 2, 4, '#C62828');
            r(14, 11, 2, 2, '#E53935');
            // Suction cups
            r(1, 11, 1, 1, '#FFCDD2');
            r(5, 12, 1, 1, '#FFCDD2');
            r(10, 12, 1, 1, '#FFCDD2');
            r(14, 11, 1, 1, '#FFCDD2');
            break;

        case 'djinn':
            // Head
            r(5, 0, 6, 5, '#7E57C2');
            r(6, 1, 4, 3, '#9575CD');
            // Turban
            r(4, 0, 8, 2, '#FFD700');
            r(7, 0, 2, 1, '#FF5722');
            // Eyes
            r(6, 2, 2, 1, '#FFEB3B');
            r(9, 2, 1, 1, '#FFEB3B');
            // Beard
            r(6, 4, 4, 2, '#5E35B1');
            // Body (smoke-like)
            r(4, 5, 8, 4, '#7E57C2');
            r(5, 6, 6, 2, '#9575CD');
            // Arms (crossed with power)
            r(2, 5, 2, 4, '#7E57C2');
            r(12, 5, 2, 4, '#7E57C2');
            // Bracelets
            r(2, 8, 2, 1, '#FFD700');
            r(12, 8, 2, 1, '#FFD700');
            // Smoke tail (instead of legs)
            r(5, 9, 6, 2, '#9575CD');
            r(6, 11, 4, 2, '#B39DDB');
            r(7, 13, 2, 2, '#D1C4E9');
            // Sparkles
            r(1, 3, 1, 1, '#FFEB3B');
            r(14, 4, 1, 1, '#FFEB3B');
            r(3, 10, 1, 1, '#FFF59D');
            r(12, 11, 1, 1, '#FFF59D');
            break;

        case 'alicorn':
            // Horn (golden)
            r(7, 0, 2, 2, '#FFD700');
            r(8, 0, 1, 1, '#FFF59D');
            // Head
            r(5, 2, 6, 4, '#F3E5F5');
            r(6, 3, 4, 2, '#FCE4EC');
            // Eye
            r(8, 3, 2, 2, '#AB47BC');
            r(9, 3, 1, 1, '#1a1a2e');
            // Mane (rainbow shimmer)
            r(4, 2, 1, 5, '#E91E63');
            r(3, 3, 1, 4, '#9C27B0');
            r(2, 4, 1, 3, '#3F51B5');
            // Ears
            r(6, 1, 2, 2, '#F3E5F5');
            // Body
            r(4, 6, 9, 5, '#F3E5F5');
            r(5, 7, 7, 3, '#FCE4EC');
            // Wings (large rainbow)
            r(1, 2, 3, 6, '#CE93D8');
            r(0, 3, 2, 4, '#BA68C8');
            r(12, 2, 3, 6, '#CE93D8');
            r(14, 3, 2, 4, '#BA68C8');
            // Wing highlights
            r(1, 4, 2, 2, '#E1BEE7');
            r(13, 4, 2, 2, '#E1BEE7');
            // Legs
            r(5, 11, 2, 4, '#F3E5F5');
            r(10, 11, 2, 4, '#F3E5F5');
            // Hooves (golden)
            r(5, 14, 2, 1, '#FFD700');
            r(10, 14, 2, 1, '#FFD700');
            // Tail (rainbow)
            r(13, 8, 2, 1, '#E91E63');
            r(14, 7, 1, 3, '#9C27B0');
            r(15, 8, 1, 1, '#3F51B5');
            break;

        case 'trol':
            // Head
            r(5, 1, 6, 5, '#6D4C41');
            r(6, 2, 4, 3, '#795548');
            // Eyes (small beady)
            r(6, 3, 1, 1, '#FFEB3B');
            r(9, 3, 1, 1, '#FFEB3B');
            // Nose (big)
            r(7, 4, 2, 2, '#5D4037');
            // Mouth
            r(6, 5, 4, 1, '#3E2723');
            r(7, 5, 1, 1, '#F5F5F5');
            r(8, 5, 1, 1, '#F5F5F5');
            // Body (big)
            r(3, 6, 10, 6, '#6D4C41');
            r(4, 7, 8, 4, '#795548');
            // Belly
            r(5, 8, 6, 3, '#8D6E63');
            // Arms
            r(1, 6, 2, 6, '#6D4C41');
            r(13, 6, 2, 6, '#6D4C41');
            // Club in hand
            r(0, 3, 2, 5, '#5D4037');
            r(0, 3, 3, 2, '#795548');
            // Legs
            r(4, 12, 3, 3, '#5D4037');
            r(9, 12, 3, 3, '#5D4037');
            r(4, 14, 3, 1, '#3E2723');
            r(9, 14, 3, 1, '#3E2723');
            break;

        case 'werwolf':
            // Ears
            r(3, 0, 3, 3, '#616161');
            r(10, 0, 3, 3, '#616161');
            r(4, 1, 1, 1, '#9E9E9E');
            r(11, 1, 1, 1, '#9E9E9E');
            // Head
            r(4, 2, 8, 5, '#616161');
            r(5, 3, 6, 3, '#757575');
            // Snout
            r(6, 5, 4, 2, '#9E9E9E');
            r(7, 5, 2, 1, '#424242');
            r(7, 6, 2, 1, '#F44336');
            // Eyes
            r(5, 3, 2, 2, '#FFD700');
            r(6, 3, 1, 1, '#FF6F00');
            r(9, 3, 2, 2, '#FFD700');
            r(10, 3, 1, 1, '#FF6F00');
            // Body
            r(3, 7, 10, 5, '#616161');
            r(4, 8, 8, 3, '#757575');
            // Arms (muscular)
            r(1, 7, 2, 5, '#616161');
            r(13, 7, 2, 5, '#616161');
            // Claws
            r(1, 12, 2, 1, '#BDBDBD');
            r(13, 12, 2, 1, '#BDBDBD');
            // Legs
            r(4, 12, 3, 3, '#616161');
            r(9, 12, 3, 3, '#616161');
            r(4, 14, 1, 1, '#BDBDBD');
            r(6, 14, 1, 1, '#BDBDBD');
            r(9, 14, 1, 1, '#BDBDBD');
            r(11, 14, 1, 1, '#BDBDBD');
            // Tail
            r(13, 9, 2, 1, '#757575');
            r(14, 8, 2, 2, '#616161');
            break;

        case 'elfje':
            // Hair
            r(4, 0, 8, 3, '#FFD54F');
            r(3, 1, 2, 4, '#FFD54F');
            r(11, 1, 2, 4, '#FFD54F');
            // Head
            r(5, 2, 6, 5, '#FDDCB5');
            // Pointed ears
            r(3, 3, 2, 2, '#FDDCB5');
            r(11, 3, 2, 2, '#FDDCB5');
            r(2, 3, 1, 1, '#FDDCB5');
            r(13, 3, 1, 1, '#FDDCB5');
            // Eyes
            r(6, 4, 2, 1, '#66BB6A');
            r(9, 4, 2, 1, '#66BB6A');
            // Mouth
            r(7, 6, 2, 1, '#E57373');
            // Body (tunic)
            r(5, 7, 6, 4, '#2E7D32');
            r(6, 8, 4, 2, '#388E3C');
            // Belt
            r(5, 10, 6, 1, '#8D6E63');
            r(7, 10, 2, 1, '#FFD700');
            // Arms
            r(3, 7, 2, 4, '#FDDCB5');
            r(11, 7, 2, 4, '#FDDCB5');
            // Bow in hand
            r(12, 7, 1, 4, '#795548');
            r(13, 8, 1, 2, '#FFD54F');
            // Legs
            r(6, 11, 2, 4, '#2E7D32');
            r(8, 11, 2, 4, '#2E7D32');
            // Boots
            r(6, 14, 2, 1, '#5D4037');
            r(8, 14, 2, 1, '#5D4037');
            break;

        case 'mantikoor':
            // Head (lion)
            r(4, 1, 6, 4, '#D4760A');
            r(5, 2, 4, 2, '#E8A04A');
            // Mane
            r(3, 0, 2, 4, '#8D6E63');
            r(9, 0, 2, 4, '#8D6E63');
            r(5, 0, 4, 1, '#8D6E63');
            // Eyes
            r(5, 2, 2, 2, '#F44336');
            r(6, 2, 1, 1, '#1a1a2e');
            // Mouth (fangs)
            r(5, 4, 4, 1, '#1a1a2e');
            r(6, 4, 1, 1, '#F5F5F5');
            r(8, 4, 1, 1, '#F5F5F5');
            // Body
            r(3, 5, 10, 5, '#D4760A');
            r(4, 6, 8, 3, '#E8A04A');
            // Wings (bat)
            r(0, 3, 3, 6, '#5D4037');
            r(13, 3, 3, 6, '#5D4037');
            r(0, 4, 2, 4, '#795548');
            r(14, 4, 2, 4, '#795548');
            // Legs
            r(4, 10, 3, 4, '#D4760A');
            r(9, 10, 3, 4, '#D4760A');
            r(4, 13, 3, 1, '#5D4037');
            r(9, 13, 3, 1, '#5D4037');
            // Scorpion tail
            r(12, 7, 2, 1, '#8D6E63');
            r(13, 5, 2, 1, '#8D6E63');
            r(14, 3, 2, 2, '#F44336');
            r(15, 3, 1, 1, '#B71C1C');
            break;

        case 'scarabee':
            // Body
            r(4, 5, 8, 7, '#FFD700');
            r(5, 6, 6, 5, '#FFC107');
            // Head
            r(5, 3, 6, 3, '#4E342E');
            // Eyes
            r(6, 4, 2, 1, '#FF5722');
            r(9, 4, 2, 1, '#FF5722');
            // Mandibles
            r(5, 6, 1, 1, '#4E342E');
            r(10, 6, 1, 1, '#4E342E');
            // Wing cases
            r(4, 6, 4, 5, '#FFD700');
            r(8, 6, 4, 5, '#FFD700');
            ctx.fillStyle = '#FFA000';
            ctx.fillRect(8 * P, 6 * P, P / 2, 5 * P);
            // Legs
            r(3, 7, 1, 1, '#4E342E');
            r(3, 9, 1, 1, '#4E342E');
            r(12, 7, 1, 1, '#4E342E');
            r(12, 9, 1, 1, '#4E342E');
            r(4, 11, 2, 2, '#4E342E');
            r(10, 11, 2, 2, '#4E342E');
            // Glow
            r(6, 7, 4, 3, '#FFEB3B');
            break;

        case 'zandworm':
            // Body segments curving up
            r(2, 12, 4, 3, '#D4760A');
            r(4, 10, 4, 3, '#E8A04A');
            r(6, 8, 4, 3, '#D4760A');
            r(8, 6, 4, 3, '#E8A04A');
            r(10, 4, 4, 3, '#D4760A');
            // Head
            r(10, 1, 5, 4, '#D4760A');
            r(11, 2, 3, 2, '#E8A04A');
            // Mouth open
            r(14, 2, 2, 2, '#8D0000');
            r(14, 1, 1, 1, '#F5F5F5');
            r(14, 4, 1, 1, '#F5F5F5');
            // Eye
            r(11, 2, 1, 1, '#FF5722');
            // Belly segments
            r(3, 13, 2, 1, '#E8A04A');
            r(5, 11, 2, 1, '#E8A04A');
            r(7, 9, 2, 1, '#E8A04A');
            r(9, 7, 2, 1, '#E8A04A');
            // Sand particles
            r(1, 14, 2, 1, '#F8D878');
            r(5, 14, 1, 1, '#F8D878');
            r(14, 6, 1, 1, '#F8D878');
            break;

        case 'fenrir':
            // Body
            r(3, 7, 10, 5, '#4A4A5A');
            r(4, 8, 8, 3, '#5C5C6E');
            // Head
            r(1, 4, 6, 4, '#4A4A5A');
            r(2, 5, 4, 2, '#5C5C6E');
            // Ears
            r(2, 2, 2, 3, '#4A4A5A');
            r(5, 2, 2, 3, '#4A4A5A');
            r(3, 3, 1, 1, '#5C5C6E');
            r(6, 3, 1, 1, '#5C5C6E');
            // Eyes (glowing red)
            r(2, 5, 2, 2, '#F44336');
            r(3, 5, 1, 1, '#FFCDD2');
            // Mouth
            r(1, 7, 3, 1, '#1a1a2e');
            r(1, 7, 1, 1, '#F5F5F5');
            // Legs
            r(4, 12, 2, 4, '#4A4A5A');
            r(10, 12, 2, 4, '#4A4A5A');
            r(4, 15, 2, 1, '#1a1a2e');
            r(10, 15, 2, 1, '#1a1a2e');
            // Tail
            r(13, 8, 2, 1, '#4A4A5A');
            r(14, 7, 2, 1, '#5C5C6E');
            // Chains broken
            r(3, 12, 1, 1, '#bcbcbc');
            r(11, 12, 1, 1, '#bcbcbc');
            break;

        case 'kappa':
            // Shell
            r(4, 6, 8, 6, '#2E7D32');
            r(5, 7, 6, 4, '#388E3C');
            // Shell pattern
            r(6, 8, 2, 2, '#1B5E20');
            r(9, 8, 2, 2, '#1B5E20');
            // Head
            r(5, 2, 6, 5, '#66BB6A');
            // Head dish (water)
            r(6, 1, 4, 2, '#0058f8');
            r(7, 1, 2, 1, '#58d8f8');
            // Eyes
            r(6, 4, 2, 1, '#1a1a2e');
            r(9, 4, 2, 1, '#1a1a2e');
            // Beak
            r(7, 5, 2, 1, '#FFD700');
            // Arms
            r(3, 7, 1, 3, '#66BB6A');
            r(12, 7, 1, 3, '#66BB6A');
            // Legs
            r(5, 12, 2, 3, '#66BB6A');
            r(9, 12, 2, 3, '#66BB6A');
            r(5, 14, 3, 1, '#388E3C');
            r(8, 14, 3, 1, '#388E3C');
            break;

        case 'wisp':
            // Outer glow
            r(4, 3, 8, 8, 'rgba(100,200,255,0.3)');
            // Core flame
            r(6, 4, 4, 6, '#64B5F6');
            r(7, 3, 2, 7, '#90CAF9');
            // Bright center
            r(7, 5, 2, 3, '#E3F2FD');
            r(8, 4, 1, 1, '#F5F5F5');
            // Eyes
            r(6, 6, 1, 1, '#1a1a2e');
            r(9, 6, 1, 1, '#1a1a2e');
            // Flame wisps
            r(5, 10, 1, 2, '#42A5F5');
            r(10, 10, 1, 2, '#42A5F5');
            r(7, 11, 2, 2, '#64B5F6');
            // Sparkles
            r(3, 2, 1, 1, '#E3F2FD');
            r(12, 4, 1, 1, '#E3F2FD');
            r(4, 9, 1, 1, '#E3F2FD');
            r(11, 7, 1, 1, '#E3F2FD');
            break;

        case 'slangenkoning':
            // Body coils
            r(3, 10, 10, 3, '#2E7D32');
            r(2, 8, 4, 3, '#388E3C');
            r(10, 8, 4, 3, '#2E7D32');
            // Upright body
            r(6, 3, 4, 7, '#2E7D32');
            r(7, 4, 2, 5, '#66BB6A');
            // Head
            r(5, 1, 6, 3, '#2E7D32');
            r(6, 2, 4, 1, '#388E3C');
            // Crown
            r(5, 0, 1, 2, '#FFD700');
            r(7, 0, 1, 1, '#FFD700');
            r(10, 0, 1, 2, '#FFD700');
            r(6, 0, 1, 1, '#FFA000');
            r(8, 0, 3, 1, '#FFA000');
            // Eyes
            r(6, 2, 1, 1, '#F44336');
            r(9, 2, 1, 1, '#F44336');
            // Fangs
            r(7, 4, 1, 1, '#F5F5F5');
            r(9, 4, 1, 1, '#F5F5F5');
            // Tongue
            r(8, 4, 1, 2, '#F44336');
            // Belly scales
            r(7, 5, 2, 4, '#A5D6A7');
            // Tail
            r(13, 11, 2, 1, '#2E7D32');
            r(14, 10, 1, 1, '#388E3C');
            break;

        case 'ijsdraak':
            // Head
            r(4, 1, 6, 5, '#90CAF9');
            r(3, 2, 1, 2, '#90CAF9');
            // Horns (ice)
            r(4, 0, 2, 2, '#E3F2FD');
            r(9, 0, 2, 2, '#E3F2FD');
            // Eyes
            r(6, 2, 2, 2, '#0058f8');
            r(7, 2, 1, 1, '#E3F2FD');
            // Mouth - ice breath
            r(3, 4, 2, 1, '#58d8f8');
            r(1, 3, 2, 1, '#E3F2FD');
            // Body
            r(3, 6, 10, 4, '#90CAF9');
            r(4, 7, 8, 2, '#B3E5FC');
            // Belly
            r(5, 8, 5, 2, '#E3F2FD');
            // Wings
            r(1, 4, 3, 5, '#64B5F6');
            r(0, 5, 1, 3, '#42A5F5');
            r(12, 4, 3, 5, '#64B5F6');
            r(15, 5, 1, 3, '#42A5F5');
            // Legs
            r(4, 10, 3, 4, '#64B5F6');
            r(9, 10, 3, 4, '#64B5F6');
            // Claws
            r(4, 13, 1, 1, '#E3F2FD');
            r(6, 13, 1, 1, '#E3F2FD');
            r(9, 13, 1, 1, '#E3F2FD');
            r(11, 13, 1, 1, '#E3F2FD');
            // Ice crystals
            r(13, 9, 2, 1, '#E3F2FD');
            r(14, 10, 2, 1, '#B3E5FC');
            break;

        case 'sneeuwuil':
            // Body
            r(4, 6, 8, 7, '#F5F5F5');
            r(5, 7, 6, 5, '#EEEEEE');
            // Head
            r(4, 2, 8, 5, '#F5F5F5');
            // Ear tufts
            r(4, 1, 2, 2, '#E0E0E0');
            r(10, 1, 2, 2, '#E0E0E0');
            // Eyes (big owl eyes)
            r(5, 3, 3, 3, '#FFD700');
            r(6, 4, 1, 1, '#1a1a2e');
            r(9, 3, 3, 3, '#FFD700');
            r(10, 4, 1, 1, '#1a1a2e');
            // Beak
            r(7, 5, 2, 2, '#FF8F00');
            // Wing pattern
            r(3, 7, 2, 5, '#E0E0E0');
            r(11, 7, 2, 5, '#E0E0E0');
            // Speckles
            r(5, 8, 1, 1, '#BDBDBD');
            r(7, 9, 1, 1, '#BDBDBD');
            r(10, 8, 1, 1, '#BDBDBD');
            r(6, 11, 1, 1, '#BDBDBD');
            r(9, 10, 1, 1, '#BDBDBD');
            // Feet
            r(5, 13, 2, 1, '#FF8F00');
            r(9, 13, 2, 1, '#FF8F00');
            // Stars around
            r(2, 2, 1, 1, '#FFD700');
            r(13, 3, 1, 1, '#FFD700');
            r(1, 8, 1, 1, '#FFD700');
            break;

        case 'wendigo':
            // Antlers
            r(3, 0, 2, 3, '#795548');
            r(1, 0, 2, 2, '#795548');
            r(11, 0, 2, 3, '#795548');
            r(13, 0, 2, 2, '#795548');
            // Skull head
            r(5, 2, 6, 4, '#E0E0E0');
            r(6, 3, 4, 2, '#F5F5F5');
            // Dark eyes
            r(6, 3, 2, 2, '#1a1a2e');
            r(9, 3, 2, 2, '#1a1a2e');
            r(7, 3, 1, 1, '#F44336');
            r(10, 3, 1, 1, '#F44336');
            // Body (thin, gaunt)
            r(6, 6, 4, 6, '#5C5C6E');
            r(7, 7, 2, 4, '#4A4A5A');
            // Arms (long, thin)
            r(4, 7, 2, 5, '#5C5C6E');
            r(10, 7, 2, 5, '#5C5C6E');
            r(3, 11, 1, 1, '#E0E0E0');
            r(12, 11, 1, 1, '#E0E0E0');
            // Legs
            r(6, 12, 2, 4, '#5C5C6E');
            r(9, 12, 2, 4, '#5C5C6E');
            // Ice particles
            r(2, 5, 1, 1, '#B3E5FC');
            r(13, 6, 1, 1, '#B3E5FC');
            r(5, 14, 1, 1, '#B3E5FC');
            break;

        case 'gargoyle':
            // Body (stone)
            r(4, 6, 8, 6, '#757575');
            r(5, 7, 6, 4, '#9E9E9E');
            // Head
            r(5, 2, 6, 5, '#757575');
            r(6, 3, 4, 3, '#9E9E9E');
            // Horns
            r(4, 1, 2, 2, '#616161');
            r(10, 1, 2, 2, '#616161');
            // Eyes (glowing)
            r(6, 4, 2, 1, '#FFD700');
            r(9, 4, 2, 1, '#FFD700');
            // Mouth
            r(7, 6, 2, 1, '#424242');
            // Wings (stone)
            r(1, 5, 3, 5, '#616161');
            r(0, 6, 1, 3, '#757575');
            r(12, 5, 3, 5, '#616161');
            r(15, 6, 1, 3, '#757575');
            // Legs
            r(5, 12, 2, 3, '#616161');
            r(9, 12, 2, 3, '#616161');
            r(5, 14, 3, 1, '#424242');
            r(9, 14, 3, 1, '#424242');
            // Stone cracks
            r(6, 8, 1, 2, '#424242');
            r(10, 7, 1, 1, '#424242');
            break;

        case 'medusa':
            // Snake hair
            r(3, 0, 2, 4, '#2E7D32');
            r(5, 0, 1, 3, '#388E3C');
            r(7, 0, 2, 2, '#2E7D32');
            r(10, 0, 1, 3, '#388E3C');
            r(11, 0, 2, 4, '#2E7D32');
            r(2, 2, 1, 2, '#66BB6A');
            r(13, 2, 1, 2, '#66BB6A');
            // Head
            r(4, 3, 8, 5, '#C8E6C9');
            r(5, 4, 6, 3, '#A5D6A7');
            // Eyes (piercing)
            r(5, 4, 2, 2, '#F44336');
            r(6, 4, 1, 1, '#FFCDD2');
            r(9, 4, 2, 2, '#F44336');
            r(10, 4, 1, 1, '#FFCDD2');
            // Mouth
            r(7, 7, 2, 1, '#F44336');
            // Body (robe)
            r(4, 8, 8, 5, '#6A1B9A');
            r(5, 9, 6, 3, '#8E24AA');
            // Snake lower body
            r(4, 13, 8, 2, '#2E7D32');
            r(3, 14, 2, 1, '#388E3C');
            r(11, 14, 2, 1, '#388E3C');
            break;

        case 'chimaera':
            // Lion head (front)
            r(2, 2, 5, 4, '#FF8F00');
            r(3, 3, 3, 2, '#FFCC80');
            r(1, 1, 2, 4, '#E65100');
            r(6, 1, 2, 4, '#E65100');
            // Lion eyes
            r(3, 3, 1, 1, '#1a1a2e');
            r(5, 3, 1, 1, '#1a1a2e');
            // Mouth - fire
            r(3, 5, 3, 1, '#F44336');
            r(2, 5, 1, 1, '#FF5722');
            // Body
            r(4, 6, 8, 5, '#D4760A');
            r(5, 7, 6, 3, '#E8A04A');
            // Goat head (back)
            r(10, 3, 4, 3, '#BDBDBD');
            r(11, 2, 1, 2, '#795548');
            r(13, 2, 1, 2, '#795548');
            r(11, 4, 2, 1, '#9E9E9E');
            // Wings
            r(1, 5, 3, 4, '#5D4037');
            r(0, 6, 1, 2, '#795548');
            // Legs
            r(5, 11, 2, 4, '#D4760A');
            r(9, 11, 2, 4, '#D4760A');
            r(5, 14, 2, 1, '#5D4037');
            r(9, 14, 2, 1, '#5D4037');
            // Snake tail
            r(12, 8, 2, 1, '#2E7D32');
            r(13, 7, 2, 1, '#388E3C');
            r(14, 6, 2, 1, '#2E7D32');
            r(15, 6, 1, 1, '#F44336');
            break;

        default:
            // Fallback: draw a colored blob with eyes
            const def = getAnimalDef(animalId);
            const col = def ? getTypeColor(def.type) : '#999';
            r(3, 2, 10, 10, col);
            r(4, 3, 8, 8, col);
            r(5, 4, 2, 2, '#F5F5F5');
            r(9, 4, 2, 2, '#F5F5F5');
            r(6, 4, 1, 1, '#1a1a2e');
            r(10, 4, 1, 1, '#1a1a2e');
            r(6, 8, 4, 1, '#1a1a2e');
            break;
    }

    if (flipped) {
        cx.restore();
    }
}
