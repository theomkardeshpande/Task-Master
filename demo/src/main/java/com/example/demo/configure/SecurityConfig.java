package com.example.demo.configure;

import com.example.demo.security.JwtAuthenticationEntryPoint;
import com.example.demo.security.JwtAuthenticationFilter;
import com.example.demo.service.CustomOAuth2UserService;
import com.example.demo.service.CustomUserDetailService;
import com.example.demo.service.OAuth2LoginSuccessHandler;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.config.annotation.authentication.builders.AuthenticationManagerBuilder;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.oauth2.client.userinfo.DefaultOAuth2UserService;
import org.springframework.security.oauth2.client.userinfo.OAuth2UserService;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;

import javax.sql.DataSource;

@Configuration
@EnableWebSecurity
@EnableMethodSecurity
public class SecurityConfig {

        private final DataSource dataSource;
        private final JwtAuthenticationEntryPoint unauthorizedHandler;
        private final JwtAuthenticationFilter jwtAuthenticationFilter;
        private final CustomOAuth2UserService customOAuth2UserService;
        private final OAuth2LoginSuccessHandler oAuth2LoginSuccessHandler;
        private final CustomUserDetailService customUserDetailService;

        public SecurityConfig(
                        DataSource dataSource,
                        JwtAuthenticationEntryPoint unauthorizedHandler,
                        JwtAuthenticationFilter jwtAuthenticationFilter,
                        CustomOAuth2UserService customOAuth2UserService,
                        OAuth2LoginSuccessHandler oAuth2LoginSuccessHandler,
                        CustomUserDetailService customUserDetailService) {
                this.dataSource = dataSource;
                this.unauthorizedHandler = unauthorizedHandler;
                this.jwtAuthenticationFilter = jwtAuthenticationFilter;
                this.customOAuth2UserService = customOAuth2UserService;
                this.oAuth2LoginSuccessHandler = oAuth2LoginSuccessHandler;
                this.customUserDetailService = customUserDetailService;
        }

        @Bean
        public PasswordEncoder passwordEncoder() {
                return new BCryptPasswordEncoder();
        }

        @Bean
        public AuthenticationManager authenticationManager(
                        HttpSecurity http,
                        PasswordEncoder passwordEncoder) throws Exception {
                AuthenticationManagerBuilder authBuilder = http.getSharedObject(AuthenticationManagerBuilder.class);

                authBuilder
                                .userDetailsService(customUserDetailService)
                                .passwordEncoder(passwordEncoder);

                return authBuilder.build();
        }

        @Bean
        public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
                http
                                // Disable CSRF since we’re using stateless JWT for APIs
                                .csrf(csrf -> csrf.disable())

                                // Handle unauthorized attempts
                                .exceptionHandling(ex -> ex.authenticationEntryPoint(unauthorizedHandler))

                                // Permit these endpoints without authentication
                                .authorizeHttpRequests(auth -> auth
                                                .requestMatchers(
                                                                "/",
                                                                "/auth/**",
                                                                "/oauth2/**",
                                                                "/login/**",
                                                                "/forgot-password",
                                                                "/css/**",
                                                                "/js/**",
                                                                "/sound/**",
                                                                "/static/**",
                                                                "/api/public/**", // if you have public APIs
                                                                "/actuator/prometheus")
                                                .permitAll()
                                                .anyRequest().authenticated())

                                // Stateless session management
                                .sessionManagement(session -> session
                                                .sessionCreationPolicy(SessionCreationPolicy.STATELESS))

                                // OAuth2 login configuration
                                .oauth2Login(oauth2 -> oauth2
                                                .loginPage("/auth/login")
                                                .userInfoEndpoint(userInfo -> userInfo
                                                                .userService(customOAuth2UserService))
                                                .successHandler(oAuth2LoginSuccessHandler));

                // Register JWT filter before UsernamePasswordAuthenticationFilter
                http.addFilterBefore(
                                jwtAuthenticationFilter,
                                UsernamePasswordAuthenticationFilter.class);

                return http.build();
        }

        @Bean
        public OAuth2UserService<org.springframework.security.oauth2.client.userinfo.OAuth2UserRequest, OAuth2User> oAuth2UserService() {
                return new DefaultOAuth2UserService();
        }
}
