package com.example.demo.dto;

import com.fasterxml.jackson.annotation.JsonInclude;
import lombok.Data;

@JsonInclude(JsonInclude.Include.NON_NULL)
public class PasswordChangeResponse {
    private boolean success;
    private String message;
    private Object data;

    // Default constructor
    public PasswordChangeResponse() {}

    // Constructor for success/failure with message only
    public PasswordChangeResponse(boolean success, String message) {
        this.success = success;
        this.message = message;
    }

    // Constructor for success with data
    public PasswordChangeResponse(boolean success, String message, Object data) {
        this.success = success;
        this.message = message;
        this.data = data;
    }

    public boolean isSuccess() {
        return success;
    }

    public void setSuccess(boolean success) {
        this.success = success;
    }

    public String getMessage() {
        return message;
    }

    public void setMessage(String message) {
        this.message = message;
    }

    public Object getData() {
        return data;
    }

    public void setData(Object data) {
        this.data = data;
    }

    public static PasswordChangeResponse success(String message) {
        return new PasswordChangeResponse(true, message);
    }

    public static PasswordChangeResponse success(String message, Object data) {
        return new PasswordChangeResponse(true, message, data);
    }

    public static PasswordChangeResponse error(String message) {
        return new PasswordChangeResponse(false, message);
    }

    public static PasswordChangeResponse error(String message, Object data) {
        return new PasswordChangeResponse(false, message, data);
    }

}
