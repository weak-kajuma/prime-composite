const keyContainer = document.querySelector('.keys');
const inputValue = document.querySelector('#inputValue');
const judgeResult = document.querySelector('#judgeResult');
const judgeText = document.querySelector('#judgeText');
const specialOverlay = document.querySelector('#specialOverlay');
const specialCanvas = document.querySelector('#specialCanvas');
const specialTitle = document.querySelector('#specialTitle');
const specialRippleLayer = document.querySelector('#specialRippleLayer');

const labels = [
  ...Array.from({ length: 13 }, (_, i) => String(i + 1)),
  '0',
  'AC',
];
const tokens = [];
const INPUT_SETTLE_MS = 1000;
const SPECIAL_DURATION_MS = 2600;
const SPECIAL_COOLDOWN_MS = 2000;

const specialJudgements = {
  57: {
    title: 'グロタンディーク素数切り',
    subtitle: '57は「グロタンディーク素数」の逸話で知られる特別な数です',
    theme: 'grot',
  },
  1729: {
    title: 'ラマヌジャン革命',
    subtitle: '1729はタクシー数として有名な特別な数です',
    theme: 'rama',
  },
};

let specialSettleTimerId;
let specialTimeoutId;
let specialCooldownUntil = 0;
let specialActive = false;
let particleFrameId;

const isPrime = (n) => {
  if (n < 2) return false;

  for (let i = 2; i * i <= n; i += 1) {
    if (n % i === 0) return false;
  }

  return true;
};

const primeFactorize = (n) => {
  const factors = [];
  let value = n;

  for (let i = 2; i * i <= value; i += 1) {
    let count = 0;
    while (value % i === 0) {
      value /= i;
      count += 1;
    }

    if (count > 0) {
      factors.push([i, count]);
    }
  }

  if (value > 1) {
    factors.push([value, 1]);
  }

  return factors;
};

const formatFactorText = (factors) =>
  factors
    .map(([prime, exponent]) => (exponent > 1 ? `${prime}^${exponent}` : `${prime}`))
    .join(' × ');

const formatFactorHtml = (factors) =>
  factors
    .map(([prime, exponent]) =>
      exponent > 1 ? `${prime}<sup>${exponent}</sup>` : `${prime}`,
    )
    .join(' × ');

const clearSpecialSettleTimer = () => {
  if (specialSettleTimerId) {
    window.clearTimeout(specialSettleTimerId);
    specialSettleTimerId = undefined;
  }
};

const stopSpecialEffect = () => {
  specialActive = false;
  document.body.classList.remove('is-special-shaking');
  specialOverlay.classList.remove('special-overlay--active', 'special-overlay--grot', 'special-overlay--rama');
  specialOverlay.setAttribute('aria-hidden', 'true');
  specialTitle.textContent = '';
  specialRippleLayer.replaceChildren();
  if (specialTimeoutId) {
    window.clearTimeout(specialTimeoutId);
    specialTimeoutId = undefined;
  }
  if (particleFrameId) {
    cancelAnimationFrame(particleFrameId);
    particleFrameId = undefined;
  }
  const ctx = specialCanvas.getContext('2d');
  if (ctx) {
    ctx.clearRect(0, 0, specialCanvas.width, specialCanvas.height);
  }
};

const setInitialDisplay = () => {
  clearSpecialSettleTimer();
  stopSpecialEffect();
  tokens.length = 0;
  inputValue.textContent = '';
  judgeResult.classList.remove('display__result--special');
  judgeText.textContent = '判定結果: ー';
  judgeResult.removeAttribute('aria-label');
};

const setStandardJudgeResult = (rawValue) => {
  const n = Number.parseInt(rawValue, 10);
  judgeResult.classList.remove('display__result--special');

  if (n < 2) {
    judgeText.textContent = `${n}は素数ではありません`;
    judgeResult.setAttribute('aria-label', `${n}は素数ではありません`);
    return;
  }

  if (isPrime(n)) {
    judgeText.textContent = `${n}は素数です`;
    judgeResult.setAttribute('aria-label', `${n}は素数です`);
    return;
  }

  const factors = primeFactorize(n);
  const factorText = formatFactorText(factors);
  const factorHtml = formatFactorHtml(factors);

  judgeText.innerHTML = `${n} = ${factorHtml}`;
  judgeResult.setAttribute('aria-label', `${n} = ${factorText}`);
};

const createRipples = () => {
  specialRippleLayer.replaceChildren();
  for (let i = 0; i < 4; i += 1) {
    const ripple = document.createElement('span');
    ripple.className = 'special-overlay__ripple';
    ripple.style.animationDelay = `${i * 200}ms`;
    specialRippleLayer.append(ripple);
  }
};

