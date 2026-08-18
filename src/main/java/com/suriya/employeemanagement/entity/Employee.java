package com.suriya.employeemanagement.entity;

import jakarta.persistence.Entity;
import jakarta.persistence.Id;

@Entity
public class Employee {

	@Id
	private int id;
	private String name;
	private double salary;
	
	public Employee() {
		// TODO Auto-generated constructor stub
	}
	
	public Employee(int id,String name,double salary) {
		
		this.id = id;
		this.name = name;
		this.salary = salary;
	}
	
	public int getId() {
		
		return id;
	}
	
	public void setId(int id) {
		this.id = id;
	}
	
	public String getName() {
		return name;
	}
	
	public void setName(String name) {
		this.name = name;
	}
	
	public double getSalary() {
		return salary;
	}
	
	public void setSalary(double salary) {
		this.salary = salary;
	}
	
}
