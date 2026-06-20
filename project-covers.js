/* =============================================
   PROJECT CANVAS COVERS — живые обложки
   ============================================= */
(function () {
    'use strict';

    /* ── Конфигурация тем ─────────────────── */
    const THEMES = {
        opa: {
            bg: ['#0a1628', '#0d1f3c'],
            colors: ['#ff4757', '#ff6b35', '#ffd32a', '#2ed573'],
            label: 'OPA 201',
            icon: '⚽',
            type: 'stadium'
        },
        juggler: {
            bg: ['#0d1a2a', '#0a1520'],
            colors: ['#00d2ff', '#3a7bd5', '#7c3aed', '#00b09b'],
            label: 'Juggler',
            icon: '🎯',
            type: 'kanban'
        },
        moodle: {
            bg: ['#1a0a2e', '#160828'],
            colors: ['#a855f7', '#ec4899', '#ff7c2a', '#f59e0b'],
            label: 'Moodle v2',
            icon: '📚',
            type: 'learning'
        },
        dashboard: {
            bg: ['#0a1628', '#0d2040'],
            colors: ['#22d3ee', '#38bdf8', '#818cf8', '#34d399'],
            label: 'Dashboard',
            icon: '📊',
            type: 'chart'
        },
        nft: {
            bg: ['#0f0a1e', '#14102a'],
            colors: ['#f0abfc', '#e879f9', '#c084fc', '#a855f7'],
            label: 'NFT Bot',
            icon: '🤖',
            type: 'nft'
        },
        webgl: {
            bg: ['#020810', '#050c18'],
            colors: ['#ff7c2a', '#ff2d6b', '#ffb347', '#ff6b35'],
            label: 'WebGL Studio',
            icon: '✦',
            type: 'webgl'
        },
        punkt: {
            bg: ['#0a1a0d', '#111f0f'],
            colors: ['#4ade80', '#86efac', '#a3e635', '#fbbf24'],
            label: 'Пункт Назначения',
            icon: '🌲',
            type: 'punkt'
        }
    };

    /* ── Утилиты ─────────────────────────── */
    function lerp(a, b, t) { return a + (b - a) * t; }
    function rand(min, max) { return Math.random() * (max - min) + min; }
    function hexToRgb(hex) {
        const r = parseInt(hex.slice(1, 3), 16);
        const g = parseInt(hex.slice(3, 5), 16);
        const b = parseInt(hex.slice(5, 7), 16);
        return { r, g, b };
    }
    function rgbA(hex, a) {
        const { r, g, b } = hexToRgb(hex);
        return `rgba(${r},${g},${b},${a})`;
    }

    /* ══════════════════════════════════════
       РИСОВАЛКИ ПОД КАЖДЫЙ ТИП
       ══════════════════════════════════════ */

    /* ── OPA 201: Стадион + мяч + частицы ── */
    function drawOpa(ctx, W, H, t, theme) {
        // Фон
        const g = ctx.createLinearGradient(0, 0, W, H);
        g.addColorStop(0, theme.bg[0]);
        g.addColorStop(1, theme.bg[1]);
        ctx.fillStyle = g;
        ctx.fillRect(0, 0, W, H);

        // Газон (дуги стадиона)
        for (let i = 0; i < 5; i++) {
            ctx.beginPath();
            ctx.arc(W / 2, H + 20, 80 + i * 35, Math.PI, 0);
            ctx.strokeStyle = `rgba(46, 213, 115, ${0.06 - i * 0.01})`;
            ctx.lineWidth = 1;
            ctx.stroke();
        }

        // Центральный круг поля
        ctx.beginPath();
        ctx.arc(W / 2, H * 0.65, 55, 0, Math.PI * 2);
        ctx.strokeStyle = 'rgba(46, 213, 115, 0.12)';
        ctx.lineWidth = 1;
        ctx.stroke();

        // Прожекторы
        [0.15, 0.85].forEach((xf, i) => {
            const x = W * xf;
            const ang = i === 0 ? 0.4 : -0.4;
            const lg = ctx.createRadialGradient(x, 10, 0, x + Math.sin(ang) * 80, 80, 120);
            lg.addColorStop(0, `rgba(255, 220, 80, 0.2)`);
            lg.addColorStop(1, `transparent`);
            ctx.fillStyle = lg;
            ctx.beginPath();
            ctx.moveTo(x, 10);
            ctx.lineTo(x + Math.sin(ang) * 150, H);
            ctx.lineTo(x - Math.sin(ang) * 20, H);
            ctx.closePath();
            ctx.fill();
        });

        // Частицы — болельщики
        const pts = (ctx._pts_opa = ctx._pts_opa || Array.from({ length: 40 }, () => ({
            x: rand(0, W), y: rand(H * 0.1, H * 0.55),
            vx: rand(-0.3, 0.3), vy: rand(-0.3, 0.3),
            r: rand(1.5, 3.5), c: theme.colors[Math.floor(rand(0, theme.colors.length))]
        })));

        pts.forEach(p => {
            p.x += p.vx; p.y += p.vy;
            if (p.x < 0 || p.x > W) p.vx *= -1;
            if (p.y < H * 0.1 || p.y > H * 0.55) p.vy *= -1;
            const pulse = 0.5 + 0.5 * Math.sin(t * 0.002 + p.x);
            ctx.beginPath();
            ctx.arc(p.x, p.y, p.r * pulse, 0, Math.PI * 2);
            ctx.fillStyle = rgbA(p.c, 0.6 * pulse);
            ctx.fill();
        });

        // Футбольный мяч (анимированный)
        const bx = W / 2 + Math.sin(t * 0.001) * 20;
        const by = H * 0.48 + Math.cos(t * 0.0015) * 8;
        drawBall(ctx, bx, by, 24, t);

        // Название
        drawLabel(ctx, W, H, theme.label, theme.colors[0]);
    }

    function drawBall(ctx, cx, cy, r, t) {
        ctx.save();
        ctx.translate(cx, cy);
        ctx.rotate(t * 0.001);
        // Тень
        ctx.beginPath();
        ctx.arc(0, 0, r, 0, Math.PI * 2);
        const bg = ctx.createRadialGradient(-r * 0.3, -r * 0.3, 0, 0, 0, r);
        bg.addColorStop(0, '#fff');
        bg.addColorStop(0.6, '#ddd');
        bg.addColorStop(1, '#aaa');
        ctx.fillStyle = bg;
        ctx.fill();
        // Пятиугольники
        ctx.strokeStyle = '#333';
        ctx.lineWidth = 0.8;
        for (let i = 0; i < 5; i++) {
            const a = (i / 5) * Math.PI * 2;
            const bx2 = Math.cos(a) * r * 0.5, by2 = Math.sin(a) * r * 0.5;
            ctx.beginPath();
            for (let j = 0; j < 5; j++) {
                const aa = a + (j / 5) * Math.PI * 2;
                const px = bx2 + Math.cos(aa) * r * 0.28;
                const py = by2 + Math.sin(aa) * r * 0.28;
                j === 0 ? ctx.moveTo(px, py) : ctx.lineTo(px, py);
            }
            ctx.closePath();
            ctx.fillStyle = i % 2 === 0 ? '#222' : '#fff';
            ctx.fill();
            ctx.stroke();
        }
        ctx.restore();
    }

    /* ── Juggler: Kanban доска ─────────────── */
    function drawJuggler(ctx, W, H, t, theme) {
        const g = ctx.createLinearGradient(0, 0, W, H);
        g.addColorStop(0, theme.bg[0]);
        g.addColorStop(1, theme.bg[1]);
        ctx.fillStyle = g;
        ctx.fillRect(0, 0, W, H);

        // Сетка точек
        for (let x = 0; x < W; x += 24) {
            for (let y = 0; y < H; y += 24) {
                ctx.beginPath();
                ctx.arc(x, y, 0.8, 0, Math.PI * 2);
                ctx.fillStyle = 'rgba(100,150,255,0.08)';
                ctx.fill();
            }
        }

        // Колонки Kanban
        const cols = ['Todo', 'In Progress', 'Done'];
        const cw = (W - 60) / 3;
        cols.forEach((colName, ci) => {
            const cx = 20 + ci * (cw + 10);

            // Заголовок колонки
            ctx.fillStyle = `rgba(${ci === 1 ? '0,210,255' : '255,255,255'},0.04)`;
            roundRect(ctx, cx, 15, cw, 18, 5);
            ctx.fill();
            ctx.fillStyle = ci === 1 ? theme.colors[0] : 'rgba(255,255,255,0.3)';
            ctx.font = `600 8px Outfit, sans-serif`;
            ctx.textAlign = 'center';
            ctx.fillText(colName, cx + cw / 2, 27);

            // Карточки задач
            const count = ci === 0 ? 3 : ci === 1 ? 2 : 3;
            for (let i = 0; i < count; i++) {
                const cardY = 42 + i * 38;
                const isActive = ci === 1 && i === 0;
                const pulse = isActive ? 0.5 + 0.5 * Math.sin(t * 0.002) : 0;

                ctx.fillStyle = isActive
                    ? `rgba(0,210,255,${0.06 + pulse * 0.04})`
                    : 'rgba(255,255,255,0.04)';
                roundRect(ctx, cx, cardY, cw, 30, 5);
                ctx.fill();

                if (isActive) {
                    ctx.strokeStyle = `rgba(0,210,255,${0.3 + pulse * 0.2})`;
                    ctx.lineWidth = 1;
                    roundRect(ctx, cx, cardY, cw, 30, 5);
                    ctx.stroke();
                }

                // Цветная полоска слева
                ctx.fillStyle = theme.colors[i % theme.colors.length];
                roundRect(ctx, cx + 3, cardY + 5, 3, 20, 2);
                ctx.fill();

                // Текстовые строки
                ctx.fillStyle = 'rgba(255,255,255,0.25)';
                ctx.fillRect(cx + 10, cardY + 8, cw * 0.55, 5);
                ctx.fillStyle = 'rgba(255,255,255,0.12)';
                ctx.fillRect(cx + 10, cardY + 17, cw * 0.35, 4);

                // Аватар
                ctx.beginPath();
                ctx.arc(cx + cw - 12, cardY + 15, 7, 0, Math.PI * 2);
                ctx.fillStyle = rgbA(theme.colors[i % theme.colors.length], 0.4);
                ctx.fill();
            }
        });

        drawLabel(ctx, W, H, theme.label, theme.colors[0]);
    }

    /* ── Moodle v2: LMS видеоплатформа ─────── */
    function drawMoodle(ctx, W, H, t, theme) {
        const g = ctx.createLinearGradient(0, 0, W, H);
        g.addColorStop(0, theme.bg[0]);
        g.addColorStop(1, theme.bg[1]);
        ctx.fillStyle = g;
        ctx.fillRect(0, 0, W, H);

        // Видеоплеер
        const vx = W * 0.05, vy = H * 0.08, vw = W * 0.6, vh = H * 0.55;
        ctx.fillStyle = 'rgba(0,0,0,0.5)';
        roundRect(ctx, vx, vy, vw, vh, 8);
        ctx.fill();
        ctx.strokeStyle = rgbA(theme.colors[0], 0.3);
        ctx.lineWidth = 1;
        roundRect(ctx, vx, vy, vw, vh, 8);
        ctx.stroke();

        // Кнопка play
        const pcx = vx + vw / 2, pcy = vy + vh / 2;
        const pulse = 0.85 + 0.15 * Math.sin(t * 0.002);
        ctx.beginPath();
        ctx.arc(pcx, pcy, 22 * pulse, 0, Math.PI * 2);
        ctx.fillStyle = rgbA(theme.colors[0], 0.15 * pulse);
        ctx.fill();
        ctx.beginPath();
        ctx.arc(pcx, pcy, 16 * pulse, 0, Math.PI * 2);
        ctx.fillStyle = rgbA(theme.colors[0], 0.35);
        ctx.fill();
        ctx.beginPath();
        ctx.moveTo(pcx - 6, pcy - 9);
        ctx.lineTo(pcx - 6, pcy + 9);
        ctx.lineTo(pcx + 11, pcy);
        ctx.closePath();
        ctx.fillStyle = '#fff';
        ctx.fill();

        // Прогресс-бар
        ctx.fillStyle = 'rgba(255,255,255,0.06)';
        roundRect(ctx, vx + 10, vy + vh - 18, vw - 20, 6, 3);
        ctx.fill();
        const prog = 0.35 + 0.15 * Math.sin(t * 0.0005);
        const pg = ctx.createLinearGradient(vx + 10, 0, vx + 10 + (vw - 20) * prog, 0);
        pg.addColorStop(0, theme.colors[0]);
        pg.addColorStop(1, theme.colors[1]);
        ctx.fillStyle = pg;
        roundRect(ctx, vx + 10, vy + vh - 18, (vw - 20) * prog, 6, 3);
        ctx.fill();

        // Правая панель — курсы
        const rx = vx + vw + 12, rw = W - rx - W * 0.05;
        for (let i = 0; i < 4; i++) {
            const cy2 = vy + i * (vh / 4 + 4);
            const isActive = i === 1;
            ctx.fillStyle = isActive ? rgbA(theme.colors[0], 0.08) : 'rgba(255,255,255,0.03)';
            roundRect(ctx, rx, cy2, rw, vh / 4 - 4, 6);
            ctx.fill();
            if (isActive) {
                ctx.strokeStyle = rgbA(theme.colors[0], 0.3);
                ctx.lineWidth = 1;
                roundRect(ctx, rx, cy2, rw, vh / 4 - 4, 6);
                ctx.stroke();
            }
            ctx.fillStyle = theme.colors[i % theme.colors.length];
            roundRect(ctx, rx + 4, cy2 + 5, 4, vh / 4 - 14, 2);
            ctx.fill();
            ctx.fillStyle = 'rgba(255,255,255,0.2)';
            ctx.fillRect(rx + 13, cy2 + 8, rw * 0.6, 4);
            ctx.fillStyle = 'rgba(255,255,255,0.1)';
            ctx.fillRect(rx + 13, cy2 + 15, rw * 0.4, 3);
        }

        // Нижняя строка прогресса
        ctx.fillStyle = 'rgba(255,255,255,0.05)';
        roundRect(ctx, vx, vy + vh + 12, vw * 0.45 - 6, 28, 6);
        ctx.fill();
        ctx.fillStyle = 'rgba(255,255,255,0.05)';
        roundRect(ctx, vx + vw * 0.45 + 6, vy + vh + 12, vw * 0.55 - 6, 28, 6);
        ctx.fill();

        drawLabel(ctx, W, H, theme.label, theme.colors[0]);
    }

    /* ── Dashboard: графики и аналитика ─────── */
    function drawDashboard(ctx, W, H, t, theme) {
        const g = ctx.createLinearGradient(0, 0, W, H);
        g.addColorStop(0, theme.bg[0]);
        g.addColorStop(1, theme.bg[1]);
        ctx.fillStyle = g;
        ctx.fillRect(0, 0, W, H);

        if (W < 450) {
            // Мобильная версия: только линейный график на всю ширину
            const gx = 14, gy = 20, gw = W - 28, gh = H - 40;
            ctx.fillStyle = 'rgba(255,255,255,0.03)';
            roundRect(ctx, gx, gy, gw, gh, 8);
            ctx.fill();

            // Сетка графика
            for (let i = 0; i <= 4; i++) {
                const y = gy + 10 + (gh - 25) * (i / 4);
                ctx.strokeStyle = 'rgba(255,255,255,0.05)';
                ctx.lineWidth = 0.5;
                ctx.beginPath();
                ctx.moveTo(gx + 10, y);
                ctx.lineTo(gx + gw - 10, y);
                ctx.stroke();
            }

            // Линия данных
            const pts2 = [0.3, 0.5, 0.4, 0.7, 0.6, 0.85, 0.75, 0.9];
            const pxw = (gw - 20) / (pts2.length - 1);

            // Заливка под графиком
            ctx.beginPath();
            ctx.moveTo(gx + 10, gy + gh - 15);
            pts2.forEach((v, i) => {
                const px = gx + 10 + i * pxw;
                const py = gy + gh - 15 - (gh - 30) * v;
                i === 0 ? ctx.lineTo(px, py) : ctx.bezierCurveTo(px - pxw * 0.4, gy + gh - 15 - (gh - 30) * pts2[i - 1], px - pxw * 0.6, py, px, py);
            });
            ctx.lineTo(gx + 10 + (pts2.length - 1) * pxw, gy + gh - 15);
            ctx.closePath();
            const fillG = ctx.createLinearGradient(0, gy, 0, gy + gh);
            fillG.addColorStop(0, rgbA(theme.colors[0], 0.2));
            fillG.addColorStop(1, 'transparent');
            ctx.fillStyle = fillG;
            ctx.fill();

            // Линия
            ctx.beginPath();
            pts2.forEach((v, i) => {
                const px = gx + 10 + i * pxw;
                const py = gy + gh - 15 - (gh - 30) * v;
                i === 0 ? ctx.moveTo(px, py) : ctx.bezierCurveTo(px - pxw * 0.4, gy + gh - 15 - (gh - 30) * pts2[i - 1], px - pxw * 0.6, py, px, py);
            });
            ctx.strokeStyle = theme.colors[0];
            ctx.lineWidth = 2;
            ctx.stroke();

            // Точки
            pts2.forEach((v, i) => {
                const px = gx + 10 + i * pxw;
                const py = gy + gh - 15 - (gh - 30) * v;
                ctx.beginPath();
                ctx.arc(px, py, 3, 0, Math.PI * 2);
                ctx.fillStyle = theme.colors[0];
                ctx.fill();
            });
        } else {
            // Десктопная версия: карточки сверху + график + радар
            const cw = (W - 50) / 4;
            [{ v: '₽48K', l: 'Revenue', c: 0 }, { v: '6', l: 'Projects', c: 1 },
             { v: '8+', l: 'Skills', c: 2 }, { v: '2yr', l: 'XP', c: 3 }].forEach((d, i) => {
                const cx = 14 + i * (cw + 8);
                ctx.fillStyle = 'rgba(255,255,255,0.04)';
                roundRect(ctx, cx, 14, cw, 35, 6);
                ctx.fill();
                ctx.strokeStyle = rgbA(theme.colors[i], 0.2);
                ctx.lineWidth = 1;
                roundRect(ctx, cx, 14, cw, 35, 6);
                ctx.stroke();
                ctx.fillStyle = theme.colors[i];
                ctx.font = `bold 11px Outfit`;
                ctx.textAlign = 'center';
                ctx.fillText(d.v, cx + cw / 2, 30);
                ctx.fillStyle = 'rgba(255,255,255,0.3)';
                ctx.font = `500 7px Outfit`;
                ctx.fillText(d.l, cx + cw / 2, 41);
            });

            // Линейный график
            const gx = 14, gy = 58, gw = W * 0.6, gh = H - 85;
            ctx.fillStyle = 'rgba(255,255,255,0.03)';
            roundRect(ctx, gx, gy, gw, gh, 8);
            ctx.fill();

            // Сетка графика
            for (let i = 0; i <= 4; i++) {
                const y = gy + 10 + (gh - 25) * (i / 4);
                ctx.strokeStyle = 'rgba(255,255,255,0.05)';
                ctx.lineWidth = 0.5;
                ctx.beginPath();
                ctx.moveTo(gx + 10, y);
                ctx.lineTo(gx + gw - 10, y);
                ctx.stroke();
            }

            // Линия данных
            const pts2 = [0.3, 0.5, 0.4, 0.7, 0.6, 0.85, 0.75, 0.9];
            const pxw = (gw - 20) / (pts2.length - 1);

            // Заливка под графиком
            ctx.beginPath();
            ctx.moveTo(gx + 10, gy + gh - 15);
            pts2.forEach((v, i) => {
                const px = gx + 10 + i * pxw;
                const py = gy + gh - 15 - (gh - 30) * v;
                i === 0 ? ctx.lineTo(px, py) : ctx.bezierCurveTo(px - pxw * 0.4, gy + gh - 15 - (gh - 30) * pts2[i - 1], px - pxw * 0.6, py, px, py);
            });
            ctx.lineTo(gx + 10 + (pts2.length - 1) * pxw, gy + gh - 15);
            ctx.closePath();
            const fillG = ctx.createLinearGradient(0, gy, 0, gy + gh);
            fillG.addColorStop(0, rgbA(theme.colors[0], 0.2));
            fillG.addColorStop(1, 'transparent');
            ctx.fillStyle = fillG;
            ctx.fill();

            // Линия
            ctx.beginPath();
            pts2.forEach((v, i) => {
                const px = gx + 10 + i * pxw;
                const py = gy + gh - 15 - (gh - 30) * v;
                i === 0 ? ctx.moveTo(px, py) : ctx.bezierCurveTo(px - pxw * 0.4, gy + gh - 15 - (gh - 30) * pts2[i - 1], px - pxw * 0.6, py, px, py);
            });
            ctx.strokeStyle = theme.colors[0];
            ctx.lineWidth = 2;
            ctx.stroke();

            // Точки
            pts2.forEach((v, i) => {
                const px = gx + 10 + i * pxw;
                const py = gy + gh - 15 - (gh - 30) * v;
                ctx.beginPath();
                ctx.arc(px, py, 3, 0, Math.PI * 2);
                ctx.fillStyle = theme.colors[0];
                ctx.fill();
            });

            // Правая панель — радар навыков
            const rx = gx + gw + 14, rw = W - rx - 14;
            ctx.fillStyle = 'rgba(255,255,255,0.03)';
            roundRect(ctx, rx, gy, rw, gh, 8);
            ctx.fill();
            const rcx = rx + rw / 2, rcy = gy + gh / 2, rr = Math.min(rw, gh) * 0.35;
            const skills = [0.9, 0.75, 0.85, 0.6, 0.95, 0.7];
            ctx.beginPath();
            skills.forEach((v, i) => {
                const a = (i / skills.length) * Math.PI * 2 - Math.PI / 2;
                const px = rcx + Math.cos(a) * rr * v;
                const py = rcy + Math.sin(a) * rr * v;
                i === 0 ? ctx.moveTo(px, py) : ctx.lineTo(px, py);
            });
            ctx.closePath();
            ctx.fillStyle = rgbA(theme.colors[0], 0.15);
            ctx.fill();
            ctx.strokeStyle = rgbA(theme.colors[0], 0.6);
            ctx.lineWidth = 1.5;
            ctx.stroke();

            // Оси радара
            skills.forEach((_, i) => {
                const a = (i / skills.length) * Math.PI * 2 - Math.PI / 2;
                ctx.strokeStyle = 'rgba(255,255,255,0.06)';
                ctx.lineWidth = 0.5;
                ctx.beginPath();
                ctx.moveTo(rcx, rcy);
                ctx.lineTo(rcx + Math.cos(a) * rr, rcy + Math.sin(a) * rr);
                ctx.stroke();
            });
        }

        drawLabel(ctx, W, H, theme.label, theme.colors[0]);
    }

    /* ── NFT Bot: телеграм + крипто ────────── */
    function drawNFT(ctx, W, H, t, theme) {
        const g = ctx.createLinearGradient(0, 0, W, H);
        g.addColorStop(0, theme.bg[0]);
        g.addColorStop(1, theme.bg[1]);
        ctx.fillStyle = g;
        ctx.fillRect(0, 0, W, H);

        // Шестиугольная сетка
        for (let x = 0; x < W + 30; x += 36) {
            for (let y = 0; y < H + 30; y += 42) {
                drawHex(ctx, x + (y % 2 === 0 ? 0 : 18), y, 18, 'rgba(168,85,247,0.04)');
            }
        }

        // Чат-пузырьки
        const msgs = [
            { text: '/start', user: true, y: 18 },
            { text: '🤖 NFT Bot активен', user: false, y: 48 },
            { text: '/collection', user: true, y: 78 },
            { text: '📊 Bayc: 45 ETH', user: false, y: 108 },
        ];

        msgs.forEach(({ text, user, y }) => {
            const maxW = W * 0.55;
            ctx.font = '9px JetBrains Mono';
            const tw = Math.min(ctx.measureText(text).width + 20, maxW);
            const bx = user ? W - tw - 14 : 14;
            ctx.fillStyle = user ? rgbA(theme.colors[0], 0.12) : 'rgba(255,255,255,0.05)';
            roundRect(ctx, bx, y, tw, 22, 10);
            ctx.fill();
            ctx.strokeStyle = user ? rgbA(theme.colors[0], 0.25) : 'rgba(255,255,255,0.08)';
            ctx.lineWidth = 1;
            roundRect(ctx, bx, y, tw, 22, 10);
            ctx.stroke();
            ctx.fillStyle = user ? theme.colors[0] : 'rgba(255,255,255,0.7)';
            ctx.textAlign = user ? 'right' : 'left';
            ctx.fillText(text, user ? bx + tw - 10 : bx + 10, y + 15);
        });

        // NFT карточки внизу
        const cardW = (W - 50) / 3;
        ['#7B3FE4', '#C026D3', '#DB2777'].forEach((c, i) => {
            const cx = 14 + i * (cardW + 10);
            const cy = H - 72;
            // Карточка
            ctx.fillStyle = `rgba(${hexToRgb(c).r},${hexToRgb(c).g},${hexToRgb(c).b},0.12)`;
            roundRect(ctx, cx, cy, cardW, 58, 8);
            ctx.fill();
            ctx.strokeStyle = `rgba(${hexToRgb(c).r},${hexToRgb(c).g},${hexToRgb(c).b},0.35)`;
            ctx.lineWidth = 1;
            roundRect(ctx, cx, cy, cardW, 58, 8);
            ctx.stroke();
            // Иконка
            ctx.fillStyle = c;
            ctx.font = `14px serif`;
            ctx.textAlign = 'center';
            ctx.fillText(['💎', '🦴', '🌀'][i], cx + cardW / 2, cy + 24);
            // Цена
            ctx.font = `bold 9px Outfit`;
            ctx.fillStyle = 'rgba(255,255,255,0.7)';
            ctx.fillText([' 45 ETH', '12 ETH', ' 8 ETH'][i], cx + cardW / 2, cy + 38);
            // Пульс активности
            if (i === 0) {
                ctx.beginPath();
                ctx.arc(cx + cardW - 10, cy + 10, 4, 0, Math.PI * 2);
                ctx.fillStyle = rgbA('#28c840', 0.7 + 0.3 * Math.sin(t * 0.003));
                ctx.fill();
            }
        });

        ctx.textAlign = 'left';
        drawLabel(ctx, W, H, theme.label, theme.colors[0]);
    }

    function drawWebGL(ctx, W, H, t, theme) {
        ctx.fillStyle = theme.bg[0];
        ctx.fillRect(0, 0, W, H);

        // Шейдерный градиент (движущийся)
        const cx = W * (0.3 + 0.2 * Math.sin(t * 0.0005));
        const cy = H * (0.4 + 0.2 * Math.cos(t * 0.0007));
        const rg = ctx.createRadialGradient(cx, cy, 0, cx, cy, W * 0.7);
        rg.addColorStop(0, rgbA(theme.colors[0], 0.3));
        rg.addColorStop(0.4, rgbA(theme.colors[1], 0.15));
        rg.addColorStop(1, 'transparent');
        ctx.fillStyle = rg;
        ctx.fillRect(0, 0, W, H);

        const rg2 = ctx.createRadialGradient(W - cx, H - cy, 0, W - cx, H - cy, W * 0.5);
        rg2.addColorStop(0, rgbA(theme.colors[2], 0.2));
        rg2.addColorStop(1, 'transparent');
        ctx.fillStyle = rg2;
        ctx.fillRect(0, 0, W, H);

        // 3D куб (изометрический)
        const kcx = W / 2, kcy = H / 2 - 5, ks = 38;
        drawIsoCube(ctx, kcx, kcy, ks, t, theme.colors);

        // Орбитальные кольца
        for (let ring = 0; ring < 3; ring++) {
            ctx.save();
            ctx.translate(kcx, kcy);
            ctx.rotate(t * 0.0008 * (ring + 1) * (ring % 2 === 0 ? 1 : -1));
            ctx.scale(1, 0.35 + ring * 0.1);
            ctx.beginPath();
            ctx.arc(0, 0, 52 + ring * 20, 0, Math.PI * 2);
            ctx.strokeStyle = rgbA(theme.colors[ring % theme.colors.length], 0.2);
            ctx.lineWidth = 1;
            ctx.setLineDash([4, 6]);
            ctx.stroke();
            ctx.setLineDash([]);
            ctx.restore();
        }

        // Частицы
        const pts3 = (ctx._pts_wgl = ctx._pts_wgl || Array.from({ length: 25 }, () => ({
            x: rand(0, W), y: rand(0, H), vx: rand(-0.4, 0.4), vy: rand(-0.4, 0.4),
            r: rand(1, 3), c: theme.colors[Math.floor(rand(0, theme.colors.length))]
        })));
        pts3.forEach(p => {
            p.x += p.vx; p.y += p.vy;
            if (p.x < 0 || p.x > W) p.vx *= -1;
            if (p.y < 0 || p.y > H) p.vy *= -1;
            const gl = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.r * 3);
            gl.addColorStop(0, rgbA(p.c, 0.8));
            gl.addColorStop(1, 'transparent');
            ctx.fillStyle = gl;
            ctx.beginPath();
            ctx.arc(p.x, p.y, p.r * 3, 0, Math.PI * 2);
            ctx.fill();
        });

        // Панель редактора справа (только на десктопе/планшетах)
        if (W >= 450) {
            const epx = W * 0.68, epy = 12, epw = W * 0.3, eph = H - 24;
            ctx.fillStyle = 'rgba(0,0,0,0.4)';
            roundRect(ctx, epx, epy, epw, eph, 6);
            ctx.fill();
            ctx.strokeStyle = rgbA(theme.colors[0], 0.2);
            ctx.lineWidth = 1;
            roundRect(ctx, epx, epy, epw, eph, 6);
            ctx.stroke();

            // Строки кода
            const lines = [
                { t: 'void main() {', c: theme.colors[1] },
                { t: '  float d = length(', c: '#fff' },
                { t: '    uv - 0.5);', c: '#fff' },
                { t: '  col = mix(a, b,', c: theme.colors[0] },
                { t: '    sin(d*8.+t));', c: '#fff' },
                { t: '}', c: theme.colors[1] },
            ];
            ctx.font = '7px JetBrains Mono';
            ctx.textAlign = 'left';
            lines.forEach((l, i) => {
                ctx.fillStyle = l.c + 'CC';
                ctx.fillText(l.t, epx + 8, epy + 20 + i * 12);
            });
        }

        drawLabel(ctx, W, H, theme.label, theme.colors[0]);
    }

    /* ── Punkt: природный глэмпинг ─────────── */
    function drawPunkt(ctx, W, H, t, theme) {
        // Ночное небо → лесной фон
        const g = ctx.createLinearGradient(0, 0, 0, H);
        g.addColorStop(0, '#060e08');
        g.addColorStop(0.55, theme.bg[0]);
        g.addColorStop(1, theme.bg[1]);
        ctx.fillStyle = g;
        ctx.fillRect(0, 0, W, H);

        // Звёзды
        const stars = (ctx._stars_punkt = ctx._stars_punkt || Array.from({ length: 60 }, () => ({
            x: rand(0, W), y: rand(0, H * 0.5),
            r: rand(0.5, 1.8), phase: rand(0, Math.PI * 2)
        })));
        stars.forEach(s => {
            const alpha = 0.4 + 0.6 * Math.sin(t * 0.0008 + s.phase);
            ctx.beginPath();
            ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
            ctx.fillStyle = `rgba(200,255,210,${alpha})`;
            ctx.fill();
        });

        // Луна
        const mx = W * 0.82, my = H * 0.18;
        const moonGlow = ctx.createRadialGradient(mx, my, 0, mx, my, 28);
        moonGlow.addColorStop(0, 'rgba(251,191,36,0.25)');
        moonGlow.addColorStop(1, 'transparent');
        ctx.fillStyle = moonGlow;
        ctx.beginPath();
        ctx.arc(mx, my, 28, 0, Math.PI * 2);
        ctx.fill();
        ctx.beginPath();
        ctx.arc(mx, my, 12, 0, Math.PI * 2);
        const moonFill = ctx.createRadialGradient(mx - 3, my - 3, 0, mx, my, 12);
        moonFill.addColorStop(0, '#fffde8');
        moonFill.addColorStop(1, '#fbbf24');
        ctx.fillStyle = moonFill;
        ctx.fill();

        // Силуэты деревьев (задний план, тёмные)
        function drawTree(bx, bh, layers, color) {
            for (let i = 0; i < layers; i++) {
                const ly = H - bh + i * (bh / layers * 0.6);
                const lw = (bh / layers) * (layers - i) * 0.9;
                ctx.beginPath();
                ctx.moveTo(bx, ly - lw * 0.7);
                ctx.lineTo(bx + lw * 0.5, ly + lw * 0.15);
                ctx.lineTo(bx - lw * 0.5, ly + lw * 0.15);
                ctx.closePath();
                ctx.fillStyle = color;
                ctx.fill();
            }
            // Ствол
            ctx.fillStyle = 'rgba(0,0,0,0.4)';
            ctx.fillRect(bx - 3, H - 18, 6, 20);
        }

        // Дальние деревья (тёмно-зелёные)
        const farTrees = (ctx._far_trees = ctx._far_trees || [
            { x: W*0.05, h: 70 }, { x: W*0.15, h: 85 }, { x: W*0.25, h: 65 },
            { x: W*0.35, h: 90 }, { x: W*0.55, h: 75 }, { x: W*0.65, h: 88 },
            { x: W*0.75, h: 72 }, { x: W*0.88, h: 80 }, { x: W*0.95, h: 68 }
        ]);
        farTrees.forEach(tr => drawTree(tr.x, tr.h, 3, 'rgba(15,30,15,0.85)'));

        // А-frame домики
        function drawAframe(cx, groundY, sz, lit) {
            // Треугольная крыша
            ctx.beginPath();
            ctx.moveTo(cx, groundY - sz * 1.8);
            ctx.lineTo(cx + sz * 0.7, groundY);
            ctx.lineTo(cx - sz * 0.7, groundY);
            ctx.closePath();
            const roofG = ctx.createLinearGradient(cx, groundY - sz * 1.8, cx, groundY);
            roofG.addColorStop(0, 'rgba(40,60,40,0.95)');
            roofG.addColorStop(1, 'rgba(25,40,25,0.95)');
            ctx.fillStyle = roofG;
            ctx.fill();
            ctx.strokeStyle = rgbA(theme.colors[0], 0.3);
            ctx.lineWidth = 0.8;
            ctx.stroke();
            // Окошко-треугольник (светится)
            if (lit) {
                const pulse = 0.5 + 0.5 * Math.sin(t * 0.002 + cx);
                ctx.beginPath();
                ctx.moveTo(cx, groundY - sz * 1.2);
                ctx.lineTo(cx + sz * 0.25, groundY - sz * 0.75);
                ctx.lineTo(cx - sz * 0.25, groundY - sz * 0.75);
                ctx.closePath();
                ctx.fillStyle = `rgba(251,191,36,${0.35 + pulse * 0.25})`;
                ctx.fill();
                // Свечение окна
                const wg = ctx.createRadialGradient(cx, groundY - sz * 0.95, 0, cx, groundY - sz * 0.95, sz * 0.5);
                wg.addColorStop(0, `rgba(251,191,36,${0.12 * pulse})`);
                wg.addColorStop(1, 'transparent');
                ctx.fillStyle = wg;
                ctx.fillRect(cx - sz, groundY - sz * 1.5, sz * 2, sz * 1.2);
            }
        }

        const groundY = H - 22;
        drawAframe(W * 0.28, groundY, 32, true);
        drawAframe(W * 0.52, groundY, 26, false);
        drawAframe(W * 0.7, groundY, 22, true);

        // Передние деревья (зеленее)
        [
            { x: W*0.0, h: 55 }, { x: W*0.42, h: 60 }, { x: W*0.6, h: 48 },
            { x: W*0.82, h: 52 }, { x: W*1.0, h: 58 }
        ].forEach(tr => drawTree(tr.x, tr.h, 3, rgbA(theme.colors[0], 0.15)));

        // Земля (трава)
        const earthG = ctx.createLinearGradient(0, groundY, 0, H);
        earthG.addColorStop(0, rgbA(theme.colors[0], 0.25));
        earthG.addColorStop(1, 'rgba(5,12,5,0.9)');
        ctx.fillStyle = earthG;
        ctx.fillRect(0, groundY, W, H - groundY);

        // Летящие листья
        const leaves = (ctx._leaves_punkt = ctx._leaves_punkt || Array.from({ length: 18 }, () => ({
            x: rand(0, W), y: rand(0, H * 0.75),
            vx: rand(-0.4, 0.4), vy: rand(0.2, 0.6),
            size: rand(3, 6), angle: rand(0, Math.PI * 2),
            va: rand(-0.02, 0.02),
            c: theme.colors[Math.floor(rand(0, 3))]
        })));
        leaves.forEach(l => {
            l.x += l.vx + Math.sin(t * 0.001 + l.y) * 0.3;
            l.y += l.vy;
            l.angle += l.va;
            if (l.y > H) { l.y = -10; l.x = rand(0, W); }
            ctx.save();
            ctx.translate(l.x, l.y);
            ctx.rotate(l.angle);
            ctx.beginPath();
            ctx.ellipse(0, 0, l.size, l.size * 0.55, 0, 0, Math.PI * 2);
            ctx.fillStyle = rgbA(l.c, 0.7);
            ctx.fill();
            ctx.restore();
        });

        drawLabel(ctx, W, H, theme.label, theme.colors[0]);
    }

    /* ── Вспомогательные ────────────────────── */
    function drawIsoCube(ctx, cx, cy, s, t, colors) {
        const a = t * 0.001;
        // Грани куба
        const top = [
            [cx, cy - s * 0.6],
            [cx + s * 0.87, cy - s * 0.1],
            [cx, cy + s * 0.4],
            [cx - s * 0.87, cy - s * 0.1]
        ];
        const right = [
            top[1], [cx + s * 0.87, cy + s * 0.9], [cx, cy + s * 1.4], top[2]
        ];
        const left = [
            top[3], top[2], [cx, cy + s * 1.4], [cx - s * 0.87, cy + s * 0.9]
        ];

        // Тень
        ctx.fillStyle = 'rgba(0,0,0,0.3)';
        ctx.beginPath();
        ctx.ellipse(cx, cy + s * 1.4, s * 0.8, s * 0.2, 0, 0, Math.PI * 2);
        ctx.fill();

        function face(pts, color, alpha) {
            ctx.beginPath();
            pts.forEach((p, i) => i === 0 ? ctx.moveTo(p[0], p[1]) : ctx.lineTo(p[0], p[1]));
            ctx.closePath();
            ctx.fillStyle = rgbA(color, alpha);
            ctx.fill();
            ctx.strokeStyle = rgbA(color, 0.4);
            ctx.lineWidth = 1;
            ctx.stroke();
        }

        face(top, colors[0], 0.25);
        face(right, colors[1], 0.15);
        face(left, colors[2], 0.2);
    }

    function drawHex(ctx, cx, cy, r, color) {
        ctx.beginPath();
        for (let i = 0; i < 6; i++) {
            const a = (i / 6) * Math.PI * 2 - Math.PI / 6;
            i === 0 ? ctx.moveTo(cx + Math.cos(a) * r, cy + Math.sin(a) * r)
                    : ctx.lineTo(cx + Math.cos(a) * r, cy + Math.sin(a) * r);
        }
        ctx.closePath();
        ctx.strokeStyle = color;
        ctx.lineWidth = 0.8;
        ctx.stroke();
    }

    function roundRect(ctx, x, y, w, h, r) {
        ctx.beginPath();
        ctx.moveTo(x + r, y);
        ctx.lineTo(x + w - r, y);
        ctx.quadraticCurveTo(x + w, y, x + w, y + r);
        ctx.lineTo(x + w, y + h - r);
        ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
        ctx.lineTo(x + r, y + h);
        ctx.quadraticCurveTo(x, y + h, x, y + h - r);
        ctx.lineTo(x, y + r);
        ctx.quadraticCurveTo(x, y, x + r, y);
        ctx.closePath();
    }

    function drawLabel(ctx, W, H, text, color) {
        ctx.save();
        ctx.font = 'bold 11px JetBrains Mono, monospace';
        ctx.textAlign = 'left';
        const tw = ctx.measureText(text).width;
        // Подложка
        ctx.fillStyle = 'rgba(0,0,0,0.5)';
        roundRect(ctx, W - tw - 28, H - 26, tw + 18, 18, 4);
        ctx.fill();
        ctx.fillStyle = color + 'CC';
        ctx.fillText(text, W - tw - 18, H - 13);
        ctx.restore();
    }

    /* ══════════════════════════════════════
       ГЛАВНЫЙ РИСОВАЛЬЩИК
       ══════════════════════════════════════ */
    const DRAWERS = {
        opa: drawOpa,
        juggler: drawJuggler,
        moodle: drawMoodle,
        dashboard: drawDashboard,
        nft: drawNFT,
        webgl: drawWebGL,
        punkt: drawPunkt
    };

    function initCanvas(canvas) {
        const theme_key = canvas.dataset.theme;
        const theme = THEMES[theme_key];
        const drawer = DRAWERS[theme_key];
        if (!theme || !drawer) return;

        const ctx = canvas.getContext('2d');
        let animId = null;
        let running = false;

        function resize() {
            canvas.width = canvas.offsetWidth;
            canvas.height = canvas.offsetHeight;
        }

        function draw(t) {
            if (canvas.width === 0 || canvas.height === 0) resize();
            drawer(ctx, canvas.width, canvas.height, t, theme);
            if (running) animId = requestAnimationFrame(draw);
        }

        // Запускаем только когда видно (IntersectionObserver)
        const io = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting && !running) {
                    running = true;
                    resize();
                    animId = requestAnimationFrame(draw);
                } else if (!entry.isIntersecting && running) {
                    running = false;
                    if (animId) cancelAnimationFrame(animId);
                }
            });
        }, { threshold: 0.1 });

        io.observe(canvas);

        // Ресайз
        const ro = new ResizeObserver(() => { if (running) resize(); });
        ro.observe(canvas);
    }

    /* ── Инициализация ─────────────────────── */
    function init() {
        document.querySelectorAll('.pcard-canvas').forEach(initCanvas);
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();
