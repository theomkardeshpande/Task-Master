package com.example.demo.Controller;

import com.example.demo.Model.AppUser;
import com.example.demo.Service.UserService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.validation.BindingResult;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.ModelAttribute;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.CrossOrigin;

import java.util.Map;


@Controller
public class RegisterController {

    @Autowired
    private RegisterValidator registerValidator;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private UserService userService;

    @GetMapping("/register")
    public String registerPage(Model model) {
        model.addAttribute("user", new AppUser());
        return "Signup";
    }

    @PostMapping("/register")
    public String registerUser(@Valid @ModelAttribute("user") AppUser user, BindingResult result, Model model) {
        registerValidator.validate(user, result);
        System.out.println("Validation errors: " + result.getAllErrors());
        
        if (result.hasErrors()) {
            model.addAttribute("message", "Registration Failed");
            result.getAllErrors().forEach(error -> System.out.println(error.getDefaultMessage()));
            return "Signup";
        }

        try {
            AppUser appUser = new AppUser();
            appUser.setFullname(user.getFullname());
            appUser.setEmail(user.getEmail());
            appUser.setPassword(passwordEncoder.encode(user.getPassword()));
            appUser.setRole("USER");
            appUser.setVerified(false);

            userService.registerUser(appUser);
            System.out.println("Saving user: " + appUser);
            model.addAttribute("message", "User Successfully Registered..!");
            return "redirect:/login?success=true";
        } catch (IllegalStateException e) {
            model.addAttribute("message", e.getMessage());
            return "Signup";
        }
    }

    /**
     * REST API endpoint for user registration with JSON request/response
     * @param request RegistrationRequest containing fullname, email, password
     * @return ResponseEntity with RegistrationResponse
     */
    @PostMapping("/api/register")
    @CrossOrigin(origins = "*")
    public ResponseEntity<RegistrationResponse> registerUserApi(@RequestBody RegistrationRequest request) {
        System.out.println("API Registration request - Email: " + request.getEmail());

        // Validate input
        Map<String, String> validationErrors = registerValidator.validateAndGetErrors(request);
        if (!validationErrors.isEmpty()) {
            System.out.println("Validation errors: " + validationErrors);
            RegistrationResponse response = new RegistrationResponse(false, "Validation failed", validationErrors);
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(response);
        }

        try {
            // Create new user
            AppUser appUser = new AppUser();
            appUser.setFullname(request.getFullname().trim());
            appUser.setEmail(request.getEmail().trim().toLowerCase());
            appUser.setPassword(passwordEncoder.encode(request.getPassword()));
            appUser.setRole("USER");
            appUser.setVerified(false);

            // Register the user (this will send verification email)
            userService.registerUser(appUser);
            System.out.println("User registered successfully: " + request.getEmail());

            RegistrationResponse response = new RegistrationResponse(true, 
                "Registration successful! Please check your email to verify your account.");
            return ResponseEntity.status(HttpStatus.CREATED).body(response);

        } catch (IllegalStateException e) {
            // Email already exists
            System.out.println("Registration failed: " + e.getMessage());
            RegistrationResponse response = new RegistrationResponse(false, e.getMessage());
            response.addError("email", "Email already registered");
            return ResponseEntity.status(HttpStatus.CONFLICT).body(response);

        } catch (Exception e) {
            // General exception
            System.out.println("Unexpected error during registration: " + e.getMessage());
            e.printStackTrace();
            RegistrationResponse response = new RegistrationResponse(false, 
                "Registration failed: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
        }
    }

    @GetMapping("/verify-account")
    public ResponseEntity<String> verifyAccount(@RequestParam("token") String token) {
        String result = userService.verifyAccount(token);
        if (result.startsWith("Account successfully")) {
            return ResponseEntity.ok(result);
        } else {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(result);
        }
    }

}
