const FILE_STATE_KEY = 'editorFileState';


async function handleAction(action) {
  switch (action) {
    case 'new':
      await handleNewFileCreation();
      break;
    case 'open':
      await handleOpenFile();
      break;
    case 'save':
      await handleSaveFile(true);
      break;
    case 'save-as':
      await handleSaveFile(false);
      break;
    case 'exit':
      window.close?.();
      break;

    case 'undo':
      document.execCommand('undo');
      break;
    case 'cut':
      document.execCommand('cut');
      break;
    case 'copy':
      document.execCommand('copy');
      break;
    case 'paste':
        if (navigator.clipboard && navigator.clipboard.readText) {
            navigator.clipboard.readText()
            .then(function(text) {
                const sel = document.getSelection();
                if (!sel.rangeCount) return;

                const range = sel.getRangeAt(0);

                range.deleteContents();

                const node = document.createTextNode(text);
                range.insertNode(node);

                range.setStartAfter(node);
                range.collapse(true);
                sel.removeAllRanges();
                sel.addRange(range);
        })
        .catch(err => {
            console.error('クリップボード読み取り失敗:', err);
        });
}
      break;
    case 'delete':
        const sel = window.getSelection();
        if (!sel.isCollapsed) {
        const range = sel.getRangeAt(0);
        range.deleteContents();
        break;
        }
    case 'selectAll':
      document.execCommand('selectAll');
      break;


    case 'enlarge': {
      const field = document.getElementById('field');
      if (field) {
        const currentSize = parseFloat(getComputedStyle(field).fontSize);
        field.style.fontSize = `${currentSize + 2}px`;
      }
      break;
    }
    case 'reduce': {
      const field = document.getElementById('field');
      if (field) {
        const currentSize = parseFloat(getComputedStyle(field).fontSize);
        field.style.fontSize = `${Math.max(currentSize - 2, 8)}px`;
      }
      break;
    }
    case 'fold': {
        const fold = document.getElementById('f');
        const field = document.getElementById('field');
        if (!field) return;

        const current = getComputedStyle(field).whiteSpace;
        const current_f = fold.innerText
        field.style.whiteSpace = current === 'pre-wrap' ? 'pre' : 'pre-wrap';
        fold.innerText = current_f === "右端での折り返し" ? "✓ 右端での折り返し" : "右端での折り返し";

        console.log(`折り返し: ${field.style.whiteSpace}`);
        break;
}

    case 'font': {
    fontdropdown.classList.remove("hidden")
}


    default:
      console.warn(`未定義のアクション: ${action}`);
      return;
  }
}

function serializeEditor() {
  const editor = document.getElementById('field');
  const fragments = [];

  editor.childNodes.forEach(node => {
    if (node.nodeType === Node.ELEMENT_NODE) {
      let content = '';

      if (node.classList.contains('word-switch')) {
        const options = JSON.parse(node.dataset.candidates || '[]');
        const text = options.length > 0 ? options[0] : node.textContent.trim();
        content = `%${text}%[${options.join(',')}]`;
      } else if (node.classList.contains('link-insert')) {
        const links = JSON.parse(node.dataset.links || '[]');
        const text = node.textContent.trim();
        content = `~${text}~[${links.join(',')}]`;
      } else {
        content = node.textContent;
      }

      const prefix = node.tagName === 'DIV' ? '\n' : '';
      fragments.push(prefix + content);
    } else if (node.nodeType === Node.TEXT_NODE) {
      fragments.push(node.textContent);
    }
  });

  return fragments.join('');
}

