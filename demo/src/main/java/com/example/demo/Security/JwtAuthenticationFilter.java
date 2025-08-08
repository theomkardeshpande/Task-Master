package com.example.demo.Security;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.Arrays;
import java.util.Optional;

@Component
public class JwtAuthenticationFilter extends OncePerRequestFilter {

    private static final Logger logger = LoggerFactory.getLogger(JwtAuthenticationFilter.class);

    private final JwtUtil jwtUtil;
    private final UserDetailsService userDetailsService;

    public JwtAuthenticationFilter(JwtUtil jwtUtil, UserDetailsService userDetailsService) {
        this.jwtUtil = jwtUtil;
        this.userDetailsService = userDetailsService;
    }

    @Override
    protected void doFilterInternal(HttpServletRequest request,
                                    HttpServletResponse response,
                                    FilterChain filterChain)
            throws ServletException, IOException {

        try {
            Optional<Cookie> jwtCookie = Optional.empty();
            if (request.getCookies() != null) {
                jwtCookie = Arrays.stream(request.getCookies())
                        .filter(cookie -> "jwt_token".equals(cookie.getName()))
                        .findFirst();
            }

            if (jwtCookie.isEmpty()) {
                filterChain.doFilter(request, response);
                return;  // No JWT cookie present, continue filter chain
            }

            String jwt = jwtCookie.get().getValue();

            // Check if user not already authenticated
            if (jwt != null && SecurityContextHolder.getContext().getAuthentication() == null) {
                String email = jwtUtil.getEmailFromToken(jwt);

                if (email != null) {
                    UserDetails userDetails = userDetailsService.loadUserByUsername(email);

                    if (userDetails != null && jwtUtil.validateToken(jwt)) {
                        UsernamePasswordAuthenticationToken authToken =
                                new UsernamePasswordAuthenticationToken(
                                        userDetails,
                                        null,
                                        userDetails.getAuthorities());

                        authToken.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));

                        SecurityContextHolder.getContext().setAuthentication(authToken);
                    }
                }
            }
        } catch (Exception ex) {
            logger.error("Could not set user authentication in security context", ex);
            // Optionally clear context or let it be anonymous
            SecurityContextHolder.clearContext();
        }

        filterChain.doFilter(request, response);
    }
}
