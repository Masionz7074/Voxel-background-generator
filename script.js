const canvas = document.getElementById("bg");
const ctx = canvas.getContext("2d");
let placed = [];
let topColorHex = "#ffffff";
let bottomColorHex = "#000000";

const widthInput = document.getElementById("widthInput");
const heightInput = document.getElementById("heightInput");
const noisinessInput = document.getElementById("noisinessInput");
const bgColorInput = document.getElementById("bgColorInput");
const shapeColorInput = document.getElementById("shapeColorInput");
const sizeInput = document.getElementById("sizeInput");
const shapeSelect = document.getElementById("shapeSelect");
const randomizeColorToggle = document.getElementById("randomizeColorToggle");

const generateBtn = document.getElementById("generateBtn");
const downloadPngBtn = document.getElementById("downloadPngBtn");
const downloadJsonBtn = document.getElementById("downloadJsonBtn");
const copyJsonBtn = document.getElementById("copyJsonBtn");

function hexToFloatArray(hex) {
    const r = parseInt(hex.slice(1, 3), 16) / 255;
    const g = parseInt(hex.slice(3, 5), 16) / 255;
    const b = parseInt(hex.slice(5, 7), 16) / 255;
    return [parseFloat(r.toFixed(3)), parseFloat(g.toFixed(3)), parseFloat(b.toFixed(3))];
}

function lightenColor(color, percent) {
    let r = parseInt(color.slice(1, 3), 16);
    let g = parseInt(color.slice(3, 5), 16);
    let b = parseInt(color.slice(5, 7), 16);
    r = Math.min(255, Math.floor(r + (255 - r) * (percent / 100)));
    g = Math.min(255, Math.floor(g + (255 - g) * (percent / 100)));
    b = Math.min(255, Math.floor(b + (255 - b) * (percent / 100)));
    return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
}

function getRandomRGB() {
    return [
        Math.floor(Math.random() * 256),
        Math.floor(Math.random() * 256),
        Math.floor(Math.random() * 256)
    ];
}

function getShapeColor() {
    const randomize = randomizeColorToggle.checked;
    const shapeHex = shapeColorInput.value;

    let rgb;
    if (randomize) {
        rgb = getRandomRGB();
    } else {
        rgb = [
            parseInt(shapeHex.slice(1, 3), 16),
            parseInt(shapeHex.slice(3, 5), 16),
            parseInt(shapeHex.slice(5, 7), 16)
        ];
    }
    return rgb.map(c => (c / 255).toFixed(3)).map(Number);
}

function drawShape(ctx, shape, size) {
    const half = size / 2;
    ctx.beginPath();

    switch (shape) {
        case 'circle':
            ctx.arc(0, 0, half, 0, Math.PI * 2);
            break;
        case 'triangle':
            for (let i = 0; i < 3; i++) {
                const angle = (i / 3) * Math.PI * 2 - Math.PI / 2;
                const x = half * Math.cos(angle);
                const y = half * Math.sin(angle);
                if (i === 0) ctx.moveTo(x, y);
                else ctx.lineTo(x, y);
            }
            ctx.closePath();
            break;
        case 'hexagon':
            for (let i = 0; i < 6; i++) {
                const angle = (i / 6) * Math.PI * 2;
                const x = half * Math.cos(angle);
                const y = half * Math.sin(angle);
                if (i === 0) ctx.moveTo(x, y);
                else ctx.lineTo(x, y);
            }
            ctx.closePath();
            break;
        case 'pentagon':
            for (let i = 0; i < 5; i++) {
                const angle = (i / 5) * Math.PI * 2 - Math.PI / 2;
                const x = half * Math.cos(angle);
                const y = half * Math.sin(angle);
                if (i === 0) ctx.moveTo(x, y);
                else ctx.lineTo(x, y);
            }
            ctx.closePath();
            break;
        case 'diamond':
            ctx.moveTo(0, -half);
            ctx.lineTo(half, 0);
            ctx.lineTo(0, half);
            ctx.lineTo(-half, 0);
            ctx.closePath();
            break;
        case 'oval':
            const radiusX = half;
            const radiusY = half * 0.7;
            ctx.ellipse(0, 0, radiusX, radiusY, 0, 0, Math.PI * 2);
            break;
        case 'rounded_square':
            const borderRadius = half * 0.2;
            ctx.roundRect(-half, -half, size, size, borderRadius);
            break;
        case 'line_horizontal':
            const lineWidthH = size;
            const lineHeightH = Math.max(2, size * 0.1);
            ctx.rect(-lineWidthH / 2, -lineHeightH / 2, lineWidthH, lineHeightH);
            break;
        case 'line_vertical':
            const lineWidthV = Math.max(2, size * 0.1);
            const lineHeightV = size;
            ctx.rect(-lineWidthV / 2, -lineHeightV / 2, lineWidthV, lineHeightV);
            break;
        case 'star':
            const numPoints = 5;
            const innerRadius = half * 0.4;
            const outerRadius = half;
            for (let i = 0; i < numPoints * 2; i++) {
                const currentRadius = i % 2 === 0 ? outerRadius : innerRadius;
                const angle = Math.PI / numPoints * i - Math.PI / 2;
                const x = currentRadius * Math.cos(angle);
                const y = currentRadius * Math.sin(angle);
                if (i === 0) ctx.moveTo(x, y);
                else ctx.lineTo(x, y);
            }
            ctx.closePath();
            break;
        default:
            ctx.fillRect(-half, -half, size, size);
            return;
    }
    ctx.fill();
}