function deserializeEditor(serialized) {
  const editor = document.getElementById('field');
  editor.innerHTML = '';

  const pattern = /%([^%]+)%\[(.*?)\]|~([^~]+)~\[(.*?)\]/g;
  let lastIndex = 0;
  let match;

  while ((match = pattern.exec(serialized)) !== null) {
    if (match.index > lastIndex) {
      const text = serialized.slice(lastIndex, match.index);
      editor.appendChild(document.createTextNode(text));
    }

    if (match[1] !== undefined) {
      //ord Switch
      const text = match[1];
      const optionsRaw = match[2] || '';
      const options = optionsRaw.split(',').map(s => s.trim()).filter(s => s.length > 0);

      const span = document.createElement('span');
      span.textContent = text;
      span.className = 'word-switch';
      span.dataset.candidates = JSON.stringify(options);
      span.style.color = '#cbb873';
      span.style.textDecoration = 'underline';
      span.addEventListener('click', () => showWordSwitchDropdown(span));
      editor.appendChild(span);
    } else if (match[3] !== undefined) {
      //Link Insert
      const text = match[3];
      const linksRaw = match[4] || '';
      const links = linksRaw.split(',').map(s => s.trim()).filter(s => s.length > 0);

      const span = document.createElement('span');
      span.textContent = text;
      span.className = 'link-insert';
      span.dataset.links = JSON.stringify(links);
      span.style.color = '#00bfff';
      span.style.textDecoration = 'underline';
      span.addEventListener('mouseover', () => showLinkDropdown(span));
      editor.appendChild(span);
    }

    lastIndex = pattern.lastIndex;
  }

  if (lastIndex < serialized.length) {
    editor.appendChild(document.createTextNode(serialized.slice(lastIndex)));
  }
}


// 2. 置き換え関数
function getTextboxContent() {
  return serializeEditor();
}

function setTextboxContent(content) {
  deserializeEditor(content);
}

// 3. 編集済みかどうか判定
function hasUnsavedChanges(currentContent) {
  const saved = localStorage.getItem("lastFileContent") || "";
  return currentContent !== saved;
}

// 4. 保存確認ダイアログ
async function confirmSaveBeforeNew(content) {
  if (!hasUnsavedChanges(content)) return false;

  const shouldSave = window.confirm("保存されていない変更があります。保存しますか？");
  if (shouldSave) {
    await saveFile(content, true);
  }
  return shouldSave;
}

// 5. 新規ファイル作成
function createNewFile() {
  return {
    name: "untitled.txt",
    content: "",
    handle: null
  };
}

// 6. 保存処理
async function saveFile(content, overwrite = false) {
  try {
    let handle = null;

    if (overwrite) {
      const storedHandle = window.lastFileHandle;
      if (storedHandle) {
        handle = storedHandle;
      }
    }

    if (!handle) {
      handle = await window.showSaveFilePicker({
        suggestedName: localStorage.getItem("lastFileName") || "untitled.txt",
        types: [{
          description: "Text Files",
          accept: { "text/plain": [".txt"] }
        }]
      });
    }

    const writable = await handle.createWritable();
    await writable.write(content);
    await writable.close();

    window.lastFileHandle = handle;
    localStorage.setItem("lastFileContent", content);
    localStorage.setItem("lastFileName", handle.name || "untitled.txt");
  } catch (err) {
    console.error("保存に失敗しました:", err);
  }
}

// 7. 新規ファイル作成の一連処理
async function handleNewFileCreation() {
  const currentContent = getTextboxContent();
  await confirmSaveBeforeNew(currentContent);

  const newFile = createNewFile();
  setTextboxContent(newFile.content);

  localStorage.setItem("lastFileContent", newFile.content);
  localStorage.setItem("lastFileName", newFile.name);
  window.lastFileHandle = null;
}

// 8. ファイルを開く処理
async function handleOpenFile() {
  const currentContent = getTextboxContent();
  await confirmSaveBeforeNew(currentContent);

  try {
    const [fileHandle] = await window.showOpenFilePicker({
      types: [{
        description: 'Text Files',
        accept: { 'text/plain': ['.txt'] }
      }],
      excludeAcceptAllOption: true,
      multiple: false
    });

    const file = await fileHandle.getFile();
    const content = await file.text();

    setTextboxContent(content);

    window.lastFileHandle = fileHandle;
    localStorage.setItem('lastFileContent', content);
    localStorage.setItem('lastFileName', file.name);

    console.log(`Opened file: ${file.name}`);
  } catch (err) {
    console.warn('File open cancelled or failed:', err);
  }
}

// 9. 保存処理（現在の内容を取得して保存）
async function handleSaveFile(overwrite = false) {
  const content = getTextboxContent();
  await saveFile(content, overwrite);
}
