package com.repairshop.service.impl;

import com.repairshop.dto.request.*;
import com.repairshop.dto.response.ApiResponse;
import com.repairshop.dto.response.AuthResponse;
import com.repairshop.dto.response.ForgotPasswordResponse;
import com.repairshop.dto.response.UserResponse;
import com.repairshop.entity.Customer;
import com.repairshop.entity.PasswordResetToken;
import com.repairshop.entity.User;
import com.repairshop.enums.Role;
import com.repairshop.enums.UserStatus;
import com.repairshop.exception.BadRequestException;
import com.repairshop.exception.ResourceNotFoundException;
import com.repairshop.repository.CustomerRepository;
import com.repairshop.repository.PasswordResetTokenRepository;
import com.repairshop.repository.UserRepository;
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

import java.time.LocalDateTime;
import java.util.Set;
import java.util.concurrent.ConcurrentHashMap;

@Service
@RequiredArgsConstructor
public class AuthServiceImpl implements AuthService {

    private final UserRepository userRepository;
    private final CustomerRepository customerRepository;
    private final PasswordResetTokenRepository passwordResetTokenRepository;
    private final PasswordEncoder passwordEncoder;
    private final AuthenticationManager authenticationManager;
    private final JwtTokenProvider tokenProvider;
    private final com.repairshop.service.EmailService emailService;

    // In-memory blacklist - thread-safe
    private final Set<String> blacklistedTokens = ConcurrentHashMap.newKeySet();


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

    @Override
    @Transactional
    public ForgotPasswordResponse forgotPassword(ForgotPasswordRequest request) {
        User user = userRepository.findByEmailIgnoreCase(request.getEmail().trim())
            .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy tài khoản với email này"));

        // Xóa các mã đặt lại mật khẩu cũ của user này
        passwordResetTokenRepository.deleteAllByUserId(user.getUserId());

        // Sinh mã OTP 6 chữ số ngẫu nhiên
        String token = String.format("%06d", (int)(Math.random() * 900000) + 100000);

        PasswordResetToken resetToken = PasswordResetToken.builder()
            .user(user)
            .token(token)
            .expiresAt(LocalDateTime.now().plusMinutes(15))
            .used(false)
            .build();

        passwordResetTokenRepository.save(resetToken);

        // Gửi email chứa mã OTP đến hòm thư người dùng
        emailService.sendOtpEmail(user.getEmail(), user.getFullName(), token);

        return ForgotPasswordResponse.builder()
            .message("Mã xác thực OTP đã được gửi về email " + user.getEmail() + ". Vui lòng kiểm tra hộp thư đến (hoặc thư rác).")
            .build();
    }

    @Override
    @Transactional
    public void resetPassword(ResetPasswordRequest request) {
        PasswordResetToken resetToken = passwordResetTokenRepository.findByToken(request.getToken().trim())
            .orElseThrow(() -> new BadRequestException("Mã xác nhận không hợp lệ hoặc không tồn tại"));

        if (resetToken.isUsed()) {
            throw new BadRequestException("Mã xác nhận này đã được sử dụng");
        }

        if (resetToken.isExpired()) {
            throw new BadRequestException("Mã xác nhận đã hết hạn (chỉ có hiệu lực trong 15 phút)");
        }

        User user = resetToken.getUser();
        user.setPasswordHash(passwordEncoder.encode(request.getNewPassword()));
        userRepository.save(user);

        resetToken.setUsed(true);
        passwordResetTokenRepository.save(resetToken);
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
