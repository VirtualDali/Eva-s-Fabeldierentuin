/* ============================================
   Game - Main loop, canvas rendering, movement
   ============================================ */

let gamePlayer = null;
let canvas, ctx;
let keys = {};
let gameLoopRunning = false;
let lastMoveTime = 0;
const MOVE_DELAY = 150;
let isMoving = false;
let moveAnimTimer = 0;
let dialogQueue = [];
let dialogActive = false;
let interactCooldown = 0;

// --- Animation ---
let animFrame = 0;
let animTimer = 0;

// --- Init ---
document.addEventListener('DOMContentLoaded', () => {
    canvas = document.getElementById('game-canvas');
    ctx = canvas.getContext('2d');

    // Key handlers
    window.addEventListener('keydown', e => {
        keys[e.key.toLowerCase()] = true;
        if (e.key === ' ' || e.key === 'Enter') {
            e.preventDefault();
            handleInteract();
        }
    });
    window.addEventListener('keyup', e => {
        keys[e.key.toLowerCase()] = false;
    });

    initStartScreen();
});

function initStartScreen() {
    const hasSave = Storage.hasSave();
    document.getElementById('btn-continue').style.display = hasSave ? 'inline-flex' : 'none';

    document.getElementById('btn-new-game').addEventListener('click', () => {
        if (hasSave && !confirm('Nieuw spel beginnen? Je voortgang wordt gewist!')) return;
        Storage.resetGame();
        startNewGame();
    });

    document.getElementById('btn-continue').addEventListener('click', () => loadExistingGame());

    // HUD buttons
    document.getElementById('btn-team').addEventListener('click', () => openTeamOverlay());
    document.getElementById('btn-bag').addEventListener('click', () => openBagOverlay());
    document.getElementById('close-team').addEventListener('click', () => closeOverlay('overlay-team'));
    document.getElementById('close-bag').addEventListener('click', () => closeOverlay('overlay-bag'));

    // Draw all fabeldieren on start screen
    drawShowcase();
}

function drawShowcase() {
    const showcase = document.getElementById('fabeldieren-showcase');
    if (!showcase) return;
    showcase.innerHTML = '';
    ANIMAL_DEFS.forEach((def, i) => {
        const cell = document.createElement('div');
        cell.className = 'dier-cell';
        const c = document.createElement('canvas');
        c.width = 64;
        c.height = 64;
        c.id = 'showcase-' + def.id;
        cell.appendChild(c);
        const naam = document.createElement('div');
        naam.className = 'dier-naam';
        naam.textContent = def.name;
        cell.appendChild(naam);
        showcase.appendChild(cell);
        // Slight delay so canvases are in DOM
        setTimeout(() => {
            drawAnimalSprite('showcase-' + def.id, def.id, false);
        }, 10);
    });
}

function startNewGame() {
    gamePlayer = createNewPlayer();

    // Give starter choice later, for now give a Mogwai
    const starter = createPartyAnimal('mogwai', 5);
    starter.nickname = 'Mogwai';
    gamePlayer.team.push(starter);

    Storage.saveGame(buildSaveData());
    showScreen('screen-world');
    updateHUD();
    gameLoopRunning = true;

    // Intro dialog
    showDialog([
        'Welkom in de wereld van de fabeldieren, Eva! 🌟',
        'Professor Willow heeft je een Mogwai gegeven als je eerste fabeldier!',
        'Loop door het hoge gras (donkergroen) om wilde fabeldieren te vinden.',
        'Gebruik pijltjestoetsen om te lopen en Spatie om te interacteren.',
        'Veel succes met je avontuur! 🦄'
    ]);

    requestAnimationFrame(gameLoop);
}

function loadExistingGame() {
    const save = Storage.loadGame();
    if (!save) { startNewGame(); return; }

    gamePlayer = {
        name: save.name,
        x: save.x,
        y: save.y,
        dir: save.dir || 'down',
        currentMap: save.currentMap,
        team: save.team,
        bag: save.bag,
        money: save.money,
        defeatedTrainers: save.defeatedTrainers || [],
        stepsInGrass: 0
    };

    showScreen('screen-world');
    updateHUD();
    gameLoopRunning = true;
    requestAnimationFrame(gameLoop);
}

function buildSaveData() {
    return {
        name: gamePlayer.name,
        x: gamePlayer.x,
        y: gamePlayer.y,
        dir: gamePlayer.dir,
        currentMap: gamePlayer.currentMap,
        team: gamePlayer.team,
        bag: gamePlayer.bag,
        money: gamePlayer.money,
        defeatedTrainers: gamePlayer.defeatedTrainers
    };
}

// --- Screen ---
function showScreen(id) {
    document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
    document.getElementById(id).classList.add('active');
}

// --- HUD ---
function updateHUD() {
    const map = MAPS[gamePlayer.currentMap];
    document.getElementById('hud-area').textContent = `📍 ${map ? map.name : '???'}`;
    document.getElementById('hud-money').textContent = `💰 €${gamePlayer.money}`;
    document.getElementById('hud-team').textContent = `🐾 ${gamePlayer.team.length}/6`;
}

// --- Game Loop ---
function gameLoop(timestamp) {
    if (!gameLoopRunning) return;

    animTimer++;
    if (animTimer % 30 === 0) animFrame = (animFrame + 1) % 4;

    if (!dialogActive) {
        handleMovement(timestamp);
    }

    renderWorld();
    requestAnimationFrame(gameLoop);
}

