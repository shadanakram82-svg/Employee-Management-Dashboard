// Global Application Logic

const App = {
  async init() {
    this.initToastContainer();
    await this.initData();
    this.checkAuth();
    this.initSidebar();
  },

  async initData() {
    let shouldFetch = false;
    const stored = localStorage.getItem('employees');
    
    if (!stored) {
      shouldFetch = true;
    } else {
      // Force update if the old foreign data is still there
      if (stored.includes('Alex Johnson') || stored.includes('Sarah Williams')) {
        shouldFetch = true;
      }
    }
    
    if (shouldFetch) {
      try {
        const response = await fetch('../data/employees.json');
        if (response.ok) {
          const data = await response.json();
          localStorage.setItem('employees', JSON.stringify(data));
        } else {
          if (!stored) localStorage.setItem('employees', JSON.stringify([]));
        }
      } catch (error) {
        console.error("Failed to load initial data:", error);
        if (!stored) localStorage.setItem('employees', JSON.stringify([]));
      }
    }
  },

  checkAuth() {
    const isLoggedIn = localStorage.getItem('isLoggedIn');
    const currentPage = window.location.pathname.split('/').pop();
    
    // Simple frontend protection
    if (!isLoggedIn && currentPage !== 'login.html' && currentPage !== '') {
      window.location.href = 'login.html';
    } else if (isLoggedIn && (currentPage === 'login.html' || currentPage === '')) {
      window.location.href = 'dashboard.html';
    }
  },

  logout() {
    localStorage.removeItem('isLoggedIn');
    window.location.href = 'login.html';
  },

  initSidebar() {
    const toggleBtn = document.getElementById('sidebar-toggle');
    const sidebar = document.getElementById('sidebar');
    
    if (toggleBtn && sidebar) {
      // Check saved state
      const isCollapsed = localStorage.getItem('sidebar-collapsed') === 'true';
      if (isCollapsed) {
        sidebar.classList.add('collapsed');
      }

      toggleBtn.addEventListener('click', () => {
        sidebar.classList.toggle('collapsed');
        localStorage.setItem('sidebar-collapsed', sidebar.classList.contains('collapsed'));
        
        // Trigger resize for charts
        setTimeout(() => window.dispatchEvent(new Event('resize')), 300);
      });
    }

    const logoutBtn = document.getElementById('logout-btn');
    if (logoutBtn) {
      logoutBtn.addEventListener('click', (e) => {
        e.preventDefault();
        this.logout();
      });
    }
  },

  initToastContainer() {
    if (!document.getElementById('toast-container')) {
      const container = document.createElement('div');
      container.id = 'toast-container';
      container.className = 'toast-container';
      document.body.appendChild(container);
    }
  },

  showToast(message, type = 'info') {
    const container = document.getElementById('toast-container');
    if (!container) return;

    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    
    // Icons based on type
    let icon = '';
    switch(type) {
      case 'success': icon = '✓'; break;
      case 'error': icon = '✕'; break;
      case 'warning': icon = '⚠'; break;
      default: icon = 'ℹ'; break;
    }

    toast.innerHTML = `
      <div class="toast-icon">${icon}</div>
      <div class="toast-message">${message}</div>
    `;

    container.appendChild(toast);

    // Remove toast after 3 seconds
    setTimeout(() => {
      toast.style.animation = 'fadeOut 0.3s ease-out forwards';
      setTimeout(() => {
        if (toast.parentNode) {
          toast.parentNode.removeChild(toast);
        }
      }, 300);
    }, 3000);
  }
};

// Add fadeOut animation dynamically
const style = document.createElement('style');
style.textContent = `
  @keyframes fadeOut {
    from { opacity: 1; transform: translateX(0); }
    to { opacity: 0; transform: translateX(100%); }
  }
`;
document.head.appendChild(style);

document.addEventListener('DOMContentLoaded', () => {
  App.init();
});

// Activity Log Utility
const ActivityLog = {
  log(message) {
    const activities = JSON.parse(localStorage.getItem('activities')) || [];
    const newActivity = {
      id: Date.now(),
      time: new Date().toISOString(),
      message: message
    };
    activities.unshift(newActivity);
    // Keep only top 10
    if(activities.length > 10) activities.pop();
    localStorage.setItem('activities', JSON.stringify(activities));
  },
  get() {
    return JSON.parse(localStorage.getItem('activities')) || [];
  },
  formatTime(isoString) {
    const date = new Date(isoString);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    
    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins} min ago`;
    
    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return `${diffHours} hr ago`;
    
    const diffDays = Math.floor(diffHours / 24);
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays} days ago`;
    
    return date.toLocaleDateString();
  }
};
