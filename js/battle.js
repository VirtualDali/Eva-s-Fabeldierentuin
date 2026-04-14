/* ============================================
   Battle System - Turn-based combat
   ============================================ */

let battleState = null;

function startBattle(playerAnimal, enemyAnimal, isWild, trainerName) {
    battleState = {
        player: playerAnimal,
        enemy: enemyAnimal,
        isWild: isWild,
        trainerName: trainerName || null,
        turn: 'intro',
        phase: 'intro',
        playerTeamIndex: 0,
        escaped: false,
        caught: false,
        won: false,
        lost: false,
        xpGained: 0
    };

    showScreen('screen-battle');
    renderBattle();
    const enemyDef = getAnimalDef(enemyAnimal.id);
    const prefix = isWild ? 'Een wilde' : `${trainerName}'s`;
    setBattleText(`${prefix} ${enemyDef.emoji} ${enemyAnimal.nickname} (Lvl ${enemyAnimal.level}) verschijnt!`);
    showBattleMainActions();
}

function renderBattle() {
    const playerDef = getAnimalDef(battleState.player.id);
    const enemyDef = getAnimalDef(battleState.enemy.id);

    // DQ2 NES style: pure black battle background
    const bgEl = document.getElementById('battle-bg');
    bgEl.style.background = '#000';

    // Enemy - centered, large (DQ first-person view)
    drawAnimalSprite('battle-enemy-sprite', enemyDef.id, false);
    updateBattleInfo('enemy');
    updateBattleInfo('player');
}

function updateBattleInfo(who) {
    const animal = who === 'player' ? battleState.player : battleState.enemy;
    const def = getAnimalDef(animal.id);
    const el = document.getElementById(who === 'player' ? 'battle-player-status' : 'battle-enemy-status');
    const hpPercent = Math.max(0, Math.round((animal.hp / animal.maxHp) * 100));
    const hpClass = hpPercent > 50 ? '' : hpPercent > 20 ? ' low' : ' critical';

    el.innerHTML = `
        <div class="dq-status-name">${def.emoji} ${animal.nickname} Lv${animal.level}</div>
        <div class="dq-status-hp">
            <span class="dq-status-hp-label">HP</span>
            <div class="hp-bar" style="flex:1"><div class="hp-bar-fill${hpClass}" style="width:${hpPercent}%"></div></div>
            <span>${animal.hp}/${animal.maxHp}</span>
        </div>
    `;
}

function setBattleText(text) {
    document.getElementById('battle-text').textContent = text;
}

function showBattleMainActions() {
    const actionsEl = document.getElementById('battle-actions');
    actionsEl.innerHTML = '';

    const actions = [
        { label: '⚔️ Aanval', action: 'fight' },
        { label: '🎒 Tas', action: 'bag' },
        { label: '🔄 Wissel', action: 'switch' },
        ...(battleState.isWild ? [{ label: '🏃 Vluchten', action: 'run' }] : [])
    ];

    actions.forEach(a => {
        const btn = document.createElement('button');
        btn.className = 'battle-btn';
        btn.textContent = a.label;
        btn.addEventListener('click', () => handleBattleAction(a.action));
        actionsEl.appendChild(btn);
    });
}

function handleBattleAction(action) {
    switch (action) {
        case 'fight':
            showMoveSelection();
            break;
        case 'bag':
            showBattleBag();
            break;
        case 'switch':
            showBattleSwitch();
            break;
        case 'run':
            tryRun();
            break;
    }
}

function showMoveSelection() {
    const actionsEl = document.getElementById('battle-actions');
    actionsEl.innerHTML = '';
    const def = getAnimalDef(battleState.player.id);

    def.moves.forEach((move, i) => {
        const btn = document.createElement('button');
        btn.className = 'battle-btn';
        btn.innerHTML = `${move.emoji} ${move.name} <span style="font-size:0.75rem;opacity:0.6">${move.heal ? 'Genees ' + move.heal : 'Kracht ' + move.power} ${getTypeEmoji(move.type)}</span>`;
        btn.addEventListener('click', () => executeTurn(i));
        actionsEl.appendChild(btn);
    });

    // Back button
    const backBtn = document.createElement('button');
    backBtn.className = 'battle-btn';
    backBtn.textContent = '⬅️ Terug';
    backBtn.addEventListener('click', () => showBattleMainActions());
    actionsEl.appendChild(backBtn);
}

