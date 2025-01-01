const userID = localStorage.getItem('userID');

document.addEventListener('DOMContentLoaded', async () => {
    if (!userID) {
        alert('User not logged in.');
        window.location.href = './login.html';
        return;
    }

    try {
        // Fetch user settings from the server
        const response = await fetch('http://localhost:3000/get-user-settings', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ userID }),
        });

        const data = await response.json();
        if (data.success) {
            const { dark_mode, color_scheme } = data.settings;
            applySettings(dark_mode, color_scheme);
        } else {
            console.error(data.message);
        }
    } catch (error) {
        console.error('Error loading settings:', error);
    }
});
//To save the settings when the user revisits the page
function applySettings(darkMode, colorScheme) {
    // Apply color scheme
    document.documentElement.style.setProperty('--primary-color', colorScheme);

    // Apply dark mode
    document.body.classList.toggle('dark-mode', darkMode);

    // Update controls to reflect the settings
    document.getElementById('dark-mode-toggle').checked = darkMode;
    document.getElementById('color-scheme').value = colorScheme;
}

// Change settings dynamically
document.getElementById('dark-mode-toggle').addEventListener('change', () => {
    const isDarkMode = document.getElementById('dark-mode-toggle').checked;
    document.body.classList.toggle('dark-mode', isDarkMode);
});

document.getElementById('color-scheme').addEventListener('input', () => {
    const newColorScheme = document.getElementById('color-scheme').value;
    document.documentElement.style.setProperty('--primary-color', newColorScheme);
});

// Save settings to the server
document.getElementById('save-settings').addEventListener('click', async () => {
    const isDarkMode = document.getElementById('dark-mode-toggle').checked;
    const newColorScheme = document.getElementById('color-scheme').value;

    try {
        const response = await fetch('http://localhost:3000/save-user-settings', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ userID, dark_mode: isDarkMode, color_scheme: newColorScheme }),
        });

        const data = await response.json();
        if (data.success) {
            alert('Settings saved successfully!');
        } else {
            console.error(data.message);
        }
    } catch (error) {
        console.error('Error saving settings:', error);
    }
});
