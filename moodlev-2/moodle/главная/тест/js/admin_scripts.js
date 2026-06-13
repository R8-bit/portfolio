// Дополнительные функции для админ панели

// Управление уведомлениями
class NotificationManager {
    constructor() {
        this.createNotificationContainer();
    }

    createNotificationContainer() {
        if (!document.getElementById('notification-container')) {
            const container = document.createElement('div');
            container.id = 'notification-container';
            container.style.cssText = `
                position: fixed;
                top: 20px;
                right: 20px;
                z-index: 10000;
                display: flex;
                flex-direction: column;
                gap: 10px;
            `;
            document.body.appendChild(container);
        }
    }

    show(message, type = 'info', duration = 3000) {
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.innerHTML = `
            <div class="notification-content">
                <span class="notification-icon">${this.getIcon(type)}</span>
                <span class="notification-message">${message}</span>
                <button class="notification-close" onclick="this.parentElement.parentElement.remove()">×</button>
            </div>
        `;
        
        notification.style.cssText = `
            background: ${this.getColor(type)};
            color: white;
            padding: 15px 20px;
            border-radius: 10px;
            box-shadow: 0 5px 15px rgba(0,0,0,0.2);
            transform: translateX(100%);
            transition: transform 0.3s ease;
            max-width: 300px;
        `;

        const container = document.getElementById('notification-container');
        container.appendChild(notification);

        // Анимация появления
        setTimeout(() => {
            notification.style.transform = 'translateX(0)';
        }, 100);

        // Автоудаление
        if (duration > 0) {
            setTimeout(() => {
                if (notification.parentElement) {
                    notification.style.transform = 'translateX(100%)';
                    setTimeout(() => notification.remove(), 300);
                }
            }, duration);
        }
    }

    getIcon(type) {
        const icons = {
            success: '✅',
            error: '❌',
            warning: '⚠️',
            info: 'ℹ️'
        };
        return icons[type] || icons.info;
    }

    getColor(type) {
        const colors = {
            success: '#10b981',
            error: '#ef4444',
            warning: '#f59e0b',
            info: '#3b82f6'
        };
        return colors[type] || colors.info;
    }
}

// Инициализируем менеджер уведомлений
const notifications = new NotificationManager();

// Расширенные функции для работы с тестами
class TestManager {
    constructor() {
        this.tests = this.loadTests();
        this.categories = {
            general: 'Общие знания',
            science: 'Наука',
            history: 'История',
            literature: 'Литература',
            math: 'Математика',
            geography: 'География',
            art: 'Искусство',
            sport: 'Спорт',
            technology: 'Технологии'
        };
    }

    loadTests() {
        const saved = localStorage.getItem('allTests');
        return saved ? JSON.parse(saved) : [];
    }

    saveTests() {
        localStorage.setItem('allTests', JSON.stringify(this.tests));
        this.updateStats();
    }

    addTest(testData) {
        const test = {
            id: Date.now(),
            ...testData,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            attempts: 0,
            averageScore: 0
        };
        
        this.tests.push(test);
        this.saveTests();
        notifications.show('Тест успешно создан!', 'success');
        return test;
    }

    updateTest(id, updates) {
        const index = this.tests.findIndex(test => test.id === id);
        if (index !== -1) {
            this.tests[index] = {
                ...this.tests[index],
                ...updates,
                updatedAt: new Date().toISOString()
            };
            this.saveTests();
            notifications.show('Тест обновлен!', 'success');
            return this.tests[index];
        }
        return null;
    }

    deleteTest(id) {
        const index = this.tests.findIndex(test => test.id === id);
        if (index !== -1) {
            this.tests.splice(index, 1);
            this.saveTests();
            notifications.show('Тест удален!', 'warning');
            return true;
        }
        return false;
    }

