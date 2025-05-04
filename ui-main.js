
// ui-main.js
window.showNotification = function(message) {
    const notification = document.createElement('div');
    notification.className = 'notification';
    notification.innerText = message;
    document.body.appendChild(notification);
    setTimeout(() => {
        notification.remove();
    }, 3000);
};

window.historyStack = ['main'];

window.profile = {
    username: 'Аноним',
    coins: 0,
    maCoins: 0,
    maCoinPrice: 60000,
    energy: 100,
    maxEnergy: 100,
    maxEnergyUpgraded: 100000,
    energyUpgradeLevel: 0,
    multitapLevel: 1,
    maxMultitap: 10,
    level: 1,
    maxLevel: 27,
    profitPerHour: 0,
    upgrades: {
        real_estate: [],
        movables: [],
        upgrades: [],
        boosts: []
    },
    ownedItems: {
        real_estate: [],
        movables: [],
        upgrades: []
    },
    theme: 'dark',
    stats: { clicker_games: 0, roulette_games: 0, depim_games: 0, quests_completed: 0 },
    event: null,
    xp: 0,
    clicks: 0,
    claimedBonuses: [],
    claimedPromoCodes: [],
    pets: [],
    petPlayCount: 0,
    petUpgrades: {},
    quests: [],
    completedQuests: [],
    levelConditions: {
        2: { xp: 200, quests: 1 },
        3: { xp: 500, quests: 2 },
        4: { xp: 1000, upgrades: 1 },
        5: { xp: 2000, pets: 1 },
        6: { xp: 3500, clicks: 50 },
        7: { xp: 5000, casino: 1 },
        8: { xp: 7500, upgrades: 2 },
        9: { xp: 10000, pets: 2 },
        10: { xp: 15000, quests: 5 },
        11: { xp: 20000, clicks: 100 },
        12: { xp: 25000, casino: 2 },
        13: { xp: 30000, upgrades: 3 },
        14: { xp: 40000, pets: 3 },
        15: { xp: 50000, quests: 7 },
        16: { xp: 60000, clicks: 200 },
        17: { xp: 70000, casino: 3 },
        18: { xp: 80000, upgrades: 4 },
        19: { xp: 90000, pets: 4 },
        20: { xp: 100000, quests: 10 },
        21: { xp: 120000, clicks: 300 },
        22: { xp: 140000, casino: 4 },
        23: { xp: 160000, upgrades: 5 },
        24: { xp: 180000, pets: 5 },
        25: { xp: 200000, quests: 12 },
        26: { xp: 250000, clicks: 500 },
        27: { xp: 300000, casino: 5, upgrades: 10, pets: 10, quests: 15 }
    }
};

window.loadProfile = function() {
    const savedProfile = localStorage.getItem('hamsterProfile');
    if (savedProfile) {
        window.profile = JSON.parse(savedProfile);
    }
    if (!window.profile.pets) window.profile.pets = [];
    if (!window.profile.maCoins) window.profile.maCoins = 0;
    if (!window.profile.maCoinPrice) window.profile.maCoinPrice = 60000;
    if (!window.profile.claimedPromoCodes) window.profile.claimedPromoCodes = [];
    if (!window.profile.upgrades) window.profile.upgrades = { real_estate: [], movables: [], upgrades: [], boosts: [] };
    if (!window.profile.ownedItems) window.profile.ownedItems = { real_estate: [], movables: [], upgrades: [] };
    if (!window.profile.stats) window.profile.stats = { clicker_games: 0, roulette_games: 0, depim_games: 0, quests_completed: 0 };
    if (!window.profile.completedQuests) window.profile.completedQuests = [];
    if (!window.profile.levelConditions) window.profile.levelConditions = window.profile.levelConditions || {};

    window.profile.upgrades.real_estate = window.getRealEstate();
    window.profile.upgrades.movables = window.getMovables();
    window.profile.upgrades.upgrades = window.getUpgrades();
    window.profile.upgrades.boosts = window.getBoosts();
    window.profile.ownedItems.real_estate = window.getRealEstate();
    window.profile.ownedItems.movables = window.getMovables();
    window.profile.ownedItems.upgrades = window.getUpgrades();

    const availablePets = window.getPets();
    if (window.profile.pets.length === 0) {
        window.profile.pets = availablePets.map(pet => ({ ...pet }));
    } else {
        window.profile.pets = window.profile.pets.map(pet => {
            const updatedPet = availablePets.find(p => p.name === pet.name) || pet;
            return { ...updatedPet, level: pet.level || 1 };
        });
    }
};

