package com.suriya.employeemanagement.controller;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpSession;
import org.springframework.web.bind.annotation.*;
import com.suriya.employeemanagement.dto.LoginRequest;
import com.suriya.employeemanagement.service.LoginService;
@RestController
public class LoginController {
    private final LoginService loginService;
    public LoginController(LoginService loginService) { this.loginService = loginService; }
    @PostMapping("/login")
    public String login(@RequestBody LoginRequest request, HttpServletRequest http) {
        HttpSession old = http.getSession(false);
        if (old != null) old.invalidate();
        String role = loginService.userLogin(request);
        if ("ADMIN".equals(role) || "EMPLOYEE".equals(role)) {
            HttpSession session = http.getSession(true);
            session.setAttribute("role", role);
            session.setAttribute("username", request.getUsername());
            session.setMaxInactiveInterval(1800);
        }
        return role;
    }
    @PostMapping("/logout")
    public void logout(HttpServletRequest request) {
        HttpSession session = request.getSession(false);
        if (session != null) session.invalidate();
    }
}
