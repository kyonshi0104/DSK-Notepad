function applyLinkInsert() {
    const selection = window.getSelection();
    if (!selection.rangeCount || selection.isCollapsed) return;

    const range = selection.getRangeAt(0);
    const selectedText = range.toString();

    const span = document.createElement('span');
    span.contentEditable = false;
    span.textContent = selectedText;
    span.classList.add('link-insert');
    span.style.textDecoration = 'underline';
    span.style.color = '#00bfff';
    span.dataset.links = JSON.stringify([]);

    range.deleteContents();
    range.insertNode(span);

    moveCaretAfter(span);
}

document.addEventListener('mouseover', (e) => {
    const target = e.target;
    if (target.classList.contains('link-insert')) {
        showLinkDropdown(target);
    }
});

function showLinkDropdown(span) {
    document.querySelectorAll('.dropdown-menu-w').forEach(m => m.remove());

    const menu = document.createElement('div');
    menu.className = 'dropdown-menu-w';
    menu.style.position = 'absolute';
    const rect = span.getBoundingClientRect();
    menu.style.left = `${rect.left}px`;
    menu.style.top = `${rect.bottom + 5}px`;

    const links = JSON.parse(span.dataset.links || '[]');

    links.forEach((url, index) => {
        const item = document.createElement('div');
        item.className = 'dropdown-item';
        item.style.display = 'flex';
        item.style.justifyContent = 'space-between';
        item.style.alignItems = 'center';

        const linkText = document.createElement('span');
        linkText.textContent = url;
        linkText.style.flexGrow = '1';
        linkText.style.cursor = 'pointer';
        linkText.addEventListener('click', () => {
            window.open(url, '_blank');
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
            e.stopPropagation(); // リンク開かないように
            links.splice(index, 1);
            span.dataset.links = JSON.stringify(links);
            showLinkDropdown(span); // 再描画
        });

        item.appendChild(linkText);
        item.appendChild(deleteBtn);
        menu.appendChild(item);
    });

    if (links.length > 0) {
        menu.appendChild(document.createElement('hr'));
    }

    const input = document.createElement('input');
    input.placeholder = 'リンクを追加...';
    input.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
            const newUrl = input.value.trim();
            if (newUrl) {
                links.push(newUrl);
                span.dataset.links = JSON.stringify(links);
                showLinkDropdown(span);
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


function removeLinkInsert() {
    const selection = window.getSelection();
    const targetNode = selection.anchorNode;

    const element = targetNode.nodeType === Node.TEXT_NODE
        ? targetNode.parentElement
        : targetNode;

    const span = element?.closest('.link-insert');
    if (!span) return;

    const text = span.textContent;
    const textNode = document.createTextNode(text);
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