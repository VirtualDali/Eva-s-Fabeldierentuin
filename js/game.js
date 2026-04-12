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
    if (tile === TILE.DOOR) {
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
            ctx.fillStyle = TILE_COLORS[tile] || '#333';
            ctx.fillRect(screenX, screenY, TILE_SIZE, TILE_SIZE);

            // Tall grass animation
            if (tile === TILE.TALLGRASS) {
                ctx.fillStyle = '#4a8c30';
                const offset = ((col + row + animFrame) % 3);
                ctx.fillRect(screenX + 2, screenY + 3 + offset, 2, 7);
                ctx.fillRect(screenX + 7, screenY + 2 + offset, 2, 8);
                ctx.fillRect(screenX + 12, screenY + 4 + offset, 2, 6);
                ctx.fillStyle = '#5aaa38';
                ctx.fillRect(screenX + 5, screenY + 5 + offset, 1, 5);
                ctx.fillRect(screenX + 10, screenY + 3 + offset, 1, 7);
            }

            // Water animation
            if (tile === TILE.WATER) {
                ctx.fillStyle = 'rgba(255,255,255,0.15)';
                const waveOff = (animFrame + col) % 4;
                ctx.fillRect(screenX + waveOff * 4, screenY + 6, 8, 2);
            }

            // Lava animation
            if (tile === TILE.LAVA) {
                ctx.fillStyle = `rgba(255,${150 + animFrame * 20},0,0.6)`;
                ctx.fillRect(screenX + 2, screenY + 2, TILE_SIZE - 4, TILE_SIZE - 4);
                ctx.fillStyle = 'rgba(255,255,100,0.3)';
                const lavaOff = (animFrame + row) % 3;
                ctx.fillRect(screenX + 4 + lavaOff * 2, screenY + 4, 4, 4);
            }

            // Emoji overlays for small tiles: skip emojis, draw pixel versions
            if (tile === TILE.TREE) {
                // Trunk
                ctx.fillStyle = '#5C3A1E';
                ctx.fillRect(screenX + 6, screenY + 9, 4, 7);
                // Leaves
                ctx.fillStyle = '#1B5E20';
                ctx.fillRect(screenX + 2, screenY + 2, 12, 8);
                ctx.fillStyle = '#2E7D32';
                ctx.fillRect(screenX + 4, screenY + 1, 8, 6);
            } else if (tile === TILE.ROCK) {
                ctx.fillStyle = '#78909C';
                ctx.fillRect(screenX + 2, screenY + 4, 12, 10);
                ctx.fillStyle = '#90A4AE';
                ctx.fillRect(screenX + 3, screenY + 5, 10, 4);
            } else if (tile === TILE.SIGN) {
                ctx.fillStyle = '#8B6914';
                ctx.fillRect(screenX + 7, screenY + 8, 2, 6);
                ctx.fillStyle = '#D2B48C';
                ctx.fillRect(screenX + 3, screenY + 3, 10, 6);
            } else if (tile === TILE.HOUSE) {
                // Better house tile - brick wall with details
                // Wall base
                ctx.fillStyle = '#FFCC80';
                ctx.fillRect(screenX, screenY, TILE_SIZE, TILE_SIZE);
                // Brick pattern
                ctx.fillStyle = '#E8B866';
                ctx.fillRect(screenX, screenY + 4, TILE_SIZE, 1);
                ctx.fillRect(screenX, screenY + 9, TILE_SIZE, 1);
                ctx.fillRect(screenX + 5, screenY, 1, 4);
                ctx.fillRect(screenX + 11, screenY + 5, 1, 4);
                ctx.fillRect(screenX + 5, screenY + 10, 1, 6);
                // Roof overhang (top of house tiles)
                const aboveTile = (row > 0) ? map.tiles[row - 1][col] : -1;
                if (aboveTile !== TILE.HOUSE && aboveTile !== TILE.DOOR) {
                    ctx.fillStyle = '#B71C1C';
                    ctx.fillRect(screenX - 1, screenY, TILE_SIZE + 2, 4);
                    ctx.fillStyle = '#D32F2F';
                    ctx.fillRect(screenX, screenY, TILE_SIZE, 2);
                }
                // Window if in middle of house (not adjacent to door row)
                const belowTile = (row < MAP_ROWS - 1) ? map.tiles[row + 1][col] : -1;
                if (belowTile !== TILE.DOOR && aboveTile !== TILE.DOOR && belowTile === TILE.HOUSE) {
                    ctx.fillStyle = '#81D4FA';
                    ctx.fillRect(screenX + 4, screenY + 5, 8, 7);
                    ctx.fillStyle = '#8B6914';
                    ctx.fillRect(screenX + 8, screenY + 5, 1, 7);
                    ctx.fillRect(screenX + 4, screenY + 8, 8, 1);
                }
            } else if (tile === TILE.DOOR) {
                // Wall behind door
                ctx.fillStyle = '#FFCC80';
                ctx.fillRect(screenX, screenY, TILE_SIZE, TILE_SIZE);
                // Door frame
                ctx.fillStyle = '#5D4037';
                ctx.fillRect(screenX + 3, screenY + 1, 10, 15);
                // Door
                ctx.fillStyle = '#795548';
                ctx.fillRect(screenX + 4, screenY + 2, 8, 14);
                // Door panels
                ctx.fillStyle = '#6D4C41';
                ctx.fillRect(screenX + 5, screenY + 3, 6, 4);
                ctx.fillRect(screenX + 5, screenY + 9, 6, 5);
                // Handle
                ctx.fillStyle = '#FFD700';
                ctx.fillRect(screenX + 10, screenY + 10, 1, 2);
                // Welcome mat
                ctx.fillStyle = '#8D6E63';
                ctx.fillRect(screenX + 2, screenY + 15, 12, 1);
            } else if (tile === TILE.HEAL) {
                ctx.fillStyle = '#FF69B4';
                ctx.fillRect(screenX + 6, screenY + 3, 4, 10);
                ctx.fillRect(screenX + 3, screenY + 6, 10, 4);
            } else if (tile === TILE.SHOP) {
                ctx.fillStyle = '#7B1FA2';
                ctx.fillRect(screenX + 1, screenY + 2, 14, 5);
                ctx.fillStyle = '#E1BEE7';
                ctx.fillRect(screenX + 2, screenY + 7, 12, 8);
                ctx.fillStyle = '#FFD700';
                ctx.fillRect(screenX + 6, screenY + 9, 4, 4);
            } else if (tile === TILE.BED) {
                // Bed frame
                ctx.fillStyle = '#5D4037';
                ctx.fillRect(screenX + 1, screenY + 2, 14, 12);
                // Mattress
                ctx.fillStyle = '#E8D5E0';
                ctx.fillRect(screenX + 2, screenY + 3, 12, 10);
                // Pillow
                ctx.fillStyle = '#F5F5F5';
                ctx.fillRect(screenX + 3, screenY + 4, 5, 3);
                // Blanket
                ctx.fillStyle = '#7B1FA2';
                ctx.fillRect(screenX + 2, screenY + 8, 12, 5);
            } else if (tile === TILE.TABLE) {
                // Table top
                ctx.fillStyle = '#8B6914';
                ctx.fillRect(screenX + 1, screenY + 4, 14, 3);
                // Table legs
                ctx.fillStyle = '#5D4037';
                ctx.fillRect(screenX + 2, screenY + 7, 2, 7);
                ctx.fillRect(screenX + 12, screenY + 7, 2, 7);
                // Item on table
                ctx.fillStyle = '#FF9800';
                ctx.fillRect(screenX + 6, screenY + 2, 4, 3);
            } else if (tile === TILE.BOOKSHELF) {
                // Shelf frame
                ctx.fillStyle = '#5D4037';
                ctx.fillRect(screenX + 1, screenY + 1, 14, 14);
                // Shelves
                ctx.fillStyle = '#8B6914';
                ctx.fillRect(screenX + 2, screenY + 5, 12, 1);
                ctx.fillRect(screenX + 2, screenY + 9, 12, 1);
                // Books (colored blocks)
                ctx.fillStyle = '#E53935';
                ctx.fillRect(screenX + 3, screenY + 2, 2, 3);
                ctx.fillStyle = '#43A047';
                ctx.fillRect(screenX + 6, screenY + 2, 2, 3);
                ctx.fillStyle = '#1E88E5';
                ctx.fillRect(screenX + 9, screenY + 2, 3, 3);
                ctx.fillStyle = '#FDD835';
                ctx.fillRect(screenX + 3, screenY + 6, 2, 3);
                ctx.fillStyle = '#AB47BC';
                ctx.fillRect(screenX + 6, screenY + 6, 3, 3);
                ctx.fillStyle = '#FF7043';
                ctx.fillRect(screenX + 10, screenY + 6, 2, 3);
                ctx.fillStyle = '#26A69A';
                ctx.fillRect(screenX + 3, screenY + 10, 3, 3);
                ctx.fillStyle = '#EF5350';
                ctx.fillRect(screenX + 7, screenY + 10, 2, 3);
                ctx.fillStyle = '#5C6BC0';
                ctx.fillRect(screenX + 10, screenY + 10, 2, 3);
            } else if (tile === TILE.CHEST) {
                // Chest body
                ctx.fillStyle = '#8B6914';
                ctx.fillRect(screenX + 2, screenY + 5, 12, 9);
                // Chest lid
                ctx.fillStyle = '#A0522D';
                ctx.fillRect(screenX + 2, screenY + 3, 12, 4);
                // Metal band
                ctx.fillStyle = '#B0BEC5';
                ctx.fillRect(screenX + 2, screenY + 5, 12, 1);
                // Lock
                ctx.fillStyle = '#FFD700';
                ctx.fillRect(screenX + 7, screenY + 7, 2, 2);
            } else if (tile === TILE.FOOD_CHEST) {
                // Food chest body (green tinted)
                ctx.fillStyle = '#2E7D32';
                ctx.fillRect(screenX + 2, screenY + 5, 12, 9);
                // Chest lid
                ctx.fillStyle = '#388E3C';
                ctx.fillRect(screenX + 2, screenY + 3, 12, 4);
                // Metal band
                ctx.fillStyle = '#B0BEC5';
                ctx.fillRect(screenX + 2, screenY + 5, 12, 1);
                // Apple icon
                ctx.fillStyle = '#F44336';
                ctx.fillRect(screenX + 6, screenY + 8, 4, 3);
                ctx.fillStyle = '#4CAF50';
                ctx.fillRect(screenX + 7, screenY + 7, 2, 1);
            } else if (tile === TILE.RUG) {
                // Rug pattern
                ctx.fillStyle = '#C4626A';
                ctx.fillRect(screenX, screenY, TILE_SIZE, TILE_SIZE);
                ctx.fillStyle = '#D4848A';
                ctx.fillRect(screenX + 2, screenY + 2, TILE_SIZE - 4, TILE_SIZE - 4);
                ctx.fillStyle = '#C4626A';
                ctx.fillRect(screenX + 4, screenY + 4, TILE_SIZE - 8, TILE_SIZE - 8);
            } else if (tile === TILE.PLANT_POT) {
                // Pot
                ctx.fillStyle = '#D84315';
                ctx.fillRect(screenX + 4, screenY + 9, 8, 6);
                ctx.fillRect(screenX + 3, screenY + 8, 10, 2);
                // Plant
                ctx.fillStyle = '#2E7D32';
                ctx.fillRect(screenX + 6, screenY + 3, 4, 6);
                ctx.fillRect(screenX + 3, screenY + 2, 4, 4);
                ctx.fillRect(screenX + 9, screenY + 2, 4, 4);
                ctx.fillStyle = '#43A047';
                ctx.fillRect(screenX + 5, screenY + 4, 2, 3);
            } else if (tile === TILE.WINDOW_TILE) {
                // Wall with window
                ctx.fillStyle = '#6B4226';
                ctx.fillRect(screenX, screenY, TILE_SIZE, TILE_SIZE);
                // Window frame
                ctx.fillStyle = '#8B6914';
                ctx.fillRect(screenX + 3, screenY + 3, 10, 10);
                // Window glass
                ctx.fillStyle = '#81D4FA';
                ctx.fillRect(screenX + 4, screenY + 4, 4, 4);
                ctx.fillRect(screenX + 9, screenY + 4, 3, 4);
                ctx.fillRect(screenX + 4, screenY + 9, 4, 3);
                ctx.fillRect(screenX + 9, screenY + 9, 3, 3);
                // Window cross
                ctx.fillStyle = '#8B6914';
                ctx.fillRect(screenX + 8, screenY + 4, 1, 8);
                ctx.fillRect(screenX + 4, screenY + 8, 8, 1);
            } else if (tile === TILE.STOVE) {
                // Stove body
                ctx.fillStyle = '#455A64';
                ctx.fillRect(screenX + 2, screenY + 3, 12, 12);
                // Stove top
                ctx.fillStyle = '#37474F';
                ctx.fillRect(screenX + 2, screenY + 2, 12, 3);
                // Burners
                ctx.fillStyle = '#EF5350';
                ctx.fillRect(screenX + 4, screenY + 3, 3, 2);
                ctx.fillRect(screenX + 9, screenY + 3, 3, 2);
                // Oven door
                ctx.fillStyle = '#546E7A';
                ctx.fillRect(screenX + 4, screenY + 8, 8, 5);
                // Handle
                ctx.fillStyle = '#B0BEC5';
                ctx.fillRect(screenX + 5, screenY + 9, 6, 1);
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

    // Draw NPCs as pixel characters
    if (map.npcs) {
        map.npcs.forEach(npc => {
            const sx = npc.x * TILE_SIZE - camX;
            const sy = npc.y * TILE_SIZE - camY;
            if (sx > -TILE_SIZE && sx < canvas.width + TILE_SIZE && sy > -TILE_SIZE && sy < canvas.height + TILE_SIZE) {
                // NPC color scheme based on name
                let shirtColor = '#6A1B9A';
                let hairColor = '#5D4037';
                let pantsColor = '#4A7ABF';
                if (npc.name.includes('Willow')) { shirtColor = '#1565C0'; hairColor = '#9E9E9E'; }
                else if (npc.name.includes('Mila')) { shirtColor = '#2E7D32'; hairColor = '#E65100'; }
                else if (npc.name.includes('Sven')) { shirtColor = '#4E342E'; hairColor = '#212121'; }
                else if (npc.name.includes('Kai')) { shirtColor = '#B71C1C'; hairColor = '#FF6F00'; pantsColor = '#37474F'; }
                else if (npc.name.includes('Lars')) { shirtColor = '#0D47A1'; hairColor = '#FFD54F'; }

                // Shadow
                ctx.fillStyle = 'rgba(0,0,0,0.3)';
                ctx.fillRect(sx + 2, sy + TILE_SIZE - 2, 12, 2);

                // Shoes
                ctx.fillStyle = '#3E2723';
                ctx.fillRect(sx + 3, sy + 14, 4, 2);
                ctx.fillRect(sx + 9, sy + 14, 4, 2);

                // Legs
                ctx.fillStyle = pantsColor;
                ctx.fillRect(sx + 4, sy + 11, 3, 3);
                ctx.fillRect(sx + 9, sy + 11, 3, 3);

                // Body
                ctx.fillStyle = shirtColor;
                ctx.fillRect(sx + 3, sy + 5, 10, 6);

                // Arms
                ctx.fillStyle = shirtColor;
                ctx.fillRect(sx + 1, sy + 5, 2, 5);
                ctx.fillRect(sx + 13, sy + 5, 2, 5);
                // Hands
                ctx.fillStyle = '#FDDCB5';
                ctx.fillRect(sx + 1, sy + 10, 2, 1);
                ctx.fillRect(sx + 13, sy + 10, 2, 1);

                // Head
                ctx.fillStyle = '#FDDCB5';
                ctx.fillRect(sx + 4, sy + 1, 8, 5);

                // Hair
                ctx.fillStyle = hairColor;
                ctx.fillRect(sx + 3, sy + 0, 10, 2);
                ctx.fillRect(sx + 3, sy + 1, 2, 3);
                ctx.fillRect(sx + 11, sy + 1, 2, 3);

                // Eyes
                ctx.fillStyle = '#1a1a2e';
                ctx.fillRect(sx + 5, sy + 3, 2, 2);
                ctx.fillRect(sx + 9, sy + 3, 2, 2);

                // Mouth
                ctx.fillStyle = '#D4896A';
                ctx.fillRect(sx + 7, sy + 5, 2, 1);

                // Name above NPC
                ctx.font = '5px "Press Start 2P"';
                ctx.fillStyle = 'white';
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

    // Shadow
    ctx.fillStyle = 'rgba(0,0,0,0.3)';
    ctx.fillRect(x + 2, y + TILE_SIZE - 2, 12, 2);

    // Shoes
    ctx.fillStyle = '#4E342E';
    ctx.fillRect(x + 3, y + 14 + bobOffset, 4, 2);
    ctx.fillRect(x + 9, y + 14 + bobOffset, 4, 2);

    // Legs (jeans) - walking animation
    ctx.fillStyle = '#4A7ABF';
    if (walkFrame === 0 || bobOffset === 0) {
        ctx.fillRect(x + 4, y + 11 + bobOffset, 3, 3);
        ctx.fillRect(x + 9, y + 11 + bobOffset, 3, 3);
    } else {
        ctx.fillRect(x + 3, y + 11 + bobOffset, 3, 3);
        ctx.fillRect(x + 10, y + 11 + bobOffset, 3, 3);
    }

    // Body - navy jacket
    ctx.fillStyle = '#1B2A4A';
    ctx.fillRect(x + 3, y + 5 + bobOffset, 10, 6);

    // Orange stripes on jacket (two stripes)
    ctx.fillStyle = '#D4760A';
    ctx.fillRect(x + 3, y + 9 + bobOffset, 10, 1);
    ctx.fillRect(x + 3, y + 7 + bobOffset, 10, 1);

    // Arms - swing when walking
    ctx.fillStyle = '#1B2A4A';
    if (bobOffset !== 0) {
        // Left arm forward, right arm back
        ctx.fillRect(x + 1, y + 5 + bobOffset + (walkFrame === 0 ? 1 : -1), 2, 5);
        ctx.fillRect(x + 13, y + 5 + bobOffset + (walkFrame === 0 ? -1 : 1), 2, 5);
    } else {
        ctx.fillRect(x + 1, y + 5 + bobOffset, 2, 5);
        ctx.fillRect(x + 13, y + 5 + bobOffset, 2, 5);
    }
    // Hands (skin color)
    ctx.fillStyle = '#FDDCB5';
    ctx.fillRect(x + 1, y + 10 + bobOffset + (bobOffset !== 0 && walkFrame === 0 ? 1 : 0), 2, 1);
    ctx.fillRect(x + 13, y + 10 + bobOffset + (bobOffset !== 0 && walkFrame !== 0 ? 1 : 0), 2, 1);

    // Head (skin)
    ctx.fillStyle = '#FDDCB5';
    ctx.fillRect(x + 4, y + 1 + bobOffset, 8, 5);

    // Hair (light blonde, blocky curls)
    ctx.fillStyle = '#D4A04A';
    ctx.fillRect(x + 3, y + 0 + bobOffset, 10, 2);
    ctx.fillRect(x + 3, y + 1 + bobOffset, 2, 4);
    ctx.fillRect(x + 11, y + 1 + bobOffset, 2, 4);
    // Curl detail
    ctx.fillStyle = '#C49040';
    ctx.fillRect(x + 3, y + 4 + bobOffset, 1, 2);
    ctx.fillRect(x + 12, y + 4 + bobOffset, 1, 2);

    // Eyes
    ctx.fillStyle = '#4A90D9';
    ctx.fillRect(x + 5, y + 3 + bobOffset, 2, 2);
    ctx.fillRect(x + 9, y + 3 + bobOffset, 2, 2);

    // Pupils
    ctx.fillStyle = '#1a1a2e';
    ctx.fillRect(x + 6, y + 3 + bobOffset, 1, 1);
    ctx.fillRect(x + 10, y + 3 + bobOffset, 1, 1);

    // Mouth
    ctx.fillStyle = '#D4896A';
    ctx.fillRect(x + 7, y + 5 + bobOffset, 2, 1);

    // Freckles
    ctx.fillStyle = '#C4956A';
    ctx.fillRect(x + 5, y + 4 + bobOffset, 1, 1);
    ctx.fillRect(x + 10, y + 4 + bobOffset, 1, 1);
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
        card.innerHTML = `
            <div class="team-card-emoji">${def.emoji}</div>
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
