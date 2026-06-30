// Form Validation Utilities

const Validator = {
  isEmail(email) {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(String(email).toLowerCase());
  },

  isNotEmpty(value) {
    return value !== null && value.trim() !== '';
  },
  
  isMinLength(value, min) {
    return value.length >= min;
  },
  
  isNumeric(value) {
    return !isNaN(parseFloat(value)) && isFinite(value);
  },

  showError(groupId) {
    const group = document.getElementById(groupId);
    if (group) group.classList.add('error');
  },

  clearError(groupId) {
    const group = document.getElementById(groupId);
    if (group) group.classList.remove('error');
  },
  
  clearAllErrors(formId) {
    const form = document.getElementById(formId);
    if (form) {
      const groups = form.querySelectorAll('.form-group.error');
      groups.forEach(g => g.classList.remove('error'));
    }
  }
};
