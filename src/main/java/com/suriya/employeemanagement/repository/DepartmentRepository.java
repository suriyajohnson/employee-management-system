package com.suriya.employeemanagement.repository;
import org.springframework.data.jpa.repository.JpaRepository;
import com.suriya.employeemanagement.entity.Department;
public interface DepartmentRepository extends JpaRepository<Department, Long> {
    boolean existsByNameIgnoreCaseAndIdNot(String name, Long id);
}
