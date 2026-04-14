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
    FOOD_CHEST: 27,
    FOUNTAIN: 28,
    CASTLE: 29,
    CASTLE_DOOR: 30,
    ICE: 31,
    SNOW: 32,
    SWAMP: 33,
    RUINS_FLOOR: 34,
    RUINS_WALL: 35
};

// DQ2 NES palette colors
const TILE_COLORS = {
    [TILE.GRASS]:       '#00a800',
    [TILE.WALL]:        '#824100',
    [TILE.TALLGRASS]:   '#005800',
    [TILE.WATER]:       '#0058f8',
    [TILE.PATH]:        '#fcbcb0',
    [TILE.DOOR]:        '#824100',
    [TILE.HOUSE]:       '#f87858',
    [TILE.TREE]:        '#005800',
    [TILE.ROCK]:        '#bcbcbc',
    [TILE.LAVA]:        '#f83800',
    [TILE.CAVE_FLOOR]:  '#747474',
    [TILE.CAVE_WALL]:   '#3c3c3c',
    [TILE.SAND]:        '#f8d878',
    [TILE.SIGN]:        '#fcbcb0',
    [TILE.NPC]:         '#fcbcb0',
    [TILE.EXIT]:        '#f8d800',
    [TILE.HOUSE_INSIDE]:'#f8d878',
    [TILE.HEAL]:        '#f878f8',
    [TILE.SHOP]:        '#6844fc',
    [TILE.BED]:         '#f8d878',
    [TILE.TABLE]:       '#f8d878',
    [TILE.BOOKSHELF]:   '#f8d878',
    [TILE.CHEST]:       '#f8d878',
    [TILE.RUG]:         '#a80020',
    [TILE.PLANT_POT]:   '#f8d878',
    [TILE.WINDOW_TILE]: '#f8d878',
    [TILE.STOVE]:       '#f8d878',
    [TILE.FOOD_CHEST]:  '#f8d878',
    [TILE.FOUNTAIN]:    '#0058f8',
    [TILE.CASTLE]:      '#bcbcbc',
    [TILE.CASTLE_DOOR]: '#bcbcbc',
    [TILE.ICE]:         '#a8d8f8',
    [TILE.SNOW]:        '#f0f0f8',
    [TILE.SWAMP]:       '#3a5828',
    [TILE.RUINS_FLOOR]: '#a89880',
    [TILE.RUINS_WALL]:  '#686058'
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
    TILE.RUG, TILE.CASTLE_DOOR, TILE.SNOW, TILE.RUINS_FLOOR, TILE.SWAMP
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
            [7,0,0,4,4,4,4,4,29,29,29,29,29,29,29,29,29,4,4,4,4,4,0,0,7],
            [7,0,0,4,6,6,6,4,29,29,29,29,29,29,29,29,29,4,6,6,6,4,0,0,7],
            [7,0,0,4,6,16,6,4,29,29,29,29,29,29,29,29,29,4,6,16,6,4,0,0,7],
            [7,0,0,4,6,5,6,4,29,29,29,30,4,30,29,29,29,4,6,5,6,4,0,0,7],
            [7,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,7],
            [7,0,0,0,0,0,4,0,0,0,0,0,4,0,0,0,0,0,4,0,0,0,0,0,7],
            [7,6,6,6,4,0,4,0,0,0,0,28,4,28,0,0,0,0,4,0,4,6,6,6,7],
            [7,6,16,6,4,0,4,0,0,0,28,3,4,3,28,0,0,0,4,0,4,6,16,6,7],
            [7,6,5,6,4,0,4,4,4,4,4,4,17,4,4,4,4,4,4,0,4,6,5,6,7],
            [7,4,4,4,4,0,0,0,0,0,0,0,4,0,0,0,0,0,0,0,4,4,4,4,7],
            [7,0,0,13,0,0,0,0,0,0,4,4,18,4,4,0,0,0,0,0,0,13,0,0,7],
            [7,0,0,0,0,0,0,0,0,4,0,0,14,0,0,4,0,0,0,0,0,0,0,0,7],
            [7,0,0,0,0,0,13,0,0,4,0,0,0,0,0,4,0,0,13,0,0,0,0,0,7],
            [7,15,0,0,0,0,0,0,0,4,4,4,4,4,4,4,0,0,0,0,0,0,15,0,7],
            [7,15,0,15,15,0,0,0,0,0,0,0,0,0,0,0,0,0,0,15,15,0,0,15,7],
            [7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7]
        ],
        exits: [
            { x: 1, y: 14, target: 'jungle', spawnX: 23, spawnY: 8 },
            { x: 1, y: 15, target: 'jungle', spawnX: 23, spawnY: 9 },
            { x: 22, y: 14, target: 'cave', spawnX: 1, spawnY: 8 },
            { x: 23, y: 15, target: 'volcano', spawnX: 1, spawnY: 8 },
            { x: 3, y: 15, target: 'desert', spawnX: 12, spawnY: 1 },
            { x: 4, y: 15, target: 'desert', spawnX: 12, spawnY: 1 },
            { x: 19, y: 15, target: 'swamp', spawnX: 12, spawnY: 1 },
            { x: 20, y: 15, target: 'swamp', spawnX: 12, spawnY: 1 }
        ],
        signs: [
            { x: 3, y: 11, text: '← Jungle: Hier leven wilde fabeldieren! 🌿' },
            { x: 21, y: 11, text: '→ Grot & Vulkaan: Pas op, sterke dieren! ⚠️' },
            { x: 6, y: 13, text: '↓ Woestijn & IJsland: Exotische gebieden! 🏜️❄️' },
            { x: 18, y: 13, text: '↓ Moeras & Ruïnes: Duistere oorden! 🐸🏛️' }
        ],
        npcs: [
            { x: 12, y: 12, name: 'Professor Willow', emoji: '👨‍🔬',
              dialog: ['Hallo Eva! Welkom in de wereld van de fabeldieren!',
                       'Loop door het hoge gras om wilde fabeldieren tegen te komen.',
                       'Gebruik Fabelballen om ze te vangen! Veel succes! 🌟'],
              battle: false }
        ],
        houses: [
            { doorX: 5, doorY: 4, inside: 'house_eva' },
            { doorX: 20, doorY: 4, inside: 'house_trainer' },
            { doorX: 2, doorY: 9, inside: 'house_eva' },
            { doorX: 23, doorY: 9, inside: 'house_trainer' },
            { doorX: 11, doorY: 4, inside: 'house_castle' },
            { doorX: 13, doorY: 4, inside: 'house_castle' }
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
    },

    house_castle: {
        name: 'Kasteel',
        emoji: '🏰',
        bgColor: '#4a4a5a',
        music: 'village',
        encounters: false,
        tiles: [
            [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
            [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
            [1,1,1,1,25,1,1,25,1,1,25,1,1,1,25,1,1,25,1,1,25,1,1,1,1],
            [1,1,1,1,16,1,1,16,1,1,16,16,16,16,16,1,1,16,1,1,16,1,1,1,1],
            [1,1,1,1,16,16,16,16,16,16,16,23,23,23,16,16,16,16,16,16,16,1,1,1,1],
            [1,1,1,1,16,16,16,16,16,16,23,23,23,23,23,16,16,16,16,16,16,1,1,1,1],
            [1,1,1,1,21,16,16,16,16,16,23,23,23,23,23,16,16,16,16,16,21,1,1,1,1],
            [1,1,1,1,16,16,20,20,16,16,16,23,14,23,16,16,16,20,20,16,16,1,1,1,1],
            [1,1,1,1,16,16,20,20,16,16,16,16,16,16,16,16,16,20,20,16,16,1,1,1,1],
            [1,1,1,1,24,16,16,16,16,22,16,16,16,16,16,22,16,16,16,16,24,1,1,1,1],
            [1,1,1,1,16,16,16,16,16,16,16,16,16,16,16,16,16,16,16,16,16,1,1,1,1],
            [1,1,1,1,16,16,16,16,16,16,16,16,16,16,16,16,16,16,16,16,16,1,1,1,1],
            [1,1,1,1,1,16,16,16,16,16,16,5,16,5,16,16,16,16,16,16,1,1,1,1,1],
            [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
            [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
            [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
            [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1]
        ],
        exits: [
            { x: 11, y: 12, target: 'village', spawnX: 11, spawnY: 5 },
            { x: 13, y: 12, target: 'village', spawnX: 13, spawnY: 5 }
        ],
        signs: [],
        npcs: [
            { x: 12, y: 7, name: 'Koning Floris', emoji: '👑',
              dialog: ['Welkom in mijn kasteel, jonge trainer!',
                       'Ik heb gehoord over jouw avonturen met de fabeldieren.',
                       'Verken alle rijken en vang ze allemaal!',
                       'Als je alle 40 fabeldieren hebt gevangen, kom dan terug voor een speciale beloning! 🏆'],
              battle: false }
        ],
        houses: []
    },

    desert: {
        name: 'Woestijn',
        emoji: '🏜️',
        bgColor: '#c4a050',
        music: 'volcano',
        encounters: true,
        encounterRate: 0.16,
        availableAnimals: ['scarabee', 'zandworm', 'fenrir', 'chimaera', 'djinn', 'sfinks', 'salamander', 'mantikoor'],
        tiles: [
            [8,8,8,8,8,8,8,8,8,8,8,8,8,8,8,8,8,8,8,8,8,8,8,8,8],
            [8,12,12,12,12,12,12,12,12,12,12,15,12,15,12,12,12,12,12,12,12,12,12,12,8],
            [8,12,12,12,2,2,12,12,12,8,12,12,12,12,12,8,12,12,12,2,2,12,12,12,8],
            [8,12,12,2,2,2,2,12,12,12,12,12,12,12,12,12,12,12,2,2,2,2,12,12,8],
            [8,12,12,2,2,12,12,12,12,12,2,2,2,2,2,12,12,12,12,12,2,2,12,12,8],
            [8,12,12,12,12,12,12,12,12,2,2,2,8,2,2,2,12,12,12,12,12,12,12,12,8],
            [8,12,12,12,12,12,12,2,2,2,2,12,12,12,2,2,2,2,12,12,12,12,12,12,8],
            [8,12,8,12,12,12,2,2,2,12,12,12,12,12,12,12,2,2,2,12,12,12,8,12,8],
            [8,12,12,12,12,2,2,12,12,12,12,12,14,12,12,12,12,12,2,2,12,12,12,12,8],
            [8,12,8,12,12,12,2,2,2,12,12,12,12,12,12,12,2,2,2,12,12,12,8,12,8],
            [8,12,12,12,12,12,12,2,2,2,2,12,12,12,2,2,2,2,12,12,12,12,12,12,8],
            [8,12,12,12,12,12,12,12,12,2,2,2,12,2,2,2,12,12,12,12,12,12,12,12,8],
            [8,12,12,2,2,12,12,12,12,12,2,2,2,2,2,12,12,12,12,12,2,2,12,12,8],
            [8,12,12,2,2,2,2,12,12,12,12,12,12,12,12,12,12,12,2,2,2,2,12,12,8],
            [8,12,12,12,2,2,12,12,12,13,12,12,12,12,12,13,12,12,12,2,2,12,12,12,8],
            [8,12,12,12,12,12,12,12,12,12,12,12,15,12,12,12,12,12,12,12,12,12,12,12,8],
            [8,8,8,8,8,8,8,8,8,8,8,8,8,8,8,8,8,8,8,8,8,8,8,8,8]
        ],
        exits: [
            { x: 11, y: 1, target: 'village', spawnX: 3, spawnY: 14 },
            { x: 13, y: 1, target: 'village', spawnX: 4, spawnY: 14 },
            { x: 12, y: 15, target: 'ice', spawnX: 12, spawnY: 1 }
        ],
        signs: [
            { x: 9, y: 14, text: '🏜️ Woestijn — Magische wezens schuilen in het zand!' },
            { x: 15, y: 14, text: '↓ IJsland: Bevroren wereld hieronder! ❄️' }
        ],
        npcs: [
            { x: 12, y: 8, name: 'Woestijnreiziger Amira', emoji: '🧕',
              dialog: ['Welkom in de woestijn! Pas op voor zandwormen!',
                       'De magische scarabeeën zijn moeilijk te vinden, maar de moeite waard!'],
              battle: true,
              team: [
                { id: 'scarabee', level: 7 },
                { id: 'djinn', level: 8 },
                { id: 'sfinks', level: 9 }
              ]
            }
        ],
        houses: []
    },

    ice: {
        name: 'IJsland',
        emoji: '❄️',
        bgColor: '#a0c8e8',
        music: 'cave',
        encounters: true,
        encounterRate: 0.17,
        availableAnimals: ['ijsdraak', 'sneeuwuil', 'wendigo', 'fenrir', 'yeti', 'pegasus', 'nymf'],
        tiles: [
            [8,8,8,8,8,8,8,8,8,8,8,8,8,8,8,8,8,8,8,8,8,8,8,8,8],
            [8,32,32,32,32,32,32,32,32,32,32,15,32,15,32,32,32,32,32,32,32,32,32,32,8],
            [8,32,32,32,2,2,32,31,31,32,32,32,32,32,32,31,31,32,32,2,2,32,32,32,8],
            [8,32,32,2,2,2,31,31,32,32,32,32,32,32,32,32,31,31,2,2,2,32,32,32,8],
            [8,32,32,2,2,32,31,32,32,32,2,2,2,2,2,32,32,31,32,32,2,2,32,32,8],
            [8,32,32,32,32,32,32,32,32,2,2,2,31,2,2,2,32,32,32,32,32,32,32,32,8],
            [8,32,31,32,32,32,32,2,2,2,2,31,31,31,2,2,2,2,32,32,32,31,32,32,8],
            [8,32,31,31,32,32,2,2,2,32,32,31,31,31,32,32,2,2,2,32,31,31,32,32,8],
            [8,32,32,32,32,2,2,32,32,32,32,32,14,32,32,32,32,32,2,2,32,32,32,32,8],
            [8,32,31,31,32,32,2,2,2,32,32,32,32,32,32,32,2,2,2,32,31,31,32,32,8],
            [8,32,31,32,32,32,32,2,2,2,2,32,32,32,2,2,2,2,32,32,32,31,32,32,8],
            [8,32,32,32,32,32,32,32,32,2,2,2,32,2,2,2,32,32,32,32,32,32,32,32,8],
            [8,32,32,2,2,32,32,32,32,32,2,2,2,2,2,32,32,32,32,32,2,2,32,32,8],
            [8,32,32,2,2,2,32,32,32,32,32,32,32,32,32,32,32,32,2,2,2,32,32,32,8],
            [8,32,32,32,2,2,32,32,13,32,32,32,32,32,32,32,13,32,32,2,2,32,32,32,8],
            [8,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,8],
            [8,8,8,8,8,8,8,8,8,8,8,8,8,8,8,8,8,8,8,8,8,8,8,8,8]
        ],
        exits: [
            { x: 11, y: 1, target: 'desert', spawnX: 12, spawnY: 14 },
            { x: 13, y: 1, target: 'desert', spawnX: 12, spawnY: 14 }
        ],
        signs: [
            { x: 8, y: 14, text: '❄️ IJsland — De bevroren wereld. Zeldzame wezens wonen hier!' },
            { x: 16, y: 14, text: '↑ Woestijn: Warm je op in het zand! 🏜️' }
        ],
        npcs: [
            { x: 12, y: 8, name: 'IJskoningin Freya', emoji: '👸',
              dialog: ['Welkom in mijn bevroren koninkrijk...',
                       'Alleen de sterkste trainers overleven de kou!',
                       'Durf je het tegen mijn IJsdraak op te nemen?'],
              battle: true,
              team: [
                { id: 'ijsdraak', level: 10 },
                { id: 'sneeuwuil', level: 9 },
                { id: 'wendigo', level: 11 }
              ]
            }
        ],
        houses: []
    },

    swamp: {
        name: 'Moeras',
        emoji: '🐸',
        bgColor: '#2a3a20',
        music: 'cave',
        encounters: true,
        encounterRate: 0.20,
        availableAnimals: ['kappa', 'wisp', 'slangenkoning', 'nymf', 'trol', 'werwolf', 'gremlin', 'hydra'],
        tiles: [
            [7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7],
            [7,33,33,33,33,33,33,33,33,33,33,15,33,15,33,33,33,33,33,33,33,33,33,33,7],
            [7,33,33,33,2,2,33,3,3,33,33,33,33,33,33,3,3,33,33,2,2,33,33,33,7],
            [7,33,33,2,2,2,3,3,33,33,7,33,33,33,7,33,3,3,2,2,2,33,33,33,7],
            [7,33,33,2,2,33,3,33,33,33,33,2,2,2,33,33,33,3,33,33,2,2,33,33,7],
            [7,33,33,33,33,33,33,33,33,2,2,2,7,2,2,2,33,33,33,33,33,33,33,33,7],
            [7,33,7,33,33,33,33,2,2,2,2,33,33,33,2,2,2,2,33,33,33,7,33,33,7],
            [7,33,7,3,33,33,2,2,2,33,33,33,33,33,33,33,2,2,2,33,3,7,33,33,7],
            [7,33,33,33,33,2,2,33,33,33,33,33,14,33,33,33,33,33,2,2,33,33,33,15,7],
            [7,33,7,3,33,33,2,2,2,33,33,33,33,33,33,33,2,2,2,33,3,7,33,15,7],
            [7,33,7,33,33,33,33,2,2,2,2,33,33,33,2,2,2,2,33,33,33,7,33,33,7],
            [7,33,33,33,33,33,33,33,33,2,2,2,33,2,2,2,33,33,33,33,33,33,33,33,7],
            [7,33,33,2,2,33,33,33,33,33,2,2,2,2,2,33,33,33,33,33,2,2,33,33,7],
            [7,33,33,2,2,2,33,33,33,33,33,33,33,33,33,33,33,33,2,2,2,33,33,33,7],
            [7,33,33,33,2,2,33,33,13,33,33,33,33,33,33,33,13,33,33,2,2,33,33,33,7],
            [7,33,33,33,33,33,33,33,33,33,33,33,33,33,33,33,33,33,33,33,33,33,33,33,7],
            [7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7]
        ],
        exits: [
            { x: 11, y: 1, target: 'village', spawnX: 19, spawnY: 14 },
            { x: 13, y: 1, target: 'village', spawnX: 20, spawnY: 14 },
            { x: 23, y: 8, target: 'ruins', spawnX: 1, spawnY: 8 },
            { x: 23, y: 9, target: 'ruins', spawnX: 1, spawnY: 9 }
        ],
        signs: [
            { x: 8, y: 14, text: '🐸 Moeras — Duistere wezens spoken rond in de mist!' },
            { x: 16, y: 14, text: '→ Ruïnes: Oude beschaving met sterke bewakers! 🏛️' }
        ],
        npcs: [
            { x: 12, y: 8, name: 'Moeraseks Hilda', emoji: '🧙‍♀️',
              dialog: ['Hihihi... verdwaald in mijn moeras?',
                       'De dwaallichten leiden je naar gevaarlijke plekken...',
                       'Laat me je kracht testen!'],
              battle: true,
              team: [
                { id: 'kappa', level: 8 },
                { id: 'wisp', level: 9 },
                { id: 'slangenkoning', level: 10 }
              ]
            }
        ],
        houses: []
    },

    ruins: {
        name: 'Oude Ruïnes',
        emoji: '🏛️',
        bgColor: '#4a4038',
        music: 'cave',
        encounters: true,
        encounterRate: 0.18,
        availableAnimals: ['gargoyle', 'medusa', 'chimaera', 'wisp', 'basilisk', 'cerberus', 'minotaurus', 'golem'],
        tiles: [
            [35,35,35,35,35,35,35,35,35,35,35,35,35,35,35,35,35,35,35,35,35,35,35,35,35],
            [35,34,34,34,35,34,34,34,34,35,34,34,34,34,34,35,34,34,34,34,35,34,34,34,35],
            [35,34,34,34,34,34,34,35,34,34,34,34,34,34,34,34,34,35,34,34,34,34,34,34,35],
            [35,34,34,2,2,34,34,34,34,34,2,2,2,2,2,34,34,34,34,34,2,2,34,34,35],
            [35,34,34,2,2,34,34,34,34,34,2,2,35,2,2,34,34,34,34,34,2,2,34,34,35],
            [35,34,34,34,34,34,34,34,2,2,2,35,35,35,2,2,2,34,34,34,34,34,34,34,35],
            [35,34,34,34,34,34,34,2,2,34,34,35,35,35,34,34,2,2,34,34,34,34,34,34,35],
            [35,34,35,34,34,34,2,2,34,34,34,34,34,34,34,34,34,2,2,34,34,35,34,34,35],
            [35,15,34,34,34,2,2,34,34,34,34,34,14,34,34,34,34,34,2,2,34,34,34,34,35],
            [35,15,35,34,34,34,2,2,34,34,34,34,34,34,34,34,34,2,2,34,34,35,34,34,35],
            [35,34,34,34,34,34,34,2,2,34,34,8,34,8,34,34,2,2,34,34,34,34,34,34,35],
            [35,34,34,34,34,34,34,34,2,2,2,34,34,34,2,2,2,34,34,34,34,34,34,34,35],
            [35,34,34,2,2,34,34,34,34,34,2,2,34,2,2,34,34,34,34,34,2,2,34,34,35],
            [35,34,34,2,2,2,34,34,34,34,34,34,13,34,34,34,34,34,2,2,2,34,34,34,35],
            [35,34,34,34,2,2,34,34,34,34,34,34,34,34,34,34,34,34,34,2,2,34,34,34,35],
            [35,34,34,34,34,34,34,34,34,34,34,34,34,34,34,34,34,34,34,34,34,34,34,34,35],
            [35,35,35,35,35,35,35,35,35,35,35,35,35,35,35,35,35,35,35,35,35,35,35,35,35]
        ],
        exits: [
            { x: 1, y: 8, target: 'swamp', spawnX: 22, spawnY: 8 },
            { x: 1, y: 9, target: 'swamp', spawnX: 22, spawnY: 9 }
        ],
        signs: [
            { x: 12, y: 13, text: '🏛️ Ruïnes — Hier sluimeren oeroude bewakers...' }
        ],
        npcs: [
            { x: 12, y: 8, name: 'Ruïnebewaker Theron', emoji: '🧝‍♂️',
              dialog: ['Halt! Deze ruïnes zijn heilig terrein!',
                       'Alleen ware kampioenen mogen hier vangen.',
                       'Bewijs je kracht in een gevecht!'],
              battle: true,
              team: [
                { id: 'gargoyle', level: 10 },
                { id: 'medusa', level: 11 },
                { id: 'chimaera', level: 12 }
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
