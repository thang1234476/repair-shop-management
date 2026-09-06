package com.repairshop.dto.response;
import lombok.Builder;
import lombok.Data;
import java.util.List;

@Data @Builder
public class ApiResponse<T> {
    private boolean success;
    private String message;
    private T data;
    private List<String> errors;
    
    public static <T> ApiResponse<T> success(String message, T data) {
        return ApiResponse.<T>builder().success(true).message(message).data(data).build();
    }

    public static <T> ApiResponse<T> success(T data) {
        return ApiResponse.<T>builder().success(true).message("Success").data(data).build();
    }
    
    public static <T> ApiResponse<T> error(String message, List<String> errors) {
        return ApiResponse.<T>builder().success(false).message(message).errors(errors).build();
    }
    
    public static <T> ApiResponse<T> error(String message) {
        return error(message, null);
    }
}
