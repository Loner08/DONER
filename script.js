// Данные приложения
let appData = {
    total: 0,
    table1: [0, 0, 0, 0, 0, 0, 0, 0],
    table2: [0, 0, 0, 0, 0, 0, 0, 0]
};

// Настройки расчетов
let currentMultiplier = 500;
let currentOption = 2;

// Таймер
let timer = {
    minutes: 15,
    seconds: 0,
    totalSeconds: 15 * 60,
    running: false,
    interval: null
};

// Счетчики команд и уровни
let mbScore = 100;
let bbScore = 200;
let mbIncrement = 100;
let level = 1;

// Состояние меню
let menuExpanded = {
    team: true,
    timer: false,
    auto: false,
    dist: false
};

// Загружаем данные при старте
window.onload = function() {
    loadData();
    createButtons();
    updateUI();
    updateCalculations();
    updateTimerDisplay();
    updateTeamInputs();
    initializeMenuSections();
    updateLevelDisplay();
};

// Функции для работы с данными
function loadData() {
    try {
        const saved = localStorage.getItem('tableCalculatorData');
        if (saved) {
            const data = JSON.parse(saved);
            appData = data.appData || appData;
            timer = data.timer || timer;
            mbScore = data.mbScore || 100;
            bbScore = data.bbScore || 200;
            mbIncrement = data.mbIncrement || 100;
            level = data.level || 1;
            currentMultiplier = data.currentMultiplier || 500;
            currentOption = data.currentOption || 2;
            menuExpanded = data.menuExpanded || menuExpanded;
            
            // Убедимся, что ББ = 2 × МБ
            if (bbScore !== mbScore * 2) {
                bbScore = mbScore * 2;
            }
        }
    } catch (e) {
        console.log('Не удалось загрузить данные');
    }
}

function saveData() {
    try {
        const data = {
            appData,
            timer,
            mbScore,
            bbScore,
            mbIncrement,
            level,
            currentMultiplier,
            currentOption,
            menuExpanded
        };
        localStorage.setItem('tableCalculatorData', JSON.stringify(data));
    } catch (e) {
        console.log('Не удалось сохранить данные');
    }
}

// Функции интерфейса
function createButtons() {
    createTableButtons('table1-buttons', 'table1');
    createTableButtons('table2-buttons', 'table2');
}

function createTableButtons(containerId, tableName) {
    const container = document.getElementById(containerId);
    container.innerHTML = '';
    
    for (let i = 0; i < 8; i++) {
        const button = document.createElement('button');
        button.className = 'number-btn';
        button.innerHTML = `
            <div style="font-size: 24px; font-weight: bold;">${i + 1}</div>
            <div style="font-size: 14px; color: #666;" id="${tableName}-count-${i}">${appData[tableName][i]}</div>
        `;
        
        button.onclick = function() {
            incrementCounter(tableName, i);
        };
        
        container.appendChild(button);
    }
}

function incrementCounter(tableName, index) {
    appData[tableName][index]++;
    appData.total++;
    
    
    updateUI();
    saveData();
    updateCalculations();
}

function updateUI() {
    // Общее количество
    document.getElementById('total').textContent = appData.total;
    
    // Суммы столов
    const table1Sum = appData.table1.reduce((a, b) => a + b, 0);
    const table2Sum = appData.table2.reduce((a, b) => a + b, 0);
    document.getElementById('table1-sum').textContent = table1Sum;
    document.getElementById('table2-sum').textContent = table2Sum;
    
    // Счетчики команд
    document.getElementById('mbScore').textContent = mbScore;
    document.getElementById('bbScore').textContent = bbScore;
    
    // Обновляем счетчики на кнопках
    updateButtonCounts('table1', appData.table1);
    updateButtonCounts('table2', appData.table2);
}

function updateButtonCounts(tableName, counts) {
    for (let i = 0; i < 8; i++) {
        const element = document.getElementById(`${tableName}-count-${i}`);
        if (element) {
            element.textContent = counts[i];
        }
    }
}