    duplicateTest(id) {
        const test = this.tests.find(t => t.id === id);
        if (test) {
            const duplicate = {
                ...test,
                id: Date.now(),
                title: test.title + ' (копия)',
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
                attempts: 0,
                averageScore: 0
            };
            this.tests.push(duplicate);
            this.saveTests();
            notifications.show('Тест скопирован!', 'info');
            return duplicate;
        }
        return null;
    }

    getTestsByCategory(category) {
        return this.tests.filter(test => test.category === category);
    }

    searchTests(query) {
        const lowercaseQuery = query.toLowerCase();
        return this.tests.filter(test => 
            test.title.toLowerCase().includes(lowercaseQuery) ||
            test.description.toLowerCase().includes(lowercaseQuery)
        );
    }

    getTestStats() {
        return {
            total: this.tests.length,
            byCategory: this.getCategoryStats(),
            totalQuestions: this.tests.reduce((sum, test) => sum + test.questions.length, 0),
            totalAttempts: this.tests.reduce((sum, test) => sum + (test.attempts || 0), 0)
        };
    }

    getCategoryStats() {
        const stats = {};
        Object.keys(this.categories).forEach(cat => {
            stats[cat] = this.tests.filter(test => test.category === cat).length;
        });
        return stats;
    }

    updateStats() {
        const stats = this.getTestStats();
        document.getElementById('testCount').textContent = stats.total;
        
        // Обновляем другие статистики если элементы существуют
        const questionsCountEl = document.getElementById('questionsCount');
        if (questionsCountEl) {
            questionsCountEl.textContent = stats.totalQuestions;
        }
        
        const attemptsCountEl = document.getElementById('attemptsCount');
        if (attemptsCountEl) {
            attemptsCountEl.textContent = stats.totalAttempts;
        }
    }

    exportTests() {
        const data = JSON.stringify(this.tests, null, 2);
        const blob = new Blob([data], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        
        const link = document.createElement('a');
        link.href = url;
        link.download = `tests_export_${new Date().toISOString().split('T')[0]}.json`;
        link.click();
        
        URL.revokeObjectURL(url);
        notifications.show('Тесты экспортированы!', 'success');
    }

    importTests(file) {
        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const importedTests = JSON.parse(e.target.result);
                if (Array.isArray(importedTests)) {
                    importedTests.forEach(test => {
                        // Присваиваем новый ID для избежания конфликтов
                        test.id = Date.now() + Math.random();
                        test.title += ' (импорт)';
                    });
                    this.tests.push(...importedTests);
                    this.saveTests();
                    notifications.show(`Импортировано ${importedTests.length} тестов!`, 'success');
                    displayTests();
                } else {
                    notifications.show('Неверный формат файла!', 'error');
                }
            } catch (error) {
                notifications.show('Ошибка при импорте файла!', 'error');
            }
        };
        reader.readAsText(file);
    }
}

// Инициализируем менеджер тестов
const testManager = new TestManager();

// Функции для улучшенного интерфейса
function addQuestionWithType(type = 'multiple') {
    questionCounter++;
    const questionsContainer = document.getElementById('questionsContainer');
    
    let questionHTML = '';
    
    if (type === 'multiple') {
        questionHTML = `
            <div class="question-item" data-type="multiple">
                <div class="question-header">
                    <select class="question-type-select" onchange="changeQuestionType(this, ${questionCounter})">
                        <option value="multiple" selected>Множественный выбор</option>
                        <option value="single">Одиночный выбор</option>
                        <option value="text">Текстовый ответ</option>
                        <option value="boolean">Да/Нет</option>
                    </select>
                    <button class="btn-remove" onclick="removeQuestion(this)">Удалить</button>
                </div>
                <div class="form-group">
                    <label>Вопрос ${questionCounter}</label>
                    <input type="text" placeholder="Введите текст вопроса" class="question-text">
                </div>
                <div class="form-group">
                    <label>Варианты ответов</label>
                    <div class="answers-list">
                        ${generateAnswerOptions(4, questionCounter)}
                    </div>
                    <button class="btn-add-option" onclick="addAnswerOption(this)">+ Добавить вариант</button>
                </div>
            </div>
        `;
    }
    
    const questionDiv = document.createElement('div');
    questionDiv.innerHTML = questionHTML;
    questionsContainer.appendChild(questionDiv.firstElementChild);
}

