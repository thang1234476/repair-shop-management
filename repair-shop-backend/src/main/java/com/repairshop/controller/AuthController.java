package com.repairshop.controller;

import com.repairshop.dto.request.ChangePasswordRequest;
import com.repairshop.dto.request.LoginRequest;
import com.repairshop.dto.request.RegisterRequest;
import com.repairshop.dto.request.RefreshTokenRequest;
import com.repairshop.dto.response.ApiResponse;
import com.repairshop.dto.response.AuthResponse;
import com.repairshop.dto.response.UserResponse;
import com.repairshop.security.UserDetailsImpl;
import com.repairshop.service.AuthService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;

    private UserDetailsImpl getCurrentUser() {
        return (UserDetailsImpl) SecurityContextHolder.getContext().getAuthentication().getPrincipal();
    }

    @PostMapping("/register")
    public ResponseEntity<ApiResponse<AuthResponse>> register(@Valid @RequestBody RegisterRequest request) {
        return ResponseEntity.ok(ApiResponse.success("Success", authService.register(request)));
    }

    @PostMapping("/login")
    public ResponseEntity<ApiResponse<AuthResponse>> login(@Valid @RequestBody LoginRequest request) {
        return ResponseEntity.ok(ApiResponse.success("Success", authService.login(request)));
    }

    @PostMapping("/refresh-token")
    public ResponseEntity<ApiResponse<AuthResponse>> refreshToken(@Valid @RequestBody RefreshTokenRequest request) {
        return ResponseEntity.ok(ApiResponse.success("Success", authService.refreshToken(request)));
    }

    @PostMapping("/logout")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<ApiResponse<Void>> logout(@RequestHeader("Authorization") String token) {
        authService.logout(token);
        return ResponseEntity.ok(ApiResponse.success("Success", null));
    }

    @GetMapping("/me")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<ApiResponse<UserResponse>> getMe() {
        return ResponseEntity.ok(ApiResponse.success("Success", authService.getCurrentUser(getCurrentUser().getUsername())));
    }

    @PutMapping("/change-password")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<ApiResponse<Void>> changePassword(@Valid @RequestBody ChangePasswordRequest request) {
        authService.changePassword(getCurrentUser().getUsername(), request);
        return ResponseEntity.ok(ApiResponse.success("Success", null));
    }
}
