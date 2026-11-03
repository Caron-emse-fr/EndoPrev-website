package com.example.demo.Controller;

import com.example.demo.Model.MyAppUser;
import com.example.demo.Model.MyAppUserRepository;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestParam;

@Controller
public class AccountWebController {

    private final MyAppUserRepository userRepository;

    public AccountWebController(MyAppUserRepository userRepository) {
        this.userRepository = userRepository;
    }

    // Afficher la page de compte avec les données de l'utilisateur
    @GetMapping("/compte")
    public String showAccountPage(Model model, Authentication authentication) {
        if (authentication != null && authentication.isAuthenticated()) {
            MyAppUser user = userRepository.findByUsername(authentication.getName())
                    .orElse(null);
            
            model.addAttribute("user", user);
            model.addAttribute("username", authentication.getName());
        } else {
            model.addAttribute("username", "Visiteur");
        }
        return "compte"; // Fichier templates/compte.html
    }

    // Traiter le formulaire de mise à jour du profil
    @PostMapping("/compte/update")
    public String updateAccount(
            @RequestParam(required = false) Integer age,
            @RequestParam(required = false) String genre,
            @RequestParam(required = false) String endometriose,
            Authentication authentication) {

        if (authentication != null) {
            MyAppUser user = userRepository.findByUsername(authentication.getName())
                    .orElseThrow(() -> new IllegalStateException("Utilisateur non trouvé"));

            // Mettre à jour les champs sur l'entité (assurez-vous d'avoir les setters dans MyAppUser)
            // user.setAge(age);
            // user.setGenre(genre);
            // user.setEndometriose(endometriose);

            userRepository.save(user);
        }

        return "redirect:/compte?success";
    }
}