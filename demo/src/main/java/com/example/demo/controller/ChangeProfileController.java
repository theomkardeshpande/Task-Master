package com.example.demo.controller;

import com.example.demo.dto.PasswordChangeRequest;
import com.example.demo.dto.ProfileChangeRequest;
import com.example.demo.model.AppUser;
import com.example.demo.repository.UserRepo;
import com.example.demo.service.UserService;
import org.springframework.core.io.Resource;
import org.springframework.http.*;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.server.ResponseStatusException;

@RestController
@RequestMapping("/user")
public class ChangeProfileController {

    private final UserService userService;
    private final UserRepo userRepository;

    public ChangeProfileController(UserService userService, UserRepo userRepository) {
        this.userRepository = userRepository;
        this.userService = userService;
    }

    @PutMapping("/{userId}/profile")
    public ResponseEntity<?> changeProfile(@PathVariable int userId, @RequestBody ProfileChangeRequest request) {
        try {
            userService.updatedProfileResponse(userId,request);
            return ResponseEntity.ok("Profile Information Saved");
        } catch (Exception e) {
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
    public ResponseEntity<byte[]> getProfilePicture(@PathVariable("userId") int userId) {
        AppUser userOpt = userRepository.findById(userId);
        if (userOpt==null) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "User Not Found");
        }

        byte[] image = userOpt.getProfilePicture();
        if (image == null || image.length == 0) {
            return ResponseEntity.notFound().build();
        }

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.IMAGE_JPEG); // Or correct type (IMAGE_PNG, etc)
        headers.setContentLength(image.length);

        return new ResponseEntity<>(image, headers, HttpStatus.OK);
    }


    @PutMapping("/{userId}/change-password")
    public ResponseEntity<String> changePassword(
            @PathVariable int userId,
            @RequestBody PasswordChangeRequest request
    ) {
        try {
            String response=userService.changePassword(userId, request);
            if(response.equals("Password is updated")){
                return ResponseEntity.ok("Password is Updated Successfully");
            }else {
                return ResponseEntity.badRequest().body(response);
            }
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @DeleteMapping("/{userId}/delete-account")
    public ResponseEntity<String> deleteAccount(@PathVariable int userId){
        String email=userService.deleteAccount(userId);
        if(email==null){
            return ResponseEntity.badRequest().body("User Not Found");
        }else {
            return ResponseEntity.ok(email+" User Account is deleted");
        }
    }

    @GetMapping("/{userId}/export-data")
    public ResponseEntity<?> exportData(@PathVariable int userId) throws Exception {
        Resource resource = userService.exportUserData(userId); // returns ByteArrayResource
        String filename = "user-" + userId + "-export.json";

        return ResponseEntity.ok()
                .contentType(MediaType.APPLICATION_JSON) // tell client it's JSON
                .header(HttpHeaders.CONTENT_DISPOSITION,
                        ContentDisposition.attachment().filename(filename).build().toString()) // download as file
                .body(resource);
    }
}
