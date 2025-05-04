
// ui-main2.js
window.showShop = function() {
    document.getElementById('main-content').innerHTML = `
        <button class="back-button hk-button" onclick="goBack()">Назад ⬅️</button>
        <h2>Магазин 🏬</h2>
        <div class="shop-tabs">
            <button class="tab-button" onclick="showRealEstate()">Недвижимость 🏠</button>
            <button class="tab-button" onclick="showMovables()">Движимость 🚗</button>
            <button class="tab-button" onclick="showPets()">Питомцы 🐾</button>
            <button class="tab-button" onclick="showUpgrades()">Улучшения ⚙️</button>
            <button class="tab-button" onclick="showBoosts()">Бусты 🚀</button>
            <button class="tab-button" onclick="showMaCoins()">MaКоин 💎</button> <!-- Новая вкладка -->
        </div>
        <div id="shop-content"></div>
    `;
    window.historyStack.push('showShop');
    document.querySelector('.shop-tabs .tab-button').click();
    bindTabEvents();
};

// Инициализация цен MaКоин и их истории
window.maCoinPriceHistory = window.maCoinPriceHistory || [30000]; // Начальная цена 30,000

window.showRealEstate = function() {
    document.getElementById('shop-content').innerHTML = `
        <h3>Недвижимость 🏠</h3>
        <div class="upgrade-list">
            ${window.profile.ownedItems.real_estate.map((item, index) => `
                <div class="upgrade">
                    <div class="upgrade-icon">🏠</div>
                    <div class="upgrade-info">
                        <p>${item.name}</p>
                        <p>Стоимость: ${item.cost} 💰</p>
                        <p>В наличии: ${item.count}/${item.maxCount}</p>
                    </div>
                    <button class="upgrade-button ${window.profile.coins >= item.cost && item.count < item.maxCount ? '' : 'disabled'}" onclick="buyRealEstate(${index})">
                        Купить
                    </button>
                </div>
            `).join('')}
        </div>
    `;
};

window.buyRealEstate = function(index) {
    const item = window.profile.ownedItems.real_estate[index];
    if (window.profile.coins >= item.cost && item.count < item.maxCount) {
        window.profile.coins -= item.cost;
        item.count++;
        window.showNotification(`Куплено: ${item.name}!`);
        window.updateProfile();
        window.updateQuests();
        showRealEstate();
    } else {
        window.showNotification('Недостаточно монет или достигнут лимит!');
    }
};

window.showMovables = function() {
    document.getElementById('shop-content').innerHTML = `
        <h3>Движимость 🚗</h3>
        <div class="upgrade-list">
            ${window.profile.ownedItems.movables.map((item, index) => `
                <div class="upgrade">
                    <div class="upgrade-icon">🚗</div>
                    <div class="upgrade-info">
                        <p>${item.name}</p>
                        <p>Стоимость: ${item.cost} 💰</p>
                        <p>В наличии: ${item.count}/${item.maxCount}</p>
                    </div>
                    <button class="upgrade-button ${window.profile.coins >= item.cost && item.count < item.maxCount ? '' : 'disabled'}" onclick="buyMovables(${index})">
                        Купить
                    </button>
                </div>
            `).join('')}
        </div>
    `;
};

window.buyMovables = function(index) {
    const item = window.profile.ownedItems.movables[index];
    if (window.profile.coins >= item.cost && item.count < item.maxCount) {
        window.profile.coins -= item.cost;
        item.count++;
        window.showNotification(`Куплено: ${item.name}!`);
        window.updateProfile();
        window.updateQuests();
        showMovables();
    } else {
        window.showNotification('Недостаточно монет или достигнут лимит!');
    }
};

window.showPets = function() {
    document.getElementById('shop-content').innerHTML = `
        <h3>Питомцы 🐾</h3>
        <div class="upgrade-list">
            ${window.profile.pets.map((pet, index) => `
                <div class="upgrade">
                    <div class="upgrade-icon">🐾</div>
                    <div class="upgrade-info">
                        <p>${pet.name} (${pet.type})</p>
                        ${pet.level >= pet.maxLevel ? '<p>Максимальный уровень!</p>' : `<p>Уровень: ${pet.level}/${pet.maxLevel}</p>`}
                        <p>Стоимость улучшения: ${(pet.level * pet.cost).toLocaleString()} 💰</p>
                    </div>
                    <button class="upgrade-button ${window.profile.coins >= (pet.level * pet.cost) && pet.level < pet.maxLevel ? '' : 'disabled'}" onclick="upgradePet(${index})">
                        Улучшить
                    </button>
                </div>
            `).join('')}
        </div>
    `;
};

