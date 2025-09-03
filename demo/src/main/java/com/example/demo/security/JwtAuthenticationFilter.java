package com.example.demo.security;

import com.example.demo.model.CustomUserDetails;
import com.example.demo.service.CustomUserDetailService;
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
import org.springframework.security.web.servlet.util.matcher.PathPatternRequestMatcher;
import org.springframework.security.web.util.matcher.OrRequestMatcher;
import org.springframework.security.web.util.matcher.RequestMatcher;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.Arrays;
import java.util.Optional;

@Component
public class JwtAuthenticationFilter extends OncePerRequestFilter {

    private final PathPatternRequestMatcher.Builder pp =
            PathPatternRequestMatcher.withDefaults();

    private final RequestMatcher skip = new OrRequestMatcher(
            pp.matcher("/auth/**"),
            pp.matcher("/reset-password/**"),
            pp.matcher("/forgot-password/**")
    );

    @Override
    protected boolean shouldNotFilter(HttpServletRequest request) {
        return skip.matches(request);
    }

    private static final Logger logger = LoggerFactory.getLogger(JwtAuthenticationFilter.class);

    private final JwtUtil jwtUtil;
    private final CustomUserDetailService customUserDetailService;

    public JwtAuthenticationFilter(JwtUtil jwtUtil,
            CustomUserDetailService customUserDetailService) {
        this.jwtUtil = jwtUtil;
        this.customUserDetailService = customUserDetailService;
    }

    @Override
    protected void doFilterInternal(HttpServletRequest request,
            HttpServletResponse response,
            FilterChain filterChain)
            throws ServletException, IOException {

        logger.debug("=== JWT Filter Processing: {} {} ===", request.getMethod(), request.getRequestURI());

        try {
            String jwt = extractJwtFromCookies(request);

            if (jwt == null) {
                logger.debug("❌ No JWT token found in cookies");
                // Print all cookies for debugging
                if (request.getCookies() != null) {
                    for (Cookie cookie : request.getCookies()) {
                        logger.debug("Found cookie: {} = {}", cookie.getName(), cookie.getValue());
                    }
                } else {
                    logger.debug("❌ No cookies found at all");
                }
                filterChain.doFilter(request, response);
                return;
            }

            logger.debug("✅ JWT token found: {}...", jwt.substring(0, Math.min(20, jwt.length())));

            if (SecurityContextHolder.getContext().getAuthentication() != null) {
                logger.debug("⚠️ SecurityContext already has authentication");
                filterChain.doFilter(request, response);
                return;
            }

            boolean isValid = jwtUtil.validateToken(jwt);
            logger.debug("JWT validation result: {}", isValid);

            if (!isValid) {
                logger.warn("❌ Invalid JWT token");
                filterChain.doFilter(request, response);
                return;
            }

            // Extract user info from JWT
            Integer userId = jwtUtil.getUserIdFromToken(jwt);
            String email = jwtUtil.getEmailFromToken(jwt);
            logger.debug("JWT claims - userId: {}, email: {}", userId, email);

            CustomUserDetails userDetails = null;
            if (userId != null) {
                userDetails = customUserDetailService.loadUserById(userId);
            } else if (email != null) {
                userDetails = customUserDetailService.loadUserByUsername(email);
            }

            if (userDetails != null) {
                UsernamePasswordAuthenticationToken authToken = new UsernamePasswordAuthenticationToken(
                        userDetails, null, userDetails.getAuthorities());
                authToken.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));
                SecurityContextHolder.getContext().setAuthentication(authToken);

                logger.debug("✅ Authentication set for user: {}", userDetails.getUsername());
            } else {
                logger.warn("❌ No user found for JWT claims");
            }

        } catch (Exception ex) {
            logger.error("❌ JWT authentication failed", ex);
            SecurityContextHolder.clearContext();
        }

        filterChain.doFilter(request, response);
    }

    private String extractJwtFromCookies(HttpServletRequest request) {
        if (request.getCookies() != null) {
            Optional<Cookie> jwtCookie = Arrays.stream(request.getCookies())
                    .filter(cookie -> "jwt_token".equals(cookie.getName()))
                    .findFirst();
            return jwtCookie.map(Cookie::getValue).orElse(null);
        }
        return null;
    }
}
