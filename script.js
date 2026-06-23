// Хранилище уровней игроков
let playerLevels = {};

// Хранилище ботов с энергией
let botStorage = [];

// Бросок кубика d6
function rollD6() {
    return Math.floor(Math.random() * 6) + 1;
}

// Бросок кубика d2
function rollD2() {
    return Math.floor(Math.random() * 2) + 1;
}

// Инициализация ботов с начальной энергией
function initializeBots(botCount) {
    botStorage = [];
    const possibleEnergies = [0, 3, 6, 9]; // 0, Ур.1, Ур.2, Ур.3
    
    for (let i = 1; i <= botCount; i++) {
        const randomEnergy = possibleEnergies[Math.floor(Math.random() * possibleEnergies.length)];
        botStorage.push({
            id: i,
            energy: randomEnergy
        });
    }
}

// Получить уровень энергии по значению
function getEnergyLevel(energy) {
    if (energy >= 12) return 4; // +7
    if (energy >= 9) return 3;  // +6
    if (energy >= 6) return 2;  // +4
    if (energy >= 3) return 1;  // +3
    return 0; // Нет эффекта
}

// Получить эффект по уровню энергии
function getEffectByEnergyLevel(level) {
    switch(level) {
        case 1: return 3;
        case 2: return 4;
        case 3: return 6;
        case 4: return 7; // Максимум!
        default: return 0;
    }
}

// Вычислить срочность ситуации (0-100)
function calculateUrgency(botSide, currentPlayerId, leaderId) {
    if (leaderId === 0) return 0; // Все равны, нет срочности
    
    const currentLevel = playerLevels[currentPlayerId] || 1;
    const leaderLevel = playerLevels[leaderId] || 1;
    const levelGap = Math.abs(currentLevel - leaderLevel);
    
    let urgency = 0;
    
    // 1. Разница уровней (чем больше, тем срочнее)
    urgency += levelGap * 10;
    
    // 2. Если бот помогает слабому игроку
    if (botSide === 'player' && currentPlayerId !== leaderId && levelGap >= 2) {
        urgency += 30;
    }
    
    // 3. Если бот мешает лидеру
    if (botSide === 'monster' && currentPlayerId === leaderId && levelGap >= 2) {
        urgency += 30;
    }
    
    // 4. Критическая ситуация (разница 5+ уровней)
    if (levelGap >= 5) {
        urgency += 40;
    }
    
    return urgency;
}

// Решить, активировать ли бота
function shouldActivate(energy, urgency) {
    // Уровень 4 (12+ энергии) → ВСЕГДА активация
    if (energy >= 12) return true;
    
    // Уровень 3 (9 энергии): активируется если urgency > 30
    if (energy >= 9) return urgency > 30;
    
    // Уровень 2 (6 энергии): активируется если urgency > 50
    if (energy >= 6) return urgency > 50;
    
    // Уровень 1 (3 энергии): активируется если urgency > 70 (критично!)
    if (energy >= 3) return urgency > 70;
    
    return false; // Продолжает копить
}

// Определение лидера по уровню
function determineLeader() {
    const players = Object.keys(playerLevels);
    if (players.length === 0) return 0;
    
    let maxLevel = -1;
    let leaderId = 0;
    let leaderCount = 0;
    
    players.forEach(id => {
        const level = playerLevels[id];
        if (level > maxLevel) {
            maxLevel = level;
            leaderId = parseInt(id);
            leaderCount = 1;
        } else if (level === maxLevel) {
            leaderCount++;
        }
    });
    
    // Если несколько игроков с одинаковым макс уровнем - никто не лидирует
    return leaderCount > 1 ? 0 : leaderId;
}

