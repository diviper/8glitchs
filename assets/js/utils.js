export function debounce(fn, ms) {
  let timeoutId;
  return function (...args) {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => fn.apply(this, args), ms);
  };
}

export function setTitle(pageTitle) {
  const base = 'Glitch Registry'; // As per AGENTS.MD, theme.js can override this later
  document.title = pageTitle ? `${base} — ${pageTitle}` : base;
}

export function showToast(message) {
  const toast = document.createElement('div');
  toast.className = 'toast';
  toast.setAttribute('role', 'status');
  toast.textContent = message;

  const closeButton = document.createElement('button');
  closeButton.type = 'button';
  closeButton.className = 'toast-close';
  closeButton.innerHTML = '&times;';
  closeButton.setAttribute('aria-label', 'Close');
  toast.appendChild(closeButton);

  const removeToast = () => {
    toast.classList.remove('show');
    toast.addEventListener('transitionend', () => toast.remove());
  };

  closeButton.addEventListener('click', removeToast);
  document.body.appendChild(toast);

  // Delay to allow CSS transition
  setTimeout(() => toast.classList.add('show'), 10);
  setTimeout(removeToast, 5000); // Auto-dismiss after 5 seconds
}
