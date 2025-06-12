package com.example.demo.Controller;

import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;

@Controller
public class ForgetPassword {

    @GetMapping("/forgot-password")
    public String forgotPasswordPage() {
        return "forgot-password";
    }
}
