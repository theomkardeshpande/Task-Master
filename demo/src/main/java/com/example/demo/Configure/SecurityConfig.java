package com.example.demo.Configure;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.config.annotation.authentication.builders.AuthenticationManagerBuilder;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;

@Configuration
public class SecurityConfig {

    private final UserDetailsService userDetailsService;

        private final CustomAuthFailureHandler customAuthFailureHandler;

        public SecurityConfig(UserDetailsService userDetailsService, CustomAuthFailureHandler customAuthFailureHandler) {
            this.userDetailsService = userDetailsService;
            this.customAuthFailureHandler = customAuthFailureHandler;
        }

        @Bean
        public PasswordEncoder passwordEncoder() {
                return new BCryptPasswordEncoder(10);
        }

        @Bean
        public AuthenticationManager authenticationManager(HttpSecurity http) throws Exception {

                // 1. Grab the shared builder that Spring creates for this HttpSecurity instance
                AuthenticationManagerBuilder builder = http.getSharedObject(AuthenticationManagerBuilder.class);

                builder.userDetailsService(userDetailsService).passwordEncoder(passwordEncoder());
//                // 2. Configure JDBC authentication on that builder
//                builder.jdbcAuthentication()
//                                .dataSource(dataSource)
//                                .usersByUsernameQuery(
//                                                "SELECT email AS principal, password AS credentials, TRUE "
//                                                                + "FROM app_user WHERE email = ?")
//                                .authoritiesByUsernameQuery(
//                                                "SELECT email AS principal, role " + "FROM app_user WHERE email = ?")
//                                .passwordEncoder(passwordEncoder()) // BCrypt, etc.
//                                .rolePrefix("ROLE_"); // Spring expects roles to start with ROLE_

                // 3. Finally build the AuthenticationManager and return it
                return builder.build();
        }

        @Bean
        public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
                http
                                .authorizeHttpRequests(auth -> auth
                                                .requestMatchers("/login", "/register", "/static/**", "/", "/css/**",
                                                                "/js/**", "/api/**", "/auth/**", "/forgot-password",
                                                                "/actuator/prometheus", "/verify-account")
                                                .permitAll()
                                                .anyRequest().authenticated())
                                .formLogin(form -> form
                                                .loginPage("/login")
                                                .usernameParameter("email")
                                                .passwordParameter("password")
                                                .failureHandler(customAuthFailureHandler)
                                                .defaultSuccessUrl("/dashboard", true)
//                                                .failureUrl("/login?error=true")
                                                .permitAll())
                                .logout(logout -> logout
                                                .logoutUrl("/logout")
                                                .logoutSuccessUrl("/login?logout=true")
                                                .invalidateHttpSession(true)
                                                .deleteCookies("JSESSIONID")
                                                .permitAll());
                http.csrf(AbstractHttpConfigurer::disable);
                return http.build();
        }
}
