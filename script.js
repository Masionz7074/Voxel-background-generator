const canvas = document.getElementById("bg"), ctx = canvas.getContext("2d");
let placed = [], topColorHex = "#ffffff", bottomColorHex = "#000000";
const elements = {
  width: document.getElementById("widthInput"),
  height: document.getElementById("heightInput"),
  noisiness: document.getElementById("noisinessInput"),
  bgColor: document.getElementById("bgColorInput"),
  shapeColor: document.getElementById("shapeColorInput"),
  size: document.getElementById("sizeInput"),
  shape: document.getElementById("shapeSelect"),
  randomColor: document.getElementById("randomizeColorToggle"),
  generateBtn: document.getElementById("generateBtn"),
  downloadPng: document.getElementById("downloadPngBtn"),
  downloadJson: document.getElementById("downloadJsonBtn"),
  copyJson: document.getElementById("copyJsonBtn"),
  albumArt: document.getElementById('albumArt'),
  songTitle: document.getElementById('songTitle'),
  artistName: document.getElementById('artistName'),
  playPause: document.getElementById('playPauseIcon'),
  currentTime: document.getElementById('currentTime'),
  totalTime: document.getElementById('totalDuration'),
  progress: document.getElementById('progressBar'),
  volume: document.getElementById('volumeBar'),
  prev: document.getElementById('skipPrevBtn'),
  next: document.getElementById('skipNextBtn')
};

const playlist = [
  { 
    title: "Music", 
    artist: "-- Made by Muskiei", 
    durationSeconds: 300, 
    audio: "music.mp3", 
    image: "music.png" 
  }
];

let currentSongIndex = 0, isPlaying = false, currentPlaybackTime = 0, currentSongDuration = 0;

const updateSliderFill = slider => {
  const percentage = (slider.value - slider.min) / (slider.max - slider.min) * 100;
  slider.style.background = `linear-gradient(to right, var(--player-accent-color) ${percentage}%, rgba(255, 255, 255, 0.3) ${percentage}%)`;
};

const formatTime = seconds => `${Math.floor(seconds/60)}:${Math.floor(seconds%60).toString().padStart(2,'0')}`;

const showSection = targetId => {
  document.querySelectorAll('.content-section, .nav-link').forEach(el => el.classList.remove('active'));
  document.getElementById(targetId + '-section')?.classList.add('active');
  document.getElementById(targetId === 'voxel-generator' ? 'nav-tools' : 'nav-' + targetId)?.classList.add('active');
  if (targetId === 'voxel-generator') generateVoxelBackground();
};

const hexToFloatArray = hex => hex.slice(1).match(/.{2}/g).map(v => parseFloat((parseInt(v,16)/255).toFixed(3)));

const lightenColor = (hex, percent) => '#' + hex.slice(1).match(/.{2}/g).map(v => 
  Math.min(255, parseInt(v,16) + Math.floor((255 - parseInt(v,16)) * percent/100)).toString(16).padStart(2,'0')).join('');

const getShapeColor = () => elements.randomColor.checked ? 
  Array.from({length:3}, () => Math.floor(Math.random()*256)) : 
  elements.shapeColor.value.slice(1).match(/.{2}/g).map(v => parseInt(v,16));

