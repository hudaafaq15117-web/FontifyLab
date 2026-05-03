// Premium Font Preview: Enhanced Cropping, Smooth Scaling, Kerning
// From single 2x13 sheet → composited text preview

let sheetDataUrl;
let sheetImg;
let previewCanvas;
let previewCtx;
let previewTextInput;
const COLS = 13;
const ROWS = 2;
let isGenerating = false;

document.addEventListener('DOMContentLoaded', async () => {
  previewCanvas = document.getElementById('previewCanvas');
  previewCtx = previewCanvas.getContext('2d');
  previewTextInput = document.getElementById('previewText');
  const generateBtn = document.getElementById('generatePreview');

  // Load sheet
  sheetDataUrl = localStorage.getItem('handwritingSheetForFont');
  if (!sheetDataUrl) {
    alert('No sheet found. Return to camera.');
    window.location.href = 'camera.html';
    return;
  }

  // Premium load with confetti effect
  await loadSheet();
  generateBtn.addEventListener('click', generatePreview);
  previewTextInput.addEventListener('input', generatePreview);
  generatePreview(); // Initial render
});

async function loadSheet() {
  return new Promise((resolve, reject) => {
    sheetImg = new Image();
    sheetImg.onload = () => {
      console.log('Premium sheet loaded:', sheetImg.width, 'x', sheetImg.height);
      // Confetti success animation (simple CSS particles)
      createConfetti();
      resolve();
    };
    sheetImg.onerror = reject;
    sheetImg.src = sheetDataUrl;
  });
}

function createConfetti() {
  for (let i = 0; i < 50; i++) {
    const conf = document.createElement('div');
    conf.style.cssText = `
      position: fixed; top: 50%; left: ${Math.random()*100}vw; 
      width: 10px; height: 10px; background: ${['#667eea','#764ba2','#f472b6','#10b981'][Math.floor(Math.random()*4)]};
      border-radius: 50%; pointer-events: none; z-index: 9999;
      animation: confetti 1s linear forwards;
      animation-delay: ${Math.random()*0.5}s;
    `;
    document.body.appendChild(conf);
    setTimeout(() => conf.remove(), 1500);
  }
}

function generatePreview() {
  if (isGenerating) return;
  isGenerating = true;
  
  previewCtx.clearRect(0, 0, previewCanvas.width, previewCanvas.height);
  previewCtx.fillStyle = 'rgba(30, 30, 47, 0.95)';
  previewCtx.fillRect(0, 0, previewCanvas.width, previewCanvas.height);
  
  previewCanvas.width = previewCanvas.clientWidth * window.devicePixelRatio;
  previewCanvas.height = 280 * window.devicePixelRatio;
  previewCtx.scale(devicePixelRatio, devicePixelRatio);
  
  const text = previewTextInput.value || 'Premium Handwriting ✨';
  const y = 140;
  let x = 40;
  const targetH = 80;
  const padding = 0.85; // Improved kerning
  
  previewCtx.imageSmoothingEnabled = true;
  previewCtx.imageSmoothingQuality = 'high';
  
  for (let char of text.toUpperCase().replace(/[^A-Z\s]/g, '')) { // A-Z only
    if (char === ' ') {
      x += targetH * 0.4;
      continue;
    }
    const idx = char.charCodeAt(0) - 65;
    if (idx >= 0 && idx < 26) {
      const col = idx % COLS;
      const row = Math.floor(idx / COLS);
      const cropW = sheetImg.width / COLS;
      const cropH = sheetImg.height / ROWS;
      const cropX = col * cropW + cropW * 0.05; // Slight trim margins
      const cropY = row * cropH + cropH * 0.05;
      const cropWidth = cropW * 0.9;
      const cropHeight = cropH * 0.9;
      
      const scale = targetH / cropHeight;
      const drawW = cropWidth * scale * padding;
      const drawH = cropHeight * scale;
      
      previewCtx.shadowColor = 'rgba(0,0,0,0.3)';
      previewCtx.shadowBlur = 5;
      previewCtx.shadowOffsetY = 2;
      previewCtx.drawImage(sheetImg, cropX, cropY, cropWidth, cropHeight, x, y - drawH/2, drawW, drawH);
      previewCtx.shadowBlur = 0;
      
      x += drawW + 15; // Kerning + gap
    }
    
    if (x > previewCanvas.clientWidth - 100) break;
  }
  
  // Retina download
  const downloadLink = document.getElementById('downloadLink');
  downloadLink.href = previewCanvas.toDataURL('image/png', 0.98);
  downloadLink.download = `premium-handwriting-${Date.now()}.png`;
  
  isGenerating = false;
}