// --- Movement ---
function handleMovement(timestamp) {
    if (timestamp - lastMoveTime < MOVE_DELAY) return;

    let dx = 0, dy = 0;
    if (keys['arrowup'] || keys['w']) { dy = -1; gamePlayer.dir = 'up'; }
    else if (keys['arrowdown'] || keys['s']) { dy = 1; gamePlayer.dir = 'down'; }
    else if (keys['arrowleft'] || keys['a']) { dx = -1; gamePlayer.dir = 'left'; }
    else if (keys['arrowright'] || keys['d']) { dx = 1; gamePlayer.dir = 'right'; }

    if (dx === 0 && dy === 0) { isMoving = false; return; }

    const newX = gamePlayer.x + dx;
    const newY = gamePlayer.y + dy;

    // Check walkable
    if (!isWalkable(gamePlayer.currentMap, newX, newY)) return;

    gamePlayer.x = newX;
    gamePlayer.y = newY;
    lastMoveTime = timestamp;
    isMoving = true;
    moveAnimTimer++;

    // Check for exit
    const exit = getExitAt(gamePlayer.currentMap, newX, newY);
    if (exit) {
        gamePlayer.currentMap = exit.target;
        gamePlayer.x = exit.spawnX;
        gamePlayer.y = exit.spawnY;
        updateHUD();
        showToast(`📍 ${MAPS[exit.target].name}`);
        Storage.saveGame(buildSaveData());
        return;
    }

    // Check for door (house entry)
    const tile = getTile(gamePlayer.currentMap, newX, newY);
    if (tile === TILE.DOOR || tile === TILE.CASTLE_DOOR) {
        const house = getHouseAt(gamePlayer.currentMap, newX, newY);
        if (house) {
            gamePlayer.currentMap = house.inside;
            gamePlayer.x = 11;
            gamePlayer.y = 11;
            updateHUD();
            return;
        }
    }

    // Check for heal tile
    if (tile === TILE.HEAL) {
        healTeam(gamePlayer);
        showToast('💖 Al je fabeldieren zijn genezen!');
        Storage.saveGame(buildSaveData());
    }

    // Check for shop tile
    if (tile === TILE.SHOP) {
        openShop();
        return;
    }

    // Check for tall grass encounter
    if (tile === TILE.TALLGRASS) {
        const map = MAPS[gamePlayer.currentMap];
        if (map && map.encounters && shouldEncounter(gamePlayer.currentMap)) {
            // Wild encounter!
            const wildAnimal = getWildAnimal(gamePlayer.currentMap, getPlayerLevel(gamePlayer));
            if (wildAnimal && gamePlayer.team.length > 0) {
                const firstAlive = gamePlayer.team.find(a => a.hp > 0);
                if (firstAlive) {
                    gameLoopRunning = false;
                    showToast(`⚡ Een wild fabeldier verschijnt!`);
                    setTimeout(() => {
                        startBattle(firstAlive, wildAnimal, true);
                    }, 800);
                }
            }
        }
    }

    // Auto-save occasionally
    if (Math.random() < 0.05) Storage.saveGame(buildSaveData());
}

// --- Interaction ---
function handleInteract() {
    if (interactCooldown > Date.now()) return;
    interactCooldown = Date.now() + 300;

    // Dialog active? Advance it
    if (dialogActive) {
        advanceDialog();
        return;
    }

    // Check what's in front of player
    const dirOffsets = { up: [0,-1], down: [0,1], left: [-1,0], right: [1,0] };
    const [dx, dy] = dirOffsets[gamePlayer.dir] || [0,0];
    const checkX = gamePlayer.x + dx;
    const checkY = gamePlayer.y + dy;

    // Sign?
    const sign = getSignAt(gamePlayer.currentMap, checkX, checkY);
    if (sign) {
        showDialog([sign.text]);
        return;
    }

    // NPC?
    const npc = getNpcAt(gamePlayer.currentMap, checkX, checkY);
    if (npc) {
        showDialog(npc.dialog, () => {
            if (npc.battle && !gamePlayer.defeatedTrainers.includes(npc.name)) {
                // Start trainer battle
                const firstAlive = gamePlayer.team.find(a => a.hp > 0);
                if (firstAlive && npc.team) {
                    const enemyAnimal = createPartyAnimal(npc.team[0].id, npc.team[0].level);
                    gameLoopRunning = false;
                    setTimeout(() => {
                        startBattle(firstAlive, enemyAnimal, false, npc.name);
                    }, 500);
                    // Mark defeated after battle ends
                    const origEnd = window.endBattle;
                    // We handle this via defeatedTrainers in battleWon
                    if (!gamePlayer.defeatedTrainers.includes(npc.name)) {
                        // Will be added in battleWon
                    }
                }
            }
        });
        return;
    }

    // Tile interaction
    const tile = getTile(gamePlayer.currentMap, checkX, checkY);
    if (tile === TILE.HEAL) {
        healTeam(gamePlayer);
        showDialog(['💖 Al je fabeldieren zijn volledig genezen!']);
        Storage.saveGame(buildSaveData());
    }

    // Food chest interaction (Eva's house)
    if (tile === TILE.FOOD_CHEST) {
        openFoodChest();
        return;
    }

    // Furniture interaction
    if (tile === TILE.BED) {
        healTeam(gamePlayer);
        showDialog(['💤 Je rust even uit in je bed...', '💖 Al je fabeldieren zijn volledig genezen!']);
        Storage.saveGame(buildSaveData());
        return;
    }
    if (tile === TILE.BOOKSHELF) {
        const tips = [
            '📖 "Fabeldieren voor Beginners" — Gebruik Fabelballen om dieren te vangen!',
            '📖 "Type-voordelen" — Vuur > Natuur > Water > Vuur. Onthoud dit!',
            '📖 "Avonturen met Eva" — Je bent de beste fabeldierverzorger!',
            '📖 "Zeldzame Fabeldieren" — De Bakunawa leeft diep in de grot...',
            '📖 "Kookboek voor Fabeldieren" — Voedsel maakt je dieren gelukkig!'
        ];
        showDialog([tips[Math.floor(Math.random() * tips.length)]]);
        return;
    }
    if (tile === TILE.CHEST) {
        showDialog(['🧰 Een kist met spullen. Misschien later handig!']);
        return;
    }
    if (tile === TILE.STOVE) {
        showDialog(['🍳 Een warm fornuis. Het ruikt heerlijk hier!']);
        return;
    }
    if (tile === TILE.FOUNTAIN) {
        showDialog(['⛲ Het water klatert rustig in de fontein...', '✨ Je voelt je verfrist! Een mooi plekje in het dorp.']);
        return;
    }
    if (tile === TILE.CASTLE) {
        showDialog(['🏰 De dikke stenen muren van het kasteel. Indrukwekkend!']);
        return;
    }
    if (tile === TILE.CASTLE_DOOR) {
        const house = getHouseAt(gamePlayer.currentMap, checkX, checkY);
        if (house) {
            gamePlayer.currentMap = house.inside;
            gamePlayer.x = 11;
            gamePlayer.y = 11;
            updateHUD();
        } else {
            showDialog(['🏰 De grote kasteelpoort.']);
        }
        return;
    }
}

// --- Dialog System ---
function showDialog(texts, callback) {
    dialogQueue = [...texts];
    dialogActive = true;
    dialogCallback = callback || null;
    document.getElementById('dialog-box').style.display = 'block';
    document.getElementById('dialog-text').textContent = dialogQueue.shift();
}

let dialogCallback = null;

