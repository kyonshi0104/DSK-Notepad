const fontInput = document.getElementById('fontInput');
const fontdropdown = document.getElementById('fontDropdown');

fontInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
        e.preventDefault();
        fontDropdown.classList.add('hidden');
    }
});

fontInput.addEventListener('input', () => {
    const font = fontInput.value.trim();
    const field = document.getElementById('field');
    if (field) field.style.fontFamily = `'${font}', sans-serif`;

    localStorage.setItem('settings', JSON.stringify({ font }));
});

const presetFontButtons = document.querySelectorAll('#fontDropdown [data-font]');

presetFontButtons.forEach(button => {
    button.addEventListener('click', () => {
        const font = button.getAttribute('data-font');
        const field = document.getElementById('field');
        if (field) field.style.fontFamily = `'${font}', sans-serif`;

        const settings = JSON.parse(localStorage.getItem('settings') || '{}');
        settings.font = font;
        localStorage.setItem('settings', JSON.stringify(settings));

        presetFontButtons.forEach(btn => btn.classList.remove('focused'));
        button.classList.add('focused');

        console.log(`フォント保存: ${font}`);

        fontdropdown.classList.add("hidden");
    });
});
