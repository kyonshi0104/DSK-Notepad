//import { handleAction } from './handler_func.js';
window.handleAction = handleAction;

const menus = [
    { btnId: 'file', menuId: 'fileMenu' },
    { btnId: 'edit', menuId: 'editMenu' },
    { btnId: 'view', menuId: 'viewMenu' }
];

function toggleMenu(btnEl, menuEl) {
    const rect = btnEl.getBoundingClientRect();
    menuEl.style.left = `${rect.left}px`;
    menuEl.style.top = `${rect.bottom + 10}px`;
    menuEl.classList.toggle('hidden');
}

menus.forEach(({ btnId, menuId }) => {
    const btn = document.getElementById(btnId);
    const menu = document.getElementById(menuId);

    btn.addEventListener('click', (e) => {
        e.stopPropagation();
        menus.forEach(({ menuId }) =>
            document.getElementById(menuId).classList.add('hidden')
        );
        document.getElementById("customMenu").classList.remove("show");
        toggleMenu(btn, menu);
    });

    menu.addEventListener('click', async (e) => {
        const action = e.target.dataset.action;
        if (!action) return;

        console.log(`選択: ${action}`);
        menu.classList.add('hidden');

        try {
            await handleAction(action);
        } catch (err) {
            console.error(`アクション処理中にエラー: ${action}`, err);
        }
    });
});

document.addEventListener('click', () => {
    menus.forEach(({ menuId }) =>
        document.getElementById(menuId).classList.add('hidden')
    );
});

document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
        menus.forEach(({ menuId }) =>
            document.getElementById(menuId).classList.add('hidden')
        );
    }
});
