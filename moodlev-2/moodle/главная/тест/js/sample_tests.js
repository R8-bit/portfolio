// Примеры тестов для демонстрации системы

const sampleTests = [
    {
        id: 1,
        title: "Основы JavaScript",
        description: "Тест на знание основ языка программирования JavaScript",
        category: "technology",
        createdAt: "2025-01-01T10:00:00.000Z",
        updatedAt: "2025-01-01T10:00:00.000Z",
        attempts: 15,
        averageScore: 78,
        questions: [
            {
                question: "Какой тип данных НЕ является примитивным в JavaScript?",
                answers: [
                    "string",
                    "number", 
                    "object",
                    "boolean"
                ],
                correct: 2
            },
            {
                question: "Что выведет console.log(typeof null)?",
                answers: [
                    "null",
                    "undefined",
                    "object",
                    "boolean"
                ],
                correct: 2
            },
            {
                question: "Какой метод используется для добавления элемента в конец массива?",
                answers: [
                    "push()",
                    "pop()",
                    "shift()",
                    "unshift()"
                ],
                correct: 0
            },
            {
                question: "Что такое hoisting в JavaScript?",
                answers: [
                    "Способ создания функций",
                    "Поднятие объявлений переменных и функций в начало области видимости",
                    "Метод сортировки массивов",
                    "Способ обработки ошибок"
                ],
                correct: 1
            },
            {
                question: "Какой оператор используется для строгого сравнения?",
                answers: [
                    "==",
                    "===",
                    "!=",
                    "!=="
                ],
                correct: 1
            }
        ]
    },
    {
        id: 2,
        title: "История России",
        description: "Тест по основным событиям российской истории",
        category: "history",
        createdAt: "2025-01-02T14:30:00.000Z",
        updatedAt: "2025-01-02T14:30:00.000Z",
        attempts: 8,
        averageScore: 65,
        questions: [
            {
                question: "В каком году произошла Октябрьская революция?",
                answers: [
                    "1916",
                    "1917",
                    "1918",
                    "1919"
                ],
                correct: 1
            },
            {
                question: "Кто был первым царем из династии Романовых?",
                answers: [
                    "Петр I",
                    "Иван Грозный",
                    "Михаил Федорович",
                    "Алексей Михайлович"
                ],
                correct: 2
            },
            {
                question: "В каком году была основана Москва?",
                answers: [
                    "1147",
                    "1156",
                    "1157",
                    "1158"
                ],
                correct: 0
            },
            {
                question: "Какое событие произошло в 1812 году?",
                answers: [
                    "Крымская война",
                    "Отечественная война",
                    "Русско-турецкая война",
                    "Северная война"
                ],
                correct: 1
            }
        ]
    },
    {
        id: 3,
        title: "Основы математики",
        description: "Тест на знание основных математических понятий и операций",
        category: "math",
        createdAt: "2025-01-03T09:15:00.000Z",
        updatedAt: "2025-01-03T09:15:00.000Z",
        attempts: 25,
        averageScore: 82,
        questions: [
            {
                question: "Чему равен квадратный корень из 144?",
                answers: [
                    "11",
                    "12",
                    "13",
                    "14"
                ],
                correct: 1
            },
            {
                question: "Что такое гипотенуза?",
                answers: [
                    "Самая короткая сторона треугольника",
                    "Самая длинная сторона прямоугольного треугольника",
                    "Высота треугольника",
                    "Медиана треугольника"
                ],
                correct: 1
            },
            {
                question: "Сколько градусов в полном круге?",
                answers: [
                    "180°",
                    "270°",
                    "360°",
                    "400°"
                ],
                correct: 2
            },
            {
                question: "Чему равно число π (пи) приблизительно?",
                answers: [
                    "3.14",
                    "2.71",
                    "1.41",
                    "2.25"
                ],
                correct: 0
            },
            {
                question: "Что означает термин 'производная' в математике?",
                answers: [
                    "Сумма чисел",
                    "Скорость изменения функции",
                    "Площадь под кривой",
                    "Максимальное значение функции"
                ],
                correct: 1
            }
        ]
    },
    {
        id: 4,
        title: "Литература XIX века",
        description: "Тест по произведениям русской литературы 19 века",
        category: "literature",
        createdAt: "2025-01-04T16:45:00.000Z",
        updatedAt: "2025-01-04T16:45:00.000Z",
        attempts: 12,
        averageScore: 71,
        questions: [
            {
                question: "Кто написал роман 'Война и мир'?",
                answers: [
                    "Ф.М. Достоевский",
                    "Л.Н. Толстой",
                    "И.С. Тургенев",
                    "А.С. Пушкин"
                ],
                correct: 1
            },
            {
                question: "Главный герой романа 'Преступление и наказание':",
                answers: [
                    "Евгений Онегин",
                    "Родион Раскольников",
                    "Григорий Печорин",
                    "Илья Обломов"
                ],
                correct: 1
            },
            {
                question: "В каком произведении А.С. Пушкина есть персонаж Татьяна Ларина?",
                answers: [
                    "Капитанская дочка",
                    "Дубровский",
                    "Евгений Онегин",
                    "Пиковая дама"
                ],
                correct: 2
            },
            {
                question: "Кто автор пьесы 'Ревизор'?",
                answers: [
                    "А.С. Грибоедов",
                    "Н.В. Гоголь",
                    "А.Н. Островский",
                    "А.П. Чехов"
                ],
                correct: 1
            }
        ]
    },
    {
        id: 5,
        title: "География мира",
        description: "Тест на знание географии различных стран и континентов",
        category: "geography",
        createdAt: "2025-01-05T11:20:00.000Z",
        updatedAt: "2025-01-05T11:20:00.000Z",
        attempts: 18,
        averageScore: 69,
        questions: [
            {
                question: "Какая река является самой длинной в мире?",
                answers: [
                    "Амазонка",
                    "Нил",
                    "Янцзы",
                    "Миссисипи"
                ],
                correct: 1
            },
            {
                question: "На каком континенте расположена пустыня Сахара?",
                answers: [
                    "Азия",
                    "Австралия",
                    "Африка",
                    "Южная Америка"
                ],
                correct: 2
            },
            {
                question: "Столица Австралии:",
                answers: [
                    "Сидней",
                    "Мельбурн",
                    "Канберра",
                    "Перт"
                ],
                correct: 2
            },
            {
                question: "Самая высокая гора в мире:",
                answers: [
                    "К2",
                    "Эверест",
                    "Канченджанга",
                    "Макалу"
                ],
                correct: 1
            },
            {
                question: "В каком океане находятся Мальдивские острова?",
                answers: [
                    "Атлантический",
                    "Тихий",
                    "Индийский",
                    "Северный Ледовитый"
                ],
                correct: 2
            }
        ]
    }
];

