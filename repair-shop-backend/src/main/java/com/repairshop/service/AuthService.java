package com.repairshop.service;
import com.repairshop.dto.request.*;
import com.repairshop.dto.response.*;

public interface AuthService {
    AuthResponse register(RegisterRequest request);
    AuthResponse login(LoginRequest request);
    AuthResponse refreshToken(RefreshTokenRequest request);
    void logout(String refreshToken);
    UserResponse getCurrentUser(String username);
    void changePassword(String username, ChangePasswordRequest request);
}
