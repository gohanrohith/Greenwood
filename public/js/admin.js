// Create overlay element once
const overlay = document.createElement('div');
overlay.className = 'sidebar-overlay';
document.body.appendChild(overlay);

const sidebarToggle = document.getElementById('sidebarToggle');
const sidebarClose  = document.getElementById('sidebarClose');
const sidebar       = document.getElementById('adminSidebar');

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
    sidebar.classList.contains('open') ? closeSidebar() : openSidebar();
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
      if (window.innerWidth < 768) closeSidebar();
    });
  });
}

// Mark active sidebar link
document.querySelectorAll('.sidebar-link').forEach(link => {
  if (link.href === window.location.href) link.classList.add('active');
});