function drawVoxelBackground(width, height, noisiness, bgColor) {
    bottomColorHex = bgColor;
    topColorHex = lightenColor(bgColor, 30);

    const gradient = ctx.createLinearGradient(0, 0, 0, height);
    gradient.addColorStop(1, bottomColorHex);
    gradient.addColorStop(0, topColorHex);
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, width, height);

    const centerHighlight = ctx.createRadialGradient(width / 2, height / 2, 0, width / 2, height / 2, width / 3);
    centerHighlight.addColorStop(0, 'rgba(255, 255, 255, 0.08)');
    centerHighlight.addColorStop(1, 'rgba(0, 0, 0, 0)');
    ctx.fillStyle = centerHighlight;
    ctx.fillRect(0, 0, width, height);

    const rotationDegrees = 37.5;
    const rotationRadians = rotationDegrees * (Math.PI / 180);
    let attempts = 0;
    const maxAttempts = noisiness * 5;
    const shapeSizeScale = parseFloat(sizeInput.value);

    placed = [];
    while (placed.length < noisiness && attempts < maxAttempts) {
        attempts++;
        const baseShapeDimension = (Math.random() * 30 + 10) * shapeSizeScale;
        const x = Math.random() * width;
        const y = Math.random() * height;

        const baseAlpha = 0.05;
        const minAlpha = 0.15;
        const normalizedY = y / height;
        const alpha = baseAlpha - (baseAlpha - minAlpha) * normalizedY;

        const diagonalLength = baseShapeDimension * Math.sqrt(2);
        const halfCollisionDim = diagonalLength / 2;

        const box = {
            left: x - halfCollisionDim,
            right: x + halfCollisionDim,
            top: y - halfCollisionDim,
            bottom: y + halfCollisionDim,
            centerX: x,
            centerY: y,
            size: baseShapeDimension,
            alpha: alpha
        };

        let overlaps = false;
        for (let other of placed) {
            if (
                box.right > other.left &&
                box.left < other.right &&
                box.bottom > other.top &&
                box.top < other.bottom
            ) {
                overlaps = true;
                break;
            }
        }

        if (!overlaps) {
            placed.push(box);
            ctx.save();
            ctx.translate(x, y);
            ctx.rotate(rotationRadians);
            const [r, g, b] = getShapeColor().map(c => Math.round(c * 255));
            ctx.fillStyle = `rgba(${r}, ${g}, ${b}, ${alpha})`;
            const shape = shapeSelect.value;
            drawShape(ctx, shape, baseShapeDimension);
            ctx.restore();
        }
    }
}

function generateVoxelBackground() {
    const width = parseInt(widthInput.value, 10);
    const height = parseInt(heightInput.value, 10);
    const noisiness = parseInt(noisinessInput.value, 10);
    const bgColor = bgColorInput.value;

    canvas.width = width;
    canvas.height = height;

    drawVoxelBackground(width, height, noisiness, bgColor);
}

function downloadImage() {
    const link = document.createElement('a');
    link.download = 'voxel-background.png';
    link.href = canvas.toDataURL();
    link.click();
}

