package com.suriya.employeemanagement.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.suriya.employeemanagement.entity.Employee;

@Repository
public interface EmployeeRepository extends JpaRepository<Employee,Integer> {
	
	Employee findByName(String name);
	
	long countByStatus(String status);
    boolean existsByDepartmentId(Long departmentId);
    boolean existsByEmployeeCodeIgnoreCaseAndIdNot(String code, int id);
    boolean existsByEmailIgnoreCaseAndIdNot(String email, int id);
	
	//long countByDepartment(String department);

}