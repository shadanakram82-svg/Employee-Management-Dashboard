document.addEventListener('DOMContentLoaded', () => {
  const loginForm = document.getElementById('login-form');
  const emailInput = document.getElementById('email');
  const passwordInput = document.getElementById('password');
  const togglePasswordBtn = document.getElementById('toggle-password');
  const rememberMe = document.getElementById('remember-me');
  const forgotPasswordBtn = document.getElementById('forgot-password');

  // Pre-fill email if remember me was checked previously
  const savedEmail = localStorage.getItem('rememberedEmail');
  if (savedEmail) {
    emailInput.value = savedEmail;
    rememberMe.checked = true;
  }

  // Toggle Password Visibility
  togglePasswordBtn.addEventListener('click', () => {
    const type = passwordInput.getAttribute('type') === 'password' ? 'text' : 'password';
    passwordInput.setAttribute('type', type);
    togglePasswordBtn.textContent = type === 'password' ? 'Show' : 'Hide';
  });

  // Handle Login
  loginForm.addEventListener('submit', (e) => {
    e.preventDefault();
    
    // Clear previous errors
    Validator.clearAllErrors('login-form');
    
    const email = emailInput.value.trim();
    const password = passwordInput.value;
    let isValid = true;

    // Validate Email
    if (!Validator.isNotEmpty(email) || !Validator.isEmail(email)) {
      Validator.showError('email-group');
      isValid = false;
    }

    // Validate Password
    if (!Validator.isNotEmpty(password)) {
      Validator.showError('password-group');
      isValid = false;
    }

    if (isValid) {
      // Simulate API call for authentication (Mock Auth)
      const loginBtn = document.getElementById('login-btn');
      const originalText = loginBtn.textContent;
      loginBtn.textContent = 'Signing in...';
      loginBtn.disabled = true;

      setTimeout(() => {
        // Any valid email and non-empty password works for demo
        if (email === 'admin@company.com' || email.includes('@')) {
          // Success
          localStorage.setItem('isLoggedIn', 'true');
          localStorage.setItem('currentUser', JSON.stringify({ email, role: 'Admin' }));
          
          if (rememberMe.checked) {
            localStorage.setItem('rememberedEmail', email);
          } else {
            localStorage.removeItem('rememberedEmail');
          }

          App.showToast('Login successful!', 'success');
          
          setTimeout(() => {
            window.location.href = 'dashboard.html';
          }, 500);
        } else {
          // Failed
          Validator.showError('email-group');
          App.showToast('Invalid credentials.', 'error');
          loginBtn.textContent = originalText;
          loginBtn.disabled = false;
        }
      }, 800);
    }
  });

  // Forgot password mock
  forgotPasswordBtn.addEventListener('click', (e) => {
    e.preventDefault();
    App.showToast('Password reset link sent to your email.', 'info');
  });
  
  // Clear error on input
  emailInput.addEventListener('input', () => Validator.clearError('email-group'));
  passwordInput.addEventListener('input', () => Validator.clearError('password-group'));
});
