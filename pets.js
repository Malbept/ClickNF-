profile.pets = profile.pets || [];
profile.petPlayCount = profile.petPlayCount || 0;

function showPets() {
    document.getElementById('main-content').innerHTML = `
        <button class="back-button glass-button" onclick="goBack()">Назад ⬅️</button>
        <h2>Питомцы 🐾</h2>
        <p>Твои питомцы приносят доход в час!</p>
        <p>Всего питомцев: ${profile.pets.length}</p>
        ${profile.pets.length > 0 ? profile.pets.map((pet, index) => `
            <p>${pet.name} (${pet.type}, Lv ${pet.level || 1}) 
            <button class="action glass-button" onclick="playWithPet(${index})">Играть</button>
            <button class="action glass-button" onclick="upgradePet(${index})">Улучшить (50 монет)</button></p>
        `).join('') : '<p>У тебя пока нет питомцев.</p>'}
        <button class="action glass-button" onclick="adoptPet()">Приютить питомца (100 монет)</button>
    `;
    if (!historyStack.includes('showPets')) {
        historyStack.push('showPets');
    }
    updateProfile();
    applyTheme();
}

function adoptPet() {
    if (profile.coins >= 100) {
        profile.coins -= 100;
        const petTypes = ['Котик 😺', 'Собачка 🐶', 'Дракончик 🐉'];
        const petNames = ['Лапка', 'Шарик', 'Снежок', 'Пушок', 'Искры'];
        const type = petTypes[Math.floor(Math.random() * petTypes.length)];
        const name = petNames[Math.floor(Math.random() * petNames.length)];
        profile.pets.push({ name, type, level: 1 }); // Добавляем уровень питомца
        showNotification(`Ты приютил питомца: ${name} (${type})! 🐾`);
        calculateProfitPerHour(); // Пересчитываем доход
        showPets();
        updateProfile();
    } else {
        showNotification('Недостаточно монет! 💰');
    }
}

function playWithPet(index) {
    const pet = profile.pets[index];
    profile.coins += 10;
    profile.petPlayCount++;
    if (profile.petPlayCount >= 5) {
        checkSecret('play_with_pet_5');
    }
    showNotification(`Ты поиграл с ${pet.name}! +10 монет 🐾`);
    showPets();
    updateProfile();
}

function upgradePet(index) {
    if (profile.coins >= 50) {
        profile.coins -= 50;
        profile.pets[index].level = (profile.pets[index].level || 1) + 1;
        showNotification(`Питомец ${profile.pets[index].name} улучшен до уровня ${profile.pets[index].level}! 🐾`);
        calculateProfitPerHour(); // Пересчитываем доход
        showPets();
        updateProfile();
    } else {
        showNotification('Недостаточно монет! 💰');
    }
}

function earnFromPets() {
    if (profile.pets.length > 0) {
        const earnings = profile.pets.reduce((total, pet) => {
            const baseProfit = 10; // Базовый доход питомца в час
            const levelMultiplier = pet.level || 1;
            return total + Math.floor((baseProfit * levelMultiplier) / 60); // Доход за минуту
        }, 0);
        profile.coins += earnings;
        showNotification(`Твои питомцы принесли ${earnings} монет! 🐾`);
        updateProfile();
    }
}

function calculateOfflineEarnings() {
    const lastVisit = localStorage.getItem('lastVisit');
    const now = Date.now();
    localStorage.setItem('lastVisit', now);

    if (lastVisit && profile.pets.length > 0) {
        const minutesPassed = Math.floor((now - lastVisit) / 60000);
        if (minutesPassed > 0) {
            const earnings = profile.pets.reduce((total, pet) => {
                const baseProfit = 10;
                const levelMultiplier = pet.level || 1;
                return total + baseProfit * levelMultiplier * minutesPassed;
            }, 0);
            profile.coins += earnings;
            showNotification(`Пока тебя не было, питомцы принесли ${earnings} монет! 🐾`);
            updateProfile();
        }
    }
}

setInterval(earnFromPets, 60000);