// Shared navigation and utils
function goBack() {
  window.location.href = 'index.html';
}

// Common back button handler
document.addEventListener('DOMContentLoaded', () => {
  const backBtn = document.getElementById('backBtn');
  if (backBtn) {
    backBtn.addEventListener('click', () => {
      window.history.back();
    });
  }
});