function advanceDialog() {
    if (dialogQueue.length > 0) {
        document.getElementById('dialog-text').textContent = dialogQueue.shift();
    } else {
        dialogActive = false;
        document.getElementById('dialog-box').style.display = 'none';
        if (dialogCallback) {
            const cb = dialogCallback;
            dialogCallback = null;
            cb();
        }
    }
}

// --- Rendering ---
function renderWorld() {
    const map = MAPS[gamePlayer.currentMap];
    if (!map) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Camera: center on player (half-res coordinates)
    const camX = gamePlayer.x * TILE_SIZE - canvas.width / 2 + TILE_SIZE / 2;
    const camY = gamePlayer.y * TILE_SIZE - canvas.height / 2 + TILE_SIZE / 2;

    // Draw tiles
    const startCol = Math.max(0, Math.floor(camX / TILE_SIZE));
    const startRow = Math.max(0, Math.floor(camY / TILE_SIZE));
    const endCol = Math.min(MAP_COLS, Math.ceil((camX + canvas.width) / TILE_SIZE) + 1);
    const endRow = Math.min(MAP_ROWS, Math.ceil((camY + canvas.height) / TILE_SIZE) + 1);

    for (let row = startRow; row < endRow; row++) {
        for (let col = startCol; col < endCol; col++) {
            const tile = map.tiles[row][col];
            const screenX = col * TILE_SIZE - camX;
            const screenY = row * TILE_SIZE - camY;

            // Base color
            ctx.fillStyle = TILE_COLORS[tile] || '#000';
            ctx.fillRect(screenX, screenY, TILE_SIZE, TILE_SIZE);

            // === DQ2 NES-style tile rendering ===

            // Grass - DQ2 checkerboard pattern
            if (tile === TILE.GRASS) {
                ctx.fillStyle = '#00d800';
                // Checkerboard dots like NES DQ2
                if ((col + row) % 2 === 0) {
                    ctx.fillRect(screenX + 2, screenY + 2, 2, 2);
                    ctx.fillRect(screenX + 10, screenY + 10, 2, 2);
                    ctx.fillRect(screenX + 6, screenY + 6, 2, 2);
                } else {
                    ctx.fillRect(screenX + 6, screenY + 2, 2, 2);
                    ctx.fillRect(screenX + 2, screenY + 10, 2, 2);
                    ctx.fillRect(screenX + 10, screenY + 6, 2, 2);
                }
            }

            // Tall grass - DQ2 darker with grass blades
            if (tile === TILE.TALLGRASS) {
                ctx.fillStyle = '#00a800';
                ctx.fillRect(screenX + 2, screenY + 4, 2, 10);
                ctx.fillRect(screenX + 6, screenY + 2, 2, 12);
                ctx.fillRect(screenX + 10, screenY + 6, 2, 8);
                ctx.fillRect(screenX + 14, screenY + 4, 2, 10);
                ctx.fillStyle = '#00d800';
                ctx.fillRect(screenX + 4, screenY + 6, 2, 8);
                ctx.fillRect(screenX + 8, screenY + 4, 2, 10);
                ctx.fillRect(screenX + 12, screenY + 8, 2, 6);
            }

            // Water - DQ2 simple wave pattern
            if (tile === TILE.WATER) {
                ctx.fillStyle = '#0098f8';
                const waveOff = (animFrame + col) % 2;
                ctx.fillRect(screenX, screenY + 4 + waveOff * 2, TILE_SIZE, 2);
                ctx.fillRect(screenX, screenY + 10 + waveOff * 2, TILE_SIZE, 2);
                ctx.fillStyle = '#58d8f8';
                ctx.fillRect(screenX + 4, screenY + 2 + waveOff, 4, 2);
                ctx.fillRect(screenX + 12, screenY + 8 + waveOff, 4, 2);
            }

            // Lava - NES style
            if (tile === TILE.LAVA) {
                ctx.fillStyle = '#f87858';
                ctx.fillRect(screenX + 2, screenY + 2, TILE_SIZE - 4, TILE_SIZE - 4);
                ctx.fillStyle = '#f8d800';
                const lavaOff = (animFrame + row) % 2;
                ctx.fillRect(screenX + 4 + lavaOff * 4, screenY + 4, 4, 4);
                ctx.fillRect(screenX + 6 - lavaOff * 4, screenY + 10, 4, 4);
            }

            // Tree - DQ2 round blob on trunk (very iconic)
            if (tile === TILE.TREE) {
                // Trunk
                ctx.fillStyle = '#824100';
                ctx.fillRect(screenX + 6, screenY + 10, 4, 6);
                // Round canopy - NES style circle
                ctx.fillStyle = '#005800';
                ctx.fillRect(screenX + 4, screenY + 2, 8, 8);
                ctx.fillRect(screenX + 2, screenY + 4, 12, 4);
                // Highlight
                ctx.fillStyle = '#00a800';
                ctx.fillRect(screenX + 4, screenY + 2, 4, 4);
                ctx.fillRect(screenX + 2, screenY + 4, 4, 2);
            } else if (tile === TILE.ROCK) {
                ctx.fillStyle = '#bcbcbc';
                ctx.fillRect(screenX + 2, screenY + 4, 12, 10);
                ctx.fillStyle = '#e8e8e8';
                ctx.fillRect(screenX + 4, screenY + 4, 8, 4);
                ctx.fillStyle = '#747474';
                ctx.fillRect(screenX + 2, screenY + 12, 12, 2);
            } else if (tile === TILE.SIGN) {
                ctx.fillStyle = '#824100';
                ctx.fillRect(screenX + 7, screenY + 8, 2, 8);
                ctx.fillStyle = '#f8d878';
                ctx.fillRect(screenX + 3, screenY + 2, 10, 6);
                ctx.fillStyle = '#824100';
                ctx.fillRect(screenX + 4, screenY + 4, 8, 2);
            } else if (tile === TILE.HOUSE) {
                // DQ2 NES house - simple colored block
                ctx.fillStyle = '#f8d878';
                ctx.fillRect(screenX, screenY, TILE_SIZE, TILE_SIZE);
                // Brick lines
                ctx.fillStyle = '#f87858';
                ctx.fillRect(screenX, screenY + 4, TILE_SIZE, 2);
                ctx.fillRect(screenX, screenY + 10, TILE_SIZE, 2);
                ctx.fillRect(screenX + 8, screenY, 2, 4);
                ctx.fillRect(screenX + 4, screenY + 6, 2, 4);
                ctx.fillRect(screenX + 12, screenY + 6, 2, 4);
                // Roof on top
                const aboveTile = (row > 0) ? map.tiles[row - 1][col] : -1;
                if (aboveTile !== TILE.HOUSE && aboveTile !== TILE.DOOR) {
                    ctx.fillStyle = '#a80020';
                    ctx.fillRect(screenX, screenY, TILE_SIZE, 4);
                    ctx.fillStyle = '#f83800';
                    ctx.fillRect(screenX + 2, screenY, TILE_SIZE - 4, 2);
                }
                // Window
                const belowTile = (row < MAP_ROWS - 1) ? map.tiles[row + 1][col] : -1;
                if (belowTile !== TILE.DOOR && aboveTile !== TILE.DOOR && belowTile === TILE.HOUSE) {
                    ctx.fillStyle = '#0058f8';
                    ctx.fillRect(screenX + 4, screenY + 6, 8, 6);
                    ctx.fillStyle = '#58d8f8';
                    ctx.fillRect(screenX + 4, screenY + 6, 4, 2);
                    ctx.fillStyle = '#f8d878';
                    ctx.fillRect(screenX + 8, screenY + 6, 1, 6);
                    ctx.fillRect(screenX + 4, screenY + 9, 8, 1);
                }
            } else if (tile === TILE.DOOR) {
                ctx.fillStyle = '#f8d878';
                ctx.fillRect(screenX, screenY, TILE_SIZE, TILE_SIZE);
                // Door
                ctx.fillStyle = '#824100';
                ctx.fillRect(screenX + 4, screenY + 2, 8, 14);
                ctx.fillStyle = '#a85800';
                ctx.fillRect(screenX + 6, screenY + 4, 4, 10);
                // Knob
                ctx.fillStyle = '#f8d800';
                ctx.fillRect(screenX + 10, screenY + 10, 2, 2);
            } else if (tile === TILE.HEAL) {
                // DQ2 church/heal - cross
                ctx.fillStyle = '#f8f8f8';
                ctx.fillRect(screenX + 6, screenY + 2, 4, 12);
                ctx.fillRect(screenX + 2, screenY + 6, 12, 4);
                ctx.fillStyle = '#f878f8';
                ctx.fillRect(screenX + 7, screenY + 3, 2, 10);
                ctx.fillRect(screenX + 3, screenY + 7, 10, 2);
            } else if (tile === TILE.SHOP) {
                // DQ2 shop
                ctx.fillStyle = '#6844fc';
                ctx.fillRect(screenX + 2, screenY + 2, 12, 4);
                ctx.fillStyle = '#f8f8f8';
                ctx.fillRect(screenX + 2, screenY + 6, 12, 8);
                ctx.fillStyle = '#f8d800';
                ctx.fillRect(screenX + 6, screenY + 8, 4, 4);
            } else if (tile === TILE.BED) {
                ctx.fillStyle = '#824100';
                ctx.fillRect(screenX + 2, screenY + 4, 12, 10);
                ctx.fillStyle = '#f8f8f8';
                ctx.fillRect(screenX + 4, screenY + 6, 4, 2);
                ctx.fillStyle = '#0058f8';
                ctx.fillRect(screenX + 4, screenY + 8, 8, 4);
            } else if (tile === TILE.TABLE) {
                ctx.fillStyle = '#824100';
                ctx.fillRect(screenX + 2, screenY + 6, 12, 2);
                ctx.fillRect(screenX + 4, screenY + 8, 2, 6);
                ctx.fillRect(screenX + 10, screenY + 8, 2, 6);
            } else if (tile === TILE.BOOKSHELF) {
                ctx.fillStyle = '#824100';
                ctx.fillRect(screenX + 2, screenY + 2, 12, 12);
                ctx.fillStyle = '#f83800';
                ctx.fillRect(screenX + 4, screenY + 4, 2, 4);
                ctx.fillStyle = '#0058f8';
                ctx.fillRect(screenX + 7, screenY + 4, 2, 4);
                ctx.fillStyle = '#00a800';
                ctx.fillRect(screenX + 10, screenY + 4, 2, 4);
                ctx.fillStyle = '#f8d800';
                ctx.fillRect(screenX + 4, screenY + 9, 3, 3);
                ctx.fillStyle = '#a80020';
                ctx.fillRect(screenX + 8, screenY + 9, 3, 3);
            } else if (tile === TILE.CHEST) {
                ctx.fillStyle = '#824100';
                ctx.fillRect(screenX + 2, screenY + 6, 12, 8);
                ctx.fillStyle = '#a85800';
                ctx.fillRect(screenX + 2, screenY + 4, 12, 4);
                ctx.fillStyle = '#f8d800';
                ctx.fillRect(screenX + 7, screenY + 8, 2, 2);
            } else if (tile === TILE.FOOD_CHEST) {
                ctx.fillStyle = '#00a800';
                ctx.fillRect(screenX + 2, screenY + 6, 12, 8);
                ctx.fillStyle = '#005800';
                ctx.fillRect(screenX + 2, screenY + 4, 12, 4);
                ctx.fillStyle = '#f83800';
                ctx.fillRect(screenX + 6, screenY + 8, 4, 4);
            } else if (tile === TILE.RUG) {
                ctx.fillStyle = '#a80020';
                ctx.fillRect(screenX, screenY, TILE_SIZE, TILE_SIZE);
                ctx.fillStyle = '#f83800';
                ctx.fillRect(screenX + 2, screenY + 2, 12, 12);
                ctx.fillStyle = '#a80020';
                ctx.fillRect(screenX + 4, screenY + 4, 8, 8);
            } else if (tile === TILE.PLANT_POT) {
                ctx.fillStyle = '#f83800';
                ctx.fillRect(screenX + 4, screenY + 10, 8, 6);
                ctx.fillStyle = '#00a800';
                ctx.fillRect(screenX + 4, screenY + 2, 8, 8);
                ctx.fillStyle = '#005800';
                ctx.fillRect(screenX + 6, screenY + 4, 4, 4);
            } else if (tile === TILE.WINDOW_TILE) {
                ctx.fillStyle = '#824100';
                ctx.fillRect(screenX, screenY, TILE_SIZE, TILE_SIZE);
                ctx.fillStyle = '#0058f8';
                ctx.fillRect(screenX + 4, screenY + 4, 8, 8);
                ctx.fillStyle = '#58d8f8';
                ctx.fillRect(screenX + 4, screenY + 4, 4, 4);
                ctx.fillStyle = '#824100';
                ctx.fillRect(screenX + 8, screenY + 4, 1, 8);
                ctx.fillRect(screenX + 4, screenY + 8, 8, 1);
            } else if (tile === TILE.STOVE) {
                ctx.fillStyle = '#747474';
                ctx.fillRect(screenX + 2, screenY + 4, 12, 12);
                ctx.fillStyle = '#bcbcbc';
                ctx.fillRect(screenX + 2, screenY + 2, 12, 4);
                ctx.fillStyle = '#f83800';
                ctx.fillRect(screenX + 4, screenY + 4, 4, 2);
                ctx.fillRect(screenX + 10, screenY + 4, 4, 2);
            } else if (tile === TILE.FOUNTAIN) {
                // DQ2 fountain - stone basin with water
                ctx.fillStyle = '#bcbcbc';
                ctx.fillRect(screenX + 2, screenY + 10, 12, 6);
                ctx.fillStyle = '#e8e8e8';
                ctx.fillRect(screenX + 4, screenY + 8, 8, 2);
                ctx.fillStyle = '#0058f8';
                ctx.fillRect(screenX + 4, screenY + 10, 8, 4);
                // Pillar
                ctx.fillStyle = '#e8e8e8';
                ctx.fillRect(screenX + 7, screenY + 4, 2, 6);
                // Water spray
                ctx.fillStyle = '#58d8f8';
                const sprayOff = animFrame % 2;
                ctx.fillRect(screenX + 6, screenY + 2 + sprayOff, 2, 2);
                ctx.fillRect(screenX + 8, screenY + 2 + sprayOff, 2, 2);
                ctx.fillStyle = '#f8f8f8';
                ctx.fillRect(screenX + 7, screenY + 1 + sprayOff, 2, 2);
            } else if (tile === TILE.CASTLE) {
                // DQ2 NES castle wall
                ctx.fillStyle = '#bcbcbc';
                ctx.fillRect(screenX, screenY, TILE_SIZE, TILE_SIZE);
                ctx.fillStyle = '#747474';
                ctx.fillRect(screenX, screenY + 4, TILE_SIZE, 2);
                ctx.fillRect(screenX, screenY + 10, TILE_SIZE, 2);
                ctx.fillRect(screenX + 8, screenY, 2, 4);
                ctx.fillRect(screenX + 4, screenY + 6, 2, 4);
                ctx.fillRect(screenX + 12, screenY + 6, 2, 4);
                // Battlements
                const aboveTile2 = (row > 0) ? map.tiles[row - 1][col] : -1;
                if (aboveTile2 !== TILE.CASTLE && aboveTile2 !== TILE.CASTLE_DOOR) {
                    ctx.fillStyle = '#bcbcbc';
                    ctx.fillRect(screenX, screenY - 2, 4, 4);
                    ctx.fillRect(screenX + 6, screenY - 2, 4, 4);
                    ctx.fillRect(screenX + 12, screenY - 2, 4, 4);
                    ctx.fillStyle = '#747474';
                    ctx.fillRect(screenX + 4, screenY, 2, 2);
                    ctx.fillRect(screenX + 10, screenY, 2, 2);
                }
                // Flag on some
                if ((col + row) % 5 === 0) {
                    ctx.fillStyle = '#a80020';
                    ctx.fillRect(screenX + 6, screenY + 5, 4, 4);
                    ctx.fillStyle = '#f8d800';
                    ctx.fillRect(screenX + 7, screenY + 6, 2, 2);
                }
            } else if (tile === TILE.CASTLE_DOOR) {
                ctx.fillStyle = '#bcbcbc';
                ctx.fillRect(screenX, screenY, TILE_SIZE, TILE_SIZE);
                ctx.fillStyle = '#824100';
                ctx.fillRect(screenX + 4, screenY + 2, 8, 14);
                ctx.fillStyle = '#a85800';
                ctx.fillRect(screenX + 6, screenY + 4, 4, 12);
                ctx.fillStyle = '#f8d800';
                ctx.fillRect(screenX + 6, screenY + 10, 2, 2);
                ctx.fillRect(screenX + 8, screenY + 10, 2, 2);
            } else if (tile === TILE.ICE) {
                // Frozen ice block - NES style
                ctx.fillStyle = '#a8d8f8';
                ctx.fillRect(screenX, screenY, TILE_SIZE, TILE_SIZE);
                ctx.fillStyle = '#c8e8f8';
                ctx.fillRect(screenX + 2, screenY + 2, 4, 4);
                ctx.fillRect(screenX + 10, screenY + 10, 4, 4);
                ctx.fillStyle = '#78b8e8';
                ctx.fillRect(screenX + 8, screenY + 4, 2, 2);
                ctx.fillRect(screenX + 4, screenY + 12, 2, 2);
            } else if (tile === TILE.SNOW) {
                // Snowy ground - walkable
                ctx.fillStyle = '#f0f0f8';
                ctx.fillRect(screenX, screenY, TILE_SIZE, TILE_SIZE);
                ctx.fillStyle = '#d8d8e8';
                if ((col + row) % 2 === 0) {
                    ctx.fillRect(screenX + 2, screenY + 4, 2, 2);
                    ctx.fillRect(screenX + 10, screenY + 10, 2, 2);
                } else {
                    ctx.fillRect(screenX + 6, screenY + 2, 2, 2);
                    ctx.fillRect(screenX + 12, screenY + 8, 2, 2);
                }
                ctx.fillStyle = '#e8e8f0';
                ctx.fillRect(screenX + 6, screenY + 6, 2, 2);
            } else if (tile === TILE.SWAMP) {
                // Swamp ground - dark murky
                ctx.fillStyle = '#3a5828';
                ctx.fillRect(screenX, screenY, TILE_SIZE, TILE_SIZE);
                ctx.fillStyle = '#4a6838';
                ctx.fillRect(screenX + 2, screenY + 4, 4, 2);
                ctx.fillRect(screenX + 10, screenY + 8, 4, 2);
                ctx.fillStyle = '#2a4818';
                ctx.fillRect(screenX + 8, screenY + 2, 2, 2);
                ctx.fillRect(screenX + 4, screenY + 12, 2, 2);
                // Mushroom dot
                if ((col * 7 + row * 3) % 11 === 0) {
                    ctx.fillStyle = '#f83800';
                    ctx.fillRect(screenX + 6, screenY + 10, 4, 2);
                    ctx.fillStyle = '#f8f8f8';
                    ctx.fillRect(screenX + 7, screenY + 10, 1, 1);
                    ctx.fillStyle = '#824100';
                    ctx.fillRect(screenX + 7, screenY + 12, 2, 2);
                }
            } else if (tile === TILE.RUINS_FLOOR) {
                // Ancient stone floor
                ctx.fillStyle = '#a89880';
                ctx.fillRect(screenX, screenY, TILE_SIZE, TILE_SIZE);
                ctx.fillStyle = '#988870';
                ctx.fillRect(screenX, screenY + 8, TILE_SIZE, 1);
                ctx.fillRect(screenX + 8, screenY, 1, TILE_SIZE);
                ctx.fillStyle = '#b8a890';
                ctx.fillRect(screenX + 2, screenY + 2, 4, 4);
                ctx.fillRect(screenX + 10, screenY + 10, 4, 4);
            } else if (tile === TILE.RUINS_WALL) {
                // Ancient ruins wall with cracks
                ctx.fillStyle = '#686058';
                ctx.fillRect(screenX, screenY, TILE_SIZE, TILE_SIZE);
                ctx.fillStyle = '#787068';
                ctx.fillRect(screenX + 2, screenY + 2, 12, 4);
                ctx.fillRect(screenX + 2, screenY + 10, 12, 4);
                ctx.fillStyle = '#585048';
                ctx.fillRect(screenX + 8, screenY + 2, 2, 4);
                ctx.fillRect(screenX + 4, screenY + 10, 2, 4);
                // Cracks
                ctx.fillStyle = '#484038';
                ctx.fillRect(screenX + 6, screenY + 6, 1, 4);
                ctx.fillRect(screenX + 10, screenY + 8, 4, 1);
            }

            // Exit indicator
            if (tile === TILE.EXIT) {
                ctx.fillStyle = `rgba(255,215,0,${0.3 + Math.sin(animTimer * 0.1) * 0.2})`;
                ctx.fillRect(screenX, screenY, TILE_SIZE, TILE_SIZE);
                // Arrow pixel art
                ctx.fillStyle = '#FFD700';
                ctx.fillRect(screenX + 5, screenY + 7, 6, 2);
                ctx.fillRect(screenX + 9, screenY + 5, 2, 2);
                ctx.fillRect(screenX + 9, screenY + 9, 2, 2);
            }
        }
    }

    // Draw NPCs - DQ2 NES style simple sprites
    if (map.npcs) {
        map.npcs.forEach(npc => {
            const sx = npc.x * TILE_SIZE - camX;
            const sy = npc.y * TILE_SIZE - camY;
            if (sx > -TILE_SIZE && sx < canvas.width + TILE_SIZE && sy > -TILE_SIZE && sy < canvas.height + TILE_SIZE) {
                // NPC palette based on name (NES limited colors)
                let tunicColor = '#6844fc';
                let tunicLight = '#a878fc';
                let hairColor = '#824100';
                let skinColor = '#f8b878';
                if (npc.name.includes('Willow')) { tunicColor = '#0058f8'; tunicLight = '#58b8f8'; hairColor = '#bcbcbc'; }
                else if (npc.name.includes('Mila')) { tunicColor = '#00a800'; tunicLight = '#00d800'; hairColor = '#f83800'; }
                else if (npc.name.includes('Sven')) { tunicColor = '#824100'; tunicLight = '#a85800'; hairColor = '#3c3c3c'; }
                else if (npc.name.includes('Kai')) { tunicColor = '#f83800'; tunicLight = '#f87858'; hairColor = '#f8d800'; }
                else if (npc.name.includes('Lars')) { tunicColor = '#0058f8'; tunicLight = '#58b8f8'; hairColor = '#f8d800'; }
                else if (npc.name.includes('Amira')) { tunicColor = '#f8d800'; tunicLight = '#f8f878'; hairColor = '#1a1a2e'; }
                else if (npc.name.includes('Freya')) { tunicColor = '#58d8f8'; tunicLight = '#a8f8f8'; hairColor = '#f0f0f8'; }
                else if (npc.name.includes('Hilda')) { tunicColor = '#6844fc'; tunicLight = '#a878fc'; hairColor = '#005800'; }
                else if (npc.name.includes('Theron')) { tunicColor = '#bcbcbc'; tunicLight = '#e8e8e8'; hairColor = '#824100'; }

                // Feet
                ctx.fillStyle = '#824100';
                ctx.fillRect(sx + 4, sy + 14, 3, 2);
                ctx.fillRect(sx + 9, sy + 14, 3, 2);
                // Legs
                ctx.fillStyle = tunicColor;
                ctx.fillRect(sx + 4, sy + 12, 3, 2);
                ctx.fillRect(sx + 9, sy + 12, 3, 2);
                // Body
                ctx.fillStyle = tunicColor;
                ctx.fillRect(sx + 4, sy + 6, 8, 6);
                ctx.fillStyle = tunicLight;
                ctx.fillRect(sx + 6, sy + 6, 4, 4);
                // Arms
                ctx.fillStyle = tunicColor;
                ctx.fillRect(sx + 2, sy + 6, 2, 4);
                ctx.fillRect(sx + 12, sy + 6, 2, 4);
                ctx.fillStyle = skinColor;
                ctx.fillRect(sx + 2, sy + 10, 2, 2);
                ctx.fillRect(sx + 12, sy + 10, 2, 2);
                // Head
                ctx.fillStyle = skinColor;
                ctx.fillRect(sx + 4, sy + 2, 8, 4);
                // Hair
                ctx.fillStyle = hairColor;
                ctx.fillRect(sx + 4, sy + 0, 8, 2);
                ctx.fillRect(sx + 4, sy + 2, 2, 2);
                ctx.fillRect(sx + 10, sy + 2, 2, 2);
                // Eyes
                ctx.fillStyle = '#000';
                ctx.fillRect(sx + 6, sy + 4, 2, 2);
                ctx.fillRect(sx + 10, sy + 4, 2, 2);

                // Name label
                ctx.font = '5px "Press Start 2P"';
                ctx.fillStyle = '#f8f8f8';
                ctx.textAlign = 'center';
                ctx.fillText(npc.name.split(' ')[0], sx + TILE_SIZE / 2, sy - 2);
            }
        });
    }

    // Draw player (Eva)
    const playerScreenX = gamePlayer.x * TILE_SIZE - camX;
    const playerScreenY = gamePlayer.y * TILE_SIZE - camY;
    drawPlayer(playerScreenX, playerScreenY);
}