// ОБЩИЙ СБРОС ВСЕГО
function resetAll() {
    if (confirm('Вы уверены, что хотите сбросить ВСЁ абсолютно?\n\nСбросится:\n- Счетчики столов\n- Счетчики команд МБ/ББ\n- Уровень\n- Таймер\n- Все настройки')) {
        // Сброс данных столов
        appData = {
            total: 0,
            table1: [0, 0, 0, 0, 0, 0, 0, 0],
            table2: [0, 0, 0, 0, 0, 0, 0, 0]
        };
        
        // Сброс команд
        mbScore = 100;
        bbScore = 200;
        mbIncrement = 100;
        level = 1;
        
        // Сброс таймера
        stopTimer();
        timer = {
            minutes: 15,
            seconds: 0,
            totalSeconds: 15 * 60,
            running: false,
            interval: null
        };
        
        // Сброс настроек расчетов
        currentMultiplier = 500;
        currentOption = 2;
        
        // Сброс состояния меню
        menuExpanded = {
            team: true,
            timer: false,
            auto: false,
            dist: false
        };
        
        // Обновление интерфейса
        updateUI();
        updateTeamInputs();
        updateTimerDisplay();
        updateLevelDisplay();
        updateCalculations();
        
        // Сброс кнопок множителя и опций
        document.querySelectorAll('.multiplier-btn').forEach(btn => btn.classList.remove('active'));
        document.querySelector('.multiplier-btn').classList.add('active');
        
        document.querySelectorAll('.option-btn').forEach(btn => btn.classList.remove('active'));
        document.querySelector('.option-btn').classList.add('active');
        
        // Сброс полей ввода таймера
        document.getElementById('timerMinutes').value = 15;
        document.getElementById('timerSeconds').value = 0;
        
        // Сохранение и перезагрузка состояния меню
        saveData();
        initializeMenuSections();
        
        alert('ВСЁ сброшено к начальным значениям!');
    }
}

// Функции меню
function toggleMenu() {
    const sidebar = document.getElementById('sidebar');
    sidebar.classList.toggle('active');
    
    // Обновляем расчеты при открытии меню
    if (sidebar.classList.contains('active')) {
        updateCalculations();
        updateTimerInputs();
    }
}

// Инициализация разделов меню
function initializeMenuSections() {
    // Устанавливаем начальное состояние для каждого раздела
    Object.keys(menuExpanded).forEach(section => {
        const sectionElement = document.getElementById(section + 'Section');
        const arrow = sectionElement.parentElement.querySelector('.toggle-arrow');
        
        if (menuExpanded[section]) {
            sectionElement.classList.add('expanded');
            arrow.style.transform = 'rotate(180deg)';
        } else {
            sectionElement.classList.remove('expanded');
            arrow.style.transform = 'rotate(0deg)';
        }
    });
}

// Переключение конкретного раздела
function toggleSection(sectionId) {
    const section = document.getElementById(sectionId + 'Section');
    const arrow = section.parentElement.querySelector('.toggle-arrow');
    
    if (section.classList.contains('expanded')) {
        section.classList.remove('expanded');
        arrow.style.transform = 'rotate(0deg)';
        menuExpanded[sectionId] = false;
    } else {
        section.classList.add('expanded');
        arrow.style.transform = 'rotate(180deg)';
        menuExpanded[sectionId] = true;
    }
    
    saveData();
}

// Обновление полей ввода команд
function updateTeamInputs() {
    document.getElementById('mbScoreInput').value = mbScore;
    document.getElementById('bbScoreInput').value = bbScore;
    document.getElementById('mbIncrementInput').value = mbIncrement;
}

// Обновление счета команды
function updateTeamScore(team) {
    if (team === 'mb') {
        const newScore = parseInt(document.getElementById('mbScoreInput').value) || 0;
        mbScore = newScore;
        bbScore = mbScore * 2;
    } else if (team === 'bb') {
        const newScore = parseInt(document.getElementById('bbScoreInput').value) || 0;
        bbScore = newScore;
        mbScore = bbScore / 2;
    }
    
    updateUI();
    saveData();
}

// Обновление инкремента команды
function updateTeamIncrement(team) {
    if (team === 'mb') {
        const newIncrement = parseInt(document.getElementById('mbIncrementInput').value) || 100;
        mbIncrement = Math.max(1, Math.min(1000, newIncrement));
        document.getElementById('mbIncrementInput').value = mbIncrement;
    }
    
    saveData();
}

// Функции для настройки таймера
function updateTimerInputs() {
    document.getElementById('timerMinutes').value = timer.minutes;
    document.getElementById('timerSeconds').value = timer.seconds;
}

function setTimerPreset(minutes, seconds) {
    document.getElementById('timerMinutes').value = minutes;
    document.getElementById('timerSeconds').value = seconds;
}

function applyTimerSettings() {
    const minutes = parseInt(document.getElementById('timerMinutes').value) || 0;
    const seconds = parseInt(document.getElementById('timerSeconds').value) || 0;
    
    // Останавливаем текущий таймер
    stopTimer();
    
    // Устанавливаем новые значения
    timer.minutes = Math.min(60, Math.max(0, minutes));
    timer.seconds = Math.min(59, Math.max(0, seconds));
    timer.totalSeconds = timer.minutes * 60 + timer.seconds;
    
    // Обновляем отображение
    updateTimerDisplay();
    
    // Сохраняем данные
    saveData();
    
    alert('Таймер установлен на ' + minutes + ' мин ' + seconds + ' сек');
}

