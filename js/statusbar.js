const field_t = document.getElementById('field');
const positionDisplay = document.getElementById('position');
const lengthDisplay = document.getElementById('length');
const zoomDisplay = document.getElementById('zoom');
const baseFontSize = getBaseFontSize();

field_t.addEventListener('input', updateStatus);
field_t.addEventListener('click', updateStatus);
field_t.addEventListener('keyup', updateStatus);




function getBaseFontSize() {
  const temp = document.createElement('div');
  temp.style.fontSize = 'large';
  temp.style.visibility = 'hidden';
  document.body.appendChild(temp);
  const size = parseFloat(window.getComputedStyle(temp).fontSize);
  document.body.removeChild(temp);
  console.log(size);
  return size;
}


function updateZoom() {
  const computedStyle = window.getComputedStyle(field_t);
  const currentFontSize = parseFloat(computedStyle.fontSize); // px → 数値
  const zoomPercent = Math.round((currentFontSize / baseFontSize) * 100);

  zoomDisplay.textContent = `${zoomPercent}%`;

  // settings に zoom を保存
  const settingsRaw = localStorage.getItem('settings');
  const settings = settingsRaw ? JSON.parse(settingsRaw) : {};

  settings.zoom = zoomPercent / 100; // 例: 120% → 1.2

  localStorage.setItem('settings', JSON.stringify(settings));
}



function updateStatus() {
  const text = field_t.innerText;
  const length = text.length;

  const selection = window.getSelection();
  if (!selection.rangeCount) return;

  const range = selection.getRangeAt(0);
  const lineElements = field_t.querySelectorAll('div');

  let row = 1;
  let col = 1;

  for (let i = 0; i < lineElements.length; i++) {
    const line = lineElements[i];

    if (line === range.endContainer || line.contains(range.endContainer)) {
      row = i + 1;

      const subRange = range.cloneRange();
      subRange.selectNodeContents(line);
      subRange.setEnd(range.endContainer, range.endOffset);

      col = subRange.toString().length + 1;
      break;
    }
  }

  positionDisplay.textContent = `行 ${row}, 列 ${col}`;
  lengthDisplay.textContent = `${length}文字`;
}

const observer = new MutationObserver(() => {
  updateZoom();
});

observer.observe(field_t, {
  attributes: true,
  attributeFilter: ['style']
});