// Обновление отображения игроков
function updatePlayerDisplay() {
    const playerCount = parseInt(document.getElementById('playerCount').value);
    const currentPlayerId = parseInt(document.getElementById('currentPlayer').value);
    const leaderId = determineLeader();
    
    const container = document.getElementById('playerLevels');
    container.innerHTML = '';
    
    for (let i = 1; i <= playerCount; i++) {
        const level = playerLevels[i] || 1;
        const isLeader = i === leaderId;
        const isCurrentTurn = i === currentPlayerId;
        
        let classNames = 'player-item';
        if (isLeader) classNames += ' leader';
        if (isCurrentTurn) classNames += ' current-turn';
        
        const playerDiv = document.createElement('div');
        playerDiv.className = classNames;
        playerDiv.innerHTML = `
            <div class="player-header">
                <span class="player-name">Игрок ${i}</span>
                <span class="player-badges">
                    ${isLeader ? '👑' : ''}
                </span>
            </div>
            <div class="player-controls">
                <div class="level-control">
                    <button class="level-btn" onclick="changeLevel(${i}, -1)">−</button>
                    <div class="level-display">Ур. ${level}</div>
                    <button class="level-btn" onclick="changeLevel(${i}, 1)">+</button>
                </div>
                <button class="turn-marker-btn ${isCurrentTurn ? 'active' : ''}" 
                        onclick="setCurrentPlayer(${i})"
                        title="Установить как текущего игрока">
                    ${isCurrentTurn ? '🎯 Ходит' : 'Ходит?'}
                </button>
            </div>
        `;
        container.appendChild(playerDiv);
    }
}

// Установить текущего игрока
function setCurrentPlayer(playerId) {
    document.getElementById('currentPlayer').value = playerId;
    updatePlayerDisplay();
}

// Следующий ход (циклический переход)
function nextTurn() {
    const currentPlayerSelect = document.getElementById('currentPlayer');
    const playerCount = parseInt(document.getElementById('playerCount').value);
    let currentId = parseInt(currentPlayerSelect.value);
    
    // Циклический переход к следующему
    currentId++;
    if (currentId > playerCount) currentId = 1;
    
    currentPlayerSelect.value = currentId;
    updatePlayerDisplay();
    
    // Показываем уведомление
    const playerLevel = playerLevels[currentId] || 1;
    showNotification(`🎯 Ходит Игрок ${currentId} (Ур. ${playerLevel})`);
}

// Изменение уровня игрока
function changeLevel(playerId, delta) {
    const currentLevel = playerLevels[playerId] || 1;
    const newLevel = Math.max(1, Math.min(10, currentLevel + delta));
    playerLevels[playerId] = newLevel;
    updatePlayerDisplay();
}

// Применение модификатора уровня к броску поведения
function applyLevelBias(behaviorRoll, currentPlayerId) {
    const leaderId = determineLeader();
    
    // Если никто не лидирует - без модификации
    if (leaderId === 0) {
        return behaviorRoll;
    }
    
    const currentLevel = playerLevels[currentPlayerId] || 1;
    const leaderLevel = playerLevels[leaderId] || 1;
    const levelDiff = currentLevel - leaderLevel;
    
    // Если ходит лидер - меньше помощи ему (НО только если большое преимущество!)
    if (currentPlayerId === leaderId) {
        // Проверяем: есть ли игроки, отстающие на 2+ уровня?
        const playerIds = Object.keys(playerLevels);
        const minLevel = Math.min(...playerIds.map(id => playerLevels[id]));
        const gap = leaderLevel - minLevel;
        
        // Штраф применяется только если лидер впереди на 2+ уровня
        if (gap >= 2 && behaviorRoll <= 2) {
            // Сдвиг помощи игроку в нейтрал (25% шанс, мягче!)
            if (Math.random() < 0.25) {
                return 3;
            }
        }
    }
    
    // Если ходит не лидер - больше помощи ему
    if (currentPlayerId !== leaderId && levelDiff < 0) {
        // Плавный рост помощи: максимум 15% при отставании на 3+ уровня
        const helpBoost = Math.min(Math.abs(levelDiff) * 0.05, 0.15);
        
        if (behaviorRoll >= 5) {
            // Сдвиг помощи монстру в нейтрал или помощь игроку
            if (Math.random() < (0.35 + helpBoost)) {
                return Math.random() < 0.5 ? 3 : 1;
            }
        }
        if (behaviorRoll === 3 || behaviorRoll === 4) {
            // Сдвиг нейтрала в помощь игроку
            if (Math.random() < (0.25 + helpBoost)) {
                return 1;
            }
        }
    }
    
    return behaviorRoll;
}

