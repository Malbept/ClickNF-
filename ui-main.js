// Глобальная функция уведомлений
window.showNotification = function(message) {
    const notification = document.createElement('div');
    notification.className = 'notification';
    notification.innerText = message;
    document.body.appendChild(notification);
    setTimeout(() => {
        notification.remove();
    }, 3000);
};

// Глобальные функции и переменные
window.historyStack = ['main'];

// Начальный профиль
window.profile = {
    username: 'Аноним',
    coins: 0,
    energy: 100,
    maxEnergy: 100,
    maxEnergyUpgraded: 100000,
    energyUpgradeLevel: 0,
    multitapLevel: 1,
    maxMultitap: 10,
    level: 1,
    maxLevel: 10,
    profitPerHour: 0,
    upgrades: {
        exchange: [{ name: 'Трейдер', level: 0, cost: 1000, profitPerHour: 10 }],
        mine: [{ name: 'Майнер', level: 0, cost: 1500, profitPerHour: 15 }],
        friends: [{ name: 'Реферал', level: 0, cost: 2000, profitPerHour: 20 }],
        earn: [{ name: 'Задание', level: 0, cost: 2500, profitPerHour: 25 }],
        airdrop: [{ name: 'Эйрдроп', level: 0, cost: 3000, profitPerHour: 30 }]
    },
    theme: 'dark',
    stats: { clicker_games: 0 },
    event: null,
    xp: 0,
    clicks: 0,
    claimedBonuses: [],
    claimedPromoCodes: [] // Добавляем для хранения активированных промокодов
};

// Загрузка профиля из localStorage
window.loadProfile = function() {
    const savedProfile = localStorage.getItem('hamsterProfile');
    if (savedProfile) {
        window.profile = JSON.parse(savedProfile);
    }
};

// Сохранение профиля в localStorage
window.saveProfile = function() {
    localStorage.setItem('hamsterProfile', JSON.stringify(window.profile));
};

// Обновление профиля
window.updateProfile = function() {
    const progress = Math.floor((window.profile.xp / (window.profile.level * 100)) * 100);

    // Обновляем верхнюю статистику
    const topStats = document.getElementById('top-stats');
    if (topStats) {
        topStats.innerHTML = `
            <div id="level-info">
                <span>GOLD ${window.profile.level}/${window.profile.maxLevel}</span>
                <div id="level-progress" style="width: ${progress}%;"></div>
                <span id="profit-per-hour">${window.profile.profitPerHour.toLocaleString()}</span>
            </div>
            <button id="settings-button" onclick="showOther()">⚙️</button>
        `;
    }

    // Обновляем информацию в основном контенте (только на главном экране)
    const mainContent = document.getElementById('main-content');
    const profileDiv = mainContent.querySelector('.profile-info');
    if (profileDiv && window.historyStack[window.historyStack.length - 1] === 'main') {
        profileDiv.innerHTML = `
            <h1 id="coin-counter">${window.profile.coins.toLocaleString()}</h1>
            <p>Мультитап: ${window.profile.multitapLevel}/${window.profile.maxMultitap} 👆</p>
        `;
    }

    const energyCounter = document.getElementById('energy-counter');
    if (energyCounter) {
        const maxEnergy = window.profile.energyUpgradeLevel > 0 ? window.profile.maxEnergyUpgraded : window.profile.maxEnergy;
        energyCounter.innerHTML = `${window.profile.energy}/${maxEnergy}`;
    }

    window.saveProfile();
};

// Применение темы
window.applyTheme = function() {
    document.body.className = '';
    document.body.classList.add(`${window.profile.theme}-theme`);
};

