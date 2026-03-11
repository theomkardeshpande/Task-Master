package com.example.demo.Controller;

import java.util.Map;
import java.util.HashMap;

public class RegistrationResponse {
    private boolean success;
    private String message;
    private Map<String, String> errors;

    public RegistrationResponse(boolean success, String message) {
        this.success = success;
        this.message = message;
        this.errors = new HashMap<>();
    }

    public RegistrationResponse(boolean success, String message, Map<String, String> errors) {
        this.success = success;
        this.message = message;
        this.errors = errors;
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

    public Map<String, String> getErrors() {
        return errors;
    }

    public void setErrors(Map<String, String> errors) {
        this.errors = errors;
    }

    public void addError(String field, String error) {
        this.errors.put(field, error);
    }
}
