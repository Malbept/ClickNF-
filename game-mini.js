// Массив достижений
window.achievements = [
    { id: 'coins_1000', name: 'Богач', description: 'Собери 1000 монет', condition: () => window.profile.coins >= 1000, reward: 50, completed: false },
    { id: 'clicks_100', name: 'Тап Мастер', description: 'Сделай 100 кликов', condition: () => window.profile.clicks >= 100, reward: 30, completed: false },
    { id: 'level_5', name: 'Прогрессор', description: 'Достигни 5 уровня', condition: () => window.profile.level >= 5, reward: 100, completed: false },
];

// Массив бонусов
window.bonuses = [];

// Функция для создания и публикации бонуса
window.createBonus = function(rewardType, rewardAmount) {
    const bonusId = Date.now().toString();
    const bonus = {
        id: bonusId,
        type: rewardType,
        amount: rewardAmount,
        claimedBy: []
    };
    window.bonuses.push(bonus);

    const botToken = "7234958924:AAHCz8bNVMTWzoDF0DEeUhXr6eoF57Vpcl0";
    const chatId = "-1002648217133";
    const message = `🎁 Новый бонус! Получи ${rewardAmount} ${rewardType === 'coins' ? 'монет 💰' : rewardType === 'energy' ? 'энергии ⚡' : 'XP 📈'}! Код: ${bonusId}`;

    fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            chat_id: chatId,
            text: message,
            parse_mode: "Markdown"
        })
    })
    .then(response => response.json())
    .then(data => {
        if (data.ok) {
            window.showNotification(`Бонус опубликован! Код: ${bonusId}`);
        } else {
            window.showNotification("Ошибка при публикации бонуса!");
            console.error("Ошибка:", data);
        }
    })
    .catch(error => {
        window.showNotification("Ошибка при отправке в Telegram!");
        console.error("Ошибка:", error);
    });

    return bonusId;
};

// Функция для забора бонуса
window.claimBonus = function(bonusId, telegramUserId) {
    const bonus = window.bonuses.find(b => b.id === bonusId);
    if (!bonus) {
        return { success: false, message: "Бонус не найден!" };
    }

    if (window.profile.claimedBonuses.includes(bonusId)) {
        return { success: false, message: "Ты уже забрал этот бонус!" };
    }

    if (bonus.type === 'coins') {
        window.profile.coins += bonus.amount;
    } else if (bonus.type === 'energy') {
        window.profile.energy = Math.min(window.profile.energy + bonus.amount, window.profile.maxEnergy);
    } else if (bonus.type === 'xp') {
        window.profile.xp += bonus.amount;
        window.checkLevelUp();
    }

    window.profile.claimedBonuses.push(bonusId);
    bonus.claimedBy.push(telegramUserId);
    window.updateProfile();
    window.saveProfile();

    return { success: true, message: `Бонус получен! +${bonus.amount} ${bonus.type === 'coins' ? 'монет 💰' : bonus.type === 'energy' ? 'энергии ⚡' : 'XP 📈'}` };
};

// Обновление энергии
window.updateEnergy = function() {
    const maxEnergy = window.profile.energyUpgradeLevel > 0 ? window.profile.maxEnergyUpgraded : window.profile.maxEnergy;
    if (window.profile.energy < maxEnergy) {
        window.profile.energy = Math.min(window.profile.energy + 1, maxEnergy);
        window.updateProfile();
    }
};

// Логика кнопки тапа (только на главном экране)
window.clickTapButton = function(event) {
    window.updateEnergy();
    const maxEnergy = window.profile.energyUpgradeLevel > 0 ? window.profile.maxEnergyUpgraded : window.profile.maxEnergy;
    if (window.profile.energy < 1) {
        window.showNotification('Недостаточно энергии! ⚡');
        const tapButton = document.getElementById('tap-button');
        tapButton.style.background = 'radial-gradient(circle, rgba(255, 0, 0, 0.5) 0%, transparent 70%)';
        setTimeout(() => {
            tapButton.style.background = 'radial-gradient(circle, rgba(255, 140, 0, 0.3) 0%, transparent 70%)';
        }, 500);
        return;
    }
    window.profile.energy--;
    window.profile.clicks++;
    const coins = Math.floor(5 * window.profile.multitapLevel * (1 + window.profile.level * 0.1));
    window.profile.coins += coins;
    window.profile.xp += 10;

    const tapContainer = document.getElementById('tap-container');
    const offsetX = (Math.random() * 60 - 30);
    const offsetY = (Math.random() * 60 - 30);
    const tapText = document.createElement('div');
    tapText.className = 'tap-animation';
    tapText.innerText = `+${coins}`;
    tapText.style.left = `calc(50% + ${offsetX}px)`;
    tapText.style.top = `calc(50% + ${offsetY}px)`;
    tapContainer.appendChild(tapText);

    window.showNotification(`+${coins} монет! 😈`);
    window.checkLevelUp();
    window.checkAchievements();
    window.updateProfile();
};

