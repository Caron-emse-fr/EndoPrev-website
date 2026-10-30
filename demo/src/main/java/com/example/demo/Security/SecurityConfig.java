package com.example.demo.Security;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.authentication.AuthenticationProvider;
import org.springframework.security.authentication.dao.DaoAuthenticationProvider;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.authentication.DisabledException;
import org.springframework.security.web.authentication.AuthenticationFailureHandler;

import com.example.demo.Model.MyAppUserService;
import lombok.AllArgsConstructor;


@Configuration
@AllArgsConstructor
@EnableWebSecurity
public class SecurityConfig {

    private final MyAppUserService appUserService;

    @Bean
    public UserDetailsService userDetailsService() {
        return appUserService;
    }

    @Bean
    public AuthenticationProvider authenticationPrivder(){
        DaoAuthenticationProvider provider = new DaoAuthenticationProvider(userDetailsService());
        provider.setPasswordEncoder(passwordEncoder());
        return provider;
    }

    @Bean
    public PasswordEncoder passwordEncoder(){
        return new BCryptPasswordEncoder();
    }


    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity httpSecurity) throws Exception {
        return httpSecurity
                        .csrf(AbstractHttpConfigurer::disable)
                        .formLogin(httpform -> {
                            httpform
                                .loginPage("/login").permitAll();
                            httpform
                                .failureHandler(authenticationFailureHandler());
                            httpform
                            .defaultSuccessUrl("/index.html", true);
                        })

                    .authorizeHttpRequests(registry -> {
                        registry.requestMatchers(
                                "/", "/index", "/index.html", "/login.html", "/signup.html",
                                "/forgot-password.html", "/reset-password.html",
                                "/patientes.html", "/chercheures.html", "/associations.html",
                                "/temoignages.html", "/qui-sommes-nous.html", "/admin.html",
                                "/style.css", "/script.js", "/css/**", "/js/**", "/img/**",
                                "/req/**", "/api/signup").permitAll();
                        registry.requestMatchers("/compte.html", "/api/me").authenticated();
                        registry.anyRequest().authenticated();
                    })
                    .build();
    }

    @Bean
    public AuthenticationFailureHandler authenticationFailureHandler() {
        return (request, response, exception) -> {
            String error = exception instanceof DisabledException ? "unverified" : "invalid";
            response.sendRedirect("/login?error=" + error);
        };
    }
}
