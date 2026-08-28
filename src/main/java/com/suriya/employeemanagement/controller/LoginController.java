package com.suriya.employeemanagement.controller;

import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RestController;

import com.suriya.employeemanagement.dto.LoginRequest;
import com.suriya.employeemanagement.entity.User;
import com.suriya.employeemanagement.service.LoginService;

@RestController
public class LoginController {

	@Autowired
	private LoginService loginservice ;
	
//	@PostMapping("/login")
//	public String login(@RequestBody User user) {
//		
//		return loginservice.userLogin(user);
//	}
	
//	@PostMapping("/login")
//	public String login(@RequestBody String body) {
//
//	    System.out.println("========== REQUEST ==========");
//	    System.out.println(body);
//
//	    return "Request Received";
//	}
	
//	@PostMapping("/login")
//	public String login(@RequestBody Map<String, Object> body) {
//
//	    System.out.println(body);
//
//	    return "Success";
//	}
	
//	@PostMapping("/login")
//	public String login(@RequestBody User user) {
//
//	    System.out.println("Username : " + user.getUsername());
//	    System.out.println("Password : " + user.getPassword());
//	    System.out.println("Id : " + user.getId());
//
//	    return "Reached";
//	}
	
//	@PostMapping("/login")
//	public String login(@RequestBody User user) {
//
//	    System.out.println("Controller Reached");
//
//	    return "OK";
//	}
	
//	@PostMapping("/login")
//	public String login(@RequestBody LoginRequest request) {
//
//	    System.out.println(request.getUsername());
//	    System.out.println(request.getPassword());
//
//	    return "OK";
//	}
	
	
	@PostMapping("/login")
	public String login(@RequestBody LoginRequest request) {

	    return loginservice.userLogin(request);

	}
}
