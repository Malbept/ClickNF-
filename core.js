let profile = {
    username: 'Аноним',
    coins: 100,
    energy: 50,
    maxEnergy: 50,
    items: [],
    level: 1,
    maxLevel: 11,
    seasonProgress: 0,
    luckyCharmActive: false,
    quests: [],
    pets: [],
    petPlayCount: 0,
    casinoLossStreak: 0,
    theme: 'dark',
    themeChangeCount: 0,
    secrets: { found: [], total: 5 },
    casinoRig: {},
    profitPerHour: 0,
    multitapLevel: 1,
    maxMultitap: 10,
    upgrades: {
        'exchange': [
            { name: 'Binance', level: 0, cost: 1000, profitPerHour: 207 },
            { name: 'Kraken', level: 0, cost: 2000, profitPerHour: 240 },
            { name: 'Coinbase', level: 0, cost: 750, profitPerHour: 70 }
        ],
        'mine': [
            { name: 'Bitcoin Miner', level: 0, cost: 1000, profitPerHour: 70 }
        ],
        'friends': [],
        'earn': [
            { name: 'Referral Bonus', level: 0, cost: 500, profitPerHour: 70 },
            { name: 'Daily Tasks', level: 0, cost: 500, profitPerHour: 90 }
        ],
        'airdrop': [
            { name: 'Token Airdrop', level: 0, cost: 350, profitPerHour: 40 }
        ]
    }
};

function loadProfile() {
    const saved = localStorage.getItem('lapulya_profile');
    if (saved) {
        profile = JSON.parse(saved);
        profile.pets = profile.pets || [];
        profile.petPlayCount = profile.petPlayCount || 0;
        profile.casinoLossStreak = profile.casinoLossStreak || 0;
        profile.themeChangeCount = profile.themeChangeCount || 0;
        profile.secrets = profile.secrets || { found: [], total: 5 };
        profile.casinoRig = profile.casinoRig || {};
        profile.maxLevel = profile.maxLevel || 11;
        profile.profitPerHour = profile.profitPerHour || 0;
        profile.multitapLevel = profile.multitapLevel || 1;
        profile.maxMultitap = profile.maxMultitap || 10;
        profile.upgrades = profile.upgrades || {
            'exchange': [
                { name: 'Binance', level: 0, cost: 1000, profitPerHour: 207 },
                { name: 'Kraken', level: 0, cost: 2000, profitPerHour: 240 },
                { name: 'Coinbase', level: 0, cost: 750, profitPerHour: 70 }
            ],
            'mine': [
                { name: 'Bitcoin Miner', level: 0, cost: 1000, profitPerHour: 70 }
            ],
            'friends': [],
            'earn': [
                { name: 'Referral Bonus', level: 0, cost: 500, profitPerHour: 70 },
                { name: 'Daily Tasks', level: 0, cost: 500, profitPerHour: 90 }
            ],
            'airdrop': [
                { name: 'Token Airdrop', level: 0, cost: 350, profitPerHour: 40 }
            ]
        };
    }
    calculateProfitPerHour();
}

function saveProfile() {
    localStorage.setItem('lapulya_profile', JSON.stringify(profile));
}

function updateEnergy() {
    if (profile.energy < profile.maxEnergy) {
        profile.energy = Math.min(profile.maxEnergy, profile.energy + 1);
        updateProfile();
    }
}

function calculateOfflineEnergy() {
    const lastVisit = localStorage.getItem('lastVisit');
    const now = Date.now();
    if (lastVisit) {
        const secondsPassed = Math.floor((now - lastVisit) / 1000);
        const energyToAdd = Math.floor(secondsPassed / 10);
        profile.energy = Math.min(profile.maxEnergy, profile.energy + energyToAdd);
        if (energyToAdd > 0) {
            showNotification(`Энергия восстановлена на ${energyToAdd} ⚡`);
        }
        updateProfile();
    }
}

function calculateProfitPerHour() {
    let totalProfit = 0;
    for (const category in profile.upgrades) {
        profile.upgrades[category].forEach(upgrade => {
            if (upgrade.level > 0) {
                totalProfit += upgrade.profitPerHour * upgrade.level;
            }
        });
    }
    profile.pets.forEach(pet => {
        const baseProfit = 10;
        const levelMultiplier = pet.level || 1;
        totalProfit += baseProfit * levelMultiplier;
    });
    profile.profitPerHour = totalProfit;
}

function earnPassiveIncome() {
    if (profile.profitPerHour > 0) {
        const earnings = Math.floor(profile.profitPerHour / 60);
        profile.coins += earnings;
        showNotification(`Пассивный доход: +${earnings} монет 💸`);
        updateProfile();
    }
}

setInterval(earnPassiveIncome, 60000);

document.addEventListener('DOMContentLoaded', calculateOfflineEnergy);