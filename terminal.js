/* =============================================
   BITER TERMINAL — Interactive Portfolio CLI
   ============================================= */

(function () {
    const COMMANDS = {
        help: {
            desc: "Список доступных команд",
            run: () => `
<span class="t-comment">╔══════════════════════════════════════════╗</span>
<span class="t-comment">║         BITER TERMINAL v1.0.0            ║</span>
<span class="t-comment">╚══════════════════════════════════════════╝</span>

<span class="t-kw">Доступные команды:</span>

  <span class="t-cmd">about</span>       — кто я такой
  <span class="t-cmd">skills</span>      — мои технологии и навыки
  <span class="t-cmd">projects</span>    — список проектов
  <span class="t-cmd">contact</span>     — как со мной связаться
  <span class="t-cmd">stats</span>       — статистика разработчика
  <span class="t-cmd">hire</span>        — готов ли я к работе?
  <span class="t-cmd">socials</span>     — социальные сети
  <span class="t-cmd">matrix</span>      — 🔴 нажми красную таблетку
  <span class="t-cmd">clear</span>       — очистить терминал
  <span class="t-cmd">exit</span>        — закрыть терминал

<span class="t-muted">Подсказка: Tab для автодополнения, ↑↓ для истории</span>`
        },

        about: {
            desc: "О разработчике",
            run: () => `
<span class="t-accent">╭───────────────────────────────╮</span>
<span class="t-accent">│</span>   <span class="t-str">BITER</span> · Frontend Developer    <span class="t-accent">│</span>
<span class="t-accent">╰───────────────────────────────╯</span>

<span class="t-prop">Имя:</span>       <span class="t-str">BITER</span>
<span class="t-prop">Роль:</span>      <span class="t-str">Frontend Developer & UI/UX</span>
<span class="t-prop">Опыт:</span>      <span class="t-num">2+</span> года
<span class="t-prop">Локация:</span>  <span class="t-str">🌍 Россия</span>
<span class="t-prop">Страсть:</span>  <span class="t-str">Canvas, GSAP, интерактивные интерфейсы</span>

<span class="t-muted">Создаю цифровые впечатления с вниманием</span>
<span class="t-muted">к деталям и любовью к анимациям.</span>`
        },

        skills: {
            desc: "Навыки и технологии",
            run: () => `
<span class="t-kw">▸ Frontend</span>
  <span class="t-str">HTML5</span>  <span class="t-bar">████████████████████</span> <span class="t-num">95%</span>
  <span class="t-str">CSS3</span>   <span class="t-bar">██████████████████░░</span> <span class="t-num">90%</span>
  <span class="t-str">JS</span>     <span class="t-bar">█████████████████░░░</span> <span class="t-num">85%</span>

<span class="t-kw">▸ Анимации</span>
  <span class="t-str">GSAP</span>    <span class="t-bar">████████████████████</span> <span class="t-num">95%</span>
  <span class="t-str">Canvas</span>  <span class="t-bar">██████████████████░░</span> <span class="t-num">88%</span>

<span class="t-kw">▸ Прочее</span>
  <span class="t-str">Node.js</span>  <span class="t-bar">████████████░░░░░░░░</span> <span class="t-num">60%</span>
  <span class="t-str">HLS.js</span>   <span class="t-bar">███████████████░░░░░</span> <span class="t-num">75%</span>
  <span class="t-str">UI/UX</span>    <span class="t-bar">████████████████████</span> <span class="t-num">92%</span>`
        },

        projects: {
            desc: "Мои проекты",
            run: () => `
<span class="t-kw">▸ Проекты:</span>

  <span class="t-accent">01.</span> <span class="t-str">OPA 201</span>
     <span class="t-muted">Сайт городской футбольной лиги</span>
     <span class="t-tag">HLS</span> <span class="t-tag">GSAP</span> <span class="t-tag">Canvas</span>
     <span class="t-link" data-href="#projects">→ посмотреть</span>

  <span class="t-accent">02.</span> <span class="t-str">Juggler</span>
     <span class="t-muted">Платформа управления задачами</span>
     <span class="t-tag">Node.js</span> <span class="t-tag">Canvas</span> <span class="t-tag">Auth</span>
     <span class="t-link" data-href="#projects">→ посмотреть</span>

  <span class="t-accent">03.</span> <span class="t-str">Moodle v2</span>
     <span class="t-muted">LMS система с HLS-видеолекциями</span>
     <span class="t-tag">Canvas</span> <span class="t-tag">HLS</span> <span class="t-tag">Admin Panel</span>
     <span class="t-link" data-href="#projects">→ посмотреть</span>`
        },

        contact: {
            desc: "Контакты",
            run: () => `
<span class="t-kw">▸ Связаться:</span>

  <span class="t-prop">Telegram:</span>  <span class="t-str">@biter</span>
  <span class="t-prop">GitHub:</span>    <span class="t-str">github.com/biter</span>
  <span class="t-prop">Email:</span>     <span class="t-str">biter@dev.ru</span>

<span class="t-muted">Открыт к фрилансу и сотрудничеству.</span>
<span class="t-muted">Отвечаю в течение нескольких часов.</span>`
        },

        stats: {
            desc: "Статистика",
            run: () => `
<span class="t-kw">▸ Статистика:</span>

  <span class="t-prop">Проектов завершено:</span>  <span class="t-num">3+</span>
  <span class="t-prop">Лет практики:</span>       <span class="t-num">2+</span>
  <span class="t-prop">Технологий:</span>          <span class="t-num">8+</span>
  <span class="t-prop">Чашек кофе:</span>          <span class="t-num">∞</span>
  <span class="t-prop">Строк кода:</span>          <span class="t-num">50,000+</span>
  <span class="t-prop">Багов исправлено:</span>    <span class="t-num">тоже много</span>

<span class="t-accent">█████████████████████ 100% отдачи</span>`
        },

        hire: {
            desc: "Готов к работе?",
            run: () => `
<span class="t-kw">▸ Статус найма:</span>

  <span class="t-str">● Открыт к работе</span>  <span class="t-green">ACTIVE</span>

<span class="t-muted">Готов к фрилансу, контракту или</span>
<span class="t-muted">постоянному сотрудничеству.</span>

<span class="t-prop">Напиши мне:</span> <span class="t-accent">contact → Telegram</span>
<span class="t-muted">или введи команду</span> <span class="t-cmd">contact</span>`
        },

        socials: {
            desc: "Социальные сети",
            run: () => `
<span class="t-kw">▸ Socials:</span>

  <span class="t-accent">⌬</span> <span class="t-str">Telegram</span>  — @biter
  <span class="t-accent">⌬</span> <span class="t-str">GitHub</span>    — github.com/biter`
        },

        matrix: {
            desc: "🔴 Easter egg",
            run: (terminalEl) => {
                startMatrix(terminalEl);
                return `<span class="t-accent">Добро пожаловать в Матрицу, Neo...</span>
<span class="t-muted">Нажми</span> <span class="t-cmd">clear</span> <span class="t-muted">чтобы выйти</span>`;
            }
        },

        clear: {
            desc: "Очистить терминал",
            run: (terminalEl) => {
                setTimeout(() => {
                    const output = terminalEl.querySelector('.t-output');
                    if (output) output.innerHTML = '';
                    stopMatrix();
                }, 50);
                return '';
            }
        },

        exit: {
            desc: "Закрыть терминал",
            run: (terminalEl) => {
                setTimeout(() => closeTerminal(), 400);
                return '<span class="t-muted">Закрываю терминал...</span>';
            }
        }
    };

    // ====== MATRIX RAIN ======
    let matrixInterval = null;
    let matrixCanvas = null;

    function startMatrix(terminalEl) {
        stopMatrix();
        const body = terminalEl.querySelector('.t-body');
        matrixCanvas = document.createElement('canvas');
        matrixCanvas.className = 't-matrix-canvas';
        matrixCanvas.style.cssText = 'position:absolute;top:0;left:0;width:100%;height:100%;z-index:0;opacity:0.18;pointer-events:none;';
        body.appendChild(matrixCanvas);

        const ctx = matrixCanvas.getContext('2d');
        function resize() {
            matrixCanvas.width = matrixCanvas.offsetWidth;
            matrixCanvas.height = matrixCanvas.offsetHeight;
        }
        resize();

        const chars = 'アイウエオカキクケコサシスセソタチツテトナニヌネノハヒフヘホ01010110BITER';
        const cols = Math.floor(matrixCanvas.width / 14);
        const drops = Array(cols).fill(1);

        matrixInterval = setInterval(() => {
            ctx.fillStyle = 'rgba(12,8,16,0.05)';
            ctx.fillRect(0, 0, matrixCanvas.width, matrixCanvas.height);
            ctx.fillStyle = '#ff7c2a';
            ctx.font = '13px JetBrains Mono, monospace';
            for (let i = 0; i < drops.length; i++) {
                const ch = chars[Math.floor(Math.random() * chars.length)];
                ctx.fillStyle = Math.random() > 0.95 ? '#fff' : (Math.random() > 0.5 ? '#ff7c2a' : '#ff2d6b');
                ctx.fillText(ch, i * 14, drops[i] * 14);
                if (drops[i] * 14 > matrixCanvas.height && Math.random() > 0.975) drops[i] = 0;
                drops[i]++;
            }
        }, 50);
    }

    function stopMatrix() {
        if (matrixInterval) { clearInterval(matrixInterval); matrixInterval = null; }
        if (matrixCanvas) { matrixCanvas.remove(); matrixCanvas = null; }
    }

    // ====== TERMINAL STATE ======
    let history = [];
    let historyIndex = -1;
    let isOpen = false;
    let terminalEl = null;

    function closeTerminal() {
        if (!terminalEl) return;
        terminalEl.classList.remove('t-open');
        setTimeout(() => {
            isOpen = false;
            stopMatrix();
        }, 400);
    }

    function openTerminal() {
        if (!terminalEl) return;
        terminalEl.classList.add('t-open');
        isOpen = true;
        setTimeout(() => {
            const input = terminalEl.querySelector('.t-input');
            if (input) input.focus();
        }, 400);
    }

    // ====== AUTOCOMPLETE ======
    const cmdNames = Object.keys(COMMANDS);

    function autocomplete(value) {
        if (!value) return value;
        const match = cmdNames.find(c => c.startsWith(value.toLowerCase()));
        return match || value;
    }

    // ====== PRINT OUTPUT ======
    function printOutput(html, outputEl) {
        const line = document.createElement('div');
        line.className = 't-line';
        line.innerHTML = html;
        outputEl.appendChild(line);

        // Кликабельные ссылки
        line.querySelectorAll('.t-link').forEach(el => {
            el.style.cursor = 'pointer';
            el.addEventListener('click', () => {
                const href = el.getAttribute('data-href');
                if (href) {
                    closeTerminal();
                    setTimeout(() => {
                        const target = document.querySelector(href);
                        if (target) target.scrollIntoView({ behavior: 'smooth' });
                    }, 500);
                }
            });
        });

        outputEl.scrollTop = outputEl.scrollHeight;
    }

    // ====== RUN COMMAND ======
    function runCommand(cmd, outputEl) {
        const trimmed = cmd.trim().toLowerCase();
        if (!trimmed) return;

        // Добавляем в историю
        if (history[history.length - 1] !== trimmed) history.push(trimmed);
        historyIndex = history.length;

        // Отображаем ввод
        const promptLine = document.createElement('div');
        promptLine.className = 't-prompt-line';
        promptLine.innerHTML = `<span class="t-prompt-sym">❯</span> <span class="t-prompt-cmd">${escapeHtml(cmd)}</span>`;
        outputEl.appendChild(promptLine);

        if (COMMANDS[trimmed]) {
            const result = COMMANDS[trimmed].run(terminalEl);
            if (result) printOutput(result, outputEl);
        } else if (trimmed) {
            printOutput(`<span class="t-error">Команда не найдена: "${escapeHtml(cmd)}"</span>\n<span class="t-muted">Введите</span> <span class="t-cmd">help</span> <span class="t-muted">для списка команд</span>`, outputEl);
        }

        outputEl.scrollTop = outputEl.scrollHeight;
    }

    function escapeHtml(str) {
        return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
    }

    // ====== BUILD TERMINAL DOM ======
    function buildTerminal() {
        terminalEl = document.createElement('div');
        terminalEl.className = 't-overlay';
        terminalEl.id = 'biter-terminal';
        terminalEl.innerHTML = `
        <div class="t-backdrop"></div>
        <div class="t-window">
            <div class="t-titlebar">
                <div class="t-dots">
                    <span class="t-dot t-dot-red" id="t-close-btn" title="Закрыть"></span>
                    <span class="t-dot t-dot-yellow"></span>
                    <span class="t-dot t-dot-green"></span>
                </div>
                <span class="t-title">biter@portfolio: ~</span>
                <span class="t-badge">v1.0.0</span>
            </div>
            <div class="t-body">
                <div class="t-output" id="t-output">
                    <div class="t-welcome">
<span class="t-ascii">
 ██████╗ ██╗████████╗███████╗██████╗
 ██╔══██╗██║╚══██╔══╝██╔════╝██╔══██╗
 ██████╔╝██║   ██║   █████╗  ██████╔╝
 ██╔══██╗██║   ██║   ██╔══╝  ██╔══██╗
 ██████╔╝██║   ██║   ███████╗██║  ██║
 ╚═════╝ ╚═╝   ╚═╝   ╚══════╝╚═╝  ╚═╝
</span>
<span class="t-muted">Frontend Developer Terminal · v1.0.0</span>
<span class="t-muted">Введите <span class="t-cmd">help</span> для начала работы</span>
                    </div>
                </div>
                <div class="t-input-row">
                    <span class="t-prompt-sym">❯</span>
                    <input class="t-input" id="t-input" type="text" 
                           autocomplete="off" autocorrect="off" 
                           spellcheck="false" placeholder="введите команду...">
                    <span class="t-cursor-hint">Tab</span>
                </div>
            </div>
        </div>`;

        document.body.appendChild(terminalEl);

        const outputEl = terminalEl.querySelector('#t-output');
        const inputEl = terminalEl.querySelector('#t-input');

        // Закрыть по клику на фон
        terminalEl.querySelector('.t-backdrop').addEventListener('click', closeTerminal);

        // Закрыть по красной кнопке
        terminalEl.querySelector('#t-close-btn').addEventListener('click', closeTerminal);

        // Обработчик ввода
        inputEl.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') {
                const cmd = inputEl.value;
                inputEl.value = '';
                runCommand(cmd, outputEl);
            } else if (e.key === 'Tab') {
                e.preventDefault();
                const completed = autocomplete(inputEl.value);
                inputEl.value = completed;
            } else if (e.key === 'ArrowUp') {
                e.preventDefault();
                if (historyIndex > 0) {
                    historyIndex--;
                    inputEl.value = history[historyIndex] || '';
                }
            } else if (e.key === 'ArrowDown') {
                e.preventDefault();
                if (historyIndex < history.length - 1) {
                    historyIndex++;
                    inputEl.value = history[historyIndex] || '';
                } else {
                    historyIndex = history.length;
                    inputEl.value = '';
                }
            } else if (e.key === 'l' && e.ctrlKey) {
                e.preventDefault();
                runCommand('clear', outputEl);
            }
        });

        // Клик на окно — фокус на input
        terminalEl.querySelector('.t-window').addEventListener('click', (e) => {
            if (e.target !== terminalEl.querySelector('.t-backdrop')) inputEl.focus();
        });

        return terminalEl;
    }

    // ====== TRIGGER BUTTON ======
    function createTriggerButton() {
        const btn = document.createElement('button');
        btn.className = 't-trigger-btn';
        btn.id = 'terminalTrigger';
        btn.setAttribute('aria-label', 'Открыть терминал');
        btn.innerHTML = `
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <polyline points="4 17 10 11 4 5"></polyline>
                <line x1="12" y1="19" x2="20" y2="19"></line>
            </svg>
            <span>Terminal</span>`;

        btn.addEventListener('click', () => {
            if (isOpen) closeTerminal();
            else openTerminal();
        });

        document.body.appendChild(btn);
    }

    // ====== KEYBOARD SHORTCUT ======
    document.addEventListener('keydown', (e) => {
        // Ctrl+` или Ctrl+Shift+T
        if ((e.ctrlKey && e.key === '`') || (e.ctrlKey && e.shiftKey && e.key === 'T')) {
            e.preventDefault();
            if (isOpen) closeTerminal();
            else openTerminal();
        }
        if (e.key === 'Escape' && isOpen) closeTerminal();
    });

    // ====== INIT ======
    document.addEventListener('DOMContentLoaded', () => {
        buildTerminal();
        createTriggerButton();
    });

    // Если DOM уже загружен
    if (document.readyState !== 'loading') {
        buildTerminal();
        createTriggerButton();
    }
})();
