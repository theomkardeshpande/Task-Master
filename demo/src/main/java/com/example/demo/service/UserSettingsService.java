package com.example.demo.service;

import com.example.demo.dto.PreferencesRequest;
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
//        return Optional.of(settingsRepo.findByUserId(userId).orElseGet(UserSettings::new));
        Optional<UserSettings> user=settingsRepo.findByUserId(userId);
        if (user.isPresent()){
            return user;
        }else{
            createNewUserSettings(userId);
            return settingsRepo.findByUserId(userId);
        }
    }

   public void createNewUserSettings(int userId){
       UserSettings userSettings=new UserSettings(userId);
       settingsRepo.save(userSettings);
   }

//    public UserSettings saveOrUpdateSettings(int userId, UserSettings newSettings) {
//        Optional<UserSettings> existing = settingsRepo.findByUserId(userId);
//        if (existing.isPresent()) {
//            UserSettings settings = existing.get();
//            settings.setTheme(newSettings.getTheme());
//            settings.setTaskReminders(newSettings.isTaskReminders());
//            settings.setTaskSounds(newSettings.isTaskSounds());
//            settings.setDueDateReminders(newSettings.isDueDateReminders());
//            settings.setDefaultPriority(newSettings.getDefaultPriority());
//            settings.setTasksPerPage(newSettings.getTasksPerPage());
//            return settingsRepo.save(settings);
//        } else {
//            createNewUserSettings(userId);
//            return settingsRepo.save(newSettings);
//        }
//    }

    public UserSettings updatePreferences(int userId, PreferencesRequest request){
        Optional<UserSettings> existing = settingsRepo.findByUserId(userId);
        if(existing.isPresent()){
            UserSettings settings = existing.get();
            settings.setDefaultPriority(request.getDefaultPriority());
            settings.setDueDateReminders(request.isDueDateReminders());
            settings.setTaskSounds(request.isTaskSounds());
            settings.setTasksPerPage(request.getTasksPerPage());
            settings.setTheme(request.getTheme());
            return settings;
        }
        return null;
    }

    public UserSettings updateNotification(int userId,UserSettings updatedSettings){
        Optional<UserSettings> existing = settingsRepo.findByUserId(userId);
        if(existing.isPresent()){
            UserSettings settings = existing.get();
            settings.setTaskReminders(updatedSettings.isTaskReminders());
            settings.setEmailNotifications(updatedSettings.isEmailNotifications());
            return settings;
        }else{
            createNewUserSettings(userId);
            return settingsRepo.save(updatedSettings);
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
