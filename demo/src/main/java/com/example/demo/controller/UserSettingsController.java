package com.example.demo.controller;

import com.example.demo.dto.PreferencesRequest;
import com.example.demo.model.UserSettings;
import com.example.demo.service.UserSettingsService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/settings")
public class UserSettingsController {

    private final UserSettingsService settingsService;

    public UserSettingsController(UserSettingsService settingsService) {
        this.settingsService = settingsService;
    }

    @GetMapping("/{userId}")
    public ResponseEntity<UserSettings> getSettings(@PathVariable int userId) {
        return settingsService.getSettingsByUserId(userId)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

//    @PutMapping("/{userId}")
//    public ResponseEntity<UserSettings> updateSettings(@PathVariable int userId,
//                                                       @RequestBody UserSettings settings) {
//        UserSettings updated = settingsService.saveOrUpdateSettings(userId, settings);
//        return ResponseEntity.ok(updated);
//    }

    @PutMapping("/preferences/{userId}")
    public ResponseEntity<UserSettings> updatePreferences(@PathVariable int userId,@RequestBody PreferencesRequest request){
        UserSettings updated=settingsService.updatePreferences(userId,request);
        if(updated==null){
//            ResponseEntity.badRequest().build();
            System.out.println("UPDATED IS NULL");
        }
        return ResponseEntity.ok(updated);
    }

    @PutMapping("/notification/{userId}")
    public ResponseEntity<UserSettings> updateNotification(@PathVariable int userId,@RequestBody UserSettings userSettings){
        UserSettings updated=settingsService.updateNotification(userId,userSettings);
        if(updated==null){
            ResponseEntity.badRequest().build();
        }
        return ResponseEntity.ok(updated);
    }

}
