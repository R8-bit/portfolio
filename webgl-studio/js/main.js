/**
 * BITER STUDIO — WebGL Main Script
 * Three.js + GSAP scroll-driven 3D scenes
 */

// ── ГЛОБАЛЬНЫЕ ПЕРЕМЕННЫЕ ──────────────────────────
let scene, camera, renderer;
let currentScene = 0;
let isLoaded = false;

// Объекты сцен
const sceneObjects = [];
const clock = new THREE.Clock();
let mouseX = 0, mouseY = 0;
let targetMouseX = 0, targetMouseY = 0;

// ── ЛОАДЕР ──────────────────────────────────────────
const loaderEl = document.getElementById('loader');
const loaderFill = document.getElementById('loaderFill');
const loaderPct = document.getElementById('loaderPct');

function updateLoader(pct) {
  loaderFill.style.width = pct + '%';
  loaderPct.textContent = Math.round(pct) + '%';
}

function hideLoader() {
  loaderEl.classList.add('hidden');
  document.getElementById('nav').classList.add('visible');
  isLoaded = true;
  revealHero();
}

// ── ИНИЦИАЛИЗАЦИЯ THREE.JS ───────────────────────────
function initThree() {
  const canvas = document.getElementById('glCanvas');

  // Сцена
  scene = new THREE.Scene();
  scene.fog = new THREE.FogExp2(0x06060f, 0.015);

  // Камера
  camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
  camera.position.z = 5;

  // Рендерер
  renderer = new THREE.WebGLRenderer({
    canvas,
    antialias: true,
    alpha: true
  });
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.setClearColor(0x06060f, 1);

  // Освещение
  const ambientLight = new THREE.AmbientLight(0x7c3aed, 0.3);
  scene.add(ambientLight);

  const pointLight1 = new THREE.PointLight(0xa855f7, 2, 20);
  pointLight1.position.set(5, 5, 5);
  scene.add(pointLight1);

  const pointLight2 = new THREE.PointLight(0x06b6d4, 1.5, 15);
  pointLight2.position.set(-5, -3, 3);
  scene.add(pointLight2);

  const pointLight3 = new THREE.PointLight(0xec4899, 1, 12);
  pointLight3.position.set(0, -5, -2);
  scene.add(pointLight3);

  // Создаём объекты для каждой сцены
  createScene0(); // Hero: сфера из частиц
  createScene1(); // О нас: тор
  createScene2(); // Услуги: кубы
  createScene3(); // Работы: кольца
  createScene4(); // Контакт: икосаэдр

  // Звёздное поле (общее для всех сцен)
  createStarfield();

  // Ресайз
  window.addEventListener('resize', onResize);

  // Мышь
  document.addEventListener('mousemove', onMouseMove);

  // Запуск анимации
  animate();
}

