
// game-mini.js
window.clickTapButton = function() {
    if (profile.energy < 1) {
        showNotification('Недостаточно энергии! ⚡');
        return;
    }
    profile.coins += profile.multitapLevel;
    profile.energy -= 1;
    profile.clicks += 1;
    showNotification(`+${profile.multitapLevel} монет!`);
    updateProfile();
};
window.checkLevelUp = function() {
    while (profile.xp >= profile.level * 100 && profile.level < profile.maxLevel) {
        profile.xp -= profile.level * 100;
        profile.level++;
        showNotification(`Поздравляем! Ты достиг уровня ${profile.level}! 🎉`);
    }
    updateProfile();
};
window.checkAchievements = function() {
    // Заглушка
};
window.checkQuests = function(type) {
    // Заглушка
};
window.checkSecret = function(type) {
    // Заглушка
};
window.spinWheel = function() {
    const rewards = [0, 10, 50, 100, 500, 1000];
    const reward = rewards[Math.floor(Math.random() * rewards.length)];
    document.getElementById('main-content').innerHTML = `
        <button class="back-button hk-button" onclick="goBack()">Назад ⬅️</button>
        <h2>Колесо удачи 🎡</h2>
        <p>Ты выиграл: ${reward} монет!</p>
    `;
    if (!historyStack.includes('spinWheel')) {
        historyStack.push('spinWheel');
    }
    const finalReward = Math.floor(reward * (1 + profile.level * 0.1));
    profile.coins += finalReward;
    let xp = reward > 0 ? (profile.event && profile.event.effect === 'double_xp' ? 40 : 20) : 5;
    profile.xp += xp;
    profile.stats.roulette_games++;
    showNotification(`+${finalReward} монет! 🎉 +${xp} XP`);
    checkAchievements();
    checkQuests('spin_wheel');
    checkLevelUp();
    updateProfile();
};
window.earnCoins = function() {
    updateEnergy();
    if (profile.energy < 1) {
        showNotification('Недостаточно энергии! ⚡');
        return;
    }
    profile.energy--;
    const coins = Math.floor(50 * (1 + (profile.earn_boost || 0)) * (1 + profile.level * 0.1));
    profile.coins += coins;
    let xp = profile.event && profile.event.effect === 'double_xp' ? 20 : 10;
    profile.xp += xp;
    profile.stats.quests_completed++;
    showNotification(`+${coins} монет! 💸 +${xp} XP`);
    checkQuests('earn_coins');
    checkLevelUp();
    showEarn();
    updateProfile();
};
window.showEarn = function() {
    document.getElementById('main-content').innerHTML = `
        <button class="back-button hk-button" onclick="goBack()">Назад ⬅️</button>
        <h2>Заработок 💸</h2>
        <button class="hk-button" onclick="earnCoins()">Заработать монеты</button>
    `;
    historyStack.push('showEarn');
};
window.watchAd = function() {
    setTimeout(() => {
        profile.coins += 50;
        showNotification('Реклама просмотрена! +50 монет 🎉');
        showRewards();
        updateProfile();
    }, 2000);
    showNotification('Просмотр рекламы...');
};
window.buyBoost = function(type) {
    if (type === 'energy' && profile.coins >= 50) {
        profile.coins -= 50;
        profile.energy = profile.energyUpgradeLevel > 0 ? profile.maxEnergyUpgraded : profile.maxEnergy;
        showNotification('Энергия полностью восстановлена! ⚡');
    } else if (type === 'profit' && profile.coins >= 100) {
        profile.coins -= 100;
        const originalProfit = profile.profitPerHour;
        profile.profitPerHour *= 2;
        setTimeout(() => {
            profile.profitPerHour = originalProfit;
            showNotification('Эффект удвоения прибыли закончился! 📉');
            updateProfile();
        }, 300000);
        showNotification('Прибыль удвоена на 5 минут! 📈');
    } else {
        showNotification('Недостаточно монет! 💰');
    }
    showBoosts();
    updateProfile();
};
window.showBoosts = function() {
    document.getElementById('main-content').innerHTML = `
        <button class="back-button hk-button" onclick="goBack()">Назад ⬅️</button>
        <h2>Бусты 🚀</h2>
        <div class="upgrade">
            <div class="upgrade-info">
                <p>Полная энергия</p>
                <p>Восстанавливает всю энергию</p>
            </div>
            <button class="upgrade-button hk-button ${profile.coins < 50 ? 'disabled' : ''}" onclick="buyBoost('energy')">Купить за 50</button>
        </div>
        <div class="upgrade">
            <div class="upgrade-info">
                <p>Удвоить прибыль</p>
                <p>Удваивает прибыль/ч на 5 минут</p>
            </div>
            <button class="upgrade-button hk-button ${profile.coins < 100 ? 'disabled' : ''}" onclick="buyBoost('profit')">Купить за 100</button>
        </div>
    `;
    window.historyStack.push('showBoosts');
};
