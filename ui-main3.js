
window.showGames = function() {
    document.getElementById('main-content').innerHTML = `
        <button class="back-button hk-button" onclick="goBack()">Назад ⬅️</button>
        <h2>Казино 🎰</h2>
        <div class="game-tabs">
            <button class="tab-button" onclick="showBlackjack()">21 очко 🎴</button>
            <button class="tab-button" onclick="showRoulette()">Рулетка 🎡</button>
            <button class="tab-button" onclick="showDepIm()">ДепИм ⚔️</button>
        </div>
        <div id="game-content"></div>
    `;
    window.historyStack.push('showGames');
    document.querySelector('.game-tabs .tab-button').click();
};

window.showBlackjack = function() {
    window.blackjackState = window.blackjackState || { playerCards: [], dealerCards: [], bet: 0, gameOver: true, lastBet: '' };
    document.getElementById('game-content').innerHTML = `
        <h3>21 очко 🎴</h3>
        <div class="blackjack-table">
            <div class="cards-section">
                <h4>Дилер: <span id="dealer-score">0</span></h4>
                <div class="dealer-cards"></div>
                <h4>Игрок: <span id="player-score">0</span></h4>
                <div class="player-cards"></div>
            </div>
            <div class="bet-section">
                <input type="number" id="blackjack-bet" placeholder="Ставка (мин. 10)" min="10" value="${window.blackjackState.lastBet}">
                <button class="hk-button" onclick="startBlackjack()">Начать игру</button>
            </div>
            <div class="actions" id="blackjack-actions" style="display: none;">
                <button class="hk-button" onclick="hitBlackjack()">Взять карту</button>
                <button class="hk-button" onclick="standBlackjack()">Остановиться</button>
            </div>
        </div>
    `;
    window.historyStack.push('showBlackjack');
    if (!window.blackjackState.gameOver) {
        renderBlackjack();
        document.getElementById('blackjack-actions').style.display = 'flex';
    }
};

function calculateScore(cards) {
    let score = 0;
    let aces = 0;
    cards.forEach(card => {
        if (card.value === 'A') {
            aces++;
            score += 11;
        } else if (['K', 'Q', 'J'].includes(card.value)) {
            score += 10;
        } else {
            score += parseInt(card.value);
        }
    });
    while (score > 21 && aces > 0) {
        score -= 10;
        aces--;
    }
    return score;
}

function renderBlackjack() {
    const playerCards = document.querySelector('.player-cards');
    const dealerCards = document.querySelector('.dealer-cards');
    const playerScore = document.getElementById('player-score');
    const dealerScore = document.getElementById('dealer-score');

    playerCards.innerHTML = window.blackjackState.playerCards.map(card => `
        <div class="card ${card.suit === '♥' || card.suit === '♦' ? 'red' : 'black'}" data-value="${card.value}${card.suit}">
            ${card.value}${card.suit}
        </div>
    `).join('');
    dealerCards.innerHTML = window.blackjackState.dealerCards.map((card, index) => `
        <div class="card ${index === 0 && !window.blackjackState.gameOver ? 'hidden' : (card.suit === '♥' || card.suit === '♦' ? 'red' : 'black')}" data-value="${index === 0 && !window.blackjackState.gameOver ? '' : card.value + card.suit}">
            ${index === 0 && !window.blackjackState.gameOver ? '🂠' : card.value + card.suit}
        </div>
    `).join('');

    playerScore.innerText = calculateScore(window.blackjackState.playerCards);
    dealerScore.innerText = window.blackjackState.gameOver ? calculateScore(window.blackjackState.dealerCards) : calculateScore([window.blackjackState.dealerCards[1]]);

    animateCards();
}

