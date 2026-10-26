package com.mmm.makros.service;

import com.mmm.makros.dto.CreateUserRequest;
import com.mmm.makros.dto.UpdateUserRequest;
import com.mmm.makros.dto.UserDto;
import com.mmm.makros.entity.User;
import com.mmm.makros.exception.ConflictException;
import com.mmm.makros.exception.NotFoundException;
import com.mmm.makros.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional
public class UserService {

    private final UserRepository userRepository;

    @Transactional(readOnly = true)
    public List<UserDto> listUsers() {
        return userRepository.findAll().stream().map(this::toDto).toList();
    }

    public UserDto createUser(CreateUserRequest request) {
        String username = request.username().trim();
        if (userRepository.existsByUsernameIgnoreCase(username)) {
            throw new ConflictException("Username '" + username + "' is already taken");
        }
        User user = User.builder().username(username).veggieGoalG(500).build();
        return toDto(userRepository.save(user));
    }

    public UserDto updateUser(Long id, UpdateUserRequest request) {
        User user = findEntity(id);
        if (request.veggieGoalG() != null) {
            user.setVeggieGoalG(request.veggieGoalG());
        }
        return toDto(userRepository.save(user));
    }

    @Transactional(readOnly = true)
    public User findEntity(Long id) {
        return userRepository.findById(id)
                .orElseThrow(() -> new NotFoundException("User " + id + " not found"));
    }

    private UserDto toDto(User user) {
        return new UserDto(user.getId(), user.getUsername(), user.getVeggieGoalG(), user.getCreatedAt());
    }
}
