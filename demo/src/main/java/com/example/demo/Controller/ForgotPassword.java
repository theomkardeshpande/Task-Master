package com.example.demo.Controller;

import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;

@Controller
public class ForgotPassword {

    @GetMapping("/forgotPassword")
    public String forgotPasswordPage(Model model) {
        model.addAttribute("forgotpassword", new ForgotPassword());
        return "ForgotPassword";
    }

}
