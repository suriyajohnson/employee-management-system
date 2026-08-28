package com.suriya.employeemanagement.service;

import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.suriya.employeemanagement.dto.LoginRequest;
import com.suriya.employeemanagement.entity.User;
import com.suriya.employeemanagement.repository.UserRepository;

@Service
public class LoginService {

    @Autowired
    private UserRepository userRepository;

    public String userLogin(LoginRequest request) {

        Optional<User> dbUser = userRepository.findByUsername(request.getUsername());

        if (dbUser.isPresent()) {

            User userFromDB = dbUser.get();

            if (request.getPassword().equals(userFromDB.getPassword())) {

                if (userFromDB.isActive()) {

                    return userFromDB.getRole();

                } else {

                    return "Account Disabled";

                }

            } else {

                return "Invalid Password";

            }

        } else {

            return "Invalid Username";

        }

    }
}