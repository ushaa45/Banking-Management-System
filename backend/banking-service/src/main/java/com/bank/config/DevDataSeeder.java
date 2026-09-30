package com.bank.config;

import com.bank.entity.AppUser;
import com.bank.entity.Role;
import com.bank.repository.AppUserRepository;
import com.bank.repository.RoleRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Profile;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.security.Provider;
import java.util.List;
import java.util.Set;

@Component
@Profile("dev")
@RequiredArgsConstructor
@Slf4j
public class DevDataSeeder implements CommandLineRunner {

    private static final List<String> ALL_ROLES = List.of(
            "SUPER_ADMIN", "BANK_ADMIN", "BRANCH_MANAGER", "BANK_EMPLOYEE",
            "TELLER", "CUSTOMER", "AUDITOR");

    private final RoleRepository roleRepository;
    private final AppUserRepository appUserRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
    public void run(String... args) {
        ALL_ROLES.forEach(name ->
                roleRepository.findByRoleName(name)
                        .orElseGet(() -> roleRepository.save(Role.builder().roleName(name).build())));

        if (appUserRepository.findByUsername("admin").isEmpty()) {
            Role superAdmin = roleRepository.findByRoleName("SUPER_ADMIN").orElseThrow();
            appUserRepository.save(AppUser.builder()
                    .username("admin")
                    .passwordHash(passwordEncoder.encode("admin123"))
                    .status("ACTIVE")
                    .roles(Set.of(superAdmin))
                    .build());
            log.info("Seeded dev-only admin user -> username: admin / password: admin123 " +
                    "(remove DevDataSeeder before anything beyond local dev)");
        }
    }
}
