const display = document.getElementById('display');
const buttons = document.querySelectorAll('button');
const clickSound = document.getElementById('click-sound');
const equalSound = document.getElementById('equal-sound');
const errorSound = document.getElementById('error-sound');

buttons.forEach(button => {
  button.addEventListener('click', () => {
    const value = button.textContent;

    if (value === 'C') {
      clickSound.currentTime = 0;
      clickSound.play();
      display.value = '';
    } else if (value === '=') {
      try {
        display.value = eval(display.value);
        equalSound.currentTime = 0;
        equalSound.play();
      } catch {
        display.value = 'Error';
        errorSound.currentTime = 0;
        errorSound.play();
      }
    } else {
      clickSound.currentTime = 0;
      clickSound.play();
      display.value += value;
    }
  });
});

// keyboard support

document.addEventListener('keydown', (event) => {
  const key = event.key;

  if (/[\d+\-*/.]/.test(key)) {
    clickSound.currentTime = 0;
    clickSound.play();
    display.value += key;

  } else if (key === 'Enter') {
    try { 
      display.value = eval(display.value);
      equalSound.currentTime = 0;
      equalSound.play();
    } catch {
      display.value = 'Error';
      errorSound.currentTime = 0;
      errorSound.play();
    }

  } else if (key === 'Backspace') {
    clickSound.currentTime = 0;
    clickSound.play();
    display.value = display.value.slice(0, -1);

  } else if (key.toLowerCase() === 'c') {
    clickSound.currentTime = 0;
    clickSound.play();
    display.value = '';
  }
});

//theme toggle //

const themeSwitch = document.getElementById('theme-switch');

themeSwitch.addEventListener('change', () => {
  document.body.classList.toggle('light');
});
