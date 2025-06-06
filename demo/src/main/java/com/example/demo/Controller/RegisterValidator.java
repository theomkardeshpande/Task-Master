package com.example.demo.Controller;

import com.example.demo.Model.AppUser;
import org.springframework.stereotype.Component;
import org.springframework.validation.Errors;
import org.springframework.validation.ValidationUtils;
import org.springframework.validation.Validator;

import java.util.regex.Pattern;

@Component
public class RegisterValidator implements Validator {

    private static final String EMAIL_REGEX = "^[A-Za-z0-9+_.-]+@[A-Za-z0-9.-]+$";
    private static final String PASSWORD_REGEX = "^(?=.*[A-Za-z])(?=.*\\d)[A-Za-z\\d@#]{3,}$";

    @Override
    public boolean supports(Class<?> clazz) {
        return AppUser.class.equals(clazz);
    }

    public void validate(Object object, Errors errors) {
        AppUser user = (AppUser) object;

        ValidationUtils.rejectIfEmpty(errors, "fullname", "field.required");
        ValidationUtils.rejectIfEmptyOrWhitespace(errors, "email", "field.required");
        ValidationUtils.rejectIfEmptyOrWhitespace(errors, "password", "field.required");

        // Validate email
        if (!Pattern.matches(EMAIL_REGEX, user.getEmail())) {
            errors.rejectValue("email", "Invalid.email", "Invalid email format");
        }

        // Validate password
        if (!Pattern.matches(PASSWORD_REGEX, user.getPassword())) {
            errors.rejectValue("password", "Invalid.password", "Password must be at least 3 characters with at least one letter and one number");
        }
    }

}
