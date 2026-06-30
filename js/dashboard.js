document.addEventListener('DOMContentLoaded', () => {
  // Load User Data
  const userData = JSON.parse(localStorage.getItem('currentUser'));
  if (userData) {
    const userNameEl = document.getElementById('user-name');
    const userAvatarEl = document.getElementById('user-avatar');
    if (userNameEl) userNameEl.textContent = userData.role || 'Admin';
    if (userAvatarEl) userAvatarEl.textContent = (userData.email || 'A').charAt(0).toUpperCase();
  }

  // Load Employee Data
  const employees = JSON.parse(localStorage.getItem('employees')) || [];
  
  updateDashboardStats(employees);
  renderCharts(employees);
  initDragAndDrop();
  renderRecentActivity();

  // Redraw charts on window resize or theme change
  window.addEventListener('resize', () => renderCharts(employees));
  window.addEventListener('themeChanged', () => renderCharts(employees));
});

function updateDashboardStats(employees) {
  const totalEmployees = employees.length;
  const activeEmployees = employees.filter(emp => emp.status === 'Active').length;
  
  // Calculate unique departments
  const departments = new Set();
  let totalSalary = 0;
  let maxSalary = 0;
  let minSalary = Infinity;
  let newEmployees = 0;

  const currentMonth = new Date().getMonth();
  const currentYear = new Date().getFullYear();
  
  employees.forEach(emp => {
    departments.add(emp.department);
    totalSalary += emp.salary;
    
    if (emp.salary > maxSalary) maxSalary = emp.salary;
    if (emp.salary < minSalary) minSalary = emp.salary;

    const joinDate = new Date(emp.joiningDate);
    if (joinDate.getMonth() === currentMonth && joinDate.getFullYear() === currentYear) {
      newEmployees++;
    }
  });

  if (minSalary === Infinity) minSalary = 0;
  
  const avgSalary = totalEmployees > 0 ? Math.round(totalSalary / totalEmployees) : 0;
  
  // Format salary
  const formatter = new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0
  });

  // Animate numbers
  animateValue('stat-total', 0, totalEmployees, 1000);
  animateValue('stat-active', 0, activeEmployees, 1000);
  animateValue('stat-depts', 0, departments.size, 1000);
  animateValue('stat-new', 0, newEmployees, 1000);
  
  const salaryEl = document.getElementById('stat-salary');
  if (salaryEl) salaryEl.textContent = formatter.format(avgSalary);

  const highSalaryEl = document.getElementById('stat-high');
  if (highSalaryEl) highSalaryEl.textContent = formatter.format(maxSalary);

  const lowSalaryEl = document.getElementById('stat-low');
  if (lowSalaryEl) lowSalaryEl.textContent = formatter.format(minSalary);
}

function animateValue(id, start, end, duration) {
  const obj = document.getElementById(id);
  if (!obj) return;
  
  let startTimestamp = null;
  const step = (timestamp) => {
    if (!startTimestamp) startTimestamp = timestamp;
    const progress = Math.min((timestamp - startTimestamp) / duration, 1);
    obj.innerHTML = Math.floor(progress * (end - start) + start);
    if (progress < 1) {
      window.requestAnimationFrame(step);
    }
  };
  window.requestAnimationFrame(step);
}

function renderCharts(employees) {
  if (employees.length === 0) return;

  // Department Data for Pie Chart
  const deptCounts = {};
  employees.forEach(emp => {
    deptCounts[emp.department] = (deptCounts[emp.department] || 0) + 1;
  });
  
  const deptLabels = Object.keys(deptCounts);
  const deptData = Object.values(deptCounts);
  
  const colors = [
    '#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#0ea5e9'
  ];
  
  SimpleChart.drawPieChart('deptChart', deptData, deptLabels, colors);

  // Salary Data for Bar Chart
  const deptSalary = {};
  const deptCount = {};
  
  employees.forEach(emp => {
    deptSalary[emp.department] = (deptSalary[emp.department] || 0) + emp.salary;
    deptCount[emp.department] = (deptCount[emp.department] || 0) + 1;
  });
  
  const salaryLabels = Object.keys(deptSalary);
  const salaryData = salaryLabels.map(dept => deptSalary[dept] / deptCount[dept]); // Avg salary per dept
  
  const barColors = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#0ea5e9'];
  SimpleChart.drawBarChart('salaryChart', salaryData, salaryLabels, {}, barColors);

  // Employee Status for Pie Chart
  const statusCounts = {};
  employees.forEach(emp => {
    statusCounts[emp.status] = (statusCounts[emp.status] || 0) + 1;
  });

  const statusLabels = Object.keys(statusCounts);
  const statusData = Object.values(statusCounts);
  const statusColors = ['#10b981', '#f59e0b', '#ef4444'];

  SimpleChart.drawPieChart('empStatusChart', statusData, statusLabels, statusColors);

  // Monthly Hiring for Bar Chart
  const monthCounts = {};
  const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  
  employees.forEach(emp => {
    const d = new Date(emp.joiningDate);
    const m = monthNames[d.getMonth()];
    monthCounts[m] = (monthCounts[m] || 0) + 1;
  });

  // Ensure order of months
  const hiringLabels = monthNames.filter(m => monthCounts[m] !== undefined);
  const hiringData = hiringLabels.map(m => monthCounts[m]);

  const hiringColors = ['#0ea5e9', '#6366f1', '#a855f7', '#ec4899', '#f43f5e', '#f97316'];
  SimpleChart.drawBarChart('hiringChart', hiringData, hiringLabels, {}, hiringColors);
}

