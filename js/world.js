/* ============================================
   World - Map definitions & tile system
   Gebieden: Village, Jungle, Cave, Volcano
   ============================================ */

const TILE = {
    GRASS: 0,
    WALL: 1,
    TALLGRASS: 2,
    WATER: 3,
    PATH: 4,
    DOOR: 5,
    HOUSE: 6,
    TREE: 7,
    ROCK: 8,
    LAVA: 9,
    CAVE_FLOOR: 10,
    CAVE_WALL: 11,
    SAND: 12,
    SIGN: 13,
    NPC: 14,
    EXIT: 15,
    HOUSE_INSIDE: 16,
    HEAL: 17,
    SHOP: 18,
    BED: 19,
    TABLE: 20,
    BOOKSHELF: 21,
    CHEST: 22,
    RUG: 23,
    PLANT_POT: 24,
    WINDOW_TILE: 25,
    STOVE: 26,
    FOOD_CHEST: 27
};

const TILE_COLORS = {
    [TILE.GRASS]:       '#5a9e3e',
    [TILE.WALL]:        '#6B4226',
    [TILE.TALLGRASS]:   '#3d7a28',
    [TILE.WATER]:       '#2196F3',
    [TILE.PATH]:        '#C8B07A',
    [TILE.DOOR]:        '#8B4513',
    [TILE.HOUSE]:       '#D4760A',
    [TILE.TREE]:        '#2E7D32',
    [TILE.ROCK]:        '#78909C',
    [TILE.LAVA]:        '#E65100',
    [TILE.CAVE_FLOOR]:  '#4A4A5A',
    [TILE.CAVE_WALL]:   '#2C2C3A',
    [TILE.SAND]:        '#E8D5A3',
    [TILE.SIGN]:        '#C8B07A',
    [TILE.NPC]:         '#C8B07A',
    [TILE.EXIT]:        '#FFD700',
    [TILE.HOUSE_INSIDE]:'#D2B48C',
    [TILE.HEAL]:        '#FF69B4',
    [TILE.SHOP]:        '#9C27B0',
    [TILE.BED]:         '#D2B48C',
    [TILE.TABLE]:       '#D2B48C',
    [TILE.BOOKSHELF]:   '#D2B48C',
    [TILE.CHEST]:       '#D2B48C',
    [TILE.RUG]:         '#C4626A',
    [TILE.PLANT_POT]:   '#D2B48C',
    [TILE.WINDOW_TILE]: '#D2B48C',
    [TILE.STOVE]:       '#D2B48C',
    [TILE.FOOD_CHEST]:  '#D2B48C'
};

const TILE_EMOJIS = {
    [TILE.TREE]:  '🌳',
    [TILE.ROCK]:  '🪨',
    [TILE.SIGN]:  '📋',
    [TILE.HOUSE]: '🏠',
    [TILE.DOOR]:  '🚪',
    [TILE.HEAL]:  '💖',
    [TILE.SHOP]:  '🏪',
    [TILE.LAVA]:  '🔥',
    [TILE.WATER]: '〰️'
};

const TILE_WALKABLE = new Set([
    TILE.GRASS, TILE.TALLGRASS, TILE.PATH, TILE.DOOR,
    TILE.SAND, TILE.CAVE_FLOOR, TILE.EXIT,
    TILE.HOUSE_INSIDE, TILE.SIGN, TILE.NPC, TILE.HEAL, TILE.SHOP,
    TILE.RUG
]);

const TILE_SIZE = 16;
const MAP_COLS = 25;
const MAP_ROWS = 17;

// --- MAP DATA ---
// Each map is MAP_ROWS × MAP_COLS
// V = Village, J = Jungle, C = Cave, X = Volcano

