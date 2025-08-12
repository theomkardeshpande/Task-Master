package com.example.demo.security;

import com.example.demo.model.CustomUserDetails;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.Arrays;
import java.util.Optional;

import com.example.demo.service.CustomUserDetailService;

@Component
public class JwtAuthenticationFilter extends OncePerRequestFilter {

    private static final Logger logger = LoggerFactory.getLogger(JwtAuthenticationFilter.class);

    private final JwtUtil jwtUtil;
    private final CustomUserDetailService customUserDetailService;

    public JwtAuthenticationFilter(JwtUtil jwtUtil, CustomUserDetailService customUserDetailService) {
        this.jwtUtil = jwtUtil;
        this.customUserDetailService = customUserDetailService;
    }

    @Override
    protected void doFilterInternal(HttpServletRequest request,
                                    HttpServletResponse response,
                                    FilterChain filterChain)
            throws ServletException, IOException {

        try {
            String jwt = extractJwtFromCookies(request);

            if (jwt == null) {
                logger.debug("No JWT token found in cookies for request: {} {}", request.getMethod(), request.getRequestURI());
                filterChain.doFilter(request, response);
                return;
            }

            if (SecurityContextHolder.getContext().getAuthentication() != null) {
                logger.debug("SecurityContext already contains authentication for request: {} {}", request.getMethod(), request.getRequestURI());
                filterChain.doFilter(request, response);
                return;
            }

            if (!jwtUtil.validateToken(jwt)) {
                logger.warn("Invalid JWT token detected for request: {} {}", request.getMethod(), request.getRequestURI());
                filterChain.doFilter(request, response);
                return;
            }

            CustomUserDetails userDetails = null;
            Integer userId = jwtUtil.getUserIdFromToken(jwt);
            if (userId != null) {
                logger.debug("JWT contains userId: {}", userId);
                userDetails = customUserDetailService.loadUserById(userId);
            } else {
                String email = jwtUtil.getEmailFromToken(jwt);
                if (email != null) {
                    logger.debug("JWT fallback to email: {}", email);
                    userDetails = customUserDetailService.loadUserByUsername(email);
                }
            }

            if (userDetails != null) {
                UsernamePasswordAuthenticationToken authToken =
                        new UsernamePasswordAuthenticationToken(
                                userDetails,
                                null,
                                userDetails.getAuthorities());

                authToken.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));
                SecurityContextHolder.getContext().setAuthentication(authToken);
                logger.debug("Authentication set in SecurityContext for user: {}", userDetails.getUsername());
            } else {
                logger.warn("No user found for JWT claims in request: {} {}", request.getMethod(), request.getRequestURI());
            }

        } catch (Exception ex) {
            logger.error("JWT authentication failed for request: {} {}", request.getMethod(), request.getRequestURI(), ex);
            SecurityContextHolder.clearContext();
        }

        filterChain.doFilter(request, response);
    }


    private String extractJwtFromCookies(HttpServletRequest request) throws Exception{
        if (request.getCookies() != null) {
            Optional<Cookie> jwtCookie = Arrays.stream(request.getCookies())
                    .filter(cookie -> "jwt_token".equals(cookie.getName()))
                    .findFirst();
            return jwtCookie.map(Cookie::getValue).orElse(null);
        }
        return null;
    }
}
