const menu = document.getElementById("customMenu");
const textbox = document.getElementById("field");

window.applyWordSwitch = applyWordSwitch;
window.removeWordSwitch = removeWordSwitch;
window.applyLinkInsert = applyLinkInsert;
window.removeLinkInsert = removeLinkInsert;

function getContextType(target) {
    if (target.closest('.word-switch')) return 'wordSwitch';
    if (target.closest('.link-insert')) return 'link';
    return 'default';
}

function updateContextMenu(type) {
    console.log(type);
    document.querySelectorAll('.wl').forEach(item => {
        const showFor = item.dataset.showfor || 'default';
        item.style.display = (showFor === type || showFor === 'default') ? 'block' : 'none';
        console.log(`${showFor} ${item.style.display}`);
    });
}

document.addEventListener("contextmenu", e => {
    e.preventDefault();
    if (e.target !== textbox && !textbox.contains(e.target)) return;

    menu.style.left = `${e.pageX}px`;
    menu.style.top = `${e.pageY}px`;
    menu.classList.add("show");

    const selection = window.getSelection().toString();
    const hasSelection = selection.length > 0;

    document.querySelectorAll(".menu-item").forEach(item => {
        const label = item.dataset.action;
        if (["cut", "copy", "delete", "wordSwitch", "insertLink"].includes(label)) {
            item.classList.toggle("disabled", !hasSelection);
        }
    });

    const type = getContextType(e.target);
    updateContextMenu(type);
});

document.addEventListener("click", e => {
    if (e.target != menu) {
        menu.classList.remove("show");
    }
});

document.getElementById("customMenu").addEventListener("click", async e => {
    const action = e.target.dataset.action;
    if (!action || e.target.classList.contains("disabled")) return;

    switch (action) {
        case "undo":
            document.execCommand("undo");
            break;
        case "cut":
            document.execCommand("cut");
            break;
        case "copy":
            document.execCommand("copy");
            break;
        case "paste":
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
        case "delete":
            const sel = window.getSelection();
            if (!sel.isCollapsed) {
                const range = sel.getRangeAt(0);
                range.deleteContents();
            }
            break;
        case "selectAll":
            document.execCommand("selectAll");
            break;
        case "insertLink":
            applyLinkInsert();
            break;
        case "wordSwitch":
            applyWordSwitch();
            break;
        case "removeWordSwitch":
            removeWordSwitch();
            break;
        case "removeInsertLink":
            removeLinkInsert();
            break;
    }

    document.getElementById("customMenu").classList.remove("show");
});
