// Theme Management

const ThemeManager = {
  init() {
    // Load saved theme or use system preference
    const savedTheme = localStorage.getItem('theme');
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    
    if (savedTheme) {
      document.documentElement.setAttribute('data-theme', savedTheme);
    } else if (prefersDark) {
      document.documentElement.setAttribute('data-theme', 'dark');
      localStorage.setItem('theme', 'dark');
    }

    // Load saved accent color
    const savedAccent = localStorage.getItem('accent-color');
    if (savedAccent) {
      document.documentElement.setAttribute('data-accent', savedAccent);
    }

    this.attachEventListeners();
  },

  toggleTheme() {
    const currentTheme = document.documentElement.getAttribute('data-theme');
    const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
    
    document.documentElement.setAttribute('data-theme', newTheme);
    localStorage.setItem('theme', newTheme);
    
    // Dispatch event for other components (like charts) to update
    window.dispatchEvent(new Event('themeChanged'));
  },

  setAccentColor(color) {
    document.documentElement.setAttribute('data-accent', color);
    localStorage.setItem('accent-color', color);
    window.dispatchEvent(new Event('themeChanged'));
  },

  attachEventListeners() {
    const themeToggleBtn = document.getElementById('theme-toggle');
    if (themeToggleBtn) {
      themeToggleBtn.addEventListener('click', () => this.toggleTheme());
    }

    const accentButtons = document.querySelectorAll('.accent-picker');
    accentButtons.forEach(btn => {
      btn.addEventListener('click', (e) => {
        const color = e.target.getAttribute('data-color');
        if (color) this.setAccentColor(color);
      });
    });
  }
};

// Initialize theme on DOM load
document.addEventListener('DOMContentLoaded', () => {
  ThemeManager.init();
});