window.saveProfile = function() {
    localStorage.setItem('hamsterProfile', JSON.stringify(window.profile));
};

window.updateEnergy = function() {
    const maxEnergy = window.profile.energyUpgradeLevel > 0 ? window.profile.maxEnergyUpgraded : window.profile.maxEnergy;
    if (window.profile.energy < maxEnergy) {
        window.profile.energy = Math.min(window.profile.energy + 1, maxEnergy);
        window.updateProfile();
    }
};

setInterval(window.updateEnergy, 2000);

window.clickTapButton = function(event) {
    if (window.profile.energy >= window.profile.multitapLevel) {
        window.profile.coins += 1;
        window.profile.energy -= window.profile.multitapLevel;
        window.profile.clicks++;
        window.profile.xp += 10;
        window.checkLevelUp();
        window.updateProfile();
        window.updateQuests();

        const tapAnim = document.createElement('div');
        tapAnim.className = 'tap-animation';
        tapAnim.innerText = '+1 💰';
        tapAnim.style.left = `${event.clientX - 20}px`;
        tapAnim.style.top = `${event.clientY - 50}px`;
        document.body.appendChild(tapAnim);
        setTimeout(() => tapAnim.remove(), 1000);
    } else {
        window.showNotification('Недостаточно энергии! ⚡');
    }
};

window.checkLevelUp = function() {
    const currentLevel = window.profile.level;
    const nextLevel = currentLevel + 1;
    const conditions = window.profile.levelConditions[nextLevel] || { xp: Infinity };
    const requiredXP = conditions.xp || 0;
    const requiredQuests = conditions.quests || 0;
    const requiredUpgrades = conditions.upgrades || 0;
    const requiredPets = conditions.pets || 0;
    const requiredClicks = conditions.clicks || 0;
    const requiredCasino = conditions.casino || 0;

    const questsCompleted = window.profile.completedQuests.length;
    const upgradesCount = window.profile.ownedItems.real_estate.concat(window.profile.ownedItems.movables, window.profile.ownedItems.upgrades).reduce((total, item) => total + item.count, 0);
    const petsCount = window.profile.pets.length;
    const clicksCount = window.profile.clicks;
    const casinoGames = window.profile.stats.clicker_games + window.profile.stats.roulette_games + window.profile.stats.depim_games;

    if (window.profile.xp >= requiredXP &&
        questsCompleted >= requiredQuests &&
        upgradesCount >= requiredUpgrades &&
        petsCount >= requiredPets &&
        clicksCount >= requiredClicks &&
        casinoGames >= requiredCasino &&
        currentLevel < window.profile.maxLevel) {
        window.profile.level++;
        window.profile.xp = 0;
        let reward = 0;
        switch (currentLevel) {
            case 1: reward = 1000; break;
            case 5: reward = 5000; break;
            case 10: reward = 10000; break;
            case 15: reward = 20000; break;
            case 20: reward = 50000; break;
            case 25: reward = 100000; break;
            default: reward = 2000 + (currentLevel * 500);
        }
        window.profile.coins += reward;
        window.showNotification(`Поздравляем! Достигнут уровень ${window.profile.level}! +${reward} монет!`);
        window.updateProfile();
    }
};

window.updateProfile = function() {
    const progress = Math.floor((window.profile.xp / (window.profile.levelConditions[window.profile.level + 1]?.xp || 1000)) * 100);
    const topStats = document.getElementById('top-stats');
    if (topStats) {
        topStats.innerHTML = `
            <div id="level-info">
                <span id="level-display">GOLD ${window.profile.level}/${window.profile.maxLevel}</span>
                <button id="level-details-btn" class="hk-button" onclick="showLevelDetails()">ℹ️</button>
                <div id="level-progress" style="width: ${progress}%;"></div>
                <span id="profit-per-hour">${window.profile.profitPerHour.toLocaleString()} 💰/час</span>
            </div>
            <div id="coin-counter-small">💰 ${window.profile.coins.toLocaleString()} | MaКоин: ${window.profile.maCoins}</div>
            <button id="settings-button" onclick="showOther()">⚙️</button>
        `;
    }
    const mainContent = document.getElementById('main-content');
    const profileDiv = mainContent.querySelector('.profile-info');
    if (profileDiv && window.historyStack[window.historyStack.length - 1] === 'main') {
        profileDiv.innerHTML = `
            <h1 id="coin-counter">${window.profile.coins.toLocaleString()}</h1>
            <p>Мультитап: ${window.profile.multitapLevel}/${window.profile.maxMultitap} 👆</p>
            <p>MaКоин: ${window.profile.maCoins}</p>
        `;
    }
    const energyCounter = document.getElementById('energy-counter');
    if (energyCounter) {
        const maxEnergy = window.profile.energyUpgradeLevel > 0 ? window.profile.maxEnergyUpgraded : window.profile.maxEnergy;
        energyCounter.innerHTML = `${window.profile.energy}/${maxEnergy}`;
    }
    window.saveProfile();
};