window.startBlackjack = function() {
    const betInput = document.getElementById('blackjack-bet');
    const bet = parseInt(betInput.value);
    if (bet >= 10 && window.profile.coins >= bet) {
        window.profile.coins -= bet;
        window.blackjackState.bet = bet;
        window.blackjackState.lastBet = bet;
        window.blackjackState.playerCards = [];
        window.blackjackState.dealerCards = [];
        window.blackjackState.gameOver = false;

        const suits = ['♠', '♣', '♥', '♦'];
        const values = ['2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K', 'A'];
        const deck = [];
        suits.forEach(suit => values.forEach(value => deck.push({ suit, value })));
        for (let i = deck.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [deck[i], deck[j]] = [deck[j], deck[i]];
        }

        window.blackjackState.playerCards.push(deck.pop(), deck.pop());
        window.blackjackState.dealerCards.push(deck.pop(), deck.pop());

        document.getElementById('blackjack-actions').style.display = 'flex';
        renderBlackjack();
        window.updateProfile();
    } else {
        window.showNotification('Неверная ставка или недостаточно монет!');
    }
};

window.hitBlackjack = function() {
    const suits = ['♠', '♣', '♥', '♦'];
    const values = ['2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K', 'A'];
    const deck = [];
    suits.forEach(suit => values.forEach(value => deck.push({ suit, value })));
    for (let i = deck.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [deck[i], deck[j]] = [deck[j], deck[i]];
    }

    window.blackjackState.playerCards.push(deck.pop());
    const playerScore = calculateScore(window.blackjackState.playerCards);
    renderBlackjack();
    if (playerScore > 21) {
        window.blackjackState.gameOver = true;
        window.showNotification('Перебор! Вы проиграли.');
        document.getElementById('blackjack-actions').style.display = 'none';
        window.profile.stats.clicker_games++;
        window.updateProfile();
        window.updateQuests();
    }
};

window.standBlackjack = function() {
    window.blackjackState.gameOver = true;
    let dealerScore = calculateScore(window.blackjackState.dealerCards);
    const playerScore = calculateScore(window.blackjackState.playerCards);

    const suits = ['♠', '♣', '♥', '♦'];
    const values = ['2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K', 'A'];
    const deck = [];
    suits.forEach(suit => values.forEach(value => deck.push({ suit, value })));
    for (let i = deck.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [deck[i], deck[j]] = [deck[j], deck[i]];
    }

    while (dealerScore < 17) {
        window.blackjackState.dealerCards.push(deck.pop());
        dealerScore = calculateScore(window.blackjackState.dealerCards);
    }

    renderBlackjack();
    document.getElementById('blackjack-actions').style.display = 'none';
    window.profile.stats.clicker_games++;

    if (dealerScore > 21 || playerScore > dealerScore) {
        window.profile.coins += window.blackjackState.bet * 2;
        window.showNotification(`Победа! +${window.blackjackState.bet * 2} монет!`);
    } else if (playerScore === dealerScore) {
        window.profile.coins += window.blackjackState.bet;
        window.showNotification('Ничья! Ставка возвращена.');
    } else {
        window.showNotification('Проигрыш!');
    }

    window.updateProfile();
    window.updateQuests();
};

window.showRoulette = function() {
    window.rouletteState = window.rouletteState || { bet: 0, type: 'number', value: 0, lastBet: '' };
    document.getElementById('game-content').innerHTML = `
        <h3>Рулетка 🎡</h3>
        <div class="roulette-table">
            <div class="bet-section">
                <input type="number" id="roulette-bet" placeholder="Ставка (мин. 10)" min="10" value="${window.rouletteState.lastBet}">
                <select id="roulette-type">
                    <option value="number">Число (0-36)</option>
                    <option value="color">Цвет (red/black)</option>
                    <option value="even_odd">Чёт/Нечёт</option>
                </select>
                <input type="text" id="roulette-value" placeholder="Значение (число, red/black, even/odd)">
                <button class="hk-button" onclick="spinRoulette()">Крутить</button>
            </div>
            <div class="roulette-wheel" id="roulette-wheel">
                <div class="wheel-inner"></div>
            </div>
        </div>
    `;
    window.historyStack.push('showRoulette');
};

