const albumArt = document.getElementById('albumArt');
const songTitle = document.getElementById('songTitle');
const artistName = document.getElementById('artistName');
const playPauseIcon = document.getElementById('playPauseIcon');
const currentTimeDisplay = document.getElementById('currentTime');
const totalDurationDisplay = document.getElementById('totalDuration');
const progressBar = document.getElementById('progressBar');
const volumeBar = document.getElementById('volumeBar');

const skipPrevBtn = document.getElementById('skipPrevBtn');
const skipNextBtn = document.getElementById('skipNextBtn');

const playlist = [
    {
        title: "White Flag",
        artist: "Dido",
        durationSeconds: 222,
        audioFileName: "white_flag.mp3",
        imageFileName: "white_flag.png"
    }
];

for (let i = 1; i <= 29; i++) {
    playlist.push({
        title: `Random Song ${i}`,
        artist: `Generated Artist ${i}`,
        durationSeconds: Math.floor(Math.random() * (300 - 180 + 1)) + 180,
        audioFileName: `song${i}.mp3`,
        imageFileName: `image${i}.png`
    });
}

let currentSongIndex = 0;
let isPlaying = false;
let currentPlaybackTime = 0;
let currentSongDuration = 0;

function updateSliderFill(slider) {
    const percentage = (slider.value - slider.min) / (slider.max - slider.min) * 100;
    slider.style.background = `linear-gradient(to right, var(--accent-color) ${percentage}%, rgba(255, 255, 255, 0.3) ${percentage}%)`;
}

function formatTime(totalSeconds) {
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = Math.floor(totalSeconds % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
}

function loadSong(index) {
    if (index < 0 || index >= playlist.length) {
        console.error("Song index out of bounds.");
        return;
    }

    currentSongIndex = index;
    const song = playlist[currentSongIndex];

    songTitle.textContent = song.title;
    artistName.textContent = song.artist;
    totalDurationDisplay.textContent = formatTime(song.durationSeconds);
    albumArt.src = `images/${song.imageFileName}`;

    currentSongDuration = song.durationSeconds;
    currentPlaybackTime = 0;
    progressBar.value = 0;
    currentTimeDisplay.textContent = '0:00';
    updateSliderFill(progressBar);
}

function playPauseToggle() {
    if (isPlaying) {
        playPauseIcon.textContent = 'play_arrow';
    } else {
        playPauseIcon.textContent = 'pause';
    }
    isPlaying = !isPlaying;
}

function playNextSong() {
    currentSongIndex = (currentSongIndex + 1) % playlist.length;
    loadSong(currentSongIndex);
}

function playPreviousSong() {
    currentSongIndex = (currentSongIndex - 1 + playlist.length) % playlist.length;
    loadSong(currentSongIndex);
}

playPauseIcon.addEventListener('click', playPauseToggle);
skipNextBtn.addEventListener('click', playNextSong);
skipPrevBtn.addEventListener('click', playPreviousSong);

document.addEventListener('DOMContentLoaded', () => {
    loadSong(currentSongIndex);
    updateSliderFill(volumeBar);
});

setInterval(() => {
    if (isPlaying && currentSongDuration > 0) {
        currentPlaybackTime += 0.1;
        if (currentPlaybackTime >= currentSongDuration) {
            playNextSong();
            if (!isPlaying) {
                playPauseIcon.textContent = 'play_arrow';
            }
            return;
        }

        progressBar.value = (currentPlaybackTime / currentSongDuration) * 100;
        updateSliderFill(progressBar);

        currentTimeDisplay.textContent = formatTime(currentPlaybackTime);
    }
}, 100);

progressBar.addEventListener('input', () => {
    currentPlaybackTime = (progressBar.value / 100) * currentSongDuration;
    currentTimeDisplay.textContent = formatTime(currentPlaybackTime);
    updateSliderFill(progressBar);
});

volumeBar.addEventListener('input', () => {
    updateSliderFill(volumeBar);
});