window.applyTheme = function() {
    document.body.className = '';
    document.body.classList.add(`${window.profile.theme}-theme`);
};

window.showMain = function() {
    const progress = Math.floor((window.profile.xp / (window.profile.levelConditions[window.profile.level + 1]?.xp || 1000)) * 100);
    document.getElementById('main-content').innerHTML = `
        <button class="back-button hk-button" onclick="goBack()" style="display: none;">Назад ⬅️</button>
        <div id="tap-container">
            <div id="tap-button">
                <span>😈</span>
                <div id="energy-counter">${window.profile.energy}/${window.profile.energyUpgradeLevel > 0 ? window.profile.maxEnergyUpgraded : window.profile.maxEnergy}</div>
            </div>
        </div>
        <div class="profile-info">
            <h1 id="coin-counter">${window.profile.coins.toLocaleString()}</h1>
            <p>Мультитап: ${window.profile.multitapLevel}/${window.profile.maxMultitap} 👆</p>
            <p>MaКоин: ${window.profile.maCoins}</p>
        </div>
    `;
    window.historyStack = ['main'];
    window.updateProfile();
    window.applyTheme();
    document.getElementById('tap-button').addEventListener('click', window.clickTapButton);
    bindButtonEvents();
    if (typeof window.calculateProfit === 'function') window.calculateProfit(); // Вызов, если определена в ui-main4.js
};

window.showQuests = function() {
    const quests = window.getQuests().filter(quest => !window.profile.completedQuests.includes(quest.name));
    document.getElementById('main-content').innerHTML = `
        <button class="back-button hk-button" onclick="goBack()">Назад ⬅️</button>
        <h2>Квесты 📋</h2>
        <div class="quest-list quest-grid">
            ${quests.length > 0 ? quests.map((quest, index) => `
                <div class="quest">
                    <div class="quest-info">
                        <p>${quest.name}</p>
                        <p>Прогресс: ${quest.progress}/${quest.target}</p>
                        <p>Награда: ${quest.reward.amount} ${quest.reward.type === 'coins' ? 'монет 💰' : 'XP 📈'}</p>
                    </div>
                    <button class="hk-button ${quest.progress >= quest.target ? '' : 'disabled'}" onclick="claimQuest(${index})">
                        ${quest.progress >= quest.target ? 'Получить' : 'В процессе'}
                    </button>
                </div>
            `).join('') : '<p>Все квесты выполнены! 🎉</p>'}
        </div>
    `;
    window.historyStack.push('showQuests');
};

window.getQuests = function() {
    return [
        { name: 'Сделай 10 кликов', type: 'clicks', target: 10, progress: window.profile.clicks || 0, reward: { type: 'coins', amount: 500 } },
        { name: 'Сыграй в казино 1 раз', type: 'casino', target: 1, progress: (window.profile.stats.clicker_games || 0) + (window.profile.stats.roulette_games || 0) + (window.profile.stats.depim_games || 0), reward: { type: 'xp', amount: 100 } },
        { name: 'Активируй промокод', type: 'promo', target: 1, progress: window.profile.claimedPromoCodes ? window.profile.claimedPromoCodes.length : 0, reward: { type: 'coins', amount: 1000 } },
        { name: 'Купи предмет', type: 'upgrade', target: 1, progress: window.profile.ownedItems ? window.profile.ownedItems.real_estate.concat(window.profile.ownedItems.movables, window.profile.ownedItems.upgrades).reduce((total, item) => total + item.count, 0) : 0, reward: { type: 'xp', amount: 200 } },
        { name: 'Купи питомца', type: 'pet', target: 1, progress: window.profile.pets ? window.profile.pets.length : 0, reward: { type: 'coins', amount: 1500 } },
        { name: 'Улучши питомца', type: 'pet_upgrade', target: 1, progress: window.profile.pets ? window.profile.pets.filter(p => p.level > 1).length : 0, reward: { type: 'xp', amount: 300 } },
        { name: 'Сыграй в ДепИм 3 раза', type: 'depim', target: 3, progress: window.profile.stats.depim_games || 0, reward: { type: 'coins', amount: 2000 } },
        { name: 'Заработай 5000 монет', type: 'coins', target: 5000, progress: window.profile.coins || 0, reward: { type: 'xp', amount: 500 } }
    ];
};

