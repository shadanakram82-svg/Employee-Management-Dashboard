// CSV Export Utility
const CSVExport = {
  exportEmployees() {
    const employees = JSON.parse(localStorage.getItem('employees')) || [];
    
    if (employees.length === 0) {
      App.showToast('No data to export', 'warning');
      return;
    }
    
    // Define headers
    const headers = [
      'Employee ID', 'Name', 'Email', 'Phone', 'Department', 
      'Designation', 'Salary', 'Joining Date', 'Gender', 'Status', 'Address'
    ];
    
    // Format data rows
    const rows = employees.map(emp => [
      emp.id,
      `"${emp.name}"`, // Quote strings that might contain commas
      emp.email,
      emp.phone,
      emp.department,
      emp.designation,
      emp.salary,
      emp.joiningDate,
      emp.gender,
      emp.status,
      `"${emp.address ? emp.address.replace(/"/g, '""') : ''}"` // Escape quotes in address
    ]);
    
    // Combine headers and rows
    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.join(','))
    ].join('\n');
    
    // Create Blob and download link
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    
    const date = new Date().toISOString().split('T')[0];
    
    link.setAttribute('href', url);
    link.setAttribute('download', `employees_export_${date}.csv`);
    link.style.visibility = 'hidden';
    
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    App.showToast('Data exported successfully', 'success');
  }
};
