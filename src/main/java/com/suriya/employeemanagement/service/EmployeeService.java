package com.suriya.employeemanagement.service;

import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;

import com.suriya.employeemanagement.entity.Employee;
import com.suriya.employeemanagement.repository.EmployeeRepository;

@Service
public class EmployeeService {

	@Autowired
	private EmployeeRepository employeeRepository;
	
//	ArrayList<Employee> list = new ArrayList<Employee>();
	
//	public EmployeeService() {
//		
//		list.add(new Employee(101, "Suriya", 40000));
//		list.add(new Employee(102,"Sathya", 50000));
//		list.add(new Employee(103,"Karpagam",60000));
//		
//	}
	
	public List<Employee> getAllEmployee() {
		
		return employeeRepository.findAll();
	}
	
//	public String updateSalary(int id,double salary) {
//		
//		for(Employee e:list) {
//			if(e.getId()==id) {
//				System.out.println(e.getName()+"Previous Salary"+e.getSalary());
//				e.setSalary(salary);
//				System.out.println(e.getName()+"Updated Salary"+e.getSalary());
//				return "Salary Updated Sucessfully";
//			}
//		}
//		return "Employee Not Found";
//	}
	
	public String updateSalary(int id, double salary) {

	    Optional<Employee> optionalEmployee = employeeRepository.findById(id);

	    if(optionalEmployee.isPresent()) {

	        Employee employee = optionalEmployee.get();

	        employee.setSalary(salary);

	        employeeRepository.save(employee);

	        return "Salary Updated Successfully";
	    }

	    return "Employee Not Found";
	}
	
//	public String addEmployee(Employee employee) {
//		
//		for(Employee e:list) {
//			if(e.getId()== employee.getId()) {
//				
//				return "Employee ID Alredy Present";
//			}
//		}
//		list.add(employee);
//		
//		return "Employee Added SucessFully";
//	}
	
	public String addEmployee(Employee employee) {

	    employee.setStatus("ACTIVE");

	    employeeRepository.save(employee);

	    return "Employee Added Successfully";
	}
	
//	public String deleteEmployee(int id) {
//		for(int i=0;i<list.size();i++) {
//			
//			if(list.get(i).getId()==id) {
//				
//				list.remove(i);
//				return "Employee Deleted Sucessfully";
//			}
//		}
//		return "Employee Not Found";
//	}
	
	public String deleteEmployee(int id) {
		if(employeeRepository.findById(id).isPresent()) {
			employeeRepository.deleteById(id);
			return "Employee Deleted Sucessfully";
		}
		return "Employee Not Found";
	}
	
	public Optional<Employee> getEmployeeById(int id) {
		return employeeRepository.findById(id);
	}
	
    public ResponseEntity<Object> getEmployeeByName(String name) {
    	
    	Employee emp = employeeRepository.findByName(name);
    
    	if(emp != null){
    		 return ResponseEntity.ok(emp);
    	}
    	    
    	  return ResponseEntity.notFound().build();
    }
    
    public String updateEmployee(Employee employee) {
    	 employeeRepository.save(employee);
    	return "Employee Updated Sucessfully";
    	
    }
    
}
