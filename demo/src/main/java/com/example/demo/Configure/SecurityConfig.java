package com.example.demo.Configure;

import com.example.demo.Security.JwtAuthenticationEntryPoint;
import com.example.demo.Security.JwtAuthenticationFilter;

import javax.sql.DataSource;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.AuthenticationManagerResolver;

import org.springframework.security.config.annotation.authentication.builders.AuthenticationManagerBuilder;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;

import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;

import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.config.http.SessionCreationPolicy;

import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;

import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;

@Configuration
@EnableWebSecurity
@EnableMethodSecurity
public class SecurityConfig {

    private final DataSource dataSource;
    private final JwtAuthenticationEntryPoint unauthorizedHandler;
    private final JwtAuthenticationFilter jwtAuthenticationFilter;

    // Constructor Injection (prefer this over @Autowired on fields)
    public SecurityConfig(
            DataSource dataSource,
            JwtAuthenticationEntryPoint unauthorizedHandler,
            JwtAuthenticationFilter jwtAuthenticationFilter) {
        this.dataSource = dataSource;
        this.unauthorizedHandler = unauthorizedHandler;
        this.jwtAuthenticationFilter = jwtAuthenticationFilter;
    }

    /**
     * Password encoder bean - using BCrypt
     */
    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    /**
     * Configures the AuthenticationManager with JDBC authentication using the dataSource.
     */
    @Bean
    public AuthenticationManager authenticationManager(HttpSecurity http, PasswordEncoder passwordEncoder) throws Exception {
        AuthenticationManagerBuilder authBuilder = http.getSharedObject(AuthenticationManagerBuilder.class);
        
        authBuilder.jdbcAuthentication()
            .dataSource(dataSource)
            .usersByUsernameQuery(
                "SELECT email AS principal, password AS credentials, TRUE FROM app_user WHERE email = ?")
            .authoritiesByUsernameQuery(
                "SELECT email AS principal, role FROM app_user WHERE email = ?")
            .rolePrefix("ROLE_")
            .passwordEncoder(passwordEncoder);

        return authBuilder.build();
    }

    /**
     * Defines the security filter chain - core part of Spring Security config.
     */
    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
            // Disable CSRF for stateless JWT APIs
            .csrf(AbstractHttpConfigurer::disable)
            
            // Exception handling for unauthorized requests
            .exceptionHandling(handler -> handler.authenticationEntryPoint(unauthorizedHandler))
            
            // Set permissions on endpoints
            .authorizeHttpRequests(auth -> auth
                // Public endpoints (adjust as needed)
                .requestMatchers(
                        "/auth/**",
                        "/static/**",
                        "/",
                        "/templates/**",
                        "/css/**",
                        "/js/**",
                        "/api/**",
                        "/forgot-password",
                        "/actuator/prometheus").permitAll()
                // Any other request requires authentication
                .anyRequest().authenticated())
            
            // Set session management to stateless (no HttpSession)
            .sessionManagement(session -> session
                .sessionCreationPolicy(SessionCreationPolicy.STATELESS));

        // Add JWT filter before the default UsernamePasswordAuthenticationFilter
        http.addFilterBefore(jwtAuthenticationFilter, UsernamePasswordAuthenticationFilter.class);

        /*
         * Optional:
         * Uncomment and customize the following if you want to add formLogin or logout support alongside JWT.
         *
         * .formLogin(form -> form
         *     .loginPage("/login")
         *     .usernameParameter("email")
         *     .passwordParameter("password")
         *     .defaultSuccessUrl("/dashboard", true)
         *     .failureUrl("/login?error=true")
         *     .permitAll())
         * .logout(logout -> logout.permitAll())
         */

        return http.build();
    }
}
