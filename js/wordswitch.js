function applyWordSwitch() {
    const selection = window.getSelection();
    if (!selection.rangeCount || selection.isCollapsed) {
        return;
    }

    const range = selection.getRangeAt(0);
    const selectedText = range.toString();
    const span = document.createElement('span');
    span.contentEditable = false;
    span.textContent = selectedText;
    span.classList.add('word-switch');
    span.style.textDecoration = 'underline';
    span.style.color = '#cbb873';
    span.dataset.candidates = JSON.stringify([selectedText]);

    range.deleteContents();
    range.insertNode(span);

    moveCaretAfter(span);
}

document.addEventListener('mouseover', (e) => {
    const target = e.target;
    if (target.classList.contains('word-switch')) {
        showDropdownMenu(target);
    }
});

function showDropdownMenu(span) {
    document.querySelectorAll('.dropdown-menu-w').forEach(m => m.remove());

    const menu = document.createElement('div');
    menu.className = 'dropdown-menu-w';
    menu.style.position = 'absolute';
    const rect = span.getBoundingClientRect();
    menu.style.left = `${rect.left}px`;
    menu.style.top = `${rect.bottom + 5}px`;

    const candidates = JSON.parse(span.dataset.candidates || '[]');

    candidates.forEach((word, index) => {
        const item = document.createElement('div');
        item.className = 'dropdown-item';
        item.style.display = 'flex';
        item.style.justifyContent = 'space-between';
        item.style.alignItems = 'center';

        const wordText = document.createElement('span');
        wordText.textContent = word;
        wordText.style.flexGrow = '1';
        wordText.style.cursor = 'pointer';
        wordText.addEventListener('click', () => {
            span.textContent = word;
            span.dataset.candidates = JSON.stringify(candidates);
            removeMenu();
        });

        const deleteBtn = document.createElement('button');
        deleteBtn.textContent = '✕';
        deleteBtn.style.marginLeft = '15px';
        deleteBtn.style.cursor = 'pointer';
        deleteBtn.style.background = 'none'
        deleteBtn.style.color = "white";;
        deleteBtn.style.border = "none";
        deleteBtn.addEventListener('click', (e) => {
            e.stopPropagation(); // 候補選択を防ぐ
            candidates.splice(index, 1);
            span.dataset.candidates = JSON.stringify(candidates);
            showDropdownMenu(span); // 再描画
        });

        item.appendChild(wordText);
        item.appendChild(deleteBtn);
        menu.appendChild(item);
    });

    if (candidates.length > 0) {
        menu.appendChild(document.createElement('hr'));
    }

    const input = document.createElement('input');
    input.placeholder = '単語を追加...';
    input.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
            const newWord = input.value.trim();
            if (newWord) {
                candidates.push(newWord);
                span.dataset.candidates = JSON.stringify(candidates);
                showDropdownMenu(span);
                removeMenu();
            }
        }
    });
    menu.appendChild(input);

    document.body.appendChild(menu);

    const outsideClickHandler = (e) => {
        if (!menu.contains(e.target) && e.target !== span) {
            removeMenu();
        }
    };
    document.addEventListener('click', outsideClickHandler);

    function removeMenu() {
        if (document.body.contains(menu)) {
            document.body.removeChild(menu);
            document.removeEventListener('click', outsideClickHandler);
        }
    }
}


function removeWordSwitch() {
    const selection = window.getSelection();
    const targetNode = selection.anchorNode;

    const element = targetNode.nodeType === Node.TEXT_NODE
        ? targetNode.parentElement
        : targetNode;

    const span = element?.closest('.word-switch');
    if (!span) return;

    const original = span.textContent;
    const textNode = document.createTextNode(original);
    span.replaceWith(textNode);
}

function moveCaretAfter(node) {
    const range = document.createRange();
    const selection = window.getSelection();
    range.setStartAfter(node);
    range.collapse(true);
    selection.removeAllRanges();
    selection.addRange(range);
}
