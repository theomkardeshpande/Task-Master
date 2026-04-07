package com.example.demo.Service;

import com.example.demo.Model.AppUser;
import com.example.demo.Model.PasswordResetToken;
import com.example.demo.Repository.PasswordResetTokenRepo;
import com.example.demo.Repository.ResetRepo;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;

import java.util.UUID;
import org.springframework.transaction.annotation.Transactional;

@Service
public class PasswordResetService {

    @Autowired
    private ResetRepo resetRepo;

    @Autowired
    private PasswordResetTokenRepo passwordResetTokenRepo;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private JavaMailSender javaMailSender;

    @Value("${spring.mail.username:default@gmail.com}")
    private String fromEmail;

//    public String createPasswordResetToken(String userEmail,String fullname){
//        AppUser user=resetRepo.findByEmailAndFullname(userEmail,fullname);
//        if (user==null ){
//            return null;
//        }
//        String token= UUID.randomUUID().toString();
//        LocalDateTime expiryDate=LocalDateTime.now().plusHours(1);
//        PasswordResetToken resetToken=new PasswordResetToken(token,user,expiryDate);
//        passwordResetTokenRepo.save(resetToken);
//        sendResetLinkEmail(userEmail,token);
//        System.out.println("MAIL SEND");
//        return token;
//
//    }

    @Transactional
    public String createPasswordResetToken(String userEmail, String fullname) {
        AppUser user = resetRepo.findByEmailAndFullname(userEmail, fullname);
        if (user == null) {
            return null;
        }

        // ✅ Delete any existing token for this user before creating a new one
        passwordResetTokenRepo.deleteByUser(user);
        passwordResetTokenRepo.flush();

        String token = UUID.randomUUID().toString();
        LocalDateTime expiryDate = LocalDateTime.now().plusHours(1);
        PasswordResetToken resetToken = new PasswordResetToken(token, user, expiryDate);
        passwordResetTokenRepo.save(resetToken);

        sendResetLinkEmail(userEmail, token);
        System.out.println("MAIL SEND");
        return token;
    }

    private void sendResetLinkEmail(String email,String token){
        String domain=System.getenv("API_BASE_URL");
        String resetLink=domain+"/auth/reset-password?token=" + token;
        SimpleMailMessage message=new SimpleMailMessage();
        message.setFrom(fromEmail);
        message.setTo(email);
        message.setSubject("Reset Your Task Master Password");
        message.setText("To reset your password, please click the following link:\n" + resetLink);
        javaMailSender.send(message);
    }

    public boolean resetPassword(String token,String newPassword){
        PasswordResetToken resetToken = passwordResetTokenRepo.findByToken(token);
        if (resetToken==null || resetToken.getExpiryDate().isBefore(LocalDateTime.now())){
            return false;
        }
        AppUser user=resetToken.getUser();
        user.setPassword(passwordEncoder.encode(newPassword));
        resetRepo.save(user);
        passwordResetTokenRepo.delete(resetToken);
        return true;
    }

}