function drawPlayer(x, y) {
    const bobOffset = isMoving ? Math.round(Math.sin(moveAnimTimer * 0.8) * 1) : 0;
    const walkFrame = isMoving ? (moveAnimTimer % 2) : 0;

    // === Eva in gele jurk met lang blond haar ===

    // Long hair behind body (flows down the back)
    ctx.fillStyle = '#f8d800';
    ctx.fillRect(x + 3, y + 2 + bobOffset, 2, 10);
    ctx.fillRect(x + 11, y + 2 + bobOffset, 2, 10);
    ctx.fillStyle = '#d8a800';
    ctx.fillRect(x + 3, y + 10 + bobOffset, 2, 4);
    ctx.fillRect(x + 11, y + 10 + bobOffset, 2, 4);

    // Schoentjes (bruin)
    ctx.fillStyle = '#824100';
    if (walkFrame === 1 && isMoving) {
        ctx.fillRect(x + 3, y + 14 + bobOffset, 4, 2);
        ctx.fillRect(x + 10, y + 14 + bobOffset, 4, 2);
    } else {
        ctx.fillRect(x + 4, y + 14 + bobOffset, 3, 2);
        ctx.fillRect(x + 9, y + 14 + bobOffset, 3, 2);
    }

    // Rok van jurk (geel, uitlopend)
    ctx.fillStyle = '#f8d800';
    if (walkFrame === 1 && isMoving) {
        ctx.fillRect(x + 2, y + 10 + bobOffset, 6, 4);
        ctx.fillRect(x + 9, y + 10 + bobOffset, 6, 4);
    } else {
        ctx.fillRect(x + 3, y + 10 + bobOffset, 10, 4);
    }
    // Rok highlight
    ctx.fillStyle = '#f8f858';
    ctx.fillRect(x + 4, y + 10 + bobOffset, 8, 1);
    // Rok schaduw onder
    ctx.fillStyle = '#d8a800';
    ctx.fillRect(x + 3, y + 13 + bobOffset, 10, 1);

    // Lijfje van jurk (geel)
    ctx.fillStyle = '#f8d800';
    ctx.fillRect(x + 4, y + 5 + bobOffset, 8, 5);
    // Lijfje highlight
    ctx.fillStyle = '#f8f858';
    ctx.fillRect(x + 5, y + 5 + bobOffset, 6, 3);
    // Kraag (wit, v-vorm)
    ctx.fillStyle = '#f8f8f8';
    ctx.fillRect(x + 6, y + 5 + bobOffset, 4, 1);
    ctx.fillRect(x + 7, y + 6 + bobOffset, 2, 1);

    // Mouwen (korte pofmouwtjes, geel)
    ctx.fillStyle = '#f8d800';
    ctx.fillRect(x + 2, y + 5 + bobOffset, 2, 3);
    ctx.fillRect(x + 12, y + 5 + bobOffset, 2, 3);
    // Armen (huidkleur)
    ctx.fillStyle = '#f8b878';
    ctx.fillRect(x + 2, y + 8 + bobOffset, 2, 3);
    ctx.fillRect(x + 12, y + 8 + bobOffset, 2, 3);
    // Handen
    ctx.fillStyle = '#f8b878';
    ctx.fillRect(x + 1, y + 10 + bobOffset, 2, 1);
    ctx.fillRect(x + 13, y + 10 + bobOffset, 2, 1);

    // Hoofd (huidkleur)
    ctx.fillStyle = '#f8b878';
    ctx.fillRect(x + 4, y + 1 + bobOffset, 8, 5);

    // Haar boven (lang blond, dikke krullen)
    ctx.fillStyle = '#f8d800';
    ctx.fillRect(x + 3, y - 1 + bobOffset, 10, 3);
    ctx.fillRect(x + 4, y + 1 + bobOffset, 2, 2);
    ctx.fillRect(x + 10, y + 1 + bobOffset, 2, 2);
    // Zijhaar (golvend naar beneden)
    ctx.fillStyle = '#d8a800';
    ctx.fillRect(x + 3, y + 0 + bobOffset, 1, 2);
    ctx.fillRect(x + 12, y + 0 + bobOffset, 1, 2);

    // Strik in het haar (rood)
    ctx.fillStyle = '#f83800';
    ctx.fillRect(x + 6, y - 1 + bobOffset, 1, 2);
    ctx.fillRect(x + 9, y - 1 + bobOffset, 1, 2);
    ctx.fillStyle = '#f87858';
    ctx.fillRect(x + 7, y - 1 + bobOffset, 2, 1);

    // Ogen (groot, blauw, expressief)
    ctx.fillStyle = '#0058f8';
    ctx.fillRect(x + 5, y + 3 + bobOffset, 2, 2);
    ctx.fillRect(x + 9, y + 3 + bobOffset, 2, 2);
    // Pupillen
    ctx.fillStyle = '#000';
    ctx.fillRect(x + 6, y + 4 + bobOffset, 1, 1);
    ctx.fillRect(x + 10, y + 4 + bobOffset, 1, 1);
    // Oogglans
    ctx.fillStyle = '#f8f8f8';
    ctx.fillRect(x + 5, y + 3 + bobOffset, 1, 1);
    ctx.fillRect(x + 9, y + 3 + bobOffset, 1, 1);

    // Mond (lachje)
    ctx.fillStyle = '#f87858';
    ctx.fillRect(x + 7, y + 5 + bobOffset, 2, 1);

    // Sproetjes (Eva's kenmerk!)
    ctx.fillStyle = '#d89858';
    ctx.fillRect(x + 5, y + 5 + bobOffset, 1, 1);
    ctx.fillRect(x + 10, y + 5 + bobOffset, 1, 1);
}

