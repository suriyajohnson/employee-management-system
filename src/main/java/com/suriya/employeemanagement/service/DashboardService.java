package com.suriya.employeemanagement.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.suriya.employeemanagement.dto.DashboardStatistics;
import com.suriya.employeemanagement.repository.EmployeeRepository;

@Service
public class DashboardService {

	@Autowired
	private EmployeeRepository employeerepository;
	
	private long getTotalEmployees() {
		
		return employeerepository.count();
	}
	
	private long getActiveEmployees() {
		
		return employeerepository.countByStatus("ACTIVE");
	}
	
	private long getInactiveEmployees() {
		return employeerepository.countByStatus("INACTIVE");
	}
	
//	private long getDepartmentCount() {
//		return employeerepository.countByDepartment("");
//	}
	
	public DashboardStatistics getDashboardStatistics() {
		
		DashboardStatistics dashboardstatistics  = new DashboardStatistics();
		
		 dashboardstatistics.setTotalEmployee(getTotalEmployees());
		 dashboardstatistics.setActiveEmployee(getActiveEmployees());
		 dashboardstatistics.setInactive(getInactiveEmployees());
	//	 dashboardstatistics.setDepartment(getDepartmentCount());
		 
		 return dashboardstatistics;
	}
}
