package com.example.demo.Controller;

import com.example.demo.Dto.PasswordChangeRequest;
import com.example.demo.Dto.ProfileChangeRequest;
import com.example.demo.Model.AppUser;
import com.example.demo.Repository.UserRepo;
import com.example.demo.Service.UserService;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.server.ResponseStatusException;

@RestController
@RequestMapping("/user")
public class ChangeProfileController {

    private final UserService userService;
    private final UserRepo userRepository;

    public ChangeProfileController(UserService userService,UserRepo userRepository)
    {
        this.userRepository=userRepository;
        this.userService=userService;
    }

    @PutMapping("/{userId}/profile")
    public ResponseEntity<?> changeProfile(@PathVariable int userId, @RequestBody ProfileChangeRequest request)
    {
        try{
            AppUser user=userRepository.findById(userId);
            user.setFullname(request.getFullname());
            user.setEmail(request.getEmail());
            user.setBio(request.getBio());

            return ResponseEntity.ok("Profile Information Saved");
        }catch (Exception e){
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("ERROR");
        }
    }

    @PutMapping("/{userId}/profile-picture")
    public ResponseEntity<String> uploadProfilePicture(
            @PathVariable int userId,
            @RequestParam("file") MultipartFile file) {
        try {
            AppUser user = userRepository.findById(userId);
            user.setProfilePicture(file.getBytes());

            userRepository.save(user);
            return ResponseEntity.ok("Profile picture saved in database");
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Error");
        }
    }

    @GetMapping("/{userId}/profile-picture")
    public ResponseEntity<byte[]> getProfilePicture(@PathVariable int user_id){
        AppUser user=userRepository.findById(user_id);
        try{
            if(user==null){
                throw new ResponseStatusException(HttpStatus.NOT_FOUND,"User Not Found");
            }
            byte[] image=user.getProfilePicture();

            if(image==null || image.length==0){
                return ResponseEntity.notFound().build();
            }

            HttpHeaders headers=new HttpHeaders();
            headers.setContentType(MediaType.ALL);
            headers.setContentLength(image.length);

            return new ResponseEntity<>(image,headers,HttpStatus.OK);
        }catch (Exception e)
        {
            System.out.println(e.toString());
        }
    }

    @PutMapping("/{userId}/change-password")
    public ResponseEntity<?> changePassword(
            @PathVariable int userId,
            @RequestBody PasswordChangeRequest request
            )
    {
        try{
            userService.changePassword(userId,request);
            return ResponseEntity.ok("Password is Updated Successfully");
        }catch (RuntimeException e){
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }
}