// Drag & Drop Functionality for Dashboard Layout
function initDragAndDrop() {
  const dropZones = document.querySelectorAll('.drop-zone');
  let draggedItem = null;

  // Restore saved layout
  restoreLayout('dashboard-stats');
  restoreLayout('dashboard-charts');

  document.querySelectorAll('.drop-zone > div[draggable="true"]').forEach(item => {
    item.addEventListener('dragstart', (e) => {
      draggedItem = item;
      setTimeout(() => {
        item.style.opacity = '0.5';
      }, 0);
    });

    item.addEventListener('dragend', () => {
      setTimeout(() => {
        draggedItem.style.opacity = '1';
        draggedItem = null;
        
        // Save layout state after drop
        saveLayout('dashboard-stats');
        saveLayout('dashboard-charts');
        
        // Redraw charts if a chart was moved (canvas might need it)
        const employees = JSON.parse(localStorage.getItem('employees')) || [];
        renderCharts(employees);
      }, 0);
    });
  });

  dropZones.forEach(zone => {
    zone.addEventListener('dragover', (e) => {
      e.preventDefault(); // Necessary to allow dropping
      const afterElement = getDragAfterElement(zone, e.clientY, e.clientX);
      const draggable = document.querySelector('[draggable="true"][style*="opacity: 0.5"]');
      
      if (draggable) {
        // Ensure we only drag within the same parent zone
        if (zone.contains(draggable) || draggable.parentElement === zone) {
            if (afterElement == null) {
                zone.appendChild(draggable);
            } else {
                zone.insertBefore(draggable, afterElement);
            }
        }
      }
    });
  });
}

function getDragAfterElement(container, y, x) {
  const draggableElements = [...container.querySelectorAll('[draggable="true"]:not([style*="opacity: 0.5"])')];

  return draggableElements.reduce((closest, child) => {
    const box = child.getBoundingClientRect();
    // Support grid layouts by checking both x and y distances
    const distanceY = y - box.top - box.height / 2;
    const distanceX = x - box.left - box.width / 2;
    const distance = Math.sqrt(distanceY * distanceY + distanceX * distanceX);

    // Simplistic heuristic for a grid: if we are generally above and to the left of the center
    if (distanceY < 0 && distanceX < 0 && distance > closest.distance) {
      return { offset: distance, element: child, distance: distance };
    } else {
      return closest;
    }
  }, { offset: Number.NEGATIVE_INFINITY, distance: Number.NEGATIVE_INFINITY }).element;
}

function saveLayout(zoneId) {
  const zone = document.getElementById(zoneId);
  if (!zone) return;
  const childrenIds = Array.from(zone.children).map(child => child.id).filter(id => id);
  localStorage.setItem(`layout-${zoneId}`, JSON.stringify(childrenIds));
}

function restoreLayout(zoneId) {
  const zone = document.getElementById(zoneId);
  if (!zone) return;
  const savedIds = JSON.parse(localStorage.getItem(`layout-${zoneId}`));
  
  if (savedIds && savedIds.length > 0) {
    const currentChildren = Array.from(zone.children);
    
    // Sort based on saved array index
    currentChildren.sort((a, b) => {
      const idxA = savedIds.indexOf(a.id);
      const idxB = savedIds.indexOf(b.id);
      // If not found in saved layout, put at the end
      if (idxA === -1) return 1;
      if (idxB === -1) return -1;
      return idxA - idxB;
    });

    // Re-append in correct order
    currentChildren.forEach(child => zone.appendChild(child));
  }
}

function renderRecentActivity() {
  const listEl = document.getElementById('recent-activity-list');
  if (!listEl) return;
  
  const activities = typeof ActivityLog !== 'undefined' ? ActivityLog.get() : [];
  listEl.innerHTML = '';
  
  if (activities.length === 0) {
    listEl.innerHTML = '<li class="activity-item"><div class="activity-content"><p style="color: var(--text-muted)">No recent activity to display.</p></div></li>';
    return;
  }
  
  // Show top 5 recent activities
  activities.slice(0, 5).forEach(act => {
    const li = document.createElement('li');
    li.className = 'activity-item';
    
    let timeText = '';
    if (typeof ActivityLog !== 'undefined') {
      timeText = ActivityLog.formatTime(act.time);
    }
    
    li.innerHTML = `
      <span class="activity-time">${timeText}</span>
      <div class="activity-content">
        <p>${act.message}</p>
      </div>
    `;
    listEl.appendChild(li);
  });
}
