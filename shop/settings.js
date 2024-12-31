document.addEventListener('DOMContentLoaded', () => {
    const darkModeToggle = document.getElementById('dark-mode-toggle');
    const colorSchemeSelect = document.getElementById('color-scheme');
    const saveSettingsButton = document.getElementById('save-settings');

    // Load settings from local storage
    const loadSettings = () => {
        const darkMode = localStorage.getItem('darkMode') === 'true';
        const colorScheme = localStorage.getItem('colorScheme') || '#f8a488';

        darkModeToggle.checked = darkMode;
        document.body.classList.toggle('dark-mode', darkMode);
        document.documentElement.style.setProperty('--primary-color', colorScheme);
        colorSchemeSelect.value = colorScheme;
    };

    // Apply changes locally
    const applySettings = () => {
        const darkMode = darkModeToggle.checked;
        const colorScheme = colorSchemeSelect.value;

        document.body.classList.toggle('dark-mode', darkMode);
        document.documentElement.style.setProperty('--primary-color', colorScheme);

        // Save to local storage for immediate application
        localStorage.setItem('darkMode', darkMode);
        localStorage.setItem('colorScheme', colorScheme);
    };

    // Save settings to the database
    const saveSettings = async () => {
        const darkMode = darkModeToggle.checked;
        const colorScheme = colorSchemeSelect.value;

        try {
            const response = await fetch('/api/save-settings', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    darkMode,
                    colorScheme,
                }),
            });

            if (response.ok) {
                alert('Settings saved successfully.');
            } else {
                alert('Failed to save settings.');
            }
        } catch (error) {
            console.error('Error saving settings:', error);
            alert('An error occurred while saving settings.');
        }
    };

    // Event listeners
    darkModeToggle.addEventListener('change', applySettings);
    colorSchemeSelect.addEventListener('change', applySettings);
    saveSettingsButton.addEventListener('click', saveSettings);

    loadSettings();
});
