package com.repairshop.service.impl;

import com.repairshop.dto.request.*;
import com.repairshop.dto.response.AuthResponse;
import com.repairshop.dto.response.UserResponse;
import com.repairshop.entity.Customer;
import com.repairshop.entity.User;
import com.repairshop.enums.Role;
import com.repairshop.enums.UserStatus;
import com.repairshop.exception.BadRequestException;
import com.repairshop.exception.ResourceNotFoundException;
import com.repairshop.repository.CustomerRepository;
import com.repairshop.repository.UserRepository;
import com.repairshop.exception.ResourceNotFoundException;
import com.repairshop.security.JwtTokenProvider;
import com.repairshop.security.UserDetailsImpl;
import com.repairshop.service.AuthService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.HashSet;
import java.util.Set;

@Service
@RequiredArgsConstructor
public class AuthServiceImpl implements AuthService {

    private final UserRepository userRepository;
    private final CustomerRepository customerRepository;
    private final PasswordEncoder passwordEncoder;
    private final AuthenticationManager authenticationManager;
    private final JwtTokenProvider tokenProvider;

    // In-memory blacklist - use Redis in production
    private final Set<String> blacklistedTokens = new HashSet<>();

    @Override
    @Transactional
    public AuthResponse register(RegisterRequest request) {
        if (userRepository.existsByUsername(request.getUsername())) {
            throw new BadRequestException("Username already exists");
        }
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new BadRequestException("Email already exists");
        }

        User user = new User();
        user.setUsername(request.getUsername());
        user.setEmail(request.getEmail());
        user.setPasswordHash(passwordEncoder.encode(request.getPassword()));
        user.setRole(Role.CUSTOMER);
        user.setStatus(UserStatus.ACTIVE);
        user.setFullName(request.getFullName());
        user.setPhone(request.getPhone());
        user = userRepository.save(user);

        Customer customer = new Customer();
        customer.setUser(user);
        customerRepository.save(customer);

        // Authenticate to get token
        Authentication auth = authenticationManager.authenticate(
            new UsernamePasswordAuthenticationToken(request.getUsername(), request.getPassword())
        );
        UserDetailsImpl userDetails = (UserDetailsImpl) auth.getPrincipal();
        String jwt = tokenProvider.generateAccessToken(userDetails);
        String refresh = tokenProvider.generateRefreshToken(userDetails.getUsername());

        return AuthResponse.builder()
            .accessToken(jwt)
            .refreshToken(refresh)
            .tokenType("Bearer")
            .user(mapToUserResponse(user))
            .build();
    }

    @Override
    public AuthResponse login(LoginRequest request) {
        // Tìm user theo email
        User user = userRepository.findByEmail(request.getEmail())
            .orElseThrow(() -> new BadRequestException("Email không tồn tại trong hệ thống"));

        // Xác thực bằng username (Spring Security dùng username nội bộ)
        Authentication auth = authenticationManager.authenticate(
            new UsernamePasswordAuthenticationToken(user.getUsername(), request.getPassword())
        );
        UserDetailsImpl userDetails = (UserDetailsImpl) auth.getPrincipal();
        String jwt = tokenProvider.generateAccessToken(userDetails);
        String refresh = tokenProvider.generateRefreshToken(userDetails.getUsername());

        return AuthResponse.builder()
            .accessToken(jwt)
            .refreshToken(refresh)
            .tokenType("Bearer")
            .user(mapToUserResponse(user))
            .build();
    }

    @Override
    public AuthResponse refreshToken(RefreshTokenRequest request) {
        if (blacklistedTokens.contains(request.getRefreshToken())
                || !tokenProvider.validateToken(request.getRefreshToken())) {
            throw new BadRequestException("Invalid or expired refresh token");
        }
        String username = tokenProvider.getUsernameFromToken(request.getRefreshToken());
        User user = userRepository.findByUsername(username)
            .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        UserDetailsImpl userDetails = new UserDetailsImpl(user);
        String newJwt = tokenProvider.generateAccessToken(userDetails);

        return AuthResponse.builder()
            .accessToken(newJwt)
            .refreshToken(request.getRefreshToken())
            .tokenType("Bearer")
            .user(mapToUserResponse(user))
            .build();
    }

    @Override
    public void logout(String refreshToken) {
        if (refreshToken != null) {
            blacklistedTokens.add(refreshToken);
        }
    }

    @Override
    public UserResponse getCurrentUser(String username) {
        User user = userRepository.findByUsername(username)
            .orElseThrow(() -> new ResourceNotFoundException("User not found"));
        return mapToUserResponse(user);
    }

    @Override
    @Transactional
    public void changePassword(String username, ChangePasswordRequest request) {
        User user = userRepository.findByUsername(username)
            .orElseThrow(() -> new ResourceNotFoundException("User not found"));
        if (!passwordEncoder.matches(request.getOldPassword(), user.getPasswordHash())) {
            throw new BadRequestException("Current password is incorrect");
        }
        user.setPasswordHash(passwordEncoder.encode(request.getNewPassword()));
        userRepository.save(user);
    }

    private UserResponse mapToUserResponse(User user) {
        UserResponse r = new UserResponse();
        r.setUserId(user.getUserId());
        r.setUsername(user.getUsername());
        r.setEmail(user.getEmail());
        r.setFullName(user.getFullName());
        r.setPhone(user.getPhone());
        r.setRole(user.getRole().name());
        r.setStatus(user.getStatus().name());
        r.setCreatedAt(user.getCreatedAt());
        return r;
    }
}
