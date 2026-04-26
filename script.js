const keyContainer = document.querySelector('.keys');
const inputValue = document.querySelector('#inputValue');
const judgeResult = document.querySelector('#judgeResult');

const labels = [...Array.from({ length: 14 }, (_, i) => String(i)), 'AC'];

const isPrime = (n) => {
  if (n < 2) return false;
  for (let i = 2; i * i <= n; i += 1) {
    if (n % i === 0) return false;
  }
  return true;
};

const setInitialDisplay = () => {
  inputValue.textContent = '';
  judgeResult.textContent = '判定結果: ー';
};

const updateDisplay = (label) => {
  if (label === 'AC') {
    setInitialDisplay();
    return;
  }

  const value = Number(label);
  inputValue.textContent = label;
  judgeResult.textContent = isPrime(value)
    ? '判定結果: 素数です'
    : '判定結果: 素数ではありません';
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
