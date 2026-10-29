package com.example.demo.Controller;

import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.ui.Model;

@Controller
public class ContentController {
    @GetMapping ("/login")
    public String login(@RequestParam(value = "error", required = false) String error,
                        Model model) {
        if ("unverified".equals(error)) {
            model.addAttribute("loginError",
                    "Your account is not verified. Check your email for the verification link.");
        } else if ("invalid".equals(error)) {
            model.addAttribute("loginError",
                    "The username or password is incorrect, or the account does not exist.");
        }
        return "login";
    }

    @GetMapping ("/req/signup")
    public String signup() {
        return "signup";
    }

    @GetMapping("/req/forgot-password")
    public String forgotPassword() {
        return "forgot-password";
    }

    @GetMapping("/req/reset-password")
    public String resetPassword(@RequestParam(value = "token", required = false) String token,
                                Model model) {
        model.addAttribute("token", token == null ? "" : token);
        return "reset-password";
    }

    @GetMapping("/index")
    public String index() {
        return "index";
    }
}
