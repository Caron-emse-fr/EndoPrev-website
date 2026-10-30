package com.example.demo.Controller;

import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.ui.Model;

@Controller
public class ContentController {
    @GetMapping({"/login", "/login.html"})
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

    @GetMapping({"/req/signup", "/signup.html"})
    public String signup() {
        return "signup";
    }

    @GetMapping({"/req/forgot-password", "/forgot-password.html"})
    public String forgotPassword() {
        return "forgot-password";
    }

    @GetMapping({"/req/reset-password", "/reset-password.html"})
    public String resetPassword(@RequestParam(value = "token", required = false) String token,
                                Model model) {
        model.addAttribute("token", token == null ? "" : token);
        return "reset-password";
    }

    @GetMapping({"/index", "/", "/index.html"})
    public String index() {
        return "index";
    }

    @GetMapping({
            "/admin.html",
            "/associations.html",
            "/chercheures.html",
            "/patientes.html",
            "/qui-sommes-nous.html",
            "/temoignages.html"
    })
    public String publicPage(jakarta.servlet.http.HttpServletRequest request) {
        String page = request.getRequestURI().substring(request.getRequestURI().lastIndexOf('/') + 1);
        return page.substring(0, page.length() - ".html".length());
    }

    @GetMapping("/compte.html")
    public String account() {
        return "compte";
    }
}
