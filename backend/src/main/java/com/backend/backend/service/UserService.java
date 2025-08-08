package com.backend.backend.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.Authentication;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.web.bind.annotation.RequestBody;

import com.backend.backend.model.Users;
import com.backend.backend.repository.UserRepository;

import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletResponse;

@Service
public class UserService {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private AuthenticationManager authenticationManager;

    @Autowired
    private JwtService jwtService;

    @Autowired
    private PasswordEncoder passwordEncoder;

    public ResponseEntity<String> registerUser(@RequestBody Users user) {
        try {
            user.setPassword(passwordEncoder.encode(user.getPassword()));
            userRepository.save(user);
            return ResponseEntity.status(HttpStatus.CREATED).body("User Registered Successfully");
        } catch (Exception e){
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("User Registration Failed");
        }
    }

    public ResponseEntity<String> loginUser(@RequestBody Users user, HttpServletResponse response) {
        try {
            Authentication authentication = authenticationManager
                    .authenticate(new UsernamePasswordAuthenticationToken(user.getUsername(), user.getPassword()));

            if (authentication.isAuthenticated()) {
                String jwtToken = jwtService.generateToken(user.getRole());
                Cookie jwtCookie = new Cookie("KAIRO", jwtToken);
                jwtCookie.setHttpOnly(true);
                jwtCookie.setPath("/");
                response.addCookie(jwtCookie);
                return ResponseEntity.status(HttpStatus.OK).body("Login Successful");
            }
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Login Failed");
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Login Failed");
        }
    }

    public String logout() {
        try {
            Cookie jwtCookie = new Cookie("KAIRO", null);
            jwtCookie.setHttpOnly(true);
            jwtCookie.setPath("/");
            jwtCookie.setMaxAge(0);
            return "Logout Successful";
        } catch (Exception e) {
            e.printStackTrace();
            return "Logout Failed";
        }
    }

    public ResponseEntity<String> verifyUser(@RequestBody Long userId) {
        try {
            Users user = userRepository.getUserById(userId);
            user.setVerified(true);
            userRepository.save(user);
            return ResponseEntity.status(HttpStatus.OK).body("User Verified Successfully");
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("User Verification Failed");
        }
    }

   
}