window.spinRoulette = function() {
    const betInput = document.getElementById('roulette-bet');
    const typeSelect = document.getElementById('roulette-type');
    const valueInput = document.getElementById('roulette-value');
    const bet = parseInt(betInput.value);
    const type = typeSelect.value;
    const value = valueInput.value.toLowerCase();

    if (bet >= 10 && window.profile.coins >= bet && validateRouletteBet(type, value)) {
        window.profile.coins -= bet;
        window.rouletteState.bet = bet;
        window.rouletteState.lastBet = bet;
        window.rouletteState.type = type;
        window.rouletteState.value = value;

        const result = Math.floor(Math.random() * 37);
        const isRed = [1, 3, 5, 7, 9, 12, 14, 16, 18, 19, 21, 23, 25, 27, 30, 32, 34, 36].includes(result);
        const isBlack = result !== 0 && !isRed;
        const isEven = result !== 0 && result % 2 === 0;

        let win = false;
        let multiplier = 1;
        if (type === 'number' && parseInt(value) === result) {
            win = true;
            multiplier = 36;
        } else if (type === 'color' && ((value === 'red' && isRed) || (value === 'black' && isBlack))) {
            win = true;
            multiplier = 2;
        } else if (type === 'even_odd' && ((value === 'even' && isEven) || (value === 'odd' && !isEven && result !== 0))) {
            win = true;
            multiplier = 2;
        }

        const wheel = document.getElementById('roulette-wheel');
        wheel.classList.add('spinning');
        setTimeout(() => {
            wheel.classList.remove('spinning');
            if (win) {
                window.profile.coins += bet * multiplier;
                window.showNotification(`Победа! +${bet * multiplier} монет!`);
            } else {
                window.showNotification('Проигрыш!');
            }
            window.profile.stats.roulette_games++;
            window.updateProfile();
            showRoulette();
            window.updateQuests();
        }, 2000);
    } else {
        window.showNotification('Неверная ставка или недостаточно монет!');
    }
};

function validateRouletteBet(type, value) {
    if (type === 'number') return !isNaN(value) && value >= 0 && value <= 36;
    if (type === 'color') return ['red', 'black'].includes(value);
    if (type === 'even_odd') return ['even', 'odd'].includes(value);
    return false;
}

window.showDepIm = function() {
    window.depImState = window.depImState || { bet: 0, asset: null, type: '', lastBet: '', doubleDown: false, doubleDownAsset: null };
    document.getElementById('game-content').innerHTML = `
        <h3>ДепИм ⚔️</h3>
        <div class="depim-arena">
            <div class="bet-section">
                <input type="number" id="depim-bet" placeholder="Ставка (мин. 10)" min="10" value="${window.depImState.lastBet}">
                <select id="depim-asset-type">
                    <option value="real_estate">Недвижимость</option>
                    <option value="movables">Движимость</option>
                    <option value="upgrades">Улучшения</option>
                </select>
                <select id="depim-asset">
                    <option value="">Выбери предмет</option>
                </select>
                <button class="hk-button" onclick="startDepIm()">Начать бой</button>
            </div>
            <div class="arena-visual" id="arena-visual"></div>
            <div id="double-down-section" style="display: none;">
                <h4>Проиграли! Хотите додеп?</h4>
                <select id="double-down-asset">
                    <option value="">Выбери предмет для додепа</option>
                </select>
                <button class="hk-button" onclick="doubleDownDepIm()">Поставить ещё (x4 награда)</button>
            </div>
        </div>
    `;
    const assetTypeSelect = document.getElementById('depim-asset-type');
    const assetSelect = document.getElementById('depim-asset');
    const doubleDownSelect = document.getElementById('double-down-asset');

    assetTypeSelect.addEventListener('change', () => {
        const type = assetTypeSelect.value;
        assetSelect.innerHTML = '<option value="">Выбери предмет</option>';
        doubleDownSelect.innerHTML = '<option value="">Выбери предмет для додепа</option>';
        window.profile.ownedItems[type].forEach((item, index) => {
            if (item.count > 0) {
                assetSelect.innerHTML += `<option value="${index}">${item.name} (${item.count} шт.)</option>`;
                doubleDownSelect.innerHTML += `<option value="${index}">${item.name} (${item.count} шт.)</option>`;
            }
        });
    });

    window.historyStack.push('showDepIm');
};