window.upgradePet = function(index) {
    const pet = window.profile.pets[index];
    const upgradeCost = pet.level * pet.cost;
    if (window.profile.coins >= upgradeCost && pet.level < pet.maxLevel) {
        window.profile.coins -= upgradeCost;
        pet.level++;
        window.showNotification(`Питомец ${pet.name} улучшен до уровня ${pet.level}!`);
        window.updateProfile();
        window.updateQuests();
        showPets();
    } else {
        window.showNotification('Недостаточно монет или максимальный уровень!');
    }
};

window.showUpgrades = function() {
    document.getElementById('shop-content').innerHTML = `
        <h3>Улучшения ⚙️</h3>
        <div class="upgrade-list">
            ${window.profile.ownedItems.upgrades.map((item, index) => `
                <div class="upgrade">
                    <div class="upgrade-icon">⚙️</div>
                    <div class="upgrade-info">
                        <p>${item.name}</p>
                        <p>Стоимость: ${item.cost} 💰</p>
                        <p>В наличии: ${item.count}/${item.maxCount}</p>
                    </div>
                    <button class="upgrade-button ${window.profile.coins >= item.cost && item.count < item.maxCount ? '' : 'disabled'}" onclick="buyUpgrade(${index})">
                        Купить
                    </button>
                </div>
            `).join('')}
        </div>
    `;
};

window.buyUpgrade = function(index) {
    const item = window.profile.ownedItems.upgrades[index];
    if (window.profile.coins >= item.cost && item.count < item.maxCount) {
        window.profile.coins -= item.cost;
        item.count++;
        window.showNotification(`Куплено: ${item.name}!`);
        window.updateProfile();
        window.updateQuests();
        showUpgrades();
    } else {
        window.showNotification('Недостаточно монет или достигнут лимит!');
    }
};

window.showBoosts = function() {
    document.getElementById('shop-content').innerHTML = `
        <h3>Бусты 🚀</h3>
        <div class="upgrade-list">
            ${window.profile.upgrades.boosts.map((boost, index) => `
                <div class="upgrade">
                    <div class="upgrade-icon">🚀</div>
                    <div class="upgrade-info">
                        <p>${boost.name}</p>
                        <p>Уровень: ${boost.level}</p>
                        <p>Стоимость: ${boost.cost} 💰</p>
                    </div>
                    <button class="upgrade-button ${window.profile.coins >= boost.cost ? '' : 'disabled'}" onclick="buyBoost(${index})">
                        Купить
                    </button>
                </div>
            `).join('')}
        </div>
    `;
};

window.buyBoost = function(index) {
    const boost = window.profile.upgrades.boosts[index];
    if (window.profile.coins >= boost.cost) {
        window.profile.coins -= boost.cost;
        boost.level++;
        if (boost.name === 'Energy') {
            window.profile.energyUpgradeLevel++;
        } else if (boost.name === 'Multitap') {
            if (window.profile.multitapLevel < window.profile.maxMultitap) {
                window.profile.multitapLevel++;
            }
        }
        window.showNotification(`Буст ${boost.name} улучшен до уровня ${boost.level}!`);
        window.updateProfile();
        showBoosts();
    } else {
        window.showNotification('Недостаточно монет!');
    }
};

// Новая вкладка MaКоин
window.showMaCoins = function() {
    const currentPrice = window.profile.maCoinPrice;
    document.getElementById('shop-content').innerHTML = `
        <h3>MaКоин 💎</h3>
        <div class="upgrade-list">
            <div class="upgrade">
                <div class="upgrade-icon">💎</div>
                <div class="upgrade-info">
                    <p>Текущая цена: ${currentPrice.toLocaleString()} 💰</p>
                    <p>В наличии: ${window.profile.maCoins}</p>
                    <input type="number" id="maCoinQuantity" min="1" value="1" style="width: 100px; padding: 5px; margin: 5px 0;" placeholder="Количество">
                </div>
                <button class="upgrade-button ${window.profile.coins >= currentPrice ? '' : 'disabled'}" onclick="buyMaCoin()">
                    Купить
                </button>
                <button class="upgrade-button ${window.profile.maCoins > 0 ? '' : 'disabled'}" onclick="sellMaCoin()">
                    Продать
                </button>
            </div>
        </div>
        <div id="price-chart" style="margin-top: 20px;">
            <canvas id="maCoinChart" width="300" height="150"></canvas>
        </div>
    `;
    updateMaCoinChart();
};

