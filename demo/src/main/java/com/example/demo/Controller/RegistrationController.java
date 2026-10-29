package com.example.demo.Controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RestController;

import com.example.demo.Model.MyAppUser;
import com.example.demo.Model.MyAppUserRepository;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.http.ResponseEntity;
import org.springframework.http.HttpStatus;
import com.example.demo.Service.EmailService;
import com.example.demo.Utils.JwtTokenUtil;

@RestController 
public class RegistrationController {
    
    @Autowired
    private MyAppUserRepository myAppUserRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private EmailService emailService;
    
    @PostMapping(value="/req/signup", consumes="application/json")
    public ResponseEntity<String> createUser(@RequestBody MyAppUser user){
        MyAppUser existingAppUser = myAppUserRepository.findByEmail(user.getEmail());

        if (existingAppUser != null) {
            if (existingAppUser.isVerified()) {
                return new ResponseEntity<>("An account with this email already exists.", HttpStatus.BAD_REQUEST);
            } else {
                String verificationToken = JwtTokenUtil.generateToken(user.getEmail());
                existingAppUser.setVerificationToken(verificationToken);
                myAppUserRepository.save(existingAppUser);
                // Send verification email
                emailService.sendVerificationEmail(existingAppUser.getEmail(), verificationToken);
                return new ResponseEntity<>("Verification email resent. Check your inbox",HttpStatus.OK);
            }
        }
        user.setPassword(passwordEncoder.encode(user.getPassword()));
        String verificationToken = JwtTokenUtil.generateToken(user.getEmail());
        user.setVerificationToken(verificationToken);
        myAppUserRepository.save(user);
        // Send verification email
        emailService.sendVerificationEmail(user.getEmail(), verificationToken);
        return new ResponseEntity<>("Registration successful. Check your email for verification.",HttpStatus.OK);

    }

}
