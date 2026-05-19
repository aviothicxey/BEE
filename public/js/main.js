// ── Toast ──────────────────────────────────────────────────────────
function showToast(message, type = 'info', duration = 3000) {
  const icons = { success: 'check_circle', error: 'error', info: 'info' };
  const container = document.getElementById('toast-container');
  if (!container) return;
  const toast = document.createElement('div');
  toast.className = `toast ${type}`;
  toast.innerHTML = `<span class="material-symbols-outlined text-lg">${icons[type]||'info'}</span> ${message}`;
  container.appendChild(toast);
  setTimeout(() => { toast.style.animation = 'fadeUp 0.3s ease reverse forwards'; setTimeout(() => toast.remove(), 300); }, duration);
}

// ── User Menu ──────────────────────────────────────────────────────
function toggleUserMenu() {
  const menu = document.getElementById('user-menu');
  if (menu) menu.classList.toggle('hidden');
}
document.addEventListener('click', (e) => {
  const wrapper = document.getElementById('user-menu-wrapper');
  if (wrapper && !wrapper.contains(e.target)) {
    const menu = document.getElementById('user-menu');
    if (menu) menu.classList.add('hidden');
  }
});

// ── Auth ───────────────────────────────────────────────────────────
function logout() {
  window.location.href = '/logout';
}

// ── Password toggle ───────────────────────────────────────────────
function togglePassword(inputId, btn) {
  const input = document.getElementById(inputId);
  if (!input) return;
  const isText = input.type === 'text';
  input.type = isText ? 'password' : 'text';
  const icon = btn.querySelector('.material-symbols-outlined');
  if (icon) icon.textContent = isText ? 'visibility' : 'visibility_off';
}

// ── On load ────────────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  // Load cart badge if cart drawer exists (user is logged in as student)
  if (document.getElementById('cart-drawer')) {
    refreshCart();
  }
});
