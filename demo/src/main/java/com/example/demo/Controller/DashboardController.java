package com.example.demo.Controller;

import com.example.demo.Model.CustomUserDetails;
import com.example.demo.Model.Task;
import com.example.demo.Repository.TaskRepo;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.*;

import java.util.Date;
import java.util.List;

@Controller
public class DashboardController {

    private final TaskRepo taskRepository;

    public DashboardController(TaskRepo taskRepository) {
        this.taskRepository = taskRepository;
    }

    // Renders the dashboard page with tasks for the logged-in user.
    @GetMapping("/dashboard")
    public String dashboard(@AuthenticationPrincipal CustomUserDetails currentUser, Model model) {
        // Use the authenticated user's email as the unique identifier.
        String email = currentUser.getUsername();
        String full_name = currentUser.getFullname();

        // Retrieve tasks belonging to the logged-in user.
        List<Task> userTasks = taskRepository.findByUserEmail(email);
        model.addAttribute("tasks", userTasks);

        // Count tasks that are not yet completed.
        long remainingTasks = userTasks.stream().filter(task -> !task.isCompleted()).count();
        model.addAttribute("remainingTasks", remainingTasks);

        // Optionally, add user details so that the view can display them.
        model.addAttribute("userName", full_name);  // Update with real name if available.
        model.addAttribute("userEmail", email);

        // Return the dashboard view (dashboard.html)
        return "dashboard";
    }

    // Endpoint for adding a new task. This can be called via an AJAX call or a regular form submission.
    @PostMapping("/addTasks")
    @ResponseBody  // Respond with JSON (the saved Task object); remove if you wish to redirect.
    public Task addTask(@RequestParam("taskTitle") String title,
                        @RequestParam("taskDescription") String description,
                        @RequestParam("taskDate") Date completionDate,
                        @AuthenticationPrincipal UserDetails currentUser) {

        // Create a new Task instance.
        Task task = new Task();
        task.setTitle(title);
        task.setDescription(description);
        task.setCompleted(false);      // New tasks are not completed by default.
        task.setCompletionDate(completionDate);  // Not yet set.
        task.setUserEmail(currentUser.getUsername());

        // Save the task to the database.
        return taskRepository.save(task);
    }
}