function executeTurn(playerMoveIndex) {
    const def = getAnimalDef(battleState.player.id);
    const enemyDef = getAnimalDef(battleState.enemy.id);
    const playerMove = def.moves[playerMoveIndex];

    // Enemy picks random move
    const enemyMoveIndex = Math.floor(Math.random() * enemyDef.moves.length);
    const enemyMove = enemyDef.moves[enemyMoveIndex];

    // Speed determines who goes first
    const playerFirst = battleState.player.spd >= battleState.enemy.spd;

    const first = playerFirst ? { move: playerMove, attacker: battleState.player, defender: battleState.enemy, attackerDef: def, defenderDef: enemyDef, isPlayer: true }
        : { move: enemyMove, attacker: battleState.enemy, defender: battleState.player, attackerDef: enemyDef, defenderDef: def, isPlayer: false };
    const second = playerFirst ? { move: enemyMove, attacker: battleState.enemy, defender: battleState.player, attackerDef: enemyDef, defenderDef: def, isPlayer: false }
        : { move: playerMove, attacker: battleState.player, defender: battleState.enemy, attackerDef: def, defenderDef: enemyDef, isPlayer: true };

    // Clear actions during animation
    document.getElementById('battle-actions').innerHTML = '';

    // First attack
    const result1 = executeMove(first);
    setBattleText(result1.text);
    updateBattleInfo('player');
    updateBattleInfo('enemy');

    setTimeout(() => {
        if (checkBattleEnd()) return;

        // Second attack
        const result2 = executeMove(second);
        setBattleText(result2.text);
        updateBattleInfo('player');
        updateBattleInfo('enemy');

        setTimeout(() => {
            if (checkBattleEnd()) return;
            showBattleMainActions();
        }, 1200);
    }, 1200);
}

function executeMove(data) {
    const { move, attacker, defender, attackerDef, defenderDef, isPlayer } = data;
    const prefix = isPlayer ? `${attacker.nickname}` : `Vijand ${attacker.nickname}`;

    if (move.heal) {
        const healAmount = move.heal;
        attacker.hp = Math.min(attacker.maxHp, attacker.hp + healAmount);
        return { text: `${prefix} gebruikt ${move.emoji} ${move.name}! +${healAmount} HP genezen!` };
    }

    // Damage calculation
    const effectiveness = getTypeEffectiveness(move.type, defenderDef.type);
    const baseDamage = ((2 * attacker.level / 5 + 2) * move.power * attacker.atk / defender.def) / 50 + 2;
    const randomFactor = 0.85 + Math.random() * 0.15;
    let damage = Math.max(1, Math.round(baseDamage * effectiveness * randomFactor));

    defender.hp = Math.max(0, defender.hp - damage);

    let effectText = '';
    if (effectiveness > 1) effectText = ' Het is super effectief! 💥';
    else if (effectiveness < 1) effectText = ' Het is niet erg effectief... 😕';

    return { text: `${prefix} gebruikt ${move.emoji} ${move.name}! -${damage} HP!${effectText}` };
}

function checkBattleEnd() {
    if (battleState.enemy.hp <= 0) {
        battleWon();
        return true;
    }
    if (battleState.player.hp <= 0) {
        // Check if player has more team members
        const alive = gamePlayer.team.filter(a => a.hp > 0);
        if (alive.length > 0) {
            setBattleText(`${battleState.player.nickname} is uitgeschakeld! Kies een ander fabeldier!`);
            setTimeout(() => showBattleSwitch(true), 1500);
            return true;
        }
        battleLost();
        return true;
    }
    return false;
}

function battleWon() {
    battleState.won = true;
    const enemyDef = getAnimalDef(battleState.enemy.id);
    const xp = battleState.enemy.level * 8 + 10;
    const money = battleState.isWild ? 0 : battleState.enemy.level * 15;

    setBattleText(`${enemyDef.emoji} ${battleState.enemy.nickname} is verslagen! 🎉`);
    document.getElementById('battle-actions').innerHTML = '';

    setTimeout(() => {
        // Award XP
        const xpMessages = gainXp(battleState.player, xp);
        gamePlayer.money += money;

        let resultText = `+${xp} XP gewonnen!`;
        if (money > 0) resultText += ` +€${money}!`;
        xpMessages.forEach(m => resultText += ' ' + m);

        setBattleText(resultText);

        const continueBtn = document.createElement('button');
        continueBtn.className = 'battle-btn';
        continueBtn.textContent = '✅ Doorgaan';
        continueBtn.addEventListener('click', () => endBattle());
        document.getElementById('battle-actions').innerHTML = '';
        document.getElementById('battle-actions').appendChild(continueBtn);

        Storage.saveGame(buildSaveData());
    }, 1500);
}

