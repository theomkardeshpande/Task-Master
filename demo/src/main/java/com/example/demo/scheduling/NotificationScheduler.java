package com.example.demo.scheduling;

import com.example.demo.model.Task;
import com.example.demo.model.UserSettings;
import com.example.demo.service.EmailService;
import com.example.demo.service.NotificationService;
import com.example.demo.service.TaskService;
import com.example.demo.service.UserSettingsService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

import java.time.Duration;
import java.util.List;

@Component
public class NotificationScheduler {

    private static final Logger logger = LoggerFactory.getLogger(NotificationScheduler.class);

    private final UserSettingsService userSettingsService;
    private final TaskService taskService;
    private final EmailService emailService;
    private final NotificationService notificationService;

    @Value("${app.url}")
    private String appUrl;

    public NotificationScheduler(UserSettingsService userSettingsService,
                                 TaskService taskService,
                                 EmailService emailService,
                                 NotificationService notificationService) {
        this.userSettingsService = userSettingsService;
        this.taskService = taskService;
        this.emailService = emailService;
        this.notificationService = notificationService;
    }

    // Email notifications - runs every hour at minute 0
    @Scheduled(cron = "${spring.task.scheduling.email-cron}")
    public void sendEmailNotifications() {
        logger.info("Starting email notification job");

        try {
            List<UserSettings> users = userSettingsService.getUsersWithEmailNotificationsEnabled();
            logger.info("Found {} users with email notifications enabled", users.size());

            for (UserSettings settings : users) {
                int userId = settings.getUserId();

                List<Task> upcomingTasks = taskService.getTasksDueWithin(userId, Duration.ofHours(24));
                if (upcomingTasks.isEmpty()) {
                    continue;
                }

                String userEmail = userSettingsService.getUserEmailById(userId);
                if (userEmail != null) {
                    String emailContent = buildEmailBody(upcomingTasks);
                    emailService.sendEmailAsync(userEmail, "Your Upcoming Tasks Reminder", emailContent);
                    logger.info("Sent email notification to user {} with {} tasks", userId, upcomingTasks.size());
                }
            }
        } catch (Exception e) {
            logger.error("Error in email notification job", e);
        }
    }

    // Task reminders - runs every 15 minutes
    @Scheduled(cron = "${spring.task.scheduling.reminder-cron}")
    public void sendTaskReminders() {
        logger.info("Starting task reminder job");

        try {
            List<UserSettings> users = userSettingsService.getUsersWithDueDateRemindersEnabled();
            logger.info("Found {} users with task reminders enabled", users.size());

            for (UserSettings settings : users) {
                int userId = settings.getUserId();
                List<Task> soonDueTasks = taskService.getTasksDueWithin(userId, Duration.ofMinutes(30));

                for (Task task : soonDueTasks) {
                    String message = String.format("Task '%s' is due soon! Due date: %s",
                            task.getTitle(), task.getDueDate());
                    notificationService.sendInAppReminder(userId, message);
                    logger.info("Sent reminder for task {} to user {}", task.getId(), userId);
                }
            }
        } catch (Exception e) {
            logger.error("Error in task reminder job", e);
        }
    }

    private String buildEmailBody(List<Task> tasks) {

        StringBuilder sb = new StringBuilder();
        sb.append("<h2>Your Upcoming Tasks</h2>");
        sb.append("<p>You have ").append(tasks.size()).append(" tasks due in the next 24 hours:</p>");
        sb.append("<ul>");

        for (Task task : tasks) {
            sb.append("<li><strong>").append(task.getTitle()).append("</strong>");
            sb.append(" - Due: ").append(task.getDueDate());
            sb.append(" (Priority: ").append(task.getPriority()).append(")");
            sb.append("</li>");
        }

        sb.append("</ul>");
        sb.append("<p>Please complete them on time to stay organized!</p>");
        sb.append("<p>Visit our dashboard: ")
                .append("<a href=\"").append(appUrl)
                .append("\" target=\"_blank\">TaskMaster Dashboard</a></p>");
        return sb.toString();
    }
}
