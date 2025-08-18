function restoreEditorState() {
  const field = document.getElementById('field');
  const zoomDisplay = document.getElementById('zoomDisplay'); // 任意

  // 1. 編集内容の復元（liveEditContent）
  const liveContent = localStorage.getItem('liveEditContent');
  if (liveContent) {
    field.innerHTML = liveContent;
  }

  // 2. フォントとズームの復元（settings）
  const settingsRaw = localStorage.getItem('settings');
  if (settingsRaw) {
    const settings = JSON.parse(settingsRaw);

    // フォント
    if (settings.font) {
      field.style.fontFamily = settings.font;
    }

    // ズーム
    if (settings.zoom && typeof settings.zoom === 'number') {
      field.style.transform = `scale(${settings.zoom})`;
      field.style.transformOrigin = 'top left';

      // 表示更新（任意）
      if (zoomDisplay) {
        const zoomPercent = Math.round(settings.zoom * 100);
        zoomDisplay.textContent = `${zoomPercent}%`;
      }
    }
  }
}
window.addEventListener('DOMContentLoaded', () => {
  restoreEditorState();
});
