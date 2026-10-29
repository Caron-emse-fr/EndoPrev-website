package com.example.demo.Model;

import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;

import java.util.Optional;

import org.junit.jupiter.api.Test;
import org.springframework.security.core.userdetails.UserDetails;

class MyAppUserServiceTest {

    private final MyAppUserRepository repository = mock(MyAppUserRepository.class);
    private final MyAppUserService service = new MyAppUserService(repository);

    @Test
    void unverifiedUserIsDisabled() {
        MyAppUser user = user(false);
        when(repository.findByUsername(user.getUsername())).thenReturn(Optional.of(user));

        UserDetails userDetails = service.loadUserByUsername(user.getUsername());

        assertFalse(userDetails.isEnabled());
    }

    @Test
    void verifiedUserIsEnabled() {
        MyAppUser user = user(true);
        when(repository.findByUsername(user.getUsername())).thenReturn(Optional.of(user));

        UserDetails userDetails = service.loadUserByUsername(user.getUsername());

        assertTrue(userDetails.isEnabled());
    }

    private MyAppUser user(boolean verified) {
        MyAppUser user = new MyAppUser();
        user.setUsername("test-user");
        user.setPassword("encoded-password");
        user.setVerified(verified);
        return user;
    }
}
