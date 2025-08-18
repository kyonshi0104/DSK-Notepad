field.addEventListener('keydown', (e) => {
    if (e.key !== 'Backspace' && e.key !== 'Delete') return;

    const sel = window.getSelection();
    if (!sel.rangeCount) return;

    const range = sel.getRangeAt(0);
    const container = range.startContainer;

    const parent = container.nodeType === Node.TEXT_NODE ? container.parentNode : container;
    const isDecorated = parent.classList?.contains('link-insert') || parent.classList?.contains('word-switch');

    if (isDecorated) {
        e.preventDefault();

        const deleteRange = document.createRange();
        deleteRange.selectNode(parent);
        sel.removeAllRanges();
        sel.addRange(deleteRange);

        document.execCommand('delete');
        document.execCommand('removeFormat');

        const newRange = document.createRange();
        newRange.selectNodeContents(field);
        newRange.collapse(false);
        sel.removeAllRanges();
        sel.addRange(newRange);
    }
});

function sanitizeEditorContentForSave() {
  const editor = document.getElementById('field');
  const clone = editor.cloneNode(true);

  // data-links を属性として保存できるように整形
  clone.querySelectorAll('.link-insert').forEach(span => {
    const links = JSON.parse(span.dataset.links || '[]');
    span.setAttribute('data-links', JSON.stringify(links)); // 明示的に設定
  });

  return clone.innerHTML;
}

function saveEditorContent() {
  const sanitized = sanitizeEditorContentForSave();
  localStorage.setItem('liveEditContent', sanitized);
}

const saveHandler = () => {
  saveEditorContent();
};

['input', 'click', 'keydown', 'blur', 'mouseup'].forEach(event => {
  document.addEventListener(event, saveHandler);
});