// --- Shop ---
function openShop() {
    dialogActive = true;
    const items = [
        { key: 'fabelbal', ...ITEMS.fabelbal },
        { key: 'superbal', ...ITEMS.superbal },
        { key: 'drankje', ...ITEMS.drankje },
        { key: 'voedsel', ...ITEMS.voedsel }
    ];

    let shopText = '🏪 Winkel — Wat wil je kopen?\n';
    items.forEach((item, i) => {
        shopText += `${i + 1}. ${item.emoji} ${item.name} — €${item.price} (${gamePlayer.bag[item.key]}×)\n`;
    });
    shopText += '\nTik het nummer (1-4) of druk op Escape om te sluiten.';

    document.getElementById('dialog-box').style.display = 'block';
    document.getElementById('dialog-text').textContent = shopText;

    const shopHandler = (e) => {
        const num = parseInt(e.key);
        if (num >= 1 && num <= 4) {
            const item = items[num - 1];
            if (gamePlayer.money >= item.price) {
                gamePlayer.money -= item.price;
                gamePlayer.bag[item.key]++;
                updateHUD();
                document.getElementById('dialog-text').textContent =
                    `${item.emoji} ${item.name} gekocht! Je hebt nu ${gamePlayer.bag[item.key]}×. (€${gamePlayer.money} over)\n\nDruk nog een nummer of Escape om te sluiten.`;
                Storage.saveGame(buildSaveData());
            } else {
                document.getElementById('dialog-text').textContent = `Niet genoeg geld! Je hebt €${gamePlayer.money}.\n\nDruk nog een nummer of Escape om te sluiten.`;
            }
        }
        if (e.key === 'Escape' || e.key === ' ') {
            window.removeEventListener('keydown', shopHandler);
            dialogActive = false;
            document.getElementById('dialog-box').style.display = 'none';
        }
    };
    window.addEventListener('keydown', shopHandler);
}