function generateAnswerOptions(count, questionNumber) {
    let html = '';
    for (let i = 0; i < count; i++) {
        html += `
            <div class="answer-option">
                <input type="radio" name="correct_${questionNumber}" value="${i}">
                <label>${i === 0 ? 'Правильный:' : 'Неправильный:'}</label>
                <input type="text" placeholder="Вариант ответа ${i + 1}" class="answer-text">
                ${i > 1 ? '<button class="btn-remove-option" onclick="removeAnswerOption(this)">×</button>' : ''}
            </div>
        `;
    }
    return html;
}

function addAnswerOption(button) {
    const answersList = button.previousElementSibling;
    const questionItem = button.closest('.question-item');
    const questionNumber = Array.from(questionItem.parentElement.children).indexOf(questionItem) + 1;
    const optionIndex = answersList.children.length;
    
    const optionDiv = document.createElement('div');
    optionDiv.className = 'answer-option';
    optionDiv.innerHTML = `
        <input type="radio" name="correct_${questionNumber}" value="${optionIndex}">
        <label>Неправильный:</label>
        <input type="text" placeholder="Вариант ответа ${optionIndex + 1}" class="answer-text">
        <button class="btn-remove-option" onclick="removeAnswerOption(this)">×</button>
    `;
    
    answersList.appendChild(optionDiv);
}

function removeAnswerOption(button) {
    const answersList = button.closest('.answers-list');
    if (answersList.children.length > 2) {
        button.parentElement.remove();
        // Обновляем индексы
        Array.from(answersList.children).forEach((option, index) => {
            const radio = option.querySelector('input[type="radio"]');
            if (radio) radio.value = index;
            const placeholder = option.querySelector('.answer-text');
            if (placeholder) placeholder.placeholder = `Вариант ответа ${index + 1}`;
        });
    } else {
        notifications.show('Минимум 2 варианта ответа!', 'warning');
    }
}

function changeQuestionType(select, questionNumber) {
    const questionItem = select.closest('.question-item');
    const type = select.value;
    
    // Здесь можно добавить логику для изменения типа вопроса
    notifications.show(`Тип вопроса изменен на: ${select.options[select.selectedIndex].text}`, 'info');
}

// Функция для создания резервной копии
function createBackup() {
    const data = {
        tests: testManager.tests,
        settings: localStorage.getItem('adminSettings') || '{}',
        timestamp: new Date().toISOString()
    };
    
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    
    const link = document.createElement('a');
    link.href = url;
    link.download = `admin_backup_${new Date().toISOString().split('T')[0]}.json`;
    link.click();
    
    URL.revokeObjectURL(url);
    notifications.show('Резервная копия создана!', 'success');
}

// Функция для восстановления из резервной копии
function restoreBackup(file) {
    const reader = new FileReader();
    reader.onload = (e) => {
        try {
            const backupData = JSON.parse(e.target.result);
            
            if (backupData.tests && Array.isArray(backupData.tests)) {
                if (confirm('Это действие заменит все текущие данные. Продолжить?')) {
                    testManager.tests = backupData.tests;
                    testManager.saveTests();
                    
                    if (backupData.settings) {
                        localStorage.setItem('adminSettings', backupData.settings);
                    }
                    
                    notifications.show('Данные восстановлены из резервной копии!', 'success');
                    displayTests();
                }
            } else {
                notifications.show('Неверный формат резервной копии!', 'error');
            }
        } catch (error) {
            notifications.show('Ошибка при чтении резервной копии!', 'error');
        }
    };
    reader.readAsText(file);
}

// Функция для поиска тестов
function searchTests(query) {
    const results = testManager.searchTests(query);
    displayFilteredTests(results);
}

