package com.suriya.employeemanagement.service;
import com.suriya.employeemanagement.repository.AttendanceRepository;
import com.suriya.employeemanagement.repository.DepartmentRepository;
import com.suriya.employeemanagement.repository.EmployeeRepository;
import java.util.List;
import java.util.Optional;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;
import com.suriya.employeemanagement.entity.Employee;
@Service
public class EmployeeService {
    private final EmployeeRepository employees;
    private final DepartmentRepository departments;
    private final AttendanceRepository attendance;
    public EmployeeService(EmployeeRepository employees, DepartmentRepository departments, AttendanceRepository attendance) {
        this.employees = employees; this.departments = departments; this.attendance = attendance;
    }
    public List<Employee> getAllEmployee() { return employees.findAll(); }
    private Employee require(int id) {
        return employees.findById(id).orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Employee not found."));
    }
    private void validate(Employee e) {
        if (e.getName() == null || e.getName().isBlank() || e.getName().length() > 100 || e.getEmployeeCode() == null || e.getEmployeeCode().isBlank() || e.getEmployeeCode().length() > 40)
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Enter a name and employee code within the allowed lengths.");
        if (e.getEmail() == null || e.getEmail().length() > 254 || !e.getEmail().matches("^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$"))
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Enter a valid email address.");
        if (!Double.isFinite(e.getSalary()) || e.getSalary() < 0)
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Salary must be a non-negative number.");
        if (!"ACTIVE".equals(e.getStatus()) && !"INACTIVE".equals(e.getStatus()))
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Choose a valid employee status.");
        if (e.getDateOfJoining() == null || e.getDesignation() == null || e.getDesignation().isBlank() || e.getDesignation().length() > 100 || (e.getMobile() != null && e.getMobile().length() > 30))
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Enter a joining date and valid job details.");
        e.setName(e.getName().trim()); e.setEmployeeCode(e.getEmployeeCode().trim()); e.setEmail(e.getEmail().trim());
        if (employees.existsByEmployeeCodeIgnoreCaseAndIdNot(e.getEmployeeCode(), e.getId()) || employees.existsByEmailIgnoreCaseAndIdNot(e.getEmail(), e.getId()))
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Employee code or email already exists.");
        if (e.getDepartmentId() != null && !departments.existsById(e.getDepartmentId()))
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Selected department no longer exists.");
    }
    public String addEmployee(Employee e) {
        e.setId(0); if (e.getStatus() == null) e.setStatus("ACTIVE");
        validate(e); employees.save(e); return "Employee added successfully.";
    }
    public String updateEmployee(Employee e) {
        Employee existing = require(e.getId()); if (e.getStatus() == null) e.setStatus(existing.getStatus());
        validate(e); employees.save(e); return "Employee updated successfully.";
    }
    public String updateSalary(int id, double salary) {
        if (!Double.isFinite(salary) || salary < 0) throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Salary must be non-negative.");
        Employee e = require(id); e.setSalary(salary); employees.save(e); return "Salary updated successfully.";
    }
    @Transactional
    public String deleteEmployee(int id) {
        require(id); attendance.deleteByEmployeeId(id); employees.deleteById(id); return "Employee deleted successfully.";
    }
    public Optional<Employee> getEmployeeById(int id) { return Optional.of(require(id)); }
    public ResponseEntity<Object> getEmployeeByName(String name) {
        Employee e = employees.findByName(name); return e == null ? ResponseEntity.notFound().build() : ResponseEntity.ok(e);
    }
}
