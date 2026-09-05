package com.suriya.employeemanagement.controller;
import com.suriya.employeemanagement.entity.Attendance;
import com.suriya.employeemanagement.entity.Department;
import com.suriya.employeemanagement.repository.AttendanceRepository;
import com.suriya.employeemanagement.repository.DepartmentRepository;
import com.suriya.employeemanagement.repository.EmployeeRepository;

import java.time.LocalDate;
import java.util.List;
import java.util.Set;
import org.springframework.http.HttpStatus;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

@RestController @RequestMapping("/api/admin")
public class AdminModulesController {
    private final DepartmentRepository departments;
    private final AttendanceRepository attendance;
    private final EmployeeRepository employees;
    public AdminModulesController(DepartmentRepository departments, AttendanceRepository attendance, EmployeeRepository employees) {
        this.departments = departments; this.attendance = attendance; this.employees = employees;
    }
    @GetMapping("/departments")
    public List<Department> departments() { return departments.findAll(); }
    @PostMapping("/departments")
    public Department saveDepartment(@RequestBody Department department) {
        if (department.getName() == null || department.getName().isBlank() || department.getName().length() > 100)
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Enter a department name of 1-100 characters.");
        if (department.getId() != null && !departments.existsById(department.getId()))
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Department not found.");
        department.setName(department.getName().trim());
        if (departments.existsByNameIgnoreCaseAndIdNot(department.getName(), department.getId() == null ? -1L : department.getId()))
            throw new ResponseStatusException(HttpStatus.CONFLICT, "A department with this name already exists.");
        if ((department.getManager() != null && department.getManager().length() > 100) || (department.getDescription() != null && department.getDescription().length() > 1000))
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Department details are too long.");
        return departments.save(department);
    }
    @DeleteMapping("/departments/{id}")
    public void deleteDepartment(@PathVariable Long id) {
        if (employees.existsByDepartmentId(id))
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Reassign this department's employees before deleting it.");
        if (!departments.existsById(id)) throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Department not found.");
        departments.deleteById(id);
    }
    @GetMapping("/attendance")
    public List<Attendance> attendance(@RequestParam LocalDate date) { return attendance.findByWorkDate(date); }
    public record AttendanceEntry(Integer employeeId, String status) {}
    public record AttendanceRequest(LocalDate date, List<AttendanceEntry> entries) {}
    @PostMapping("/attendance") @Transactional
    public void saveAttendance(@RequestBody AttendanceRequest request) {
        if (request.date() == null || request.date().isAfter(LocalDate.now()) || request.entries() == null || request.entries().size() > 10000)
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Choose today or an earlier date and valid attendance entries.");
        for (AttendanceEntry entry : request.entries()) {
            if (entry == null || entry.employeeId() == null || entry.status() == null || !Set.of("PRESENT", "ABSENT", "LEAVE", "REMOTE").contains(entry.status()) || !employees.existsById(entry.employeeId()))
                throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Invalid employee or attendance status.");
            Attendance row = attendance.findByEmployeeIdAndWorkDate(entry.employeeId(), request.date()).orElseGet(Attendance::new);
            row.setEmployeeId(entry.employeeId()); row.setWorkDate(request.date()); row.setStatus(entry.status()); attendance.save(row);
        }
    }
}