const MAPS = {
    village: {
        name: 'Dorpje',
        emoji: '🏘️',
        bgColor: '#5a9e3e',
        music: 'village',
        encounters: false,
        tiles: [
            [7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7],
            [7,4,4,4,4,4,0,0,0,7,0,0,0,0,0,7,0,0,4,4,4,4,4,4,7],
            [7,4,6,6,6,4,0,0,0,0,0,0,0,0,0,0,0,0,4,6,6,6,4,4,7],
            [7,4,6,16,6,4,0,0,0,0,0,0,13,0,0,0,0,0,4,6,16,6,4,4,7],
            [7,4,6,5,6,4,0,0,0,0,0,0,0,0,0,0,0,0,4,6,5,6,4,4,7],
            [7,4,4,4,4,4,0,0,0,0,4,4,4,4,4,0,0,0,4,4,4,4,4,4,7],
            [7,0,0,0,0,0,0,0,0,4,4,17,4,18,4,4,0,0,0,0,0,0,0,0,7],
            [7,0,0,0,0,0,0,0,4,4,0,0,0,0,0,4,4,0,0,0,0,0,0,0,7],
            [7,4,4,4,4,4,4,4,4,0,0,0,0,0,0,0,4,4,4,4,4,4,4,4,7],
            [7,0,0,0,0,0,0,0,4,0,0,0,14,0,0,0,4,0,0,0,0,0,0,0,7],
            [7,0,0,0,0,0,0,0,4,0,0,0,0,0,0,0,4,0,0,0,0,0,0,0,7],
            [7,0,0,13,0,0,0,0,4,4,0,0,0,0,4,4,4,0,0,0,0,13,0,0,7],
            [7,0,0,0,0,0,0,0,0,4,4,4,4,4,4,0,0,0,0,0,0,0,0,0,7],
            [7,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,7],
            [7,15,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,15,0,7],
            [7,15,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,15,7],
            [7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7]
        ],
        exits: [
            { x: 1, y: 14, target: 'jungle', spawnX: 23, spawnY: 8 },
            { x: 1, y: 15, target: 'jungle', spawnX: 23, spawnY: 9 },
            { x: 22, y: 14, target: 'cave', spawnX: 1, spawnY: 8 },
            { x: 23, y: 15, target: 'volcano', spawnX: 1, spawnY: 8 }
        ],
        signs: [
            { x: 12, y: 3, text: 'Welkom in het Dorpje! Hier begint je avontuur! 🏘️' },
            { x: 3, y: 11, text: '← Jungle: Hier leven wilde fabeldieren! 🌿' },
            { x: 21, y: 11, text: '→ Grot & Vulkaan: Pas op, sterke dieren! ⚠️' }
        ],
        npcs: [
            { x: 12, y: 9, name: 'Professor Willow', emoji: '👨‍🔬',
              dialog: ['Hallo Eva! Welkom in de wereld van de fabeldieren!',
                       'Loop door het hoge gras om wilde fabeldieren tegen te komen.',
                       'Gebruik Fabelballen om ze te vangen! Veel succes! 🌟'],
              battle: false }
        ],
        houses: [
            { doorX: 3, doorY: 4, inside: 'house_eva' },
            { doorX: 20, doorY: 4, inside: 'house_trainer' }
        ]
    },

    jungle: {
        name: 'Jungle',
        emoji: '🌿',
        bgColor: '#2d5a27',
        music: 'jungle',
        encounters: true,
        encounterRate: 0.15,
        availableAnimals: ['mogwai', 'kitsune', 'eenhoorn', 'pegasus', 'sprite', 'wolpertinger', 'nymf', 'elfje', 'trol', 'werwolf', 'alicorn'],
        tiles: [
            [7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7],
            [7,2,2,2,7,0,0,2,2,2,7,2,2,2,7,0,0,2,2,2,7,2,2,2,7],
            [7,2,2,2,0,0,2,2,7,2,2,2,7,2,2,2,2,7,2,0,0,2,2,2,7],
            [7,7,2,0,0,2,2,7,7,2,2,0,0,0,2,2,7,7,2,0,0,2,7,2,7],
            [7,0,0,0,2,2,7,7,2,2,0,0,4,0,0,2,2,7,7,2,0,0,0,0,7],
            [7,0,2,2,2,0,0,2,2,0,0,4,4,4,0,0,2,2,0,0,2,2,2,0,7],
            [7,2,2,7,2,2,0,0,0,0,4,4,7,4,4,0,0,0,0,2,2,7,2,2,7],
            [7,2,7,7,7,2,2,0,0,4,4,7,7,7,4,4,0,0,2,2,7,7,7,2,7],
            [7,0,0,0,0,0,0,0,4,4,0,0,4,0,0,4,4,0,0,0,0,0,0,15,7],
            [7,2,7,7,7,2,2,0,0,4,4,7,7,7,4,4,0,0,2,2,7,7,7,15,7],
            [7,2,2,7,2,2,0,0,0,0,4,4,7,4,4,0,0,0,0,2,2,7,2,2,7],
            [7,0,2,2,2,0,0,2,2,0,0,4,4,4,0,0,2,2,0,0,2,2,2,0,7],
            [7,0,0,0,2,2,7,7,2,2,0,0,4,0,0,2,2,7,7,2,2,0,0,0,7],
            [7,7,2,0,0,2,2,7,7,2,2,0,0,0,2,2,7,7,2,2,0,0,2,7,7],
            [7,2,2,2,0,0,2,2,7,2,2,2,14,2,2,2,2,7,2,0,0,2,2,2,7],
            [7,2,2,2,7,0,0,2,2,2,7,2,2,2,7,0,0,2,2,2,7,2,2,2,7],
            [7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7]
        ],
        exits: [
            { x: 23, y: 8, target: 'village', spawnX: 2, spawnY: 14 },
            { x: 23, y: 9, target: 'village', spawnX: 2, spawnY: 15 }
        ],
        signs: [],
        npcs: [
            { x: 12, y: 14, name: 'Ranger Mila', emoji: '🧑‍🌾',
              dialog: ['Pas op in het hoge gras! Daar leven wilde fabeldieren.',
                       'Hoe dieper je in de jungle gaat, hoe sterker ze worden!'],
              battle: false }
        ],
        houses: []
    },

    cave: {
        name: 'Grot',
        emoji: '🕳️',
        bgColor: '#2C2C3A',
        music: 'cave',
        encounters: true,
        encounterRate: 0.20,
        availableAnimals: ['gremlin', 'kitsune', 'zeemeermin', 'hydra', 'bakunawa', 'cerberus', 'minotaurus', 'yeti', 'basilisk', 'golem', 'kraken', 'sfinks', 'djinn'],
        tiles: [
            [11,11,11,11,11,11,11,11,11,11,11,11,11,11,11,11,11,11,11,11,11,11,11,11,11],
            [11,10,10,10,11,11,10,10,10,10,11,11,11,10,10,10,10,10,11,11,10,10,10,10,11],
            [11,10,10,10,10,11,10,10,11,10,10,10,10,10,11,11,10,10,10,10,10,10,11,10,11],
            [11,10,10,10,10,10,10,11,11,10,10,10,10,10,10,10,10,11,10,10,10,10,10,10,11],
            [11,10,10,11,10,10,10,10,10,10,10,3,3,3,10,10,10,10,10,10,11,10,10,10,11],
            [11,10,10,11,11,10,10,10,10,10,3,3,3,3,3,10,10,10,10,10,11,11,10,10,11],
            [11,10,10,10,10,10,10,10,10,10,3,3,8,3,3,10,10,10,10,10,10,10,10,10,11],
            [11,10,10,10,10,10,10,10,10,10,10,3,3,3,10,10,10,10,10,10,10,10,10,10,11],
            [11,15,10,10,10,10,10,10,10,10,10,10,10,10,10,10,10,10,10,10,10,10,10,15,11],
            [11,10,10,10,10,10,10,10,10,10,10,10,10,10,10,10,10,10,10,10,10,10,10,10,11],
            [11,10,10,10,10,10,10,10,10,10,8,10,10,10,8,10,10,10,10,10,10,10,10,10,11],
            [11,10,10,11,10,10,10,10,10,10,10,10,14,10,10,10,10,10,10,10,11,10,10,10,11],
            [11,10,10,11,11,10,10,10,10,10,10,10,10,10,10,10,10,10,10,11,11,10,10,10,11],
            [11,10,10,10,10,10,10,11,10,10,10,10,10,10,10,10,11,10,10,10,10,10,10,10,11],
            [11,10,10,10,10,10,10,10,10,10,10,10,10,10,10,10,10,10,10,10,10,10,10,10,11],
            [11,10,10,10,11,11,10,10,10,10,11,10,10,10,11,10,10,10,10,11,11,10,10,10,11],
            [11,11,11,11,11,11,11,11,11,11,11,11,11,11,11,11,11,11,11,11,11,11,11,11,11]
        ],
        exits: [
            { x: 1, y: 8, target: 'village', spawnX: 21, spawnY: 14 },
            { x: 23, y: 8, target: 'volcano', spawnX: 1, spawnY: 8 }
        ],
        signs: [],
        npcs: [
            { x: 12, y: 11, name: 'Grotbewoner Sven', emoji: '🧔',
              dialog: ['Diep in deze grot leeft de legendaris Bakunawa...',
                       'Alleen de moedigste trainers durven hem uit te dagen!'],
              battle: true,
              team: [
                { id: 'gremlin', level: 5 },
                { id: 'kitsune', level: 6 }
              ]
            }
        ],
        houses: []
    },

    volcano: {
        name: 'Vulkaan',
        emoji: '🌋',
        bgColor: '#4A1A0A',
        music: 'volcano',
        encounters: true,
        encounterRate: 0.18,
        availableAnimals: ['draak', 'feniks', 'griffioen', 'salamander', 'mantikoor', 'basilisk', 'sfinks', 'djinn'],
        tiles: [
            [8,8,8,8,8,8,8,8,8,8,8,8,8,8,8,8,8,8,8,8,8,8,8,8,8],
            [8,12,12,12,8,12,12,12,9,12,12,12,12,12,12,9,12,12,12,8,12,12,12,12,8],
            [8,12,12,12,12,12,12,9,9,9,12,12,12,12,9,9,9,12,12,12,12,12,12,12,8],
            [8,12,12,12,12,12,12,12,9,12,12,12,12,12,12,9,12,12,12,12,12,12,12,12,8],
            [8,12,12,8,12,12,12,12,12,12,12,9,9,9,12,12,12,12,12,12,8,12,12,12,8],
            [8,12,12,8,8,12,12,12,12,12,9,9,9,9,9,12,12,12,12,8,8,12,12,12,8],
            [8,12,12,12,12,12,12,12,12,9,9,9,8,9,9,9,12,12,12,12,12,12,12,12,8],
            [8,12,12,12,12,12,12,12,12,12,9,9,9,9,9,12,12,12,12,12,12,12,12,12,8],
            [8,15,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,8],
            [8,12,12,12,12,12,12,12,12,12,12,12,14,12,12,12,12,12,12,12,12,12,12,12,8],
            [8,12,12,12,12,12,12,12,12,12,8,12,12,12,8,12,12,12,12,12,12,12,12,12,8],
            [8,12,12,8,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,8,12,12,12,8],
            [8,12,12,8,8,12,12,12,12,12,12,12,12,12,12,12,12,12,12,8,8,12,12,12,8],
            [8,12,12,12,12,12,12,8,12,12,12,12,12,12,12,12,8,12,12,12,12,12,12,12,8],
            [8,12,12,12,12,12,12,12,12,12,13,12,12,12,12,12,12,12,12,12,12,12,12,12,8],
            [8,12,12,12,8,8,12,12,12,12,12,12,12,12,12,12,12,12,8,8,12,12,12,12,8],
            [8,8,8,8,8,8,8,8,8,8,8,8,8,8,8,8,8,8,8,8,8,8,8,8,8]
        ],
        exits: [
            { x: 1, y: 8, target: 'cave', spawnX: 22, spawnY: 8 }
        ],
        signs: [
            { x: 10, y: 14, text: '⚠️ Gevaar! Sterke fabeldieren leven hier. Wees voorbereid!' }
        ],
        npcs: [
            { x: 12, y: 9, name: 'Vuurmeester Kai', emoji: '🧑‍🚒',
              dialog: ['Ik ben de Vuurmeester! Denk je dat je sterk genoeg bent?',
                       'Laat me je kracht zien in een gevecht!'],
              battle: true,
              team: [
                { id: 'draak', level: 8 },
                { id: 'feniks', level: 7 },
                { id: 'griffioen', level: 9 }
              ]
            }
        ],
        houses: []
    },

    house_eva: {
        name: 'Eva\'s Huis',
        emoji: '🏠',
        bgColor: '#D2B48C',
        music: 'village',
        encounters: false,
        tiles: [
            [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
            [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
            [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
            [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
            [1,1,1,1,1,1,25,1,1,1,25,1,1,25,1,1,1,25,1,1,1,1,1,1,1],
            [1,1,1,1,1,1,19,19,16,16,16,16,16,16,16,21,21,21,1,1,1,1,1,1,1],
            [1,1,1,1,1,1,16,16,16,23,23,16,16,16,16,16,16,16,1,1,1,1,1,1,1],
            [1,1,1,1,1,1,16,16,23,23,23,23,16,16,20,20,16,16,1,1,1,1,1,1,1],
            [1,1,1,1,1,1,24,16,23,23,23,23,16,16,20,20,16,27,1,1,1,1,1,1,1],
            [1,1,1,1,1,1,16,16,16,23,23,16,16,16,16,16,16,27,1,1,1,1,1,1,1],
            [1,1,1,1,1,1,16,16,16,16,16,16,16,16,16,16,16,16,1,1,1,1,1,1,1],
            [1,1,1,1,1,1,26,16,16,16,16,16,16,16,16,16,22,16,1,1,1,1,1,1,1],
            [1,1,1,1,1,1,1,16,16,16,16,5,16,16,16,16,16,1,1,1,1,1,1,1,1],
            [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
            [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
            [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
            [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1]
        ],
        exits: [
            { x: 11, y: 12, target: 'village', spawnX: 3, spawnY: 5 }
        ],
        signs: [],
        npcs: [],
        houses: [],
        foodChests: [
            { x: 17, y: 8, text: '🍎 Eva\'s Voorraadkist' },
            { x: 17, y: 9, text: '🍎 Eva\'s Voorraadkist' }
        ]
    },

    house_trainer: {
        name: 'Trainer\'s Huis',
        emoji: '🏠',
        bgColor: '#D2B48C',
        music: 'village',
        encounters: false,
        tiles: [
            [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
            [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
            [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
            [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
            [1,1,1,1,1,1,25,1,1,1,25,1,1,25,1,1,1,25,1,1,1,1,1,1,1],
            [1,1,1,1,1,1,21,21,16,16,16,16,16,16,16,19,19,16,1,1,1,1,1,1,1],
            [1,1,1,1,1,1,16,16,16,16,16,16,16,16,16,16,16,16,1,1,1,1,1,1,1],
            [1,1,1,1,1,1,22,16,16,20,20,16,16,16,16,16,16,24,1,1,1,1,1,1,1],
            [1,1,1,1,1,1,16,16,16,20,20,16,14,16,16,16,16,16,1,1,1,1,1,1,1],
            [1,1,1,1,1,1,16,16,16,16,16,23,23,23,16,16,16,16,1,1,1,1,1,1,1],
            [1,1,1,1,1,1,16,16,16,16,16,23,23,23,16,16,16,16,1,1,1,1,1,1,1],
            [1,1,1,1,1,1,26,16,16,16,16,16,16,16,16,16,21,16,1,1,1,1,1,1,1],
            [1,1,1,1,1,1,1,16,16,16,16,5,16,16,16,16,16,1,1,1,1,1,1,1,1],
            [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
            [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
            [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
            [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1]
        ],
        exits: [
            { x: 11, y: 12, target: 'village', spawnX: 20, spawnY: 5 }
        ],
        signs: [],
        npcs: [
            { x: 12, y: 8, name: 'Trainer Lars', emoji: '🧑',
              dialog: ['Hé! Ik ben Lars. Wil je een gevecht?',
                       'Mijn fabeldieren zijn sterk getraind!'],
              battle: true,
              team: [
                { id: 'eenhoorn', level: 4 },
                { id: 'mogwai', level: 5 }
              ]
            }
        ],
        houses: []
    }
};

function getTile(mapId, x, y) {
    const map = MAPS[mapId];
    if (!map || y < 0 || y >= MAP_ROWS || x < 0 || x >= MAP_COLS) return TILE.WALL;
    return map.tiles[y][x];
}

function isWalkable(mapId, x, y) {
    return TILE_WALKABLE.has(getTile(mapId, x, y));
}

function getExitAt(mapId, x, y) {
    const map = MAPS[mapId];
    if (!map) return null;
    return map.exits.find(e => e.x === x && e.y === y) || null;
}

function getSignAt(mapId, x, y) {
    const map = MAPS[mapId];
    if (!map) return null;
    return map.signs.find(s => s.x === x && s.y === y) || null;
}

function getNpcAt(mapId, x, y) {
    const map = MAPS[mapId];
    if (!map) return null;
    return map.npcs.find(n => n.x === x && n.y === y) || null;
}

function getHouseAt(mapId, doorX, doorY) {
    const map = MAPS[mapId];
    if (!map) return null;
    return map.houses.find(h => h.doorX === doorX && h.doorY === doorY) || null;
}

function shouldEncounter(mapId) {
    const map = MAPS[mapId];
    if (!map || !map.encounters) return false;
    return Math.random() < map.encounterRate;
}

function getWildAnimal(mapId, playerLevel) {
    const map = MAPS[mapId];
    if (!map || !map.availableAnimals) return null;

    // Weighted by rarity
    const available = map.availableAnimals.map(id => getAnimalDef(id)).filter(Boolean);
    const totalRarity = available.reduce((sum, a) => sum + a.rarity, 0);
    let roll = Math.random() * totalRarity;

    let chosen = available[0];
    for (const a of available) {
        roll -= a.rarity;
        if (roll <= 0) { chosen = a; break; }
    }

    // Wild level: playerLevel -2 to +2, min 1
    const wildLevel = Math.max(1, playerLevel + Math.floor(Math.random() * 5) - 2);
    return createPartyAnimal(chosen.id, wildLevel);
}