// Определение типа поведения
function getBehaviorType(roll) {
    if (roll <= 2) return { type: 'player', label: '🟢 Помогает игроку', class: 'behavior-player' };
    if (roll <= 4) return { type: 'neutral', label: '🟡 Нейтральный', class: 'behavior-neutral' };
    return { type: 'monster', label: '🔴 Помогает монстру', class: 'behavior-monster' };
}

// Определение прироста энергии
function getEnergyGain(strengthRoll, isNeutral) {
    if (isNeutral) return 1; // Нейтральные копят медленнее
    
    if (strengthRoll <= 2) return 2; // Слабое
    if (strengthRoll <= 4) return 3; // Среднее
    return 4; // Сильное
}

// Вычисление эффекта с системой энергии
function calculateEffectWithEnergy(bot, behavior, strengthRoll, currentPlayerId, leaderId) {
    const isNeutral = behavior.type === 'neutral';
    const energyGain = getEnergyGain(strengthRoll, isNeutral);
    
    // Добавляем энергию
    bot.energy += energyGain;
    
    // Вычисляем срочность
    const urgency = calculateUrgency(behavior.type, currentPlayerId, leaderId);
    
    // Решаем, активироваться ли
    const shouldAct = shouldActivate(bot.energy, urgency);
    
    if (shouldAct && bot.energy >= 3) {
        // АКТИВАЦИЯ!
        const energyLevel = getEnergyLevel(bot.energy);
        const effectValue = getEffectByEnergyLevel(energyLevel);
        
        // Сбрасываем энергию (оставляем остаток)
        const usedEnergy = energyLevel * 3;
        bot.energy = Math.max(0, bot.energy - usedEnergy);
        
        // Возвращаем эффект
        if (behavior.type === 'player') {
            return {
                playerBonus: effectValue,
                monsterBonus: 0,
                description: `+${effectValue} игроку ⚡`,
                activated: true,
                energyLevel: energyLevel,
                newEnergy: bot.energy
            };
        } else if (behavior.type === 'monster') {
            return {
                playerBonus: 0,
                monsterBonus: effectValue,
                description: `+${effectValue} монстру ⚡`,
                activated: true,
                energyLevel: energyLevel,
                newEnergy: bot.energy
            };
        } else {
            // Нейтральный редко активируется
            const d2 = rollD2();
            return d2 === 1 ? 
                { playerBonus: effectValue, monsterBonus: 0, description: `+${effectValue} игроку ⚡`, activated: true, energyLevel: energyLevel, newEnergy: bot.energy } :
                { playerBonus: 0, monsterBonus: effectValue, description: `+${effectValue} монстру ⚡`, activated: true, energyLevel: energyLevel, newEnergy: bot.energy };
        }
    } else {
        // Копит энергию
        return {
            playerBonus: 0,
            monsterBonus: 0,
            description: `Накопление... (+${energyGain} энергии)`,
            activated: false,
            energyGain: energyGain,
            newEnergy: bot.energy
        };
    }
}

// Сброс матча (новая игра)
function resetMatch() {
    // Подтверждение
    if (!confirm('🔄 Начать новый матч?\n\nВсе игроки будут сброшены на 1 уровень.\nБоты получат новую начальную энергию.')) {
        return;
    }
    
    // Сбрасываем уровни всех игроков на 1
    const playerCount = parseInt(document.getElementById('playerCount').value);
    for (let i = 1; i <= playerCount; i++) {
        playerLevels[i] = 1;
    }
    
    // Реинициализируем ботов
    const botCount = parseInt(document.getElementById('botCount').value);
    initializeBots(botCount);
    
    // Сбрасываем текущего игрока на первого
    document.getElementById('currentPlayer').value = 1;
    
    // Очищаем результаты ботов
    document.getElementById('results').innerHTML = '';
    document.getElementById('summary').style.display = 'none';
    
    // Обновляем отображение
    updatePlayerDisplay();
    
    // Показываем уведомление
    showNotification('✨ Новый матч начат! Все игроки на 1 уровне.');
}