// --- Food Chest (Eva's House) ---
function openFoodChest() {
    dialogActive = true;

    function showChestMenu() {
        let text = '🍎 Eva\'s Voorraadkist\n';
        text += `Voedsel: ${gamePlayer.bag.voedsel}× · Drankjes: ${gamePlayer.bag.drankje}×\n\n`;
        text += '1. 🍎 Pak 5 voedsel (gratis!)\n';
        text += '2. 🧪 Pak 3 drankjes (gratis!)\n';
        text += '3. Voed al je fabeldieren\n';
        text += '\nDruk een nummer of Escape om te sluiten.';

        document.getElementById('dialog-box').style.display = 'block';
        document.getElementById('dialog-text').textContent = text;
    }

    showChestMenu();

    const chestHandler = (e) => {
        if (e.key === '1') {
            gamePlayer.bag.voedsel += 5;
            showToast('🍎 +5 voedsel gepakt uit de kist!');
            Storage.saveGame(buildSaveData());
            showChestMenu();
        } else if (e.key === '2') {
            gamePlayer.bag.drankje += 3;
            showToast('🧪 +3 drankjes gepakt uit de kist!');
            Storage.saveGame(buildSaveData());
            showChestMenu();
        } else if (e.key === '3') {
            if (gamePlayer.team.length === 0) {
                showToast('Je hebt nog geen fabeldieren!');
            } else {
                let fedCount = 0;
                gamePlayer.team.forEach(animal => {
                    if (animal.hunger < 100) {
                        animal.hunger = Math.min(100, animal.hunger + 30);
                        animal.happiness = Math.min(100, animal.happiness + 10);
                        fedCount++;
                    }
                });
                if (fedCount > 0) {
                    showToast(`🍎 ${fedCount} fabeldier(en) gevoerd! Ze zijn blij!`);
                } else {
                    showToast('Al je fabeldieren zitten al vol!');
                }
                Storage.saveGame(buildSaveData());
            }
            showChestMenu();
        } else if (e.key === 'Escape' || e.key === ' ') {
            window.removeEventListener('keydown', chestHandler);
            dialogActive = false;
            document.getElementById('dialog-box').style.display = 'none';
        }
    };
    window.addEventListener('keydown', chestHandler);
}

