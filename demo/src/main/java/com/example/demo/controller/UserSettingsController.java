package com.example.demo.controller;

import com.example.demo.model.UserSettings;
import com.example.demo.service.UserSettingsService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

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

    @PutMapping("/{userId}")
    public ResponseEntity<UserSettings> updateSettings(@PathVariable int userId,
                                                       @RequestBody UserSettings settings) {
        UserSettings updated = settingsService.saveOrUpdateSettings(userId, settings);
        return ResponseEntity.ok(updated);
    }

    @PutMapping("/notification/{userId}")
    public ResponseEntity<UserSettings> updateSettings(@PathVariable int userId,
                                                       @RequestBody Map<String, Object> updates) {
        UserSettings settings = settingsService.getSettingsByUserId(userId)
                .orElse(new UserSettings(userId));

        if (updates.containsKey("emailNotifications")) {
            settings.setEmailNotifications((boolean) updates.get("emailNotifications"));
        }
        if (updates.containsKey("dueDateReminders")) {
            settings.setDueDateReminders((boolean) updates.get("dueDateReminders"));
        }
        return ResponseEntity.ok(settingsService.saveOrUpdateSettings(userId, settings));
    }

}