// Игра "Камень-Ножницы-Бумага"
window.playRockPaperScissors = function() {
    window.updateEnergy();
    const maxEnergy = window.profile.energyUpgradeLevel > 0 ? window.profile.maxEnergyUpgraded : window.profile.maxEnergy;
    if (window.profile.energy < 1) {
        window.showNotification('Недостаточно энергии! ⚡');
        return;
    }
    window.profile.energy--;
    const progress = Math.floor((window.profile.xp / (window.profile.level * 100)) * 100);
    document.getElementById('main-content').innerHTML = `
        <button class="back-button hk-button" onclick="goBack()">Назад ⬅️</button>
        <h2>Камень-Ножницы-Бумага ✊✂️📜</h2>
        <button class="action hk-button" onclick="playRPS('камень')">Камень ✊</button>
        <button class="action hk-button" onclick="playRPS('ножницы')">Ножницы ✂️</button>
        <button class="action hk-button" onclick="playRPS('бумага')">Бумага 📜</button>
        <div class="profile-info">
            <h1 id="coin-counter">${window.profile.coins.toLocaleString()}</h1>
            <p>Мультитап: ${window.profile.multitapLevel}/${window.profile.maxMultitap} 👆</p>
            <div id="level-info">
                <span>GOLD ${window.profile.level}/${window.profile.maxLevel}</span>
                <div id="level-progress" style="width: ${progress}%;"></div>
                <span id="profit-per-hour">${window.profile.profitPerHour.toLocaleString()}</span>
            </div>
        </div>
    `;
    window.historyStack.push('playRockPaperScissors');
};

window.playRPS = function(playerChoice) {
    const choices = ['камень', 'ножницы', 'бумага'];
    const botChoice = choices[Math.floor(Math.random() * choices.length)];
    let result = '';
    if (playerChoice === botChoice) {
        result = 'Ничья! 🤝';
        window.profile.xp += 5;
    } else if (
        (playerChoice === 'камень' && botChoice === 'ножницы') ||
        (playerChoice === 'ножницы' && botChoice === 'бумага') ||
        (playerChoice === 'бумага' && botChoice === 'камень')
    ) {
        result = 'Победа! +50 монет 🎉';
        const reward = Math.floor(50 * (1 + window.profile.level * 0.1));
        window.profile.coins += reward;
        let xp = window.profile.event && window.profile.event.effect === 'double_xp' ? 60 : 30;
        window.profile.xp += xp;
        window.showNotification(`Победа! +${reward} монет 🎉 +${xp} XP`);
        window.checkLevelUp();
    } else {
        result = 'Проигрыш! 😿';
        window.profile.xp += 10;
    }
    const progress = Math.floor((window.profile.xp / (window.profile.level * 100)) * 100);
    document.getElementById('main-content').innerHTML = `
        <button class="back-button hk-button" onclick="goBack()">Назад ⬅️</button>
        <h2>Камень-Ножницы-Бумага ✊✂️📜</h2>
        <p>Твой выбор: ${playerChoice}</p>
        <p>Выбор бота: ${botChoice}</p>
        <p>${result}</p>
        <div class="profile-info">
            <h1 id="coin-counter">${window.profile.coins.toLocaleString()}</h1>
            <p>Мультитап: ${window.profile.multitapLevel}/${window.profile.maxMultitap} 👆</p>
            <div id="level-info">
                <span>GOLD ${window.profile.level}/${window.profile.maxLevel}</span>
                <div id="level-progress" style="width: ${progress}%;"></div>
                <span id="profit-per-hour">${window.profile.profitPerHour.toLocaleString()}</span>
            </div>
        </div>
    `;
    window.checkLevelUp();
    window.updateProfile();
};

