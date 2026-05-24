// Sidebar toggle on mobile
const sidebarToggle = document.getElementById('sidebarToggle');
const sidebarClose  = document.getElementById('sidebarClose');
const sidebar       = document.getElementById('adminSidebar');

if (sidebarToggle && sidebar) {
  sidebarToggle.addEventListener('click', () => sidebar.classList.toggle('open'));
}
if (sidebarClose && sidebar) {
  sidebarClose.addEventListener('click', () => sidebar.classList.remove('open'));
}

// Mark active sidebar link
document.querySelectorAll('.sidebar-link').forEach(link => {
  if (link.href === window.location.href) link.classList.add('active');
});