// Обновление отображения уровня
function updateLevelDisplay() {
    const levelDisplay = document.getElementById('levelDisplay');
    if (levelDisplay) {
        levelDisplay.textContent = 'Уровень ' + level;
    }
}

// Функции таймера
function updateTimerDisplay() {
    const display = document.getElementById('timerDisplay');
    const minutes = Math.floor(timer.totalSeconds / 60);
    const seconds = timer.totalSeconds % 60;
    
    display.textContent = 
        minutes.toString().padStart(2, '0') + ':' + 
        seconds.toString().padStart(2, '0');
    
    // Изменяем цвет при низком времени
    if (timer.totalSeconds <= 10 && timer.running) {
        display.classList.add('blinking');
        display.style.color = '#e74c3c';
    } else {
        display.classList.remove('blinking');
        display.style.color = '#2c3e50';
    }
}

function startTimer() {
    if (timer.running) return;
    
    timer.running = true;
    
    timer.interval = setInterval(function() {
        if (timer.totalSeconds > 0) {
            timer.totalSeconds--;
            updateTimerDisplay();
        } else {
            // Таймер закончился - увеличиваем уровень и счетчики
            stopTimer();
            
            // Увеличиваем уровень
            level++;
            
            // Увеличиваем счетчики команд (МБ на 100)
            mbScore += mbIncrement;
            bbScore = mbScore * 2;
            
            // Сбрасываем таймер
            timer.totalSeconds = timer.minutes * 60 + timer.seconds;
            updateTimerDisplay();
            
            // Обновляем UI и уровень
            updateUI();
            updateLevelDisplay();
            saveData();
            
            // Запускаем таймер снова
            startTimer();
        }
    }, 1000);
}

function stopTimer() {
    if (!timer.running) return;
    
    timer.running = false;
    clearInterval(timer.interval);
    saveData();
}

function skipTimer() {
    stopTimer();
    
    // Увеличиваем уровень
    level++;
    
    // Увеличиваем счетчики команд (МБ на 100)
    mbScore += mbIncrement;
    bbScore = mbScore * 2;
    
    // Сбрасываем таймер
    timer.totalSeconds = timer.minutes * 60 + timer.seconds;
    updateTimerDisplay();
    
    // Обновляем UI
    updateUI();
    updateLevelDisplay();
    saveData();
}

// Функции для множителя и опций
function selectMultiplier(multiplier) {
    currentMultiplier = multiplier;
    
    // Обновляем кнопки
    document.querySelectorAll('.multiplier-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    event.target.classList.add('active');
    
    // Обновляем расчеты
    updateCalculations();
    saveData();
}

function selectOption(option) {
    currentOption = option;
    
    // Обновляем кнопки
    document.querySelectorAll('.option-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    event.target.classList.add('active');
    
    // Обновляем расчеты
    updateCalculations();
    saveData();
}

// Расчеты
function updateCalculations() {
    const totalClicks = appData.total;
    
    // Общая сумма
    const totalAmount = totalClicks * currentMultiplier;
    document.getElementById('autoTotalAmount').textContent = formatNumber(totalAmount);
    
    // Распределение
    updateDistribution(totalAmount);
}

function updateDistribution(totalAmount) {
    const parts = calculateParts(totalAmount, currentOption);
    const container = document.getElementById('distributionParts');
    
    container.innerHTML = '';
    
    if (parts.length === 0) {
        container.innerHTML = '<div style="text-align: center; color: #666; padding: 20px;">Выберите вариант распределения</div>';
        return;
    }
    
    parts.forEach((part, index) => {
        const partElement = document.createElement('div');
        partElement.className = 'distribution-part';
        
        partElement.innerHTML = `
            <div class="part-name">
                Часть ${index + 1} (${part.percentage}%)
            </div>
            <div class="part-value">
                ${formatNumber(part.amount)}
            </div>
        `;
        
        container.appendChild(partElement);
    });
}

function calculateParts(totalAmount, option) {
    switch(option) {
        case 2:
            return [
                { percentage: 70, amount: Math.round(totalAmount * 0.7) },
                { percentage: 30, amount: Math.round(totalAmount * 0.3) }
            ];
        case 3:
            return [
                { percentage: 50, amount: Math.round(totalAmount * 0.5) },
                { percentage: 30, amount: Math.round(totalAmount * 0.3) },
                { percentage: 20, amount: Math.round(totalAmount * 0.2) }
            ];
        case 4:
            return [
                { percentage: 40, amount: Math.round(totalAmount * 0.4) },
                { percentage: 30, amount: Math.round(totalAmount * 0.3) },
                { percentage: 20, amount: Math.round(totalAmount * 0.2) },
                { percentage: 10, amount: Math.round(totalAmount * 0.1) }
            ];
        default:
            return [];
    }
}

function formatNumber(num) {
    return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, " ");
}

// Автосохранение каждые 5 секунд
setInterval(saveData, 5000);