// ── СЦЕНА 0: ЧАСТИЦЫ-СФЕРА (Hero) ───────────────────
function createScene0() {
  const group = new THREE.Group();

  // Сфера из частиц
  const particleCount = 3000;
  const positions = new Float32Array(particleCount * 3);
  const colors = new Float32Array(particleCount * 3);
  const sizes = new Float32Array(particleCount);

  const color1 = new THREE.Color(0x7c3aed);
  const color2 = new THREE.Color(0x06b6d4);
  const color3 = new THREE.Color(0xec4899);

  for (let i = 0; i < particleCount; i++) {
    // Сферическое распределение
    const phi = Math.acos(-1 + (2 * i) / particleCount);
    const theta = Math.sqrt(particleCount * Math.PI) * phi;
    const radius = 2.5 + (Math.random() - 0.5) * 0.8;

    positions[i * 3]     = radius * Math.sin(phi) * Math.cos(theta);
    positions[i * 3 + 1] = radius * Math.sin(phi) * Math.sin(theta);
    positions[i * 3 + 2] = radius * Math.cos(phi);

    // Цвет в зависимости от позиции
    const t = Math.random();
    const mixedColor = t < 0.33 ? color1 : t < 0.66 ? color2 : color3;
    colors[i * 3]     = mixedColor.r;
    colors[i * 3 + 1] = mixedColor.g;
    colors[i * 3 + 2] = mixedColor.b;

    sizes[i] = Math.random() * 3 + 1;
  }

  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
  geometry.setAttribute('size', new THREE.BufferAttribute(sizes, 1));

  const material = new THREE.PointsMaterial({
    size: 0.03,
    vertexColors: true,
    transparent: true,
    opacity: 0.85,
    blending: THREE.AdditiveBlending,
    depthWrite: false
  });

  const particles = new THREE.Points(geometry, material);
  group.add(particles);

  // Внутренняя сфера (wireframe)
  const sphereGeo = new THREE.IcosahedronGeometry(1.5, 4);
  const sphereMat = new THREE.MeshBasicMaterial({
    color: 0x7c3aed,
    wireframe: true,
    transparent: true,
    opacity: 0.08
  });
  const sphere = new THREE.Mesh(sphereGeo, sphereMat);
  group.add(sphere);

  group.position.x = 3;
  scene.add(group);
  sceneObjects.push({ group, type: 'particles', particles, sphere });
}

// ── СЦЕНА 1: ТОР (О нас) ────────────────────────────
function createScene1() {
  const group = new THREE.Group();

  const torusGeo = new THREE.TorusGeometry(2, 0.6, 16, 100);
  const torusMat = new THREE.MeshPhongMaterial({
    color: 0x7c3aed,
    emissive: 0x4c1d95,
    specular: 0xa855f7,
    shininess: 100,
    wireframe: false,
    transparent: true,
    opacity: 0.8
  });
  const torus = new THREE.Mesh(torusGeo, torusMat);
  group.add(torus);

  // Wireframe поверх
  const wireGeo = new THREE.TorusGeometry(2, 0.6, 8, 40);
  const wireMat = new THREE.MeshBasicMaterial({
    color: 0xa855f7,
    wireframe: true,
    transparent: true,
    opacity: 0.15
  });
  const wire = new THREE.Mesh(wireGeo, wireMat);
  group.add(wire);

  group.position.x = 3;
  group.visible = false;
  scene.add(group);
  sceneObjects.push({ group, type: 'torus', torus, wire });
}

// ── СЦЕНА 2: КУБЫ В ПРОСТРАНСТВЕ (Услуги) ───────────
function createScene2() {
  const group = new THREE.Group();

  const cubeData = [
    { pos: [0, 0, 0], size: 0.8, color: 0x7c3aed },
    { pos: [2, 1, -1], size: 0.5, color: 0x06b6d4 },
    { pos: [-1.5, -1, 0.5], size: 0.6, color: 0xec4899 },
    { pos: [1, -1.5, 1], size: 0.4, color: 0xa855f7 },
    { pos: [-2, 0.5, -0.5], size: 0.35, color: 0x06b6d4 },
  ];

  cubeData.forEach(d => {
    const geo = new THREE.BoxGeometry(d.size, d.size, d.size);
    const mat = new THREE.MeshPhongMaterial({
      color: d.color,
      emissive: d.color,
      emissiveIntensity: 0.2,
      wireframe: false,
      transparent: true,
      opacity: 0.75
    });
    const cube = new THREE.Mesh(geo, mat);
    cube.position.set(...d.pos);
    cube.userData = { rotSpeed: Math.random() * 0.02 + 0.005 };
    group.add(cube);

    // Wireframe куб
    const wGeo = new THREE.BoxGeometry(d.size, d.size, d.size);
    const wMat = new THREE.MeshBasicMaterial({
      color: d.color, wireframe: true, transparent: true, opacity: 0.3
    });
    const wCube = new THREE.Mesh(wGeo, wMat);
    wCube.position.set(...d.pos);
    group.add(wCube);
  });

  group.position.x = 3;
  group.visible = false;
  scene.add(group);
  sceneObjects.push({ group, type: 'cubes' });
}

