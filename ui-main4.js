
// ui-main4.js
window.calculateProfit = function() {
    let profit = 0;

    // Прибыль от недвижимости (4% от стоимости в час за единицу)
    profit += window.profile.ownedItems.real_estate.reduce((sum, item) => sum + (item.count * (item.cost * 0.04)), 0);

    // Прибыль от движимости (4% от стоимости в час за единицу)
    profit += window.profile.ownedItems.movables.reduce((sum, item) => sum + (item.count * (item.cost * 0.04)), 0);

    // Прибыль от улучшений (4% от стоимости в час за единицу)
    profit += window.profile.ownedItems.upgrades.reduce((sum, item) => sum + (item.count * (item.cost * 0.04)), 0);

    // Прибыль от питомцев (4% от базовой стоимости * уровень в час)
    profit += window.profile.pets.reduce((sum, pet) => sum + ((pet.cost * 0.04) * pet.level), 0);

    window.profile.profitPerHour = Math.floor(profit);
};

setInterval(() => {
    const profitPerSecond = window.profile.profitPerHour / 3600;
    window.profile.coins = Math.floor(window.profile.coins + profitPerSecond * 10);
    window.updateProfile();
    window.calculateProfit();
}, 10000);
