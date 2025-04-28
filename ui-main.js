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
        exchange: [{ name: 'Трейдер', level: 0, cost: 100, profitPerHour: 10 }],
        mine: [{ name: 'Майнер', level: 0, cost: 150, profitPerHour: 15 }],
        friends: [{ name: 'Реферал', level: 0, cost: 200, profitPerHour: 20 }],
        earn: [{ name: 'Задание', level: 0, cost: 250, profitPerHour: 25 }],
        airdrop: [{ name: 'Эйрдроп', level: 0, cost: 300, profitPerHour: 30 }]
    },
    theme: 'dark',
    stats: { clicker_games: 0 },
    event: null,
    xp: 0,
    clicks: 0,
    claimedBonuses: []
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

    // Обновляем информацию в основном контенте (на главном экране и в разделах)
    const mainContent = document.getElementById('main-content');
    const profileDiv = mainContent.querySelector('.profile-info');
    if (profileDiv) {
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
        <div class="profile-info">
            <h1 id="coin-counter">${window.profile.coins.toLocaleString()}</h1>
            <p>Мультитап: ${window.profile.multitapLevel}/${window.profile.maxMultitap} 👆</p>
        </div>
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
        upgrade.cost = Math.floor(upgrade.cost * 1.5);
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

// Раздел "Бонусы"
window.showBonuses = function() {
    document.getElementById('main-content').innerHTML = `
        <button class="back-button hk-button" onclick="goBack()">Назад ⬅️</button>
        <h2>Бонусы 🎁</h2>
        <p>Введите код бонуса:</p>
        <input type="text" id="bonusCode" placeholder="Код бонуса">
        <button class="hk-button" onclick="claimBonusFromCode()">Залутать бонус</button>
        <div class="profile-info">
            <h1 id="coin-counter">${window.profile.coins.toLocaleString()}</h1>
            <p>Мультитап: ${window.profile.multitapLevel}/${window.profile.maxMultitap} 👆</p>
        </div>
    `;
    window.historyStack.push('showBonuses');
};

window.claimBonusFromCode = function() {
    const bonusId = document.getElementById('bonusCode').value;
    const telegramUserId = window.Telegram && window.Telegram.WebApp ? window.Telegram.WebApp.initDataUnsafe.user?.id || "test_user" : "test_user";
    const result = window.claimBonus(bonusId, telegramUserId);
    window.showNotification(result.message);
};

// Админ-панель
window.showAdminPanel = function() {
    document.getElementById('main-content').innerHTML = `
        <button class="back-button hk-button" onclick="goBack()">Назад ⬅️</button>
        <h2>Админ 🔧</h2>
        <p>Создать бонус:</p>
        <select id="bonusType">
            <option value="coins">Монеты 💰</option>
            <option value="energy">Энергия ⚡</option>
            <option value="xp">XP 📈</option>
        </select>
        <input type="number" id="bonusAmount" placeholder="Количество" min="1">
        <button class="hk-button" onclick="createBonus(document.getElementById('bonusType').value, parseInt(document.getElementById('bonusAmount').value))">Опубликовать бонус</button>
        <div class="profile-info">
            <h1 id="coin-counter">${window.profile.coins.toLocaleString()}</h1>
            <p>Мультитап: ${window.profile.multitapLevel}/${window.profile.maxMultitap} 👆</p>
        </div>
    `;
    window.historyStack.push('showAdminPanel');
};

// Простые заглушки для навигации
window.showGames = function() {
    document.getElementById('main-content').innerHTML = `
        <button class="back-button hk-button" onclick="goBack()">Назад ⬅️</button>
        <h2>Казино 🎰</h2>
        <p>Скоро здесь появятся игры!</p>
        <div class="profile-info">
            <h1 id="coin-counter">${window.profile.coins.toLocaleString()}</h1>
            <p>Мультитап: ${window.profile.multitapLevel}/${window.profile.maxMultitap} 👆</p>
        </div>
    `;
    window.historyStack.push('showGames');
};

window.showRewards = function() {
    document.getElementById('main-content').innerHTML = `
        <button class="back-button hk-button" onclick="goBack()">Назад ⬅️</button>
        <h2>Награды 🎁</h2>
        <p>Скоро здесь появятся награды!</p>
        <div class="profile-info">
            <h1 id="coin-counter">${window.profile.coins.toLocaleString()}</h1>
            <p>Мультитап: ${window.profile.multitapLevel}/${window.profile.maxMultitap} 👆</p>
        </div>
    `;
    window.historyStack.push('showRewards');
};

window.showFriends = function() {
    document.getElementById('main-content').innerHTML = `
        <button class="back-button hk-button" onclick="goBack()">Назад ⬅️</button>
        <h2>Друзья 👥</h2>
        <p>Приглашайте друзей и получайте бонусы!</p>
        <div class="profile-info">
            <h1 id="coin-counter">${window.profile.coins.toLocaleString()}</h1>
            <p>Мультитап: ${window.profile.multitapLevel}/${window.profile.maxMultitap} 👆</p>
        </div>
    `;
    window.historyStack.push('showFriends');
};

window.showBoosts = function() {
    document.getElementById('main-content').innerHTML = `
        <button class="back-button hk-button" onclick="goBack()">Назад ⬅️</button>
        <h2>Буст 🚀</h2>
        <p>Скоро здесь появятся бусты!</p>
        <div class="profile-info">
            <h1 id="coin-counter">${window.profile.coins.toLocaleString()}</h1>
            <p>Мультитап: ${window.profile.multitapLevel}/${window.profile.maxMultitap} 👆</p>
        </div>
    `;
    window.historyStack.push('showBoosts');
};