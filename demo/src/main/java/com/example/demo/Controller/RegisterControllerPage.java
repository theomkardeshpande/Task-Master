package com.example.demo.Controller;

import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;

@Controller
@RequestMapping("/auth")
public class RegisterControllerPage {
    
    @GetMapping("/register")
    public String showRegisterationPage(){
        return "register";
    }
}