const runParticles = (theme) => {
  const ctx = specialCanvas.getContext('2d');
  if (!ctx) return;

  const palette =
    theme === 'grot'
      ? ['#fbbf24', '#f97316', '#fb7185', '#facc15']
      : ['#fde047', '#22d3ee', '#c084fc', '#f472b6'];

  specialCanvas.width = window.innerWidth;
  specialCanvas.height = window.innerHeight;

  const particles = Array.from({ length: 90 }, () => ({
    x: Math.random() * specialCanvas.width,
    y: Math.random() * specialCanvas.height,
    vx: (Math.random() - 0.5) * 4,
    vy: (Math.random() - 0.5) * 4,
    radius: Math.random() * 2.5 + 1,
    life: Math.random() * 40 + 40,
    color: palette[Math.floor(Math.random() * palette.length)],
  }));

  const loop = () => {
    ctx.clearRect(0, 0, specialCanvas.width, specialCanvas.height);

    particles.forEach((particle) => {
      particle.x += particle.vx;
      particle.y += particle.vy;
      particle.vx *= 0.985;
      particle.vy *= 0.985;
      particle.life -= 1;

      if (particle.life <= 0) {
        particle.x = Math.random() * specialCanvas.width;
        particle.y = Math.random() * specialCanvas.height;
        particle.vx = (Math.random() - 0.5) * 4;
        particle.vy = (Math.random() - 0.5) * 4;
        particle.life = Math.random() * 40 + 40;
      }

      const alpha = Math.max(0, particle.life / 80);
      ctx.beginPath();
      ctx.fillStyle = `${particle.color}${Math.floor(alpha * 255)
        .toString(16)
        .padStart(2, '0')}`;
      ctx.arc(particle.x, particle.y, particle.radius, 0, Math.PI * 2);
      ctx.fill();
    });

    particleFrameId = requestAnimationFrame(loop);
  };

  loop();
};

const triggerSpecialEffect = (n) => {
  const data = specialJudgements[n];
  if (!data) return;

  const now = Date.now();
  if (now < specialCooldownUntil) {
    judgeResult.classList.add('display__result--special');
    judgeText.textContent = `${data.title}（クールダウン中）`;
    judgeResult.setAttribute('aria-label', `${data.title} クールダウン中`);
    return;
  }

  specialCooldownUntil = now + SPECIAL_COOLDOWN_MS;
  stopSpecialEffect();
  specialActive = true;
  specialTitle.textContent = data.title;

  specialOverlay.classList.add('special-overlay--active', `special-overlay--${data.theme}`);
  specialOverlay.setAttribute('aria-hidden', 'false');
  document.body.classList.add('is-special-shaking');
  createRipples();
  runParticles(data.theme);

  specialTimeoutId = window.setTimeout(() => {
    stopSpecialEffect();
  }, SPECIAL_DURATION_MS);
};

const scheduleSpecialEffectIfNeeded = () => {
  clearSpecialSettleTimer();

  const rawValue = tokens.join('');
  if (rawValue === '') return;

  const n = Number.parseInt(rawValue, 10);
  if (!Object.hasOwn(specialJudgements, n)) return;

  specialSettleTimerId = window.setTimeout(() => {
    specialSettleTimerId = undefined;
    const latestValue = tokens.join('');
    if (latestValue === rawValue) {
      triggerSpecialEffect(n);
    }
  }, INPUT_SETTLE_MS);
};

const updateJudgeImmediately = () => {
  const rawValue = tokens.join('');
  if (rawValue === '') {
    setInitialDisplay();
    return;
  }

  const n = Number.parseInt(rawValue, 10);
  if (Object.hasOwn(specialJudgements, n)) {
    judgeResult.classList.add('display__result--special');
    judgeText.textContent = specialJudgements[n].title;
    judgeResult.setAttribute('aria-label', specialJudgements[n].title);
    return;
  }

  setStandardJudgeResult(rawValue);
};

const updateDisplay = (label) => {
  if (label === 'AC') {
    setInitialDisplay();
    return;
  }

  tokens.push(Number(label));
  inputValue.textContent = tokens.join('');
  updateJudgeImmediately();
  scheduleSpecialEffectIfNeeded();
};

const createKey = (label) => {
  const button = document.createElement('button');
  button.type = 'button';
  button.textContent = label;
  button.className = `key ${label === 'AC' ? 'key--clear' : ''}`.trim();
  button.addEventListener('click', () => updateDisplay(label));
  return button;
};

labels.map(createKey).forEach((button) => keyContainer.append(button));
setInitialDisplay();