// Показать уведомление
function showNotification(message) {
    const notification = document.createElement('div');
    notification.className = 'notification';
    notification.textContent = message;
    document.body.appendChild(notification);
    
    // Анимация появления
    setTimeout(() => notification.classList.add('show'), 10);
    
    // Удаление через 3 секунды
    setTimeout(() => {
        notification.classList.remove('show');
        setTimeout(() => notification.remove(), 300);
    }, 3000);
}
function toggleTactics() {
    const modal = document.getElementById('tacticsModal');
    if (modal.style.display === 'flex') {
        modal.style.display = 'none';
    } else {
        modal.style.display = 'flex';
    }
}

// Обновление отображения текущего игрока (удалено - больше не нужно)
// function updateTurnDisplay() { ... }

// Смена хода (стрелки влево/вправо) - УДАЛЕНО, больше не используется
// Показать модальное окно выбора игрока - УДАЛЕНО, больше не используется
// Выбор игрока из модального окна - УДАЛЕНО, больше не используется

// Закрытие модального окна при клике вне его
window.onclick = function(event) {
    const tacticsModal = document.getElementById('tacticsModal');
    
    if (event.target === tacticsModal) {
        tacticsModal.style.display = 'none';
    }
}

// Обновление списков игроков при изменении количества
document.getElementById('playerCount').addEventListener('input', function() {
    const playerCount = parseInt(this.value);
    
    // Инициализируем уровни для новых игроков
    for (let i = 1; i <= playerCount; i++) {
        if (!playerLevels[i]) {
            playerLevels[i] = 1;
        }
    }
    
    // Удаляем уровни игроков, которых больше нет
    Object.keys(playerLevels).forEach(id => {
        if (parseInt(id) > playerCount) {
            delete playerLevels[id];
        }
    });
    
    // Обновляем скрытый список "Кто ходит"
    const currentPlayerSelect = document.getElementById('currentPlayer');
    let currentValue = parseInt(currentPlayerSelect.value);
    
    // Если текущий игрок больше не существует, сбрасываем на 1
    if (currentValue > playerCount) {
        currentValue = 1;
    }
    
    currentPlayerSelect.innerHTML = '';
    
    for (let i = 1; i <= playerCount; i++) {
        const option = document.createElement('option');
        option.value = i;
        option.textContent = `Игрок ${i}`;
        if (i == currentValue) option.selected = true;
        currentPlayerSelect.appendChild(option);
    }
    
    updatePlayerDisplay();
});

