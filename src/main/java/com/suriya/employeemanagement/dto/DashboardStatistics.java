package com.suriya.employeemanagement.dto;

public class DashboardStatistics {

	private long TotalEmployee;
	private long ActiveEmployee;
	private long Inactive;
	private long Department;
	public long getTotalEmployee() {
		return TotalEmployee;
	}
	public long getActiveEmployee() {
		return ActiveEmployee;
	}
	public long getInactive() {
		return Inactive;
	}
//	public long getDepartment() {
//		return Department;
//	}
	public void setTotalEmployee(long totalEmployee) {
		TotalEmployee = totalEmployee;
	}
	public void setActiveEmployee(long activeEmployee) {
		ActiveEmployee = activeEmployee;
	}
	public void setInactive(long inactive) {
		Inactive = inactive;
	}
//	public void setDepartment(long department) {
//		Department = department;
//	}
	
}
