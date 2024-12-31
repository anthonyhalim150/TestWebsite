const audio = new Audio('/music/background_music1.mp3'); // Replace with your music file
audio.loop = true; // Loop the audio

function play_music() {
    audio.play().catch((error) => {
        // Log the error for debugging
        console.error('Music playback failed:', error);

        // Fallback for user interaction requirement
        console.log('Waiting for user interaction to play the music.');
        document.body.addEventListener('click', () => {
            audio.play().catch((err) => {
                console.error('Failed to play music after user interaction:', err);
            });
        }, { once: true });
    });
}

document.addEventListener('DOMContentLoaded', () => {
    play_music(); // Attempt to play music once the DOM is fully loaded
});
