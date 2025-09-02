package com.example.demo.repository;

import com.example.demo.model.UserSettings;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.List;
import java.util.Optional;


public interface UserSettingsRepo extends JpaRepository<UserSettings, Integer> {
    Optional<UserSettings> findByUserId(int userId);

    @Query("SELECT u FROM UserSettings u WHERE u.emailNotifications = true")
    List<UserSettings> getUsersWithEmailNotificationsEnabled();

    @Query("SELECT u FROM UserSettings u WHERE u.dueDateReminders = true")
    List<UserSettings> getUsersWithDueDateRemindersEnabled();

}