// Главный экран
window.showMain = function() {
    const progress = Math.floor((window.profile.xp / (window.profile.level * 100)) * 100);
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
        </div>
    `;
    window.historyStack = ['main'];
    window.updateProfile();
    window.applyTheme();

    document.getElementById('tap-button').addEventListener('click', window.clickTapButton);
};

// Вкладки (Биржа, Майнинг и т.д.)
window.showTab = function(tabName) {
    const upgrades = window.profile.upgrades[tabName] || [];
    document.getElementById('main-content').innerHTML = `
        <button class="back-button hk-button" onclick="goBack()">Назад ⬅️</button>
        <h2>${tabName === 'exchange' ? 'Биржа' : tabName === 'mine' ? 'Майнинг' : tabName === 'friends' ? 'Друзья' : tabName === 'earn' ? 'Заработок' : 'Эйрдроп'}</h2>
        ${upgrades.map((upgrade, index) => `
            <div class="upgrade">
                <div class="upgrade-icon">📈</div>
                <div class="upgrade-info">
                    <p>${upgrade.name} (Lv ${upgrade.level})</p>
                    <p>Прибыль/ч: +${upgrade.profitPerHour.toLocaleString()}</p>
                </div>
                <button class="upgrade-button hk-button ${window.profile.coins < upgrade.cost ? 'disabled' : ''}" onclick="buyUpgrade('${tabName}', ${index})">Купить за ${upgrade.cost.toLocaleString()}</button>
            </div>
        `).join('')}
    `;
    window.historyStack.push(`showTab('${tabName}')`);
    window.updateProfile();

    document.querySelectorAll('.tab-button').forEach(button => {
        button.classList.remove('active');
        if (button.textContent === (tabName === 'exchange' ? 'Биржа' : tabName === 'mine' ? 'Майнинг' : tabName === 'friends' ? 'Друзья' : tabName === 'earn' ? 'Заработок' : 'Эйрдроп')) {
            button.classList.add('active');
        }
    });
};

// Покупка улучшений
window.buyUpgrade = function(tabName, index) {
    const upgrade = window.profile.upgrades[tabName][index];
    if (window.profile.coins >= upgrade.cost) {
        window.profile.coins -= upgrade.cost;
        upgrade.level++;
        window.calculateProfitPerHour();
        upgrade.cost = Math.floor(upgrade.cost * 2); // Увеличиваем цену в 2 раза
        window.showNotification(`Улучшение ${upgrade.name} куплено! +${upgrade.profitPerHour.toLocaleString()} к прибыли/ч 📈`);
        window.profile.xp += 50;
        window.checkLevelUp();
        window.checkAchievements();
        window.showTab(tabName);
        window.updateProfile();
    } else {
        window.showNotification('Недостаточно монет! 💰');
    }
};

// Расчёт прибыли в час
window.calculateProfitPerHour = function() {
    let total = 0;
    for (let tab in window.profile.upgrades) {
        window.profile.upgrades[tab].forEach(upgrade => {
            total += upgrade.level * upgrade.profitPerHour;
        });
    }
    window.profile.profitPerHour = total;
};

// Простые заглушки для навигации
window.showGames = function() {
    document.getElementById('main-content').innerHTML = `
        <button class="back-button hk-button" onclick="goBack()">Назад ⬅️</button>
        <h2>Казино 🎰</h2>
        <p>Скоро здесь появятся игры!</p>
    `;
    window.historyStack.push('showGames');
};

window.showRewards = function() {
    document.getElementById('main-content').innerHTML = `
        <button class="back-button hk-button" onclick="goBack()">Назад ⬅️</button>
        <h2>Награды 🎁</h2>
        <p>Скоро здесь появятся награды!</p>
    `;
    window.historyStack.push('showRewards');
};

window.showFriends = function() {
    document.getElementById('main-content').innerHTML = `
        <button class="back-button hk-button" onclick="goBack()">Назад ⬅️</button>
        <h2>Друзья 👥</h2>
        <p>Приглашайте друзей и получайте бонусы!</p>
    `;
    window.historyStack.push('showFriends');
};

window.showBoosts = function() {
    document.getElementById('main-content').innerHTML = `
        <button class="back-button hk-button" onclick="goBack()">Назад ⬅️</button>
        <h2>Буст 🚀</h2>
        <p>Скоро здесь появятся бусты!</p>
    `;
    window.historyStack.push('showBoosts');
};