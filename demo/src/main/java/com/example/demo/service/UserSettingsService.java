package com.example.demo.service;

import com.example.demo.model.AppUser;
import com.example.demo.model.UserSettings;
import com.example.demo.repository.UserRepo;
import com.example.demo.repository.UserSettingsRepo;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class UserSettingsService {
    private final UserSettingsRepo settingsRepo;
    private final UserRepo userRepo;

    public UserSettingsService(UserSettingsRepo settingsRepo, UserRepo userRepo) {
        this.settingsRepo = settingsRepo;
        this.userRepo=userRepo;
    }

    public Optional<UserSettings> getSettingsByUserId(int userId) {
        return settingsRepo.findByUserId(userId);
    }

    public UserSettings saveOrUpdateSettings(int userId, UserSettings newSettings) {
        Optional<UserSettings> existing = settingsRepo.findByUserId(userId);
        if (existing.isPresent()) {
            UserSettings settings = existing.get();
            settings.setTheme(newSettings.getTheme());
            settings.setTaskSounds(newSettings.isTaskSounds());
            settings.setDueDateReminders(newSettings.isDueDateReminders());
            settings.setDefaultPriority(newSettings.getDefaultPriority());
            settings.setTasksPerPage(newSettings.getTasksPerPage());
            return settingsRepo.save(settings);
        } else {
            newSettings.setUserId(userId);
            return settingsRepo.save(newSettings);
        }
    }

    public List<UserSettings> getUsersWithEmailNotificationsEnabled() {
        return settingsRepo.getUsersWithEmailNotificationsEnabled();
    }

    public List<UserSettings> getUsersWithDueDateRemindersEnabled() {
        return settingsRepo.getUsersWithDueDateRemindersEnabled();
    }

    public String getUserEmailById(int userId) {
        AppUser user = userRepo.findById(userId);
        return user != null ? user.getEmail() : null;
    }


}
