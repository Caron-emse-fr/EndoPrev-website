package com.example.demo.Service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.MailException;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.web.servlet.support.ServletUriComponentsBuilder;
import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;
import org.springframework.mail.javamail.MimeMessageHelper;

@Service
public class EmailService {
    private static final Logger logger = LoggerFactory.getLogger(EmailService.class);

    @Autowired
    private JavaMailSender mailSender;

    @Value("${spring.mail.username}")
    private String from;

    public void sendVerificationEmail(String email, String verificationToken){
        String subject = "Email Verification";
        String path = "/req/signup/verify";
        String message = "Click the button below to verify your email address";
        sendEmail(email, verificationToken, subject, path, message);
    }
    public void sendForgotPasswordEmail(String email, String resetToken){
        String subject = "Password Reset";
        String path = "/req/reset-password";
        String message = "Click the button below to reset your password";
        sendEmail(email, resetToken, subject, path, message);
    }

    private void sendEmail(String email, String token, String subject, String path, String message){
        try{
            String actionUrl = ServletUriComponentsBuilder.fromCurrentContextPath()
                .path(path)
                .queryParam("token", token)
                .toUriString();
            logger.debug("Preparing {} email for {} with action path {}.", subject, maskEmail(email), path);
        
            String content = """
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px; border-radius: 8px; background-color: #f9f9f9; text-align: center;">
                    <h2 style="color: #333;">%s</h2>
                    <p style="font-size: 16px; color: #555;">%s</p>
                    <a href="%s" style="display: inline-block; margin: 20px 0; padding: 10px 20px; font-size: 16px; color: #fff; background-color: #007bff; text-decoration: none; border-radius: 5px;">Cliquez ici</a>
                    <p style="font-size: 14px; color: #777;">Or copy and paste this link into your browser:</p>
                    <p style="font-size: 14px; color: #007bff;">%s</p>
                    <p style="font-size: 12px; color: #aaa;">This is an automated message. Please do not reply.</p>
                </div>
                """.formatted(subject, message, actionUrl, actionUrl);
            
            MimeMessage mimeMessage = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(mimeMessage, true);

            helper.setFrom(from.trim());
            helper.setTo(email);
            helper.setSubject(subject);
            helper.setText(content, true);

            logger.debug("Connecting to SMTP server to send {} email to {}.", subject, maskEmail(email));
            mailSender.send(mimeMessage);
            logger.info("{} email sent successfully to {}.", subject, maskEmail(email));

        } catch (MessagingException | MailException exception) {
            logger.error("Failed to send {} email to {}. Check SMTP credentials and Gmail account settings.",
                    subject, maskEmail(email), exception);
            throw new EmailDeliveryException("The email could not be sent.", exception);
        }
    }

    private static String maskEmail(String email) {
        int atIndex = email.indexOf('@');
        if (atIndex <= 1) {
            return "***";
        }
        return email.charAt(0) + "***" + email.substring(atIndex);
    }

    public static class EmailDeliveryException extends RuntimeException {
        public EmailDeliveryException(String message, Throwable cause) {
            super(message, cause);
        }
    }
}