window.startDepIm = function() {
    const betInput = document.getElementById('depim-bet');
    const bet = parseInt(betInput.value);
    const type = document.getElementById('depim-asset-type').value;
    const assetIndex = document.getElementById('depim-asset').value;

    if (bet >= 10 && window.profile.coins >= bet && assetIndex !== '') {
        window.profile.coins -= bet;
        window.depImState.bet = bet;
        window.depImState.lastBet = bet;
        window.depImState.type = type;
        window.depImState.asset = assetIndex;
        window.depImState.doubleDown = false;

        const arena = document.getElementById('arena-visual');
        arena.classList.add('fighting');
        setTimeout(() => {
            arena.classList.remove('fighting');
            const winChance = 0.5; // Шанс победы 50%
            const win = Math.random() < winChance;
            window.profile.stats.depim_games++;

            if (win) {
                const item = window.profile.ownedItems[type][assetIndex];
                item.count++; // Добавляем ещё один предмет
                window.showNotification(`Победа! Вы получили ещё один ${item.name}!`);
                document.getElementById('double-down-section').style.display = 'none';
            } else {
                window.showNotification('Проигрыш! Хотите сделать додеп?');
                document.getElementById('double-down-section').style.display = 'block';
            }

            window.updateProfile();
            showDepIm();
            window.updateQuests();
        }, 2000);
    } else {
        window.showNotification('Неверная ставка, предмет или недостаточно монет!');
    }
};

window.doubleDownDepIm = function() {
    const doubleDownAsset = document.getElementById('double-down-asset').value;
    if (doubleDownAsset !== '') {
        window.depImState.doubleDown = true;
        window.depImState.doubleDownAsset = doubleDownAsset;

        const arena = document.getElementById('arena-visual');
        arena.classList.add('fighting');
        setTimeout(() => {
            arena.classList.remove('fighting');
            const winChance = 0.5; // Шанс победы 50%
            const win = Math.random() < winChance;
            window.profile.stats.depim_games++;

            if (win) {
                const type = window.depImState.type;
                const assetIndex = window.depImState.asset;
                const item = window.profile.ownedItems[type][assetIndex];
                item.count += 4; // Награда х4
                window.showNotification(`Додеп успешен! Вы получили ${item.count} ${item.name}!`);
            } else {
                window.showNotification('Додеп не удался. Проигрыш!');
            }

            window.depImState.doubleDown = false;
            document.getElementById('double-down-section').style.display = 'none';
            window.updateProfile();
            showDepIm();
            window.updateQuests();
        }, 2000);
    } else {
        window.showNotification('Выберите предмет для додепа!');
    }
};

function bindTabEvents() {
    document.querySelectorAll('.tab-button').forEach(button => {
        button.addEventListener('click', () => {
            document.querySelectorAll('.tab-button').forEach(btn => btn.classList.remove('active'));
            button.classList.add('active');
        });
    });
}

function animateCards() {
    const cards = document.querySelectorAll('.card');
    cards.forEach((card, index) => {
        card.style.animationDelay = `${index * 0.2}s`;
        card.classList.add('deal');
    });
}

function animateRoulette() {
    const wheel = document.getElementById('roulette-wheel');
    wheel.innerHTML = '<div class="wheel-inner"></div>';
}