const shapes = {
  circle: (ctx, s) => ctx.arc(0,0,s/2,0,Math.PI*2),
  triangle: (ctx, s) => { for(let i=0;i<3;i++){const a=i/3*Math.PI*2-Math.PI/2,i==0?ctx.moveTo(s/2*Math.cos(a),s/2*Math.sin(a)):ctx.lineTo(s/2*Math.cos(a),s/2*Math.sin(a))} ctx.closePath() },
  hexagon: (ctx, s) => { for(let i=0;i<6;i++){const a=i/6*Math.PI*2,i==0?ctx.moveTo(s/2*Math.cos(a),s/2*Math.sin(a)):ctx.lineTo(s/2*Math.cos(a),s/2*Math.sin(a))} ctx.closePath() },
  pentagon: (ctx, s) => { for(let i=0;i<5;i++){const a=i/5*Math.PI*2-Math.PI/2,i==0?ctx.moveTo(s/2*Math.cos(a),s/2*Math.sin(a)):ctx.lineTo(s/2*Math.cos(a),s/2*Math.sin(a))} ctx.closePath() },
  diamond: (ctx, s) => { ctx.moveTo(0,-s/2); ctx.lineTo(s/2,0); ctx.lineTo(0,s/2); ctx.lineTo(-s/2,0); ctx.closePath() },
  oval: (ctx, s) => ctx.ellipse(0,0,s/2,s/2*0.7,0,0,Math.PI*2),
  rounded_square: (ctx, s) => ctx.roundRect(-s/2,-s/2,s,s,s/5),
  line_horizontal: (ctx, s) => ctx.rect(-s/2,-s/20,s,s/10),
  line_vertical: (ctx, s) => ctx.rect(-s/20,-s/2,s/10,s),
  star: (ctx, s) => { for(let i=0;i<10;i++){const r=i%2?s/5:s/2,a=Math.PI/5*i-Math.PI/2,i==0?ctx.moveTo(r*Math.cos(a),r*Math.sin(a)):ctx.lineTo(r*Math.cos(a),r*Math.sin(a))} ctx.closePath() }
};

const drawShape = (ctx, shape, size) => {
  ctx.beginPath();
  (shapes[shape] || (() => ctx.fillRect(-size/2,-size/2,size,size)))(ctx, size);
  ctx.fill();
};

const generateVoxelBackground = () => {
  const w = parseInt(elements.width.value), h = parseInt(elements.height.value);
  canvas.width = w; canvas.height = h;
  
  bottomColorHex = elements.bgColor.value;
  topColorHex = lightenColor(bottomColorHex, 30);
  
  const grad = ctx.createLinearGradient(0,0,0,h);
  grad.addColorStop(1, bottomColorHex); grad.addColorStop(0, topColorHex);
  ctx.fillStyle = grad; ctx.fillRect(0,0,w,h);
  
  const highlight = ctx.createRadialGradient(w/2,h/2,0,w/2,h/2,w/3);
  highlight.addColorStop(0,'rgba(255,255,255,0.08)'); highlight.addColorStop(1,'rgba(0,0,0,0)');
  ctx.fillStyle = highlight; ctx.fillRect(0,0,w,h);
  
  const rot = 37.5 * Math.PI/180, noise = parseInt(elements.noisiness.value);
  placed = []; let attempts = 0;
  
  while(placed.length < noise && attempts++ < noise*5) {
    const s = (Math.random()*30+10)*parseFloat(elements.size.value);
    const x = Math.random()*w, y = Math.random()*h;
    const a = 0.05 - (0.05-0.15)*(y/h);
    const d = s * Math.sqrt(2), hd = d/2;
    const box = {left:x-hd, right:x+hd, top:y-hd, bottom:y+hd, cx:x, cy:y, size:s, alpha:a};
    
    if(!placed.some(b => box.right>b.left && box.left<b.right && box.bottom>b.top && box.top<b.bottom)) {
      placed.push(box);
      ctx.save();
      ctx.translate(x,y); ctx.rotate(rot);
      const [r,g,b] = getShapeColor();
      ctx.fillStyle = `rgba(${r},${g},${b},${a})`;
      drawShape(ctx, elements.shape.value, s);
      ctx.restore();
    }
  }
};

const downloadImage = () => {
  const link = document.createElement('a');
  link.download = 'voxel-background.png';
  link.href = canvas.toDataURL();
  link.click();
};

