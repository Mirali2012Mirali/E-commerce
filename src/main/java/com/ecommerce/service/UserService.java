package com.ecommerce.service;

import com.ecommerce.dto.LoginRequest;
import com.ecommerce.dto.RegisterForm;
import com.ecommerce.entity.User;
import com.ecommerce.repository.UserRepository;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
public class UserService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    public UserService(UserRepository userRepository,
                       PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
    }

    public User login(LoginRequest request) {

        if (request.getUsername() == null || request.getUsername().isBlank()) {
            throw new RuntimeException("Username is required.");
        }

        if (request.getPassword() == null || request.getPassword().isBlank()) {
            throw new RuntimeException("Password is required.");
        }

        User user = userRepository.findByUsername(request.getUsername())
                .orElseThrow(() -> new RuntimeException("User not found."));

        if (!passwordEncoder.matches(request.getPassword(), user.getPassword())) {
            throw new RuntimeException("Wrong password.");
        }

        return user;
    }

    public User register(RegisterForm form) {

        if (form.getUsername() == null || form.getUsername().isBlank()) {
            throw new RuntimeException("Username is required.");
        }

        if (form.getEmail() == null || form.getEmail().isBlank()) {
            throw new RuntimeException("Email is required.");
        }

        if (!form.getEmail().contains("@")) {
            throw new RuntimeException("Invalid email.");
        }

        if (form.getPassword() == null || form.getPassword().isBlank()) {
            throw new RuntimeException("Password is required.");
        }

        if (userRepository.findByEmail(form.getEmail()).isPresent()) {
            throw new RuntimeException("Email already exists.");
        }


        User user = new User();

        user.setName(form.getName());
        user.setSurname(form.getSurname());
        user.setUsername(form.getUsername());
        user.setEmail(form.getEmail());
        user.setPassword(passwordEncoder.encode(form.getPassword()));;

        return userRepository.save(user);
    }
}