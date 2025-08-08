package com.backend.backend.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.backend.backend.model.Users;
import com.backend.backend.service.UserService;

import jakarta.servlet.http.HttpServletResponse;
import org.springframework.web.bind.annotation.GetMapping;



@RestController
@RequestMapping("/users")
public class UserController {

    @Autowired
    private UserService userService;

    @PostMapping("/register")
    public ResponseEntity<String> registerUser(@RequestBody Users user) {
        return userService.registerUser(user);
    }

    @PostMapping("/login")
    public ResponseEntity<String> loginUser(@RequestBody Users user, HttpServletResponse response) {
        return userService.loginUser(user, response);
    }

    @GetMapping("/logout")
    public String logout() {
        return userService.logout();
    }

    @PostMapping("/verify-user")
    public ResponseEntity<String> verifyUser(@RequestBody Users user) {
        return userService.verifyUser(user.getId());
    }

}