function battleLost() {
    battleState.lost = true;
    setBattleText('Al je fabeldieren zijn uitgeschakeld! 😢 Je wordt teruggebracht naar het dorpje...');
    document.getElementById('battle-actions').innerHTML = '';

    setTimeout(() => {
        // Heal team partially and return to village
        gamePlayer.team.forEach(a => a.hp = Math.round(a.maxHp * 0.3));
        gamePlayer.currentMap = 'village';
        gamePlayer.x = 12;
        gamePlayer.y = 10;
        Storage.saveGame(buildSaveData());
        endBattle();
    }, 2500);
}

function tryRun() {
    const runChance = 0.6 + (battleState.player.spd - battleState.enemy.spd) * 0.05;
    if (Math.random() < Math.min(0.95, Math.max(0.2, runChance))) {
        battleState.escaped = true;
        setBattleText('Je bent ontsnapt! 🏃');
        document.getElementById('battle-actions').innerHTML = '';
        setTimeout(() => endBattle(), 1200);
    } else {
        setBattleText('Je kon niet ontsnappen! 😰');
        // Enemy attacks
        setTimeout(() => {
            const enemyDef = getAnimalDef(battleState.enemy.id);
            const moveIdx = Math.floor(Math.random() * enemyDef.moves.length);
            const result = executeMove({
                move: enemyDef.moves[moveIdx],
                attacker: battleState.enemy,
                defender: battleState.player,
                attackerDef: enemyDef,
                defenderDef: getAnimalDef(battleState.player.id),
                isPlayer: false
            });
            setBattleText(result.text);
            updateBattleInfo('player');
            setTimeout(() => {
                if (!checkBattleEnd()) showBattleMainActions();
            }, 1000);
        }, 1000);
    }
}

function showBattleBag() {
    const actionsEl = document.getElementById('battle-actions');
    actionsEl.innerHTML = '';

    if (battleState.isWild) {
        // Fabelbal
        if (gamePlayer.bag.fabelbal > 0) {
            const btn = document.createElement('button');
            btn.className = 'battle-btn';
            btn.textContent = `🔮 Fabelbal (${gamePlayer.bag.fabelbal})`;
            btn.addEventListener('click', () => throwBall('fabelbal'));
            actionsEl.appendChild(btn);
        }
        if (gamePlayer.bag.superbal > 0) {
            const btn = document.createElement('button');
            btn.className = 'battle-btn';
            btn.textContent = `💎 Superbal (${gamePlayer.bag.superbal})`;
            btn.addEventListener('click', () => throwBall('superbal'));
            actionsEl.appendChild(btn);
        }
    }

    if (gamePlayer.bag.drankje > 0) {
        const btn = document.createElement('button');
        btn.className = 'battle-btn';
        btn.textContent = `🧪 Drankje (${gamePlayer.bag.drankje})`;
        btn.addEventListener('click', () => usePotionInBattle());
        actionsEl.appendChild(btn);
    }

    const backBtn = document.createElement('button');
    backBtn.className = 'battle-btn';
    backBtn.textContent = '⬅️ Terug';
    backBtn.addEventListener('click', () => showBattleMainActions());
    actionsEl.appendChild(backBtn);
}

