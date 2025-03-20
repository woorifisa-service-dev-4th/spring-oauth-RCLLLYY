package dev.auth.demo;

import dev.auth.demo.model.User;
import dev.auth.demo.repository.UserRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.util.Set;

@Component
public class DataLoader implements CommandLineRunner {

    private final UserRepository userRepository;
    private final BCryptPasswordEncoder bCryptPasswordEncoder;

    public DataLoader(UserRepository userRepository, BCryptPasswordEncoder bCryptPasswordEncoder) {
        this.userRepository = userRepository;
        this.bCryptPasswordEncoder = bCryptPasswordEncoder;
    }

    @Override
    public void run(String... args) {
        if (userRepository.findByUsername("user").isEmpty()) {
            User user = new User();
            user.setUsername("user");
            user.setPassword(bCryptPasswordEncoder.encode("password"));
            user.setEmail("user@test.com");
            user.setName("user");
            user.setRoles(Set.of("USER"));
            userRepository.save(user);
        }

        if (userRepository.findByUsername("admin").isEmpty()) {
            User admin = new User();
            admin.setUsername("admin");
            admin.setPassword(bCryptPasswordEncoder.encode("password"));
            admin.setEmail("admin@test.com");
            admin.setName("admin");
            admin.setRoles(Set.of("ADMIN"));
            userRepository.save(admin);
        }

        if (userRepository.findByUsername("test").isEmpty()) {
            User test = new User();
            test.setUsername("test");
            test.setPassword(bCryptPasswordEncoder.encode("1234"));
            test.setEmail("test@test.com");
            test.setName("test");
            test.setRoles(Set.of("USER"));
            userRepository.save(test);
        }
    }
}
