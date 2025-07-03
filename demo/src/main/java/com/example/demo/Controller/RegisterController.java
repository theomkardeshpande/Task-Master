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
import org.springframework.web.bind.annotation.RequestParam;


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
    }

    @GetMapping("/verify-account")
    public ResponseEntity<String> verifyAccount(@RequestParam("token") String token) {
        String result = userService.verifyAccount(token);
        if (result.startsWith("Success")) {
            return ResponseEntity.ok(result);
        } else {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(result);
        }
    }

}