window.updateQuests = function() {
    if (window.historyStack[window.historyStack.length - 1] === 'showQuests') {
        window.showQuests();
    }
};

window.claimQuest = function(index) {
    const quests = window.getQuests().filter(quest => !window.profile.completedQuests.includes(quest.name));
    const quest = quests[index];
    if (quest.progress >= quest.target) {
        if (quest.reward.type === 'coins') {
            window.profile.coins += quest.reward.amount;
        } else if (quest.reward.type === 'xp') {
            window.profile.xp += quest.reward.amount;
            window.checkLevelUp();
        }
        window.profile.stats.quests_completed++;
        window.profile.completedQuests.push(quest.name);
        window.showNotification(`Квест "${quest.name}" выполнен! +${quest.reward.amount} ${quest.reward.type === 'coins' ? 'монет 💰' : 'XP 📈'}`);
        window.updateProfile();
        window.showQuests();
    } else {
        window.showNotification('Квест ещё не выполнен!');
    }
};

window.showFriends = function() {
    document.getElementById('main-content').innerHTML = `
        <button class="back-button hk-button" onclick="goBack()">Назад ⬅️</button>
        <h2>Друзья 👥</h2>
        <p>Приглашайте друзей и получайте бонусы!</p>
    `;
    window.historyStack.push('showFriends');
};

window.showLevelDetails = function() {
    const currentLevel = window.profile.level;
    const nextLevel = currentLevel + 1;
    const conditions = window.profile.levelConditions[nextLevel] || { xp: 'Максимальный уровень достигнут!' };
    const requiredXP = conditions.xp || 0;
    const requiredQuests = conditions.quests || 0;
    const requiredUpgrades = conditions.upgrades || 0;
    const requiredPets = conditions.pets || 0;
    const requiredClicks = conditions.clicks || 0;
    const requiredCasino = conditions.casino || 0;

    const questsCompleted = window.profile.completedQuests.length;
    const upgradesCount = window.profile.ownedItems.real_estate.concat(window.profile.ownedItems.movables, window.profile.ownedItems.upgrades).reduce((total, item) => total + item.count, 0);
    const petsCount = window.profile.pets.length;
    const clicksCount = window.profile.clicks;
    const casinoGames = window.profile.stats.clicker_games + window.profile.stats.roulette_games + window.profile.stats.depim_games;

    document.getElementById('main-content').innerHTML = `
        <button class="back-button hk-button" onclick="goBack()">Назад ⬅️</button>
        <h2>Детали уровня</h2>
        <div class="level-details">
            <p>Текущий уровень: ${currentLevel}/27</p>
            <p>XP: ${window.profile.xp}/${requiredXP}</p>
            ${requiredQuests > 0 ? `<p>Выполнено квестов: ${questsCompleted}/${requiredQuests}</p>` : ''}
            ${requiredUpgrades > 0 ? `<p>Куплено предметов: ${upgradesCount}/${requiredUpgrades}</p>` : ''}
            ${requiredPets > 0 ? `<p>Куплено питомцев: ${petsCount}/${requiredPets}</p>` : ''}
            ${requiredClicks > 0 ? `<p>Кликов: ${clicksCount}/${requiredClicks}</p>` : ''}
            ${requiredCasino > 0 ? `<p>Игр в казино: ${casinoGames}/${requiredCasino}</p>` : ''}
            <p>${conditions.xp === 'Максимальный уровень достигнут!' ? conditions.xp : 'Продолжайте выполнять условия!'}</p>
        </div>
    `;
    window.historyStack.push('showLevelDetails');
};

// Функция для привязки событий к кнопкам (если используется где-то в коде)
function bindButtonEvents() {
    // Здесь можно добавить дополнительные события для кнопок, если нужно
}
