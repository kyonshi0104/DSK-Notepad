const field = document.getElementById('field');

field.addEventListener('keydown', async (e) => {
  if (!e.ctrlKey) return;

  switch (e.key.toLowerCase()) {
    case 's':
      e.preventDefault();
      await handleSaveFile(true);
      break;
    case 'n':
      e.preventDefault();
      await handleNewFileCreation();
      break;
    case 'o':
      e.preventDefault();
      await handleOpenFile();
      break;
    case '+':
    case '=':
      e.preventDefault();
      adjustZoom(1.1);
      break;
    case '-':
      e.preventDefault();
      adjustZoom(0.9);
      break;
  }
});
