package dev.auth.demo.service;

import java.util.HashMap;
import java.util.Map;

import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import dev.auth.demo.model.User;

@Service
public class UserService implements UserDetailsService {

    private final Map<String, User> users = new HashMap<>();
    private final PasswordEncoder passwordEncoder;

    public UserService(PasswordEncoder passwordEncoder) {
        this.passwordEncoder = passwordEncoder;
        // 데모용 사용자 추가
        addUser("user", "password", "user@example.com", "Demo User");
        addUser("admin", "admin123", "admin@example.com", "Admin User");
    }

    public void addUser(String username, String password, String email, String name) {
        User user = new User(
            username,
            passwordEncoder.encode(password),
            email,
            name
        );
        users.put(username, user);
    }

    @Override
    public UserDetails loadUserByUsername(String username) throws UsernameNotFoundException {
        if (!users.containsKey(username)) {
            throw new UsernameNotFoundException("User not found: " + username);
        }
        return users.get(username);
    }

    public User findByUsername(String username) {
        return users.getOrDefault(username, null);
    }
}