function prepareJsonOutput() {
    const width = parseInt(widthInput.value, 10);
    const height = parseInt(document.getElementById("heightInput").value, 10);

    const jsonOutput = {
        namespace: "cubes",
        image: {
            type: "image",
            texture: "textures/ui/cube"
        },
        panel: {
            layer: 1000,
            type: "custom",
            renderer: "gradient_renderer",
            size: [width, height],
            color1: hexToFloatArray(topColorHex),
            color2: hexToFloatArray(bottomColorHex),
            clips_children: true,
            controls: [{
                panel: {
                    type: "panel",
                    controls: []
                }
            }]
        }
    };

    jsonOutput.panel.controls[0].panel.controls = placed.map(box => {
        const sizePercent = (box.size / Math.max(width, height)) * 100;
        const offsetXPercent = ((box.centerX - (width / 2)) / width) * 100;
        const offsetYPercent = ((box.centerY - (height / 2)) / height) * 100;

        return {
            [`image@${jsonOutput.namespace}.image`]: {
                size: [`${sizePercent.toFixed(2)}%`, `${sizePercent.toFixed(2)}%`],
                offset: [`${offsetXPercent.toFixed(2)}%`, `${offsetYPercent.toFixed(2)}%`],
                color: getShapeColor(),
                alpha: parseFloat(box.alpha.toFixed(2))
            }
        };
    });

    let rawJSON = JSON.stringify(jsonOutput, null, 2);
    rawJSON = rawJSON.replace(/\[\s+([^\[\]]+?)\s+\]/g, (match, content) => {
        return '[' + content.replace(/\s*,\s*/g, ', ').trim() + ']';
    });
    return rawJSON;
}

function downloadJSON() {
    const rawJSON = prepareJsonOutput();
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(rawJSON);
    const link = document.createElement('a');
    link.setAttribute("href", dataStr);
    link.setAttribute("download", "voxel_background.json");
    document.body.appendChild(link);
    link.click();
    link.remove();
}

function copyJSON() {
    const rawJSON = prepareJsonOutput();
    navigator.clipboard.writeText(rawJSON).then(() => {
        alert('JSON copied to clipboard!');
    }, () => {
        alert('Failed to copy JSON.');
    });
}

function showSection(targetId) {
    const navLinks = document.querySelectorAll('.nav-link');
    const contentSections = document.querySelectorAll('.content-section');

    contentSections.forEach(section => {
        section.classList.remove('active');
    });
    navLinks.forEach(link => {
        link.classList.remove('active');
    });

    const targetSection = document.getElementById(targetId + '-section');
    if (targetSection) {
        targetSection.classList.add('active');
    }

    const mainNavLinkId = targetId.startsWith('voxel-generator') ? 'nav-tools' : 'nav-' + targetId;
    const mainNavLink = document.getElementById(mainNavLinkId);
    if (mainNavLink) {
        mainNavLink.classList.add('active');
    }

    if (targetId === 'voxel-generator') {
        generateVoxelBackground();
    }
}

document.addEventListener('DOMContentLoaded', () => {
    const navHome = document.getElementById('nav-home');
    const navCredits = document.getElementById('nav-credits');
    const navLicense = document.getElementById('nav-license');
    const navVoxelGenerator = document.getElementById('nav-voxel-generator');

    navHome.addEventListener('click', (e) => {
        e.preventDefault();
        showSection('home');
    });

    navCredits.addEventListener('click', (e) => {
        e.preventDefault();
        showSection('credits');
    });

    navLicense.addEventListener('click', (e) => {
        e.preventDefault();
        showSection('license');
    });

    navVoxelGenerator.addEventListener('click', (e) => {
        e.preventDefault();
        showSection('voxel-generator');
    });

    const voxelControls = [
        widthInput, heightInput, noisinessInput, bgColorInput,
        shapeColorInput, sizeInput, shapeSelect, randomizeColorToggle
    ];
    voxelControls.forEach(control => {
        control.addEventListener('change', () => {
            if (document.getElementById('voxel-generator-section').classList.contains('active')) {
                generateVoxelBackground();
            }
        });
    });

    generateBtn.addEventListener('click', generateVoxelBackground);
    downloadPngBtn.addEventListener('click', downloadImage);
    downloadJsonBtn.addEventListener('click', downloadJSON);
    copyJsonBtn.addEventListener('click', copyJSON);

    showSection('home');
});

window.addEventListener('resize', () => {
    if (document.getElementById('voxel-generator-section').classList.contains('active')) {
        generateVoxelBackground();
    }
});
