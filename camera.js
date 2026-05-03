// Premium Handwriting Font Generator - Enhanced Camera (Reliable Capture)
// Features: Camera fallbacks, live status, detailed errors, smooth UX

let video;
let canvas;
let captureBtn;
let submitBtn;
let backBtn;
let gallery;
let templateCanvas;
let statusDiv;
let stream;
let sheetData = null;

document.addEventListener('DOMContentLoaded', async () => {
  video = document.getElementById('video');
  canvas = document.getElementById('canvas');
  captureBtn = document.getElementById('captureBtn');
  uploadBtn = document.getElementById('uploadBtn');
  uploadFallback = document.getElementById('uploadFallback');
  submitBtn = document.getElementById('submitBtn');
  backBtn = document.getElementById('backBtn');
  gallery = document.getElementById('gallery');
  templateCanvas = document.getElementById('templateCanvas');
  statusDiv = document.getElementById('status');

  // Load saved sheet if any
  const savedSheet = localStorage.getItem('handwritingSheet');
  if (savedSheet) {
    sheetData = savedSheet;
    updateGallery();
    captureBtn.disabled = true;
    submitBtn.disabled = false;
    statusDiv.textContent = '✅ Sheet captured! Ready to submit.';
    return;
  }

  statusDiv.textContent = '🔄 Initializing camera... (Grant permission if prompted)';

  // Setup event listeners
  captureBtn.addEventListener('click', captureImage);
  uploadBtn.addEventListener('click', () => uploadFallback.click());
  uploadFallback.addEventListener('change', handleUpload);
  submitBtn.addEventListener('click', submitImages);
  backBtn.addEventListener('click', () => window.location.href = 'index.html');

  // Enhanced camera setup with fallbacks
  await initCamera();
});

async function initCamera() {
  const constraintsList = [
    { video: { facingMode: 'environment', width: { ideal: 1280 }, height: { ideal: 720 } } }, // Rear cam preferred
    { video: { facingMode: 'user', width: { ideal: 1280 }, height: { ideal: 720 } } }, // Front cam
    { video: true } // Any camera
  ];

  for (let constraints of constraintsList) {
    try {
      statusDiv.textContent = `📷 Trying camera mode...`;
      stream = await navigator.mediaDevices.getUserMedia(constraints);
      video.srcObject = stream;
      
      return new Promise((resolve) => {
        video.onloadedmetadata = () => {
          statusDiv.textContent = `✅ Camera ready! (${video.videoWidth}x${video.videoHeight}) Position your A-Z sheet using the grid overlay above.`;
          video.oncanplay = () => {
            updateTemplateOverlay();
            captureBtn.disabled = false;
            resolve();
          };
        };
      });
    } catch (err) {
      console.error('Camera mode failed:', constraints, err);
      statusDiv.textContent = `⚠️ Camera mode unavailable: ${err.name}`;
    }
  }

  // All failed
  const errorMsg = '❌ Live camera unavailable. ';
  statusDiv.innerHTML = `${errorMsg}<strong>Upload photo instead!</strong> (Take A-Z sheet pic separately)`;
  uploadBtn.style.display = 'inline-block';
  captureBtn.style.display = 'none';
  alert(`${errorMsg}\\nUse 📁 Upload button or enable HTTPS: npx serve . --ssl`);
}

function updateTemplateOverlay() {
  if (video.videoWidth === 0 || !templateCanvas) return;
  templateCanvas.width = video.videoWidth;
  templateCanvas.height = video.videoHeight;
  const ctx = templateCanvas.getContext('2d');
  ctx.clearRect(0, 0, templateCanvas.width, templateCanvas.height);

  // Premium grid: 2x13, thicker lines, glow
  const cols = 13, rows = 2;
  const cellW = templateCanvas.width / cols;
  const cellH = templateCanvas.height / rows;

  // Outer glow border
  ctx.shadowColor = 'rgba(255,255,255,0.8)';
  ctx.shadowBlur = 10;
  ctx.strokeStyle = '#FFFFFF';
  ctx.lineWidth = 4;
  ctx.strokeRect(0, 0, templateCanvas.width, templateCanvas.height);

  ctx.shadowBlur = 0; // Reset

  // Cells + labels
  ctx.lineWidth = 2;
  ctx.font = 'bold 32px -apple-system, BlinkMacSystemFont, sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillStyle = 'rgba(255,255,255,0.95)';
  ctx.strokeStyle = 'rgba(255,255,255,0.8)';

  const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');
  for (let i = 0; i < 26; i++) {
    const col = i % cols;
    const row = Math.floor(i / cols);
    const x = col * cellW + cellW / 2;
    const y = row * cellH + cellH / 2;
    ctx.fillText(letters[i], x, y);
    ctx.strokeRect(col * cellW, row * cellH, cellW, cellH);
  }
}

async function captureImage() {
  if (video.videoWidth === 0) {
    alert('Camera not ready.');
    return;
  }
  statusDiv.textContent = '📸 Capturing...';
  canvas.width = video.videoWidth;
  canvas.height = video.videoHeight;
  canvas.getContext('2d').drawImage(video, 0, 0);
  sheetData = canvas.toDataURL('image/png', 0.95); // High quality
  localStorage.setItem('handwritingSheet', sheetData);
  updateGallery();
  captureBtn.disabled = true;
  submitBtn.disabled = false;
  statusDiv.textContent = '✅ Sheet captured perfectly! Review below.';
}

function updateGallery() {
  gallery.innerHTML = '';
  if (!sheetData) return;
  const div = document.createElement('div');
  div.className = 'gallery-item';
  const img = document.createElement('img');
  img.src = sheetData;
  img.title = 'Your A-Z sheet (click to enlarge)';
  img.style.cursor = 'zoom-in';
  img.onclick = () => window.open(img.src);
  const delBtn = document.createElement('button');
  delBtn.textContent = '🔄 Retake';
  delBtn.onclick = () => {
    sheetData = null;
    localStorage.removeItem('handwritingSheet');
    updateGallery();
    captureBtn.disabled = false;
    submitBtn.disabled = true;
    statusDiv.textContent = '📷 Ready to retake.';
    // Restart camera if needed
    if (stream) stream.getTracks().forEach(t => t.stop());
    initCamera();
  };
  div.append(img, delBtn);
  gallery.appendChild(div);
}

function submitImages() {
  if (sheetData) {
    localStorage.setItem('handwritingSheetForFont', sheetData);
    statusDiv.textContent = '🚀 Generating font preview...';
    window.location.href = 'result.html';
  } else {
    alert('Capture first!');
  }
}

async function handleUpload(e) {
  const file = e.target.files[0];
  if (!file) return;
  statusDiv.textContent = '📤 Processing uploaded image...';
  const img = new Image();
  img.onload = () => {
    canvas.width = 1280;
    canvas.height = 720;
    canvas.getContext('2d').drawImage(img, 0, 0, canvas.width, canvas.height);
    sheetData = canvas.toDataURL('image/png', 0.95);
    localStorage.setItem('handwritingSheet', sheetData);
    updateGallery();
    captureBtn.disabled = true;
    uploadBtn.style.display = 'none';
    submitBtn.disabled = false;
    statusDiv.textContent = '✅ Sheet loaded from upload! Review below.';
  };
  const reader = new FileReader();
  reader.onload = (ev) => img.src = ev.target.result;
  reader.readAsDataURL(file);
}

// Cleanup
window.addEventListener('beforeunload', () => {
  if (stream) stream.getTracks().forEach(track => track.stop());
});