// Функция для загрузки примеров тестов
function loadSampleTests() {
    if (confirm('Загрузить примеры тестов? Это добавит 5 демонстрационных тестов в систему.')) {
        const existingTests = JSON.parse(localStorage.getItem('allTests') || '[]');
        
        // Проверяем, не загружены ли уже примеры
        const hasExamples = existingTests.some(test => sampleTests.find(sample => sample.title === test.title));
        
        if (hasExamples && !confirm('Примеры тестов уже загружены. Загрузить повторно?')) {
            return;
        }
        
        // Обновляем ID для избежания конфликтов
        const updatedSamples = sampleTests.map(test => ({
            ...test,
            id: Date.now() + Math.random() * 1000,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        }));
        
        const allTests = [...existingTests, ...updatedSamples];
        localStorage.setItem('allTests', JSON.stringify(allTests));
        
        // Обновляем глобальную переменную
        if (typeof tests !== 'undefined') {
            tests = allTests;
        }
        
        // Обновляем отображение
        if (typeof displayTests === 'function') {
            displayTests();
        }
        
        // Показываем уведомление
        if (typeof notifications !== 'undefined') {
            notifications.show(`Загружено ${updatedSamples.length} примеров тестов!`, 'success');
        } else {
            alert(`Загружено ${updatedSamples.length} примеров тестов!`);
        }
        
        // Обновляем статистику
        if (typeof updateStats === 'function') {
            updateStats();
        }
    }
}

// Функция для очистки всех тестов
function clearAllTests() {
    if (confirm('Вы уверены, что хотите удалить ВСЕ тесты? Это действие нельзя отменить!')) {
        if (confirm('Последнее предупреждение! Все тесты будут удалены безвозвратно!')) {
            localStorage.removeItem('allTests');
            
            // Обновляем глобальную переменную
            if (typeof tests !== 'undefined') {
                tests = [];
            }
            
            // Обновляем отображение
            if (typeof displayTests === 'function') {
                displayTests();
            }
            
            // Показываем уведомление
            if (typeof notifications !== 'undefined') {
                notifications.show('Все тесты удалены!', 'warning');
            } else {
                alert('Все тесты удалены!');
            }
            
            // Обновляем статистику
            if (typeof updateStats === 'function') {
                updateStats();
            }
        }
    }
}

// Функция для экспорта примеров тестов
function exportSampleTests() {
    const data = JSON.stringify(sampleTests, null, 2);
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    
    const link = document.createElement('a');
    link.href = url;
    link.download = 'sample_tests.json';
    link.click();
    
    URL.revokeObjectURL(url);
    
    if (typeof notifications !== 'undefined') {
        notifications.show('Примеры тестов экспортированы!', 'success');
    } else {
        alert('Примеры тестов экспортированы!');
    }
}

// Добавляем кнопки управления примерами в интерфейс
function addSampleTestsControls() {
    const quickActions = document.querySelector('.quick-actions .action-buttons');
    if (quickActions) {
        const sampleControls = document.createElement('div');
        sampleControls.innerHTML = `
            <button class="btn btn-info" onclick="loadSampleTests()">📥 Загрузить примеры</button>
            <button class="btn btn-secondary" onclick="exportSampleTests()">📤 Экспорт примеров</button>
            <button class="btn" style="background: #ef4444; color: white;" onclick="clearAllTests()">🗑️ Очистить все</button>
        `;
        sampleControls.style.marginTop = '15px';
        sampleControls.style.display = 'flex';
        sampleControls.style.gap = '10px';
        sampleControls.style.flexWrap = 'wrap';
        
        quickActions.parentElement.appendChild(sampleControls);
    }
}

// Автоматически добавляем контролы при загрузке страницы
if (typeof document !== 'undefined') {
    document.addEventListener('DOMContentLoaded', function() {
        // Небольшая задержка чтобы убедиться что основные элементы загружены
        setTimeout(addSampleTestsControls, 500);
    });
}