// --- Team Overlay ---
function openTeamOverlay() {
    const overlay = document.getElementById('overlay-team');
    const list = document.getElementById('team-list');
    list.innerHTML = '';

    if (gamePlayer.team.length === 0) {
        list.innerHTML = '<p style="text-align:center;opacity:0.5">Je hebt nog geen fabeldieren!</p>';
    }

    gamePlayer.team.forEach((animal, i) => {
        const def = getAnimalDef(animal.id);
        const hpPercent = Math.round((animal.hp / animal.maxHp) * 100);
        const hpClass = hpPercent > 50 ? '' : hpPercent > 20 ? ' low' : ' critical';

        const card = document.createElement('div');
        card.className = 'team-card';
        const canvasId = 'team-sprite-' + i;
        card.innerHTML = `
            <div class="team-card-sprite"><canvas id="${canvasId}" width="64" height="64"></canvas></div>
            <div class="team-card-info">
                <div class="team-card-name">${animal.nickname}</div>
                <div class="team-card-level">Lvl ${animal.level} · ${getTypeEmoji(def.type)} ${def.type} · XP: ${animal.xp}/${animal.xpNeeded}</div>
                <div class="team-card-stats">
                    ⚔️${animal.atk} 🛡️${animal.def} 💨${animal.spd} · 😊${animal.happiness} 🍖${animal.hunger}
                </div>
                <div class="care-actions">
                    <button class="care-btn" data-action="feed" data-index="${i}">🍎 Voeren</button>
                    <button class="care-btn" data-action="heal" data-index="${i}">🧪 Genezen</button>
                </div>
            </div>
            <div class="team-card-hp">
                <div>${animal.hp}/${animal.maxHp} HP</div>
                <div class="hp-bar"><div class="hp-bar-fill${hpClass}" style="width:${hpPercent}%"></div></div>
            </div>
        `;
        list.appendChild(card);
    });

    // Draw sprites
    gamePlayer.team.forEach((animal, i) => {
        drawAnimalSprite('team-sprite-' + i, animal.id, false);
    });

    // Care button handlers
    list.querySelectorAll('.care-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.stopPropagation();
            const action = btn.dataset.action;
            const index = parseInt(btn.dataset.index);
            let msg;
            if (action === 'feed') msg = feedAnimal(gamePlayer, index);
            else if (action === 'heal') msg = usePotion(gamePlayer, index);
            if (msg) showToast(msg);
            Storage.saveGame(buildSaveData());
            openTeamOverlay(); // refresh
        });
    });

    overlay.style.display = 'flex';
}

function openBagOverlay() {
    const overlay = document.getElementById('overlay-bag');
    const list = document.getElementById('bag-list');
    list.innerHTML = '';

    Object.entries(gamePlayer.bag).forEach(([key, count]) => {
        const item = ITEMS[key];
        if (!item) return;
        const el = document.createElement('div');
        el.className = 'bag-item';
        el.innerHTML = `
            <div class="bag-item-emoji">${item.emoji}</div>
            <div class="bag-item-name">${item.name}</div>
            <div class="bag-item-count">×${count}</div>
        `;
        list.appendChild(el);
    });

    overlay.style.display = 'flex';
}

function closeOverlay(id) {
    document.getElementById(id).style.display = 'none';
}

// --- Toast ---
function showToast(text) {
    const toast = document.getElementById('toast');
    document.getElementById('toast-text').textContent = text;
    toast.style.display = 'block';
    toast.style.animation = 'none';
    toast.offsetHeight;
    toast.style.animation = 'toastIn 0.4s ease, toastOut 0.4s ease 2.5s forwards';
    setTimeout(() => toast.style.display = 'none', 3000);
}