function throwBall(ballType) {
    const ball = ballType === 'superbal' ? { bonus: 1.5 } : { bonus: 1 };
    gamePlayer.bag[ballType]--;

    const enemyDef = getAnimalDef(battleState.enemy.id);
    const hpRatio = battleState.enemy.hp / battleState.enemy.maxHp;
    const catchChance = enemyDef.catchRate * ball.bonus * (1 - hpRatio * 0.5);

    document.getElementById('battle-actions').innerHTML = '';
    setBattleText(`Je gooit een ${ballType === 'superbal' ? '💎 Superbal' : '🔮 Fabelbal'}...`);

    setTimeout(() => {
        if (Math.random() < catchChance) {
            // Caught!
            battleState.caught = true;
            if (gamePlayer.team.length < 6) {
                gamePlayer.team.push(battleState.enemy);
                setBattleText(`${enemyDef.emoji} ${battleState.enemy.nickname} is gevangen! 🎉 Welkom in het team!`);
            } else {
                setBattleText(`${enemyDef.emoji} ${battleState.enemy.nickname} is gevangen! Maar je team is vol (max 6). Het dier is vrijgelaten.`);
            }

            const continueBtn = document.createElement('button');
            continueBtn.className = 'battle-btn';
            continueBtn.textContent = '✅ Doorgaan';
            continueBtn.addEventListener('click', () => endBattle());
            document.getElementById('battle-actions').appendChild(continueBtn);

            Storage.saveGame(buildSaveData());
        } else {
            setBattleText(`Bijna! ${battleState.enemy.nickname} is ontsnapt uit de bal! 😤`);
            // Enemy attacks
            setTimeout(() => {
                const moveIdx = Math.floor(Math.random() * enemyDef.moves.length);
                const result = executeMove({
                    move: enemyDef.moves[moveIdx],
                    attacker: battleState.enemy,
                    defender: battleState.player,
                    attackerDef: enemyDef,
                    defenderDef: getAnimalDef(battleState.player.id),
                    isPlayer: false
                });
                setBattleText(result.text);
                updateBattleInfo('player');
                setTimeout(() => {
                    if (!checkBattleEnd()) showBattleMainActions();
                }, 1000);
            }, 1000);
        }
    }, 1500);
}

function usePotionInBattle() {
    gamePlayer.bag.drankje--;
    battleState.player.hp = Math.min(battleState.player.maxHp, battleState.player.hp + 30);
    updateBattleInfo('player');

    setBattleText(`${battleState.player.nickname} is genezen! +30 HP 💊`);
    document.getElementById('battle-actions').innerHTML = '';

    // Enemy attacks
    setTimeout(() => {
        const enemyDef = getAnimalDef(battleState.enemy.id);
        const moveIdx = Math.floor(Math.random() * enemyDef.moves.length);
        const result = executeMove({
            move: enemyDef.moves[moveIdx],
            attacker: battleState.enemy,
            defender: battleState.player,
            attackerDef: enemyDef,
            defenderDef: getAnimalDef(battleState.player.id),
            isPlayer: false
        });
        setBattleText(result.text);
        updateBattleInfo('player');
        setTimeout(() => {
            if (!checkBattleEnd()) showBattleMainActions();
        }, 1000);
    }, 1200);
}

function showBattleSwitch(forced) {
    const actionsEl = document.getElementById('battle-actions');
    actionsEl.innerHTML = '';

    gamePlayer.team.forEach((animal, i) => {
        if (animal === battleState.player && !forced) return;
        if (animal.hp <= 0) return;
        const def = getAnimalDef(animal.id);
        const btn = document.createElement('button');
        btn.className = 'battle-btn';
        btn.innerHTML = `${def.emoji} ${animal.nickname} <span style="font-size:0.75rem;opacity:0.6">Lvl ${animal.level} | ${animal.hp}/${animal.maxHp} HP</span>`;
        btn.addEventListener('click', () => switchAnimal(i));
        actionsEl.appendChild(btn);
    });

    if (!forced) {
        const backBtn = document.createElement('button');
        backBtn.className = 'battle-btn';
        backBtn.textContent = '⬅️ Terug';
        backBtn.addEventListener('click', () => showBattleMainActions());
        actionsEl.appendChild(backBtn);
    }
}

function switchAnimal(index) {
    battleState.player = gamePlayer.team[index];
    battleState.playerTeamIndex = index;
    const def = getAnimalDef(battleState.player.id);

    renderBattle();
    setBattleText(`Ga, ${def.emoji} ${battleState.player.nickname}!`);
    document.getElementById('battle-actions').innerHTML = '';

    // Enemy attacks after switch
    setTimeout(() => {
        const enemyDef = getAnimalDef(battleState.enemy.id);
        const moveIdx = Math.floor(Math.random() * enemyDef.moves.length);
        const result = executeMove({
            move: enemyDef.moves[moveIdx],
            attacker: battleState.enemy,
            defender: battleState.player,
            attackerDef: enemyDef,
            defenderDef: def,
            isPlayer: false
        });
        setBattleText(result.text);
        updateBattleInfo('player');
        setTimeout(() => {
            if (!checkBattleEnd()) showBattleMainActions();
        }, 1000);
    }, 1200);
}

function endBattle() {
    battleState = null;
    showScreen('screen-world');
    updateHUD();
    gameLoopRunning = true;
    requestAnimationFrame(gameLoop);
}
