// Функция для отображения раздела настроек
window.showOther = function() {
    document.getElementById('main-content').innerHTML = `
        <button class="back-button hk-button" onclick="goBack()">Назад ⬅️</button>
        <h2>Настройки ⚙️</h2>
        <p>Тема:</p>
        <select id="themeSelect" onchange="changeTheme()">
            <option value="dark" ${window.profile.theme === 'dark' ? 'selected' : ''}>Тёмная</option>
            <option value="light" ${window.profile.theme === 'light' ? 'selected' : ''}>Светлая</option>
        </select>
        <p>Язык:</p>
        <select id="languageSelect" onchange="changeLanguage()">
            <option value="ru" selected>Русский</option>
            <option value="en">English</option>
        </select>
        <div class="profile-info">
            <h1 id="coin-counter">${window.profile.coins.toLocaleString()}</h1>
            <p>Мультитап: ${window.profile.multitapLevel}/${window.profile.maxMultitap} 👆</p>
        </div>
    `;
    window.historyStack.push('showOther');
};

// Функция смены темы
window.changeTheme = function() {
    const theme = document.getElementById('themeSelect').value;
    window.profile.theme = theme;
    window.applyTheme();
    window.saveProfile();
    window.showNotification(`Тема изменена на ${theme === 'dark' ? 'тёмную' : 'светлую'}!`);
};

// Функция смены языка (заглушка, можно расширить)
window.changeLanguage = function() {
    const language = document.getElementById('languageSelect').value;
    window.showNotification(`Язык изменён на ${language === 'ru' ? 'Русский' : 'English'}!`);
    // Здесь можно добавить логику для смены языка (например, перевод текста)
};