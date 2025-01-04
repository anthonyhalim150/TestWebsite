const API_URL = 'https://anthonyhalim-150-723848267249.us-central1.run.app';
const userID = localStorage.getItem('userID');

document.addEventListener('DOMContentLoaded', async () => {
    if (!userID) {
        alert('User not logged in.');
        window.location.href = './login.html';
        return;
    }

    try {
        // Fetch user settings from the server
        const response = await fetch(`${API_URL}/get-user-settings`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ userID }),
        });

        const data = await response.json();
        if (data.success) {
            const { dark_mode, color_scheme } = data.settings;
            document.body.classList.add('loading');
            apply_initial_settings(dark_mode, color_scheme)
                .then(() => apply_settings())
                .then(() => {
                    document.body.classList.remove('loading');
                })
                .catch((error) => {
                    console.error('Error applying settings:', error);
                    document.body.classList.remove('loading');
                });
            /*
            apply_initial_settings(dark_mode, color_scheme).then(() => {
                apply_settings().then(()=>{
                    document.body.classList.remove('loading');
                });
            });
            */
        } else {
            console.error(data.message);
        }
    } catch (error) {
        console.error('Error loading settings:', error);
    }
});
//To save the settings when the user revisits the page
async function apply_initial_settings(darkMode, colorScheme) {
    // Apply color scheme
    document.documentElement.style.setProperty('--primary-color', colorScheme);

    // Apply dark mode
    document.body.classList.toggle('dark-mode', darkMode);

    // Update controls to reflect the settings
    document.getElementById('dark-mode-toggle').checked = darkMode;
    document.getElementById('color-scheme').value = colorScheme;
}

// Change settings dynamically
function apply_settings() {
    return new Promise((resolve) => {
        const dark_mode_toggle = document.getElementById('dark-mode-toggle');
        if (dark_mode_toggle) {
            dark_mode_toggle.addEventListener('change', () => {
                const isDarkMode = dark_mode_toggle.checked;
                document.body.classList.toggle('dark-mode', isDarkMode);
            });
        }

        const color_scheme = document.getElementById('color-scheme');
        if (color_scheme) {
            color_scheme.addEventListener('input', () => {
                const newColorScheme = color_scheme.value;
                document.documentElement.style.setProperty('--primary-color', newColorScheme);
            });
        }

        // Resolve the Promise once the settings are applied
        resolve();
    });
}


// Save settings to the server
const save_settings = document.getElementById('save-settings');
if (save_settings){
    save_settings.addEventListener('click', async () => {
    const isDarkMode = document.getElementById('dark-mode-toggle').checked;
    const newColorScheme = document.getElementById('color-scheme').value;

    try {
        const response = await fetch(`${API_URL}/save-user-settings`, {
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
}
apply_settings();