// Главная функция - Бросок кубиков
document.getElementById('rollBtn').addEventListener('click', function() {
    const botCount = parseInt(document.getElementById('botCount').value);
    const playerCount = parseInt(document.getElementById('playerCount').value);
    const currentPlayerId = parseInt(document.getElementById('currentPlayer').value);
    
    if (botCount < 1 || botCount > 6) {
        alert('Количество ботов должно быть от 1 до 6');
        return;
    }
    
    if (playerCount < 1 || playerCount > 6) {
        alert('Количество игроков должно быть от 1 до 6');
        return;
    }
    
    // Если ботов ещё нет или изменилось количество - инициализируем
    if (botStorage.length !== botCount) {
        initializeBots(botCount);
    }
    
    const resultsDiv = document.getElementById('results');
    resultsDiv.innerHTML = '';
    
    let totalPlayerBonus = 0;
    let totalMonsterBonus = 0;
    
    const leaderId = determineLeader();
    
    // Обработка каждого бота
    for (let i = 0; i < botCount; i++) {
        const bot = botStorage[i];
        const behaviorRoll = rollD6();
        const modifiedRoll = applyLevelBias(behaviorRoll, currentPlayerId);
        const strengthRoll = rollD6();
        
        const behavior = getBehaviorType(modifiedRoll);
        const effect = calculateEffectWithEnergy(bot, behavior, strengthRoll, currentPlayerId, leaderId);
        
        totalPlayerBonus += effect.playerBonus;
        totalMonsterBonus += effect.monsterBonus;
        
        // Создание карточки бота
        const botCard = document.createElement('div');
        botCard.className = 'bot-card' + (effect.activated ? ' activated' : '');
        
        const energyDisplay = effect.activated ? 
            `<div class="energy-bar">⚡ Активация! Ур.${effect.energyLevel} → Энергия: ${effect.newEnergy}/12</div>` :
            `<div class="energy-bar">🔋 Накопление: ${effect.newEnergy}/12</div>`;
        
        botCard.innerHTML = `
            <div class="bot-header">
                <div class="bot-name">🤖 Бот ${i + 1}</div>
                <div class="dice-rolls">
                    <div class="dice" title="Поведение">🎲 ${behaviorRoll}</div>
                    <div class="dice" title="Сила">🎲 ${strengthRoll}</div>
                </div>
            </div>
            ${energyDisplay}
            <div class="bot-details">
                <div class="detail-row">
                    <span class="detail-label">Поведение:</span>
                    <span class="detail-value ${behavior.class}">${behavior.label}</span>
                </div>
                <div class="detail-row">
                    <span class="detail-label">Эффект:</span>
                    <span class="detail-value ${effect.activated ? 'effect-active' : ''}">${effect.description}</span>
                </div>
            </div>
        `;
        resultsDiv.appendChild(botCard);
    }
    
    // Показать итоги
    const summaryDiv = document.getElementById('summary');
    const summaryContent = document.getElementById('summaryContent');
    summaryDiv.style.display = 'block';
    
    const currentPlayerName = `Игрок ${currentPlayerId}`;
    const currentPlayerLevel = playerLevels[currentPlayerId] || 1;
    const leaderName = leaderId === 0 ? 'Никто' : `Игрок ${leaderId} (Ур. ${playerLevels[leaderId]})`;
    
    summaryContent.innerHTML = `
        <div class="summary-item summary-info">
            👥 В игре: ${playerCount} игрок(ов)
        </div>
        <div class="summary-item summary-leader">
            � Лидер: ${leaderName} | 🎯 Ходит: ${currentPlayerName} (Ур. ${currentPlayerLevel})
        </div>
        <div class="summary-item summary-player">
            🧙 Бонус игрокам: +${totalPlayerBonus}
        </div>
        <div class="summary-item summary-monster">
            👹 Бонус монстру: +${totalMonsterBonus}
        </div>
    `;
});

// Инициализация при загрузке страницы
document.addEventListener('DOMContentLoaded', function() {
    // Инициализируем начальные уровни
    playerLevels[1] = 1;
    playerLevels[2] = 1;
    
    // Инициализируем ботов с начальной энергией
    initializeBots(1);
    
    document.getElementById('playerCount').dispatchEvent(new Event('input'));
});

// Мобильные настройки
function openMobileSettings() {
    document.getElementById('mobileSettings').classList.add('open');
    // Синхронизируем значения
    document.getElementById('playerCountMobile').value = document.getElementById('playerCount').value;
    document.getElementById('botCountMobile').value = document.getElementById('botCount').value;
}

function closeMobileSettings() {
    document.getElementById('mobileSettings').classList.remove('open');
}

function syncPlayerCount() {
    const mobileCount = document.getElementById('playerCountMobile').value;
    document.getElementById('playerCount').value = mobileCount;
    document.getElementById('playerCount').dispatchEvent(new Event('input'));
}

function syncBotCount() {
    const mobileCount = document.getElementById('botCountMobile').value;
    document.getElementById('botCount').value = mobileCount;
}
