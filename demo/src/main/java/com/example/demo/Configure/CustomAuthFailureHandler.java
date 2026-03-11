package com.example.demo.Configure;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.DisabledException;
import org.springframework.security.core.AuthenticationException;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.web.authentication.AuthenticationFailureHandler;
import org.springframework.stereotype.Component;

import java.io.IOException;

@Component
public class CustomAuthFailureHandler implements AuthenticationFailureHandler {

    @Override
    public void onAuthenticationFailure(HttpServletRequest request,
                                        HttpServletResponse response,
                                        AuthenticationException exception) throws IOException {

        // ✅ Unwrap InternalAuthenticationServiceException to get the real cause
        Throwable cause = exception.getCause() != null ? exception.getCause() : exception;

        String errorParam;

        if (cause instanceof DisabledException || exception instanceof DisabledException) {
            errorParam = "not-verified";
        } else if (cause instanceof UsernameNotFoundException
                || exception instanceof UsernameNotFoundException
                || exception instanceof BadCredentialsException) {
            errorParam = "invalid-credentials";
        } else {
            errorParam = "error";
        }

        response.sendRedirect("/login?error=" + errorParam);
    }
}
