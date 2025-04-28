// Функция для получения списка промокодов из promo.js
window.getPromoCodes = function() {
    return window.promoCodes; // promoCodes будет определён в promo.js
};

// Функция для активации промокода
window.activatePromoCode = function(code) {
    const promo = window.getPromoCodes().find(p => p.code === code);
    if (!promo) {
        return { success: false, message: "Промокод не найден! 😿" };
    }

    if (window.profile.claimedPromoCodes.includes(code)) {
        return { success: false, message: "Ты уже активировал этот промокод! 😿" };
    }

    // Применяем награду
    if (promo.type === 'coins') {
        window.profile.coins += promo.amount;
    } else if (promo.type === 'energy') {
        window.profile.energy = Math.min(window.profile.energy + promo.amount, window.profile.energyUpgradeLevel > 0 ? window.profile.maxEnergyUpgraded : window.profile.maxEnergy);
    } else if (promo.type === 'xp') {
        window.profile.xp += promo.amount;
        window.checkLevelUp();
    }

    window.profile.claimedPromoCodes.push(code);
    window.updateProfile();
    window.saveProfile();

    return { success: true, message: `Промокод активирован! +${promo.amount} ${promo.type === 'coins' ? 'монет 💰' : promo.type === 'energy' ? 'энергии ⚡' : 'XP 📈'}` };
};

// Обновим раздел "Бонусы" для работы с промокодами
window.showBonuses = function() {
    document.getElementById('main-content').innerHTML = `
        <button class="back-button hk-button" onclick="goBack()">Назад ⬅️</button>
        <h2>Бонусы 🎁</h2>
        <p>Введите промокод:</p>
        <input type="text" id="promoCodeInput" placeholder="Введите промокод">
        <button class="hk-button" onclick="claimPromoCode()">Активировать</button>
        <div class="profile-info">
            <h1 id="coin-counter">${window.profile.coins.toLocaleString()}</h1>
            <p>Мультитап: ${window.profile.multitapLevel}/${window.profile.maxMultitap} 👆</p>
        </div>
    `;
    window.historyStack.push('showBonuses');
};

window.claimPromoCode = function() {
    const code = document.getElementById('promoCodeInput').value.trim();
    if (!code) {
        window.showNotification("Введите промокод!");
        return;
    }
    const result = window.activatePromoCode(code);
    window.showNotification(result.message);
};