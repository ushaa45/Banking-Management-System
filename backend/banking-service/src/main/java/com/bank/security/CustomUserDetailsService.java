package com.bank.security;

import com.bank.entity.AppUser;
import com.bank.entity.Role;
import com.bank.repository.AppUserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.userdetails.User;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

/**
 * Placeholder implementation. Replace with a repository-backed lookup
 * against the USER / ROLE / USER_ROLE tables described in the DB schema
 * once the user-management module is built out.
 */
@Service
@RequiredArgsConstructor
public class CustomUserDetailsService implements UserDetailsService {

    private final AppUserRepository appUserRepository;

    @Override
    public UserDetails loadUserByUsername(String username) throws UsernameNotFoundException {
        // TODO: replace with UserRepository lookup + BCrypt password hash + real roles
        AppUser user = appUserRepository.findByUsername(username)
                .orElseThrow(() -> new UsernameNotFoundException("User not found: " + username));
        String[] roles = user.getRoles().stream()
                .map(Role::getRoleName)
                .toArray(String[]::new);

        return User.builder()
                .username(user.getUsername())
                .password(user.getPasswordHash())
                .roles(roles)
                .disabled(!"ACTIVE".equals(user.getStatus()))
                .build();
    }
}
