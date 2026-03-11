package com.example.demo.Controller;

import com.example.demo.Model.AppUser;
import org.springframework.stereotype.Component;
import org.springframework.validation.Errors;
import org.springframework.validation.Validator;

import java.util.HashMap;
import java.util.Map;
import java.util.regex.Pattern;

@Component
public class RegisterValidator implements Validator {

    private static final String EMAIL_REGEX = "^[A-Za-z0-9+_.-]+@[A-Za-z0-9.-]+\\.[A-Za-z0-9.-]+$";
    private static final String PASSWORD_REGEX = "^(?=.*[A-Za-z])(?=.*\\d)[A-Za-z\\d@$!%*?&]{8,}$";
    private static final String FULLNAME_REGEX = "^[A-Za-z\\s]{2,50}$";

    @Override
    public boolean supports(Class<?> clazz) {
        return AppUser.class.equals(clazz) || RegistrationRequest.class.equals(clazz);
    }

    public void validate(Object object, Errors errors) {
        if (object instanceof AppUser) {
            validateAppUser((AppUser) object, errors);
        } else if (object instanceof RegistrationRequest) {
            validateRegistrationRequest((RegistrationRequest) object, errors);
        }
    }

    private void validateAppUser(AppUser user, Errors errors) {
        // Validate fullname
        if (user.getFullname() == null || user.getFullname().trim().isEmpty()) {
            errors.rejectValue("fullname", "field.required", "Full name is required");
        } else if (!Pattern.matches(FULLNAME_REGEX, user.getFullname().trim())) {
            errors.rejectValue("fullname", "Invalid.fullname", "Full name must contain only letters and spaces, between 2-50 characters");
        }

        // Validate email
        if (user.getEmail() == null || user.getEmail().trim().isEmpty()) {
            errors.rejectValue("email", "field.required", "Email is required");
        } else if (!Pattern.matches(EMAIL_REGEX, user.getEmail().trim())) {
            errors.rejectValue("email", "Invalid.email", "Invalid email format. Use format: user@domain.com");
        }

        // Validate password
        if (user.getPassword() == null || user.getPassword().isEmpty()) {
            errors.rejectValue("password", "field.required", "Password is required");
        } else if (!Pattern.matches(PASSWORD_REGEX, user.getPassword())) {
            errors.rejectValue("password", "Invalid.password", 
                "Password must be at least 8 characters with at least one letter and one number");
        }
    }

    private void validateRegistrationRequest(RegistrationRequest request, Errors errors) {
        // Validate fullname
        if (request.getFullname() == null || request.getFullname().trim().isEmpty()) {
            errors.rejectValue("fullname", "field.required", "Full name is required");
        } else if (!Pattern.matches(FULLNAME_REGEX, request.getFullname().trim())) {
            errors.rejectValue("fullname", "Invalid.fullname", "Full name must contain only letters and spaces, between 2-50 characters");
        }

        // Validate email
        if (request.getEmail() == null || request.getEmail().trim().isEmpty()) {
            errors.rejectValue("email", "field.required", "Email is required");
        } else if (!Pattern.matches(EMAIL_REGEX, request.getEmail().trim())) {
            errors.rejectValue("email", "Invalid.email", "Invalid email format. Use format: user@domain.com");
        }

        // Validate password
        if (request.getPassword() == null || request.getPassword().isEmpty()) {
            errors.rejectValue("password", "field.required", "Password is required");
        } else if (!Pattern.matches(PASSWORD_REGEX, request.getPassword())) {
            errors.rejectValue("password", "Invalid.password", 
                "Password must be at least 8 characters with at least one letter and one number");
        }
    }

    /**
     * Validate and return error map for registration request
     */
    public Map<String, String> validateAndGetErrors(RegistrationRequest request) {
        Map<String, String> errorMap = new HashMap<>();

        // Validate fullname
        if (request.getFullname() == null || request.getFullname().trim().isEmpty()) {
            errorMap.put("fullname", "Full name is required");
        } else if (!Pattern.matches(FULLNAME_REGEX, request.getFullname().trim())) {
            errorMap.put("fullname", "Full name must contain only letters and spaces, between 2-50 characters");
        }

        // Validate email
        if (request.getEmail() == null || request.getEmail().trim().isEmpty()) {
            errorMap.put("email", "Email is required");
        } else if (!Pattern.matches(EMAIL_REGEX, request.getEmail().trim())) {
            errorMap.put("email", "Invalid email format. Use format: user@domain.com");
        }

        // Validate password
        if (request.getPassword() == null || request.getPassword().isEmpty()) {
            errorMap.put("password", "Password is required");
        } else if (!Pattern.matches(PASSWORD_REGEX, request.getPassword())) {
            errorMap.put("password", "Password must be at least 8 characters with at least one letter and one number");
        }

        return errorMap;
    }
}