// Игра "Угадай число"
window.playGuessNumber = function() {
    window.updateEnergy();
    const maxEnergy = window.profile.energyUpgradeLevel > 0 ? window.profile.maxEnergyUpgraded : window.profile.maxEnergy;
    if (window.profile.energy < 1) {
        window.showNotification('Недостаточно энергии! ⚡');
        return;
    }
    window.profile.energy--;
    const number = Math.floor(Math.random() * 10) + 1;
    const progress = Math.floor((window.profile.xp / (window.profile.level * 100)) * 100);
    document.getElementById('main-content').innerHTML = `
        <button class="back-button hk-button" onclick="goBack()">Назад ⬅️</button>
        <h2>Угадай число 🔢</h2>
        <p>Угадай число от 1 до 10:</p>
        <input id="guessInput" type="number" min="1" max="10">
        <button class="action hk-button" onclick="guessNumber(${number})">Угадать</button>
        <div class="profile-info">
            <h1 id="coin-counter">${window.profile.coins.toLocaleString()}</h1>
            <p>Мультитап: ${window.profile.multitapLevel}/${window.profile.maxMultitap} 👆</p>
            <div id="level-info">
                <span>GOLD ${window.profile.level}/${window.profile.maxLevel}</span>
                <div id="level-progress" style="width: ${progress}%;"></div>
                <span id="profit-per-hour">${window.profile.profitPerHour.toLocaleString()}</span>
            </div>
        </div>
    `;
    window.historyStack.push('playGuessNumber');
};

window.guessNumber = function(correctNumber) {
    const guess = parseInt(document.getElementById('guessInput').value);
    const progress = Math.floor((window.profile.xp / (window.profile.level * 100)) * 100);
    if (guess === correctNumber) {
        const reward = Math.floor(75 * (1 + window.profile.level * 0.1));
        window.profile.coins += reward;
        let xp = window.profile.event && window.profile.event.effect === 'double_xp' ? 100 : 50;
        window.profile.xp += xp;
        window.showNotification(`Правильно! +${reward} монет 🎉 +${xp} XP`);
        window.checkLevelUp();
        window.showGames();
    } else {
        window.profile.xp += 20;
        document.getElementById('main-content').innerHTML = `
            <button class="back-button hk-button" onclick="goBack()">Назад ⬅️</button>
            <h2>Угадай число 🔢</h2>
            <p>Неправильно! Число было: ${correctNumber}</p>
            <div class="profile-info">
                <h1 id="coin-counter">${window.profile.coins.toLocaleString()}</h1>
                <p>Мультитап: ${window.profile.multitapLevel}/${window.profile.maxMultitap} 👆</p>
                <div id="level-info">
                    <span>GOLD ${window.profile.level}/${window.profile.maxLevel}</span>
                    <div id="level-progress" style="width: ${progress}%;"></div>
                    <span id="profit-per-hour">${window.profile.profitPerHour.toLocaleString()}</span>
                </div>
            </div>
        `;
        window.checkLevelUp();
    }
    window.updateProfile();
};

// Проверка повышения уровня
window.checkLevelUp = function() {
    const xpNeeded = window.profile.level * 100;
    if (window.profile.xp >= xpNeeded && window.profile.level < window.profile.maxLevel) {
        window.profile.level++;
        window.profile.xp -= xpNeeded;
        window.showNotification(`Поздравляем! Новый уровень: ${window.profile.level}! 🎉`);
        window.updateProfile();
    }
};

// Проверка достижений
window.checkAchievements = function() {
    window.achievements.forEach(achievement => {
        if (!achievement.completed && achievement.condition()) {
            achievement.completed = true;
            window.profile.coins += achievement.reward;
            window.showNotification(`Достижение разблокировано: ${achievement.name}! +${achievement.reward} монет 🎉`);
            window.updateProfile();
            window.saveProfile();
        }
    });
};

// Проверка квестов (заглушка)
window.checkQuests = function(type) {
    // Здесь можно добавить логику квестов в будущем
};