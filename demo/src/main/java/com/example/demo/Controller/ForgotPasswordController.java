package com.example.demo.Controller;

import com.example.demo.Model.MyAppUser;
import com.example.demo.Model.MyAppUserRepository;
import com.example.demo.Service.EmailService;
import com.example.demo.Utils.JwtTokenUtil;
import io.jsonwebtoken.JwtException;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RestController;

@RestController
public class ForgotPasswordController {
    private static final Logger logger = LoggerFactory.getLogger(ForgotPasswordController.class);

    private final MyAppUserRepository myAppUserRepository;
    private final PasswordEncoder passwordEncoder;
    private final EmailService emailService;
    private final JwtTokenUtil jwtTokenUtil;

    public ForgotPasswordController(MyAppUserRepository myAppUserRepository,
                                    PasswordEncoder passwordEncoder,
                                    EmailService emailService,
                                    JwtTokenUtil jwtTokenUtil) {
        this.myAppUserRepository = myAppUserRepository;
        this.passwordEncoder = passwordEncoder;
        this.emailService = emailService;
        this.jwtTokenUtil = jwtTokenUtil;
    }

    @PostMapping(value = "/req/forgot-password", consumes = "application/json")
    public ResponseEntity<String> requestPasswordReset(@RequestBody PasswordResetRequest request) {
        if (request.email() == null || request.email().isBlank()) {
            logger.warn("Password reset request rejected because the email address was blank.");
            return ResponseEntity.ok("If an account exists for that email, a password reset link has been sent.");
        }

        String email = request.email().trim();
        logger.info("Password reset requested for {}", maskEmail(email));
        MyAppUser user = myAppUserRepository.findByEmail(email);

        if (user != null) {
            logger.debug("Password reset account found for {}; generating reset token.", maskEmail(email));
            String resetToken = jwtTokenUtil.generateToken(user.getEmail());
            user.setResetToken(resetToken);
            myAppUserRepository.save(user);
            logger.debug("Password reset token persisted for {}; sending reset email.", maskEmail(email));
            emailService.sendForgotPasswordEmail(user.getEmail(), resetToken);
            logger.info("Password reset email accepted for {}", maskEmail(email));
        } else {
            logger.info("Password reset requested for an unknown email address.");
        }

        return ResponseEntity.ok("If an account exists for that email, a password reset link has been sent.");
    }

    @PostMapping(value = "/req/reset-password", consumes = "application/json")
    public ResponseEntity<String> resetPassword(@RequestBody ResetPasswordRequest request) {
        if (request.token() == null || request.token().isBlank()
                || request.password() == null || request.password().length() < 8) {
            return ResponseEntity.badRequest().body("A valid token and a password of at least 8 characters are required.");
        }

        try {
            String email = jwtTokenUtil.extractEmail(request.token());
            MyAppUser user = myAppUserRepository.findByEmail(email);

            if (user == null || user.getResetToken() == null
                    || !user.getResetToken().equals(request.token())
                    || !jwtTokenUtil.validateToken(request.token())) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN).body("This password reset link is invalid or expired.");
            }

            user.setPassword(passwordEncoder.encode(request.password()));
            user.setResetToken(null);
            myAppUserRepository.save(user);
            return ResponseEntity.ok("Password reset successfully. You can now log in.");
        } catch (JwtException | IllegalArgumentException exception) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body("This password reset link is invalid or expired.");
        }
    }

    public record PasswordResetRequest(String email) {
    }

    public record ResetPasswordRequest(String token, String password) {
    }

    private static String maskEmail(String email) {
        int atIndex = email.indexOf('@');
        if (atIndex <= 1) {
            return "***";
        }
        return email.charAt(0) + "***" + email.substring(atIndex);
    }
}
