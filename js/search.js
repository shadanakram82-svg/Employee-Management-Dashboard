// Search Utility
const Search = {
  searchEmployees(employees, query) {
    if (!query) return employees;
    const lowerQuery = query.toLowerCase();
    
    return employees.filter(emp => 
      emp.name.toLowerCase().includes(lowerQuery) ||
      emp.id.toLowerCase().includes(lowerQuery) ||
      emp.email.toLowerCase().includes(lowerQuery) ||
      emp.department.toLowerCase().includes(lowerQuery)
    );
  },

  sortEmployees(employees, sortBy, sortOrder = 'asc') {
    if (!sortBy) return employees;
    
    return [...employees].sort((a, b) => {
      let valA = a[sortBy];
      let valB = b[sortBy];
      
      if (typeof valA === 'string') valA = valA.toLowerCase();
      if (typeof valB === 'string') valB = valB.toLowerCase();
      
      if (valA < valB) return sortOrder === 'asc' ? -1 : 1;
      if (valA > valB) return sortOrder === 'asc' ? 1 : -1;
      return 0;
    });
  }
};
