package com.example.demo.Controller;

import org.springframework.web.bind.annotation.RestController;
import com.example.demo.Model.MyAppUserRepository;
import com.example.demo.Utils.JwtTokenUtil;
import io.jsonwebtoken.JwtException;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.http.ResponseEntity;
import org.springframework.http.HttpStatus;
import com.example.demo.Model.MyAppUser;

@RestController
public class VerificationController {
    private final MyAppUserRepository myAppUserRepository;
    private final JwtTokenUtil jwtUtil;

    public VerificationController(MyAppUserRepository myAppUserRepository, JwtTokenUtil jwtUtil) {
        this.myAppUserRepository = myAppUserRepository;
        this.jwtUtil = jwtUtil;
    }

    @GetMapping("/req/signup/verify")
    public ResponseEntity<String> verifyUser(@RequestParam("token") String token){
        try {
            String email = jwtUtil.extractEmail(token);
            MyAppUser user = myAppUserRepository.findByEmail(email);
            if (user == null || user.getVerificationToken() == null
                    || !jwtUtil.validateToken(token)
                    || !user.getVerificationToken().equals(token)){
                return ResponseEntity.status(HttpStatus.FORBIDDEN).body("Token expired.");
            }

            user.setVerificationToken(null);
            user.setVerified(true);
            myAppUserRepository.save(user);
            return ResponseEntity.status(HttpStatus.CREATED).body("User verified successfully.");
        } catch (JwtException | IllegalArgumentException exception) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body("Token expired.");
        }
    }
}
