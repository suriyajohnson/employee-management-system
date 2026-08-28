package com.suriya.employeemanagement.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.suriya.employeemanagement.dto.DashboardStatistics;
import com.suriya.employeemanagement.service.DashboardService;

@RestController
@RequestMapping("/dashboard")
public class DashboardController {

	@Autowired
	private DashboardService dashboardService;
	
	@GetMapping("/statistics")
	public DashboardStatistics getDashboardStatistics() {
		
		return dashboardService.getDashboardStatistics();
	}
}