// Покупка MaКоин
window.buyMaCoin = function() {
    const quantity = parseInt(document.getElementById('maCoinQuantity').value) || 1;
    const totalCost = window.profile.maCoinPrice * quantity;
    if (quantity <= 0) {
        window.showNotification('Введите корректное количество!');
        return;
    }
    if (window.profile.coins >= totalCost) {
        window.profile.coins -= totalCost;
        window.profile.maCoins += quantity;
        window.showNotification(`Куплено ${quantity} MaКоин за ${totalCost.toLocaleString()} монет!`);
        window.updateProfile();
        window.showMaCoins();
    } else {
        window.showNotification('Недостаточно монет!');
    }
};

// Продажа MaКоин
window.sellMaCoin = function() {
    const quantity = parseInt(document.getElementById('maCoinQuantity').value) || 1;
    if (quantity <= 0) {
        window.showNotification('Введите корректное количество!');
        return;
    }
    if (window.profile.maCoins >= quantity) {
        window.profile.maCoins -= quantity;
        const totalEarned = window.profile.maCoinPrice * quantity;
        window.profile.coins += totalEarned;
        window.showNotification(`Продано ${quantity} MaКоин за ${totalEarned.toLocaleString()} монет!`);
        window.updateProfile();
        window.showMaCoins();
    } else {
        window.showNotification('Недостаточно MaКоин для продажи!');
    }
};

// Обновление цены MaКоин (каждые 10 минут)
window.updateMaCoinPrice = function() {
    const fluctuation = Math.random() * 40000 - 20000; // ±20,000
    window.profile.maCoinPrice = Math.max(15000, Math.min(100000, window.profile.maCoinPrice + fluctuation)); // Ограничение: 15,000–100,000
    window.profile.maCoinPrice = Math.floor(window.profile.maCoinPrice);
    window.maCoinPriceHistory.push(window.profile.maCoinPrice);
    if (window.maCoinPriceHistory.length > 60) window.maCoinPriceHistory.shift(); // Храним историю за 60 обновлений (10 часов)
    if (window.historyStack[window.historyStack.length - 1] === 'showShop') {
        const shopContent = document.getElementById('shop-content');
        if (shopContent && shopContent.innerHTML.includes('MaКоин')) {
            window.showMaCoins();
        }
    }
};

setInterval(window.updateMaCoinPrice, 600000); // 10 минут = 600,000 мс

// График цен MaКоин
window.maCoinPriceHistory = window.maCoinPriceHistory || [30000]; // Начальная цена 30,000

window.updateMaCoinChart = function() {
    const ctx = document.getElementById('maCoinChart')?.getContext('2d');
    if (!ctx) return;

    const prices = window.maCoinPriceHistory;
    const labels = prices.map((_, index) => index);
    const minPrice = Math.min(...prices);
    const maxPrice = Math.max(...prices);

    new Chart(ctx, {
        type: 'line',
        data: {
            labels: labels,
            datasets: [{
                label: 'Цена MaКоин',
                data: prices,
                borderColor: '#ffcc00',
                backgroundColor: 'rgba(255, 204, 0, 0.1)',
                fill: true,
                tension: 0.3
            }]
        },
        options: {
            responsive: true,
            scales: {
                x: {
                    display: false
                },
                y: {
                    min: minPrice - (maxPrice - minPrice) * 0.1,
                    max: maxPrice + (maxPrice - minPrice) * 0.1
                }
            },
            plugins: {
                legend: {
                    display: false
                }
            }
        }
    });
};

// Обновление графика каждые 10 секунд (если вкладка открыта)
setInterval(() => {
    if (window.historyStack[window.historyStack.length - 1] === 'showShop') {
        const shopContent = document.getElementById('shop-content');
        if (shopContent && shopContent.innerHTML.includes('MaКоин')) {
            window.showMaCoins();
        }
    }
}, 10000);
