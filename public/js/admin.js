// Create overlay element once
const overlay = document.createElement('div');
overlay.className = 'sidebar-overlay';
document.body.appendChild(overlay);

const sidebarToggle = document.getElementById('sidebarToggle');
const sidebarClose  = document.getElementById('sidebarClose');
const sidebar       = document.getElementById('adminSidebar');

// Restore desktop collapse state across page navigations
if (window.innerWidth > 768 && localStorage.getItem('sidebarCollapsed') === '1') {
  document.body.classList.add('sidebar-collapsed');
}

function openSidebar() {
  sidebar.classList.add('open');
  overlay.classList.add('active');
  document.body.style.overflow = 'hidden';
}
function closeSidebar() {
  sidebar.classList.remove('open');
  overlay.classList.remove('active');
  document.body.style.overflow = '';
}

if (sidebarToggle && sidebar) {
  sidebarToggle.addEventListener('click', () => {
    if (window.innerWidth > 768) {
      const collapsed = document.body.classList.toggle('sidebar-collapsed');
      localStorage.setItem('sidebarCollapsed', collapsed ? '1' : '0');
    } else {
      sidebar.classList.contains('open') ? closeSidebar() : openSidebar();
    }
  });
}
if (sidebarClose && sidebar) {
  sidebarClose.addEventListener('click', closeSidebar);
}
overlay.addEventListener('click', closeSidebar);

// Close sidebar on mobile when a nav link is clicked
if (sidebar) {
  sidebar.querySelectorAll('.sidebar-link').forEach(link => {
    link.addEventListener('click', () => {
      if (window.innerWidth <= 768) closeSidebar();
    });
  });
}

// Mark active sidebar link
document.querySelectorAll('.sidebar-link').forEach(link => {
  const path = window.location.pathname;
  const href = link.getAttribute('href');
  if (!href) return;
  const isActive = href === '/admin'
    ? (path === '/admin' || path === '/admin/')
    : path.startsWith(href);
  if (isActive) link.classList.add('active');
});

// Confirm before destructive actions
document.querySelectorAll('[data-confirm]').forEach(el => {
  el.addEventListener('click', e => {
    if (!confirm(el.dataset.confirm || 'Are you sure?')) e.preventDefault();
  });
});
