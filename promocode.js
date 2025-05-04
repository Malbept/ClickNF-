
// promocode.js
window.getPromoCodes = function() {
    return window.promoCodes || []; // Загружаем из promo-data.js
};

window.activatePromoCode = function(code) {
    console.log('Активация промокода:', code); // Отладка
    if (!window.profile) {
        console.error('window.profile не определён!');
        return { success: false, message: 'Ошибка: профиль не загружен! 😿' };
    }
    if (!window.profile.claimedPromoCodes) {
        window.profile.claimedPromoCodes = [];
    }
    const promo = window.getPromoCodes().find(p => p.code === code);
    if (!promo) {
        return { success: false, message: 'Промокод не найден! 😿' };
    }
    if (window.profile.claimedPromoCodes.includes(code)) {
        return { success: false, message: 'Ты уже активировал этот промокод! 😿' };
    }
    if (promo.type === 'coins') {
        window.profile.coins += promo.amount;
    } else if (promo.type === 'energy') {
        window.profile.energy = Math.min(
            window.profile.energy + promo.amount,
            window.profile.energyUpgradeLevel > 0 ? window.profile.maxEnergyUpgraded : window.profile.maxEnergy
        );
    } else if (promo.type === 'xp') {
        window.profile.xp += promo.amount;
        if (window.checkLevelUp) {
            window.checkLevelUp();
        } else {
            console.warn('checkLevelUp не определён');
        }
    } else if (promo.type === 'pet_upgrade') {
        if (!window.profile.pets || window.profile.pets.length === 0) {
            return { success: false, message: 'Нет питомцев для улучшения! 🐾' };
        }
        window.profile.pets.forEach(pet => {
            pet.level = (pet.level || 1) + promo.amount;
        });
        window.calculateProfitPerHour();
    }
    window.profile.claimedPromoCodes.push(code);
    if (window.updateProfile) {
        window.updateProfile();
    } else {
        console.error('updateProfile не определён!');
    }
    if (window.saveProfile) {
        window.saveProfile();
    } else {
        console.warn('saveProfile не определён');
    }
    window.updateQuests(); // Обновляем квесты
    return {
        success: true,
        message: `Промокод активирован! ${
            promo.type === 'coins' ? `+${promo.amount} монет 💰` :
            promo.type === 'energy' ? `+${promo.amount} энергии ⚡` :
            promo.type === 'xp' ? `+${promo.amount} XP 📈` :
            `Все питомцы улучшены на ${promo.amount} уровень 🐾`
        }`
    };
};

window.showBonuses = function() {
    console.log('Открытие раздела Бонусы'); // Отладка
    document.getElementById('main-content').innerHTML = `
        <button class="back-button hk-button" onclick="goBack()">Назад ⬅️</button>
        <h2>Бонусы 🎁</h2>
        <div class="promo-section">
            <p>Введите промокод для получения бонусов!</p>
            <input type="text" id="promoCodeInput" placeholder="Введите промокод (например, vasya)" style="width: 200px;">
            <button class="hk-button" onclick="claimPromoCode()">Активировать промокод</button>
        </div>
    `;
    window.historyStack.push('showBonuses');
};

window.claimPromoCode = function() {
    const code = document.getElementById('promoCodeInput').value.trim();
    console.log('Попытка активации промокода:', code); // Отладка
    if (!code) {
        window.showNotification('Введите промокод!');
        return;
    }
    const result = window.activatePromoCode(code);
    window.showNotification(result.message);
};