// Функция для фильтрации по категории
function filterByCategory(category) {
    const results = category === 'all' ? testManager.tests : testManager.getTestsByCategory(category);
    displayFilteredTests(results);
}

function displayFilteredTests(tests) {
    const container = document.getElementById('generatedTests');
    if (tests.length === 0) {
        container.innerHTML = '<div class="empty-state"><h3>Тесты не найдены</h3><p>Попробуйте изменить параметры поиска</p></div>';
        return;
    }
    
    const testsHtml = tests.map(test => `
        <div class="test-item">
            <h4>${test.title}</h4>
            <p><strong>Категория:</strong> ${testManager.categories[test.category]}</p>
            <p><strong>Описание:</strong> ${test.description}</p>
            <p><strong>Вопросов:</strong> ${test.questions.length}</p>
            <p><strong>Создан:</strong> ${new Date(test.createdAt).toLocaleDateString()}</p>
            <div class="test-actions">
                <button class="btn btn-primary btn-small" onclick="editTest(${test.id})">Редактировать</button>
                <button class="btn btn-success btn-small" onclick="previewTest(${test.id})">Предпросмотр</button>
                <button class="btn btn-info btn-small" onclick="testManager.duplicateTest(${test.id}); displayTests();">Копировать</button>
                <button class="btn-remove btn-small" onclick="deleteTest(${test.id})">Удалить</button>
            </div>
        </div>
    `).join('');
    
    container.innerHTML = `<h3>Найдено тестов: ${tests.length}</h3>${testsHtml}`;
}

// Обновляем функцию displayTests для использования testManager
function displayTests() {
    displayFilteredTests(testManager.tests);
}

// Keyboard shortcuts
document.addEventListener('keydown', function(e) {
    // Ctrl+S для сохранения теста
    if (e.ctrlKey && e.key === 's') {
        e.preventDefault();
        const activePageId = document.querySelector('.page.active').id;
        if (activePageId === 'tests') {
            saveTest();
        }
    }
    
    // Ctrl+N для добавления нового вопроса
    if (e.ctrlKey && e.key === 'n') {
        e.preventDefault();
        const activePageId = document.querySelector('.page.active').id;
        if (activePageId === 'tests') {
            addQuestion();
        }
    }
    
    // Esc для возврата к списку тестов
    if (e.key === 'Escape') {
        const activePageId = document.querySelector('.page.active').id;
        if (activePageId === 'tests') {
            clearForm();
        }
    }
});

// Автосохранение формы теста
let autoSaveTimeout;
function setupAutoSave() {
    const inputs = document.querySelectorAll('#tests input, #tests textarea, #tests select');
    inputs.forEach(input => {
        input.addEventListener('input', () => {
            clearTimeout(autoSaveTimeout);
            autoSaveTimeout = setTimeout(() => {
                saveFormData();
            }, 2000);
        });
    });
}

function saveFormData() {
    const formData = {
        title: document.getElementById('testTitle')?.value || '',
        description: document.getElementById('testDescription')?.value || '',
        category: document.getElementById('testCategory')?.value || 'general'
    };
    
    localStorage.setItem('tempTestData', JSON.stringify(formData));
}

function loadFormData() {
    const saved = localStorage.getItem('tempTestData');
    if (saved) {
        const formData = JSON.parse(saved);
        if (document.getElementById('testTitle')) document.getElementById('testTitle').value = formData.title;
        if (document.getElementById('testDescription')) document.getElementById('testDescription').value = formData.description;
        if (document.getElementById('testCategory')) document.getElementById('testCategory').value = formData.category;
    }
}

// Инициализация дополнительных функций при загрузке
document.addEventListener('DOMContentLoaded', function() {
    setupAutoSave();
    loadFormData();
    
    // Показываем приветственное уведомление
    setTimeout(() => {
        notifications.show('Добро пожаловать в админ панель!', 'info');
    }, 1000);
});