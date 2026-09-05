package com.suriya.employeemanagement.controller;
import jakarta.servlet.http.*;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.HandlerInterceptor;
import org.springframework.web.servlet.config.annotation.*;
@Configuration
public class AdminAccessConfig implements WebMvcConfigurer {
    @Override
    public void addInterceptors(InterceptorRegistry registry) {
        registry.addInterceptor(new HandlerInterceptor() {
            @Override
            public boolean preHandle(HttpServletRequest request, HttpServletResponse response, Object handler) throws Exception {
                response.setHeader("Cache-Control", "no-store");
                HttpSession session = request.getSession(false);
                Object role = session == null ? null : session.getAttribute("role");
                if ("ADMIN".equals(role)) return true;
                if (request.getRequestURI().endsWith(".html")) {
                    response.sendRedirect(request.getContextPath() + "/index.html");
                } else {
                    response.setStatus(role == null ? 401 : 403);
                    response.setContentType("application/json");
                    response.getWriter().write("{\"message\":\"Please sign in with an administrator account.\"}");
                }
                return false;
            }
        }).addPathPatterns("/api/admin/**", "/dashboard/**", "/allemployee", "/employee", "/employee/**", "/delete/**", "/salaryUpdate/**", "/admin-dashboard.html");
    }
}
