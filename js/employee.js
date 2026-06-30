document.addEventListener('DOMContentLoaded', () => {
  let employees = JSON.parse(localStorage.getItem('employees')) || [];
  
  let currentPage = 1;
  const rowsPerPage = 5;
  
  let currentSort = { by: null, order: 'asc' };
  let currentFilters = { department: '', designation: '', status: '' };
  let currentQuery = '';

  const departmentDesignations = {
    "Engineering": ["Software Engineer", "Senior Developer", "QA Engineer", "DevOps Engineer", "Tech Lead"],
    "Human Resources": ["HR Manager", "HR Executive", "Recruiter"],
    "Design": ["UX Designer", "UI Designer", "Graphic Designer"],
    "Marketing": ["Marketing Specialist", "SEO Expert", "Content Writer", "Marketing Manager"],
    "Finance": ["Financial Analyst", "Accountant", "Finance Manager"]
  };

  function populateDesignations(dept, selectElement, includeAll = false) {
    if (!selectElement) return;
    selectElement.innerHTML = '';
    
    if (includeAll) {
      const allOption = document.createElement('option');
      allOption.value = '';
      allOption.textContent = 'All Designations';
      selectElement.appendChild(allOption);
    }

    if (dept && departmentDesignations[dept]) {
      departmentDesignations[dept].forEach(desig => {
        const option = document.createElement('option');
        option.value = desig;
        option.textContent = desig;
        selectElement.appendChild(option);
      });
    } else if (!dept) {
      // Show all if no department selected
      const allDesigs = new Set();
      Object.values(departmentDesignations).forEach(list => list.forEach(d => allDesigs.add(d)));
      Array.from(allDesigs).sort().forEach(desig => {
        const option = document.createElement('option');
        option.value = desig;
        option.textContent = desig;
        selectElement.appendChild(option);
      });
    }
  }

  const tableBody = document.getElementById('employee-tbody');
  const paginationContainer = document.getElementById('pagination');
  
  // Modal Elements
  const modal = document.getElementById('employee-modal');
  const addBtn = document.getElementById('add-employee-btn');
  const closeBtn = document.getElementById('close-modal');
  const cancelBtn = document.getElementById('cancel-modal');
  const form = document.getElementById('employee-form');
  const modalTitle = document.getElementById('modal-title');
  const empIndexInput = document.getElementById('emp-index');

  // Search & Filter Elements
  const searchInput = document.getElementById('search-input');
  const filterDept = document.getElementById('filter-dept');
  const filterDesignation = document.getElementById('filter-designation');
  const filterStatus = document.getElementById('filter-status');
  
  const modalDept = document.getElementById('emp-dept');
  const modalDesig = document.getElementById('emp-desig');
  if (modalDept && modalDesig) {
    modalDept.addEventListener('change', (e) => {
      populateDesignations(e.target.value, modalDesig, false);
    });
  }

  // Initialize
  populateDesignations('', filterDesignation, true);
  renderTable();
  
  // Event Listeners for Modal
  addBtn.addEventListener('click', () => openModal());
  closeBtn.addEventListener('click', closeModal);
  cancelBtn.addEventListener('click', (e) => { e.preventDefault(); closeModal(); });
  
  // Close modal on click outside
  modal.addEventListener('click', (e) => {
    if (e.target === modal) closeModal();
  });
  
  // Handle Form Submit (Add/Edit)
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    if (!validateForm()) return;
    
    const index = empIndexInput.value;
    const employeeData = {
      id: document.getElementById('emp-id').value,
      name: document.getElementById('emp-name').value,
      email: document.getElementById('emp-email').value,
      phone: document.getElementById('emp-phone').value,
      department: document.getElementById('emp-dept').value,
      designation: document.getElementById('emp-desig').value,
      salary: parseFloat(document.getElementById('emp-salary').value),
      joiningDate: document.getElementById('emp-date').value,
      gender: document.getElementById('emp-gender').value,
      status: document.getElementById('emp-status').value,
      address: document.getElementById('emp-address').value
    };
    
    if (index === '') {
      // Add new
      employees.push(employeeData);
      if (typeof ActivityLog !== 'undefined') ActivityLog.log(`<strong>${employeeData.name}</strong> joined the ${employeeData.department} department.`);
      App.showToast('Employee added successfully', 'success');
    } else {
      // Edit existing
      employees[index] = employeeData;
      if (typeof ActivityLog !== 'undefined') ActivityLog.log(`Updated profile for <strong>${employeeData.name}</strong>.`);
      App.showToast('Employee updated successfully', 'success');
    }
    
    saveData();
    closeModal();
    renderTable();
  });
  
  // Search & Filter Events
  searchInput.addEventListener('input', (e) => {
    currentQuery = e.target.value;
    currentPage = 1;
    renderTable();
  });
  
  filterDept.addEventListener('change', (e) => {
    currentFilters.department = e.target.value;
    
    populateDesignations(currentFilters.department, filterDesignation, true);
    currentFilters.designation = '';
    
    currentPage = 1;
    renderTable();
  });
  
  if (filterDesignation) {
    filterDesignation.addEventListener('change', (e) => {
      currentFilters.designation = e.target.value;
      currentPage = 1;
      renderTable();
    });
  }

  filterStatus.addEventListener('change', (e) => {
    currentFilters.status = e.target.value;
    currentPage = 1;
    renderTable();
  });
  
  // Sorting Events
  document.querySelectorAll('th[data-sort]').forEach(th => {
    th.addEventListener('click', () => {
      const sortBy = th.getAttribute('data-sort');
      if (currentSort.by === sortBy) {
        currentSort.order = currentSort.order === 'asc' ? 'desc' : 'asc';
      } else {
        currentSort.by = sortBy;
        currentSort.order = 'asc';
      }
      
      // Update UI for sort icons
      document.querySelectorAll('th[data-sort]').forEach(el => {
        el.classList.remove('sort-asc', 'sort-desc');
        el.querySelector('.sort-icon').textContent = '⇅';
      });
      
      th.classList.add(`sort-${currentSort.order}`);
      th.querySelector('.sort-icon').textContent = currentSort.order === 'asc' ? '↑' : '↓';
      
      renderTable();
    });
  });

  // Global functions for inline HTML event handlers
  window.editEmployee = (id) => {
    const index = employees.findIndex(emp => emp.id === id);
    if (index > -1) {
      openModal(employees[index], index);
    }
  };
  
  window.deleteEmployee = (id) => {
    if (confirm('Are you sure you want to delete this employee?')) {
      const emp = employees.find(e => e.id === id);
      if (emp && typeof ActivityLog !== 'undefined') {
        ActivityLog.log(`<strong>${emp.name}</strong> was removed from the system.`);
      }
      employees = employees.filter(emp => emp.id !== id);
      saveData();
      App.showToast('Employee deleted', 'warning');
      
      // Adjust page if necessary
      const processed = getProcessedData();
      if (currentPage > 1 && processed.length === 0) currentPage--;
      
      renderTable();
    }
  };

  // Helper Functions
  function getProcessedData() {
    let result = employees;
    result = Search.searchEmployees(result, currentQuery);
    result = Filter.filterEmployees(result, currentFilters);
    result = Search.sortEmployees(result, currentSort.by, currentSort.order);
    return result;
  }
  
  function renderTable() {
    const processedData = getProcessedData();
    
    // Pagination logic
    const totalPages = Math.ceil(processedData.length / rowsPerPage) || 1;
    if (currentPage > totalPages) currentPage = totalPages;
    
    const start = (currentPage - 1) * rowsPerPage;
    const paginatedData = processedData.slice(start, start + rowsPerPage);
    
    // Render rows
    tableBody.innerHTML = '';
    
    if (paginatedData.length === 0) {
      tableBody.innerHTML = `<tr><td colspan="7" class="text-center">No employees found</td></tr>`;
    } else {
      paginatedData.forEach(emp => {
        const tr = document.createElement('tr');
        
        // Status badge class
        let statusClass = 'info';
        if (emp.status === 'Active') statusClass = 'success';
        if (emp.status === 'On Leave') statusClass = 'warning';
        if (emp.status === 'Resigned') statusClass = 'danger';
        
        tr.innerHTML = `
          <td>
            <div class="employee-cell">
              <div class="employee-avatar">${emp.name.charAt(0).toUpperCase()}</div>
              <div>
                <div style="font-weight: 500;"><a href="employee-details.html?id=${emp.id}" style="color: inherit; text-decoration: none;">${emp.name}</a></div>
                <div style="font-size: 0.75rem; color: var(--text-muted);">${emp.email}</div>
              </div>
            </div>
          </td>
          <td>${emp.id}</td>
          <td>${emp.department}</td>
          <td>${emp.designation}</td>
          <td>${new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(emp.salary)}</td>
          <td><span class="badge badge-${statusClass}">${emp.status}</span></td>
          <td>
            <button class="action-btn" onclick="editEmployee('${emp.id}')" title="Edit">✎</button>
            <button class="action-btn delete" onclick="deleteEmployee('${emp.id}')" title="Delete">🗑</button>
          </td>
        `;
        tableBody.appendChild(tr);
      });
    }
    
    renderPagination(totalPages);
  }
  
  function renderPagination(totalPages) {
    paginationContainer.innerHTML = '';
    
    // Prev Button
    const prevBtn = document.createElement('button');
    prevBtn.className = 'page-btn';
    prevBtn.innerHTML = '❮';
    prevBtn.disabled = currentPage === 1;
    prevBtn.addEventListener('click', () => {
      if (currentPage > 1) { currentPage--; renderTable(); }
    });
    paginationContainer.appendChild(prevBtn);
    
    // Page Numbers
    for (let i = 1; i <= totalPages; i++) {
      const pageBtn = document.createElement('button');
      pageBtn.className = `page-btn ${i === currentPage ? 'active' : ''}`;
      pageBtn.textContent = i;
      pageBtn.addEventListener('click', () => {
        currentPage = i;
        renderTable();
      });
      paginationContainer.appendChild(pageBtn);
    }
    
    // Next Button
    const nextBtn = document.createElement('button');
    nextBtn.className = 'page-btn';
    nextBtn.innerHTML = '❯';
    nextBtn.disabled = currentPage === totalPages;
    nextBtn.addEventListener('click', () => {
      if (currentPage < totalPages) { currentPage++; renderTable(); }
    });
    paginationContainer.appendChild(nextBtn);
  }
  
  function openModal(employee = null, index = '') {
    Validator.clearAllErrors('employee-form');
    empIndexInput.value = index;
    
    if (employee) {
      modalTitle.textContent = 'Edit Employee';
      document.getElementById('emp-id').value = employee.id;
      document.getElementById('emp-id').disabled = true; // Don't allow changing ID
      document.getElementById('emp-name').value = employee.name;
      document.getElementById('emp-email').value = employee.email;
      document.getElementById('emp-phone').value = employee.phone || '';
      document.getElementById('emp-dept').value = employee.department;
      
      populateDesignations(employee.department, document.getElementById('emp-desig'), false);
      document.getElementById('emp-desig').value = employee.designation;
      
      document.getElementById('emp-salary').value = employee.salary;
      document.getElementById('emp-date').value = employee.joiningDate;
      document.getElementById('emp-gender').value = employee.gender || 'Male';
      document.getElementById('emp-status').value = employee.status;
      document.getElementById('emp-address').value = employee.address || '';
    } else {
      modalTitle.textContent = 'Add New Employee';
      form.reset();
      document.getElementById('emp-id').disabled = false;
      
      const defaultDept = document.getElementById('emp-dept').value;
      populateDesignations(defaultDept, document.getElementById('emp-desig'), false);
      
      // Generate a new ID for convenience
      const nextIdNum = employees.length > 0 
        ? Math.max(...employees.map(e => parseInt(e.id.replace('EMP-', '')) || 0)) + 1 
        : 1;
      document.getElementById('emp-id').value = `EMP-${nextIdNum.toString().padStart(3, '0')}`;
    }
    
    modal.classList.add('active');
  }
  
  function closeModal() {
    modal.classList.remove('active');
  }
  
  function validateForm() {
    let isValid = true;
    Validator.clearAllErrors('employee-form');
    
    const id = document.getElementById('emp-id').value;
    const name = document.getElementById('emp-name').value;
    const email = document.getElementById('emp-email').value;
    
    if (!Validator.isNotEmpty(id)) {
      Validator.showError('group-id'); isValid = false;
    } else if (empIndexInput.value === '' && employees.some(e => e.id === id)) {
      App.showToast('Employee ID already exists', 'error');
      Validator.showError('group-id'); isValid = false;
    }
    
    if (!Validator.isNotEmpty(name)) {
      Validator.showError('group-name'); isValid = false;
    }
    
    if (!Validator.isEmail(email)) {
      Validator.showError('group-email'); isValid = false;
    }
    
    return isValid;
  }
  
  function saveData() {
    localStorage.setItem('employees', JSON.stringify(employees));
  }
});
