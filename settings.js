// Функция для отображения раздела настроек
window.showOther = function() {
    document.getElementById('main-content').innerHTML = `
        <button class="back-button hk-button" onclick="goBack()">Назад ⬅️</button>
        <h2>Настройки ⚙️</h2>
        <p>Настройки временно недоступны.</p>
    `;
    window.historyStack.push('showOther');
};

// Удаляем функции смены темы и языка
window.changeTheme = function() {
    window.showNotification("Смена темы временно отключена.");
};

window.changeLanguage = function() {
    window.showNotification("Смена языка временно отключена.");
};