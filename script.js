const keyContainer = document.querySelector('.keys');
const inputValue = document.querySelector('#inputValue');
const judgeResult = document.querySelector('#judgeResult');
const judgeBadge = document.querySelector('#judgeBadge');
const judgeText = document.querySelector('#judgeText');

const labels = [...Array.from({ length: 14 }, (_, i) => String(i)), 'AC'];
const tokens = [];
const specialJudgements = {
  57: '57は「グロタンディーク素数」の逸話で知られる特別な数です',
  1729: '1729はタクシー数として有名な特別な数です',
};

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

const setInitialDisplay = () => {
  tokens.length = 0;
  inputValue.textContent = '';
  judgeResult.classList.remove('display__result--special');
  judgeBadge.className = 'display__badge display__badge--default';
  judgeBadge.textContent = '待機中';
  judgeText.textContent = '判定結果: ー';
  judgeResult.removeAttribute('aria-label');
};

const setJudgeResult = (rawValue) => {
  if (rawValue === '') {
    setInitialDisplay();
    return;
  }

  const n = Number.parseInt(rawValue, 10);

  if (Object.hasOwn(specialJudgements, n)) {
    judgeResult.classList.add('display__result--special');
    judgeBadge.className = 'display__badge display__badge--special';
    judgeBadge.textContent = '特別表示';
    judgeText.textContent = specialJudgements[n];
    judgeResult.setAttribute('aria-label', specialJudgements[n]);
    return;
  }

  judgeResult.classList.remove('display__result--special');
  judgeBadge.className = 'display__badge display__badge--normal';
  judgeBadge.textContent = '通常判定';

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

const updateDisplay = (label) => {
  if (label === 'AC') {
    setInitialDisplay();
    return;
  }

  tokens.push(Number(label));

  const joined = tokens.join('');
  inputValue.textContent = joined;
  setJudgeResult(joined);
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
