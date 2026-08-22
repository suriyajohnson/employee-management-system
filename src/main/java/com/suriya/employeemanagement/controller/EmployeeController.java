package com.suriya.employeemanagement.controller;

import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RestController;

import com.suriya.employeemanagement.entity.Employee;
import com.suriya.employeemanagement.service.EmployeeService;

@CrossOrigin("*")
@RestController
public class EmployeeController {

	@Autowired
	private EmployeeService employeeService;
	
	public EmployeeController() {
		System.out.println("Employee Controller Object Created");
	}
	
	
	@GetMapping("/allemployee")
	public List<Employee> getAllEmployee() {
		
		return employeeService.getAllEmployee();
	}		
	
	
	@PutMapping("/salaryUpdate/{id}/{salary}")
	public String updateSalary(@PathVariable  int id,@PathVariable double salary) {
		
		return employeeService.updateSalary(id, salary);
	}
	
	@DeleteMapping("/delete/{id}")
	public String deleteEMployee(@PathVariable int id) {
	
		return employeeService.deleteEmployee(id);
	}
	

	@PostMapping("/employee")
	public String addEmployee(@RequestBody Employee employee) {
		
		return employeeService.addEmployee(employee);
		
	}
	
	@GetMapping("/employee/{id}")
	public Optional<Employee> getEmployeeById(@PathVariable int id) {
		
		return employeeService.getEmployeeById(id);
	}
	
	@GetMapping("/employee/name/{name}")
	public ResponseEntity<Object> getEmployeeByName(@PathVariable String name) {
		
		return employeeService.getEmployeeByName(name);
	}
	
	@PutMapping("/employee")
	public String updateEmployee(@RequestBody Employee employee) {
		
		return employeeService.updateEmployee(employee);
	}
	
}