// ── СЦЕНА 3: КОЛЬЦА (Работы) ────────────────────────
function createScene3() {
  const group = new THREE.Group();

  const rings = [
    { r: 1.5, tube: 0.03, color: 0xa855f7, rot: [0, 0, 0] },
    { r: 2.0, tube: 0.025, color: 0x06b6d4, rot: [Math.PI/3, 0, 0] },
    { r: 2.5, tube: 0.02, color: 0xec4899, rot: [0, Math.PI/4, 0] },
    { r: 1.0, tube: 0.04, color: 0x7c3aed, rot: [Math.PI/2, 0, 0] },
  ];

  rings.forEach(r => {
    const geo = new THREE.TorusGeometry(r.r, r.tube, 8, 80);
    const mat = new THREE.MeshBasicMaterial({
      color: r.color,
      transparent: true,
      opacity: 0.7
    });
    const ring = new THREE.Mesh(geo, mat);
    ring.rotation.set(...r.rot);
    ring.userData = { baseRot: [...r.rot] };
    group.add(ring);
  });

  group.position.x = 3;
  group.visible = false;
  scene.add(group);
  sceneObjects.push({ group, type: 'rings' });
}

// ── СЦЕНА 4: ИКОСАЭДР (Контакт) ─────────────────────
function createScene4() {
  const group = new THREE.Group();

  const geo = new THREE.IcosahedronGeometry(2, 1);
  const mat = new THREE.MeshPhongMaterial({
    color: 0xa855f7,
    emissive: 0x4c1d95,
    emissiveIntensity: 0.3,
    wireframe: false,
    transparent: true,
    opacity: 0.6,
    side: THREE.DoubleSide
  });
  const ico = new THREE.Mesh(geo, mat);
  group.add(ico);

  const wGeo = new THREE.IcosahedronGeometry(2.05, 1);
  const wMat = new THREE.MeshBasicMaterial({
    color: 0xa855f7, wireframe: true, transparent: true, opacity: 0.25
  });
  const wIco = new THREE.Mesh(wGeo, wMat);
  group.add(wIco);

  group.position.x = 3;
  group.visible = false;
  scene.add(group);
  sceneObjects.push({ group, type: 'icosahedron', ico, wIco });
}

// ── ЗВЁЗДНОЕ ПОЛЕ ─────────────────────────────────────
function createStarfield() {
  const count = 5000;
  const positions = new Float32Array(count * 3);
  for (let i = 0; i < count; i++) {
    positions[i * 3]     = (Math.random() - 0.5) * 100;
    positions[i * 3 + 1] = (Math.random() - 0.5) * 100;
    positions[i * 3 + 2] = (Math.random() - 0.5) * 100;
  }
  const geo = new THREE.BufferGeometry();
  geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  const mat = new THREE.PointsMaterial({
    size: 0.05,
    color: 0xffffff,
    transparent: true,
    opacity: 0.4,
    blending: THREE.AdditiveBlending,
    depthWrite: false
  });
  scene.add(new THREE.Points(geo, mat));
}

// ── АНИМАЦИОННЫЙ ЦИКЛ ─────────────────────────────────
function animate() {
  requestAnimationFrame(animate);

  const t = clock.getElapsedTime();

  // Плавное следование мыши
  targetMouseX += (mouseX - targetMouseX) * 0.05;
  targetMouseY += (mouseY - targetMouseY) * 0.05;
  camera.rotation.y = targetMouseX * 0.03;
  camera.rotation.x = targetMouseY * 0.02;

  // Анимируем объекты текущей сцены
  if (sceneObjects[0]) {
    const o = sceneObjects[0];
    o.group.rotation.y = t * 0.2;
    o.group.rotation.x = Math.sin(t * 0.3) * 0.15;
  }
  if (sceneObjects[1] && sceneObjects[1].group.visible) {
    const o = sceneObjects[1];
    o.torus.rotation.x = t * 0.5;
    o.torus.rotation.y = t * 0.3;
    o.wire.rotation.x = -t * 0.3;
    o.wire.rotation.y = t * 0.4;
    // Левитация
    o.group.position.y = Math.sin(t * 0.8) * 0.3;
  }
  if (sceneObjects[2] && sceneObjects[2].group.visible) {
    const children = sceneObjects[2].group.children;
    children.forEach((c, i) => {
      c.rotation.x += c.userData.rotSpeed || 0.01;
      c.rotation.y += (c.userData.rotSpeed || 0.01) * 0.7;
      c.position.y += Math.sin(t + i) * 0.003;
    });
    sceneObjects[2].group.rotation.y = t * 0.1;
  }
  if (sceneObjects[3] && sceneObjects[3].group.visible) {
    const children = sceneObjects[3].group.children;
    children.forEach((c, i) => {
      c.rotation.x = t * (0.3 + i * 0.1);
      c.rotation.y = t * (0.2 + i * 0.08);
    });
  }
  if (sceneObjects[4] && sceneObjects[4].group.visible) {
    const o = sceneObjects[4];
    o.ico.rotation.x = t * 0.3;
    o.ico.rotation.y = t * 0.4;
    o.wIco.rotation.x = -t * 0.2;
    o.wIco.rotation.y = t * 0.5;
    o.group.position.y = Math.sin(t * 0.6) * 0.2;
  }

  renderer.render(scene, camera);
}

// ── СМЕНА СЦЕНЫ ──────────────────────────────────────
function switchScene(index) {
  if (index === currentScene) return;

  // Скрываем старую
  if (sceneObjects[currentScene]) {
    sceneObjects[currentScene].group.visible = false;
  }

  // Показываем новую
  currentScene = index;
  if (sceneObjects[currentScene]) {
    sceneObjects[currentScene].group.visible = true;
  }

  // Меняем цвет тумана
  const fogColors = [0x06060f, 0x090315, 0x03080f, 0x0f0318, 0x0a0210];
  scene.fog.color.setHex(fogColors[index] || 0x06060f);
}

// ── СКРОЛЛ ───────────────────────────────────────────
function initScroll() {
  const panels = document.querySelectorAll('.panel');
  const scrollFill = document.getElementById('scrollFill');

  // IntersectionObserver для смены сцен
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const sceneIndex = parseInt(entry.target.dataset.scene || '0');
        switchScene(sceneIndex);
      }
    });
  }, { threshold: 0.5 });

  panels.forEach(panel => observer.observe(panel));

  // Прогресс скролла
  window.addEventListener('scroll', () => {
    const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
    const pct = (window.scrollY / maxScroll) * 100;
    scrollFill.style.height = pct + '%';
  });

  // Reveal анимации
  const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('revealed');
        revealObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.2 });

  document.querySelectorAll('[data-reveal]').forEach(el => revealObserver.observe(el));
}

// ── МЫШЬ ─────────────────────────────────────────────
function onMouseMove(e) {
  mouseX = (e.clientX / window.innerWidth - 0.5);
  mouseY = (e.clientY / window.innerHeight - 0.5);
}

// ── РЕСАЙЗ ───────────────────────────────────────────
function onResize() {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
}

// ── REVEAL HERO ───────────────────────────────────────
function revealHero() {
  const heroEls = document.querySelectorAll('#hero [data-reveal]');
  heroEls.forEach((el, i) => {
    setTimeout(() => el.classList.add('revealed'), i * 150 + 200);
  });
}

// ── СТАРТ ─────────────────────────────────────────────
(function init() {
  // Имитируем загрузку
  let progress = 0;
  const interval = setInterval(() => {
    progress += Math.random() * 15;
    if (progress >= 100) {
      progress = 100;
      clearInterval(interval);
      updateLoader(100);
      setTimeout(() => {
        initThree();
        initScroll();
        hideLoader();
      }, 500);
    }
    updateLoader(progress);
  }, 120);
})();
