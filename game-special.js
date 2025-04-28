function startTreasureHunt() {
    updateEnergy();
    if (profile.energy < 1) {
        showNotification('Недостаточно энергии! ⚡');
        return;
    }
    profile.energy--;
    const rewards = [50, 100, 150, 200];
    const reward = rewards[Math.floor(Math.random() * rewards.length)];
    document.getElementById('main-content').innerHTML = `
        <button class="back-button glass-button" onclick="goBack()">Назад ⬅️</button>
        <h2>Поиск сокровищ 🔍</h2>
        <p>Сокровище найдено! +${reward} монет</p>
    `;
    if (!historyStack.includes('startTreasureHunt')) {
        historyStack.push('startTreasureHunt');
    }
    const finalReward = Math.floor(reward * (1 + profile.level * 0.1));
    profile.coins += finalReward;
    let xp = profile.event && profile.event.effect === 'double_xp' ? 60 : 30;
    profile.xp += xp;
    profile.stats.treasure_hunts++;
    showNotification(`Сокровище найдено! +${finalReward} монет 🪙 +${xp} XP`);
    checkAchievements();
    checkQuests('treasure_hunt');
    checkLevelUp();
    updateProfile();
}

function spinWheel() {
    updateEnergy();
    if (profile.energy < 1) {
        showNotification('Недостаточно энергии! ⚡');
        return;
    }
    profile.energy--;
    const rewards = [10, 50, 100, 0, 200, 500];
    const reward = rewards[Math.floor(Math.random() * rewards.length)];
    document.getElementById('main-content').innerHTML = `
        <button class="back-button glass-button" onclick="goBack()">Назад ⬅️</button>
        <h2>Колесо фортуны 🎡</h2>
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
}

function earnCoins() {
    updateEnergy();
    if (profile.energy < 1) {
        showNotification('Недостаточно энергии! ⚡');
        return;
    }
    profile.energy--;
    const coins = Math.floor(50 * (1 + profile.earn_boost) * (1 + profile.level * 0.1));
    profile.coins += coins;
    let xp = profile.event && profile.event.effect === 'double_xp' ? 20 : 10;
    profile.xp += xp;
    profile.stats.quests_completed++;
    showNotification(`+${coins} монет! 💸 +${xp} XP`);
    checkQuests('earn_coins');
    checkLevelUp();
    showEarn();
    updateProfile();
}

function watchAd() {
    setTimeout(() => {
        profile.coins += 50;
        showNotification('Реклама просмотрена! +50 монет 🎉');
        showRewards();
        updateProfile();
    }, 2000);
    showNotification('Просмотр рекламы...');
}

function showBoosts() {
    document.getElementById('main-content').innerHTML = `
        <button class="back-button glass-button" onclick="goBack()">Назад ⬅️</button>
        <h2>Бусты 🚀</h2>
        <button class="action glass-button" onclick="buyBoost('energy')">Полная энергия (50 монет)</button>
        <button class="action glass-button" onclick="buyBoost('profit')">Удвоить прибыль (100 монет)</button>
    `;
    historyStack.push('showBoosts');
}

function buyBoost(type) {
    if (type === 'energy' && profile.coins >= 50) {
        profile.coins -= 50;
        profile.energy = profile.maxEnergy;
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
}