// Filter Utility
const Filter = {
  filterEmployees(employees, filters) {
    return employees.filter(emp => {
      let isMatch = true;
      
      if (filters.department && emp.department !== filters.department) {
        isMatch = false;
      }
      
      if (filters.designation && emp.designation !== filters.designation) {
        isMatch = false;
      }
      
      if (filters.status && emp.status !== filters.status) {
        isMatch = false;
      }
      
      return isMatch;
    });
  }
};
