package com.example.demo.Model;

import org.springframework.stereotype.Service;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.userdetails.User;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import java.util.Optional;
import lombok.AllArgsConstructor;

@Service 
@AllArgsConstructor 
public class MyAppUserService implements UserDetailsService{

    @Autowired 
    private MyAppUserRepository repository;

    @Override 
    public UserDetails loadUserByUsername(String username) throws UsernameNotFoundException {
        Optional<MyAppUser> user = repository.findByUsername(username);
        if (user.isPresent()){
            var userObj = user.get();
            return User.builder()
                .username(userObj.getUsername())
                .password(userObj.getPassword())
                .disabled(!userObj.isVerified())
                .build();
        }else{
            throw new UsernameNotFoundException("User not found");
        }
    }
}