const prepareJsonOutput = () => {
  const w = parseInt(elements.width.value), h = parseInt(elements.height.value);
  const json = {
    namespace: "cubes",
    image: { type: "image", texture: "textures/ui/cube" },
    panel: {
      layer: 1000, type: "custom", renderer: "gradient_renderer",
      size: [w, h], color1: hexToFloatArray(topColorHex), color2: hexToFloatArray(bottomColorHex),
      clips_children: true, controls: [{ panel: { type: "panel", controls: [] }}]
    }
  };
  
  json.panel.controls[0].panel.controls = placed.map(b => {
    const sp = (b.size/Math.max(w,h))*100;
    const xp = ((b.cx - w/2)/w)*100, yp = ((b.cy - h/2)/h)*100;
    return { [`image@${json.namespace}.image`]: {
      size: [`${sp.toFixed(2)}%`, `${sp.toFixed(2)}%`],
      offset: [`${xp.toFixed(2)}%`, `${yp.toFixed(2)}%`],
      color: getShapeColor().map(c => c/255),
      alpha: parseFloat(b.alpha.toFixed(2))
    }};
  });
  
  return JSON.stringify(json, null, 2)
    .replace(/\[\s+([^[\]]+?)\s+\]/g, (_,c) => `[${c.replace(/\s*,\s*/g,', ').trim()}]`);
};

const downloadJSON = () => {
  const data = "data:text/json;charset=utf-8," + encodeURIComponent(prepareJsonOutput());
  const link = document.createElement('a');
  link.href = data; link.download = "voxel_background.json";
  document.body.appendChild(link).click(); link.remove();
};

const copyJSON = () => navigator.clipboard.writeText(prepareJsonOutput()).then(
  () => alert('JSON copied!'), () => alert('Copy failed')
);

const loadSong = index => {
  if (index < 0 || index >= playlist.length) return;
  currentSongIndex = index;
  const song = playlist[currentSongIndex];
  
  elements.songTitle.textContent = song.title;
  elements.artistName.textContent = song.artist;
  elements.totalTime.textContent = formatTime(song.durationSeconds);
  elements.albumArt.src = `images/${song.image}`;
  
  currentSongDuration = song.durationSeconds;
  currentPlaybackTime = 0;
  elements.progress.value = 0;
  elements.currentTime.textContent = '0:00';
  updateSliderFill(elements.progress);
};

const playPauseToggle = () => {
  isPlaying = !isPlaying;
  elements.playPause.textContent = isPlaying ? 'pause' : 'play_arrow';
};

document.addEventListener('DOMContentLoaded', () => {
  loadSong(currentSongIndex);
  updateSliderFill(elements.volume);
  
  elements.playPause.addEventListener('click', playPauseToggle);
  
  setInterval(() => {
    if (isPlaying && currentSongDuration > 0) {
      currentPlaybackTime += 0.1;
      if (currentPlaybackTime >= currentSongDuration) {
        currentPlaybackTime = 0;
        elements.progress.value = 0;
        updateSliderFill(elements.progress);
        elements.currentTime.textContent = '0:00';
        isPlaying = false;
        elements.playPause.textContent = 'play_arrow';
        return;
      }
      elements.progress.value = (currentPlaybackTime / currentSongDuration) * 100;
      updateSliderFill(elements.progress);
      elements.currentTime.textContent = formatTime(currentPlaybackTime);
    }
  }, 100);
  
  elements.progress.addEventListener('input', () => {
    currentPlaybackTime = (elements.progress.value / 100) * currentSongDuration;
    elements.currentTime.textContent = formatTime(currentPlaybackTime);
    updateSliderFill(elements.progress);
  });
  
  elements.volume.addEventListener('input', () => updateSliderFill(elements.volume));
  
  ['home','credits','license','voxel-generator'].forEach(id => 
    document.getElementById(`nav-${id}`)?.addEventListener('click', e => {
      e.preventDefault();
      showSection(id);
    })
  );
  
  [elements.width, elements.height, elements.noisiness, elements.bgColor, 
   elements.shapeColor, elements.size, elements.shape, elements.randomColor].forEach(el => 
    el.addEventListener('change', () => {
      if (document.getElementById('voxel-generator-section').classList.contains('active')) {
        generateVoxelBackground();
      }
    })
  );
  
  elements.generateBtn.addEventListener('click', generateVoxelBackground);
  elements.downloadPng.addEventListener('click', downloadImage);
  elements.downloadJson.addEventListener('click', downloadJSON);
  elements.copyJson.addEventListener('click', copyJSON);
  
  showSection('home');
});

window.addEventListener('resize', () => {
  if (document.getElementById('voxel-generator-section').classList.contains('active')) {
    generateVoxelBackground();
  }
});
