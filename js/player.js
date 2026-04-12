/* ============================================
   Player - State & inventory
   ============================================ */

function createNewPlayer() {
    return {
        name: 'Eva',
        x: 12,
        y: 10,
        dir: 'down',
        currentMap: 'village',
        team: [],
        bag: {
            fabelbal: 10,
            drankje: 5,
            superbal: 0,
            voedsel: 5
        },
        money: 100,
        defeatedTrainers: [],
        stepsInGrass: 0
    };
}

const ITEMS = {
    fabelbal: { name: 'Fabelbal', emoji: '🔮', description: 'Vang een wild fabeldier!', price: 15 },
    superbal: { name: 'Superbal', emoji: '💎', description: 'Hogere vangkans!', price: 40 },
    drankje:  { name: 'Drankje', emoji: '🧪', description: 'Genees 30 HP', price: 10, healAmount: 30 },
    voedsel:  { name: 'Voedsel', emoji: '🍎', description: 'Verhoog geluk', price: 8 }
};

function getPlayerLevel(player) {
    if (player.team.length === 0) return 1;
    return Math.max(...player.team.map(a => a.level));
}

function healTeam(player) {
    player.team.forEach(a => {
        a.hp = a.maxHp;
        a.happiness = Math.min(100, a.happiness + 10);
    });
}

function feedAnimal(player, index) {
    if (player.bag.voedsel <= 0) return 'Je hebt geen voedsel meer!';
    if (index < 0 || index >= player.team.length) return 'Ongeldig dier!';
    player.bag.voedsel--;
    const animal = player.team[index];
    animal.hunger = Math.min(100, animal.hunger + 30);
    animal.happiness = Math.min(100, animal.happiness + 10);
    const def = getAnimalDef(animal.id);
    return `${animal.nickname} eet dankbaar! 🍎 Honger +30, Geluk +10`;
}

function usePotion(player, index) {
    if (player.bag.drankje <= 0) return 'Je hebt geen drankjes meer!';
    if (index < 0 || index >= player.team.length) return 'Ongeldig dier!';
    player.bag.drankje--;
    const animal = player.team[index];
    animal.hp = Math.min(animal.maxHp, animal.hp + ITEMS.drankje.healAmount);
    return `${animal.nickname} is genezen! +${ITEMS.drankje.healAmount} HP 💊`;
}
