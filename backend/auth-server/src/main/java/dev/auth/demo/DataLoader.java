package dev.auth.demo;

import dev.auth.demo.model.User;
import dev.auth.demo.repository.UserRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.util.Set;

@Component
public class DataLoader implements CommandLineRunner {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    public DataLoader(UserRepository userRepository, PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Override
    public void run(String... args) {
        if (userRepository.findByUsername("user").isEmpty()) {
            User user = new User();
            user.setUsername("user");
            user.setPassword(passwordEncoder.encode("password"));
            user.setEmail("user@test.com");
            user.setName("user");
            user.setRoles(Set.of("ADMIN", "USER"));
            userRepository.save(user);
        }

        if (userRepository.findByUsername("admin").isEmpty()) {
            User admin = new User();
            admin.setUsername("admin");
            admin.setPassword(passwordEncoder.encode("password"));
            admin.setEmail("admin@test.com");
            admin.setName("admin");
            admin.setRoles(Set.of("ADMIN", "USER"));
            userRepository.save(admin);
        }

        if (userRepository.findByUsername("test").isEmpty()) {
            User test = new User();
            test.setUsername("test");
            test.setPassword(passwordEncoder.encode("1234"));
            test.setEmail("test@test.com");
            test.setName("test");
            test.setRoles(Set.of("ADMIN", "USER"));
            userRepository.save(test);
        }
    }
}
