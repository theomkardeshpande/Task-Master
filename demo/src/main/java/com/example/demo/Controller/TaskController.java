package com.example.demo.Controller;

import com.example.demo.Model.Task;
import com.example.demo.Repository.TaskRepo;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.Date;
import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/tasks")
public class TaskController {

    private final TaskRepo taskRepository;

    public TaskController(TaskRepo taskRepository) {
        this.taskRepository = taskRepository;
    }

    /**
     * Endpoint to retrieve all tasks for the logged-in user.
     */
    @GetMapping("/api/tasks")
    public ResponseEntity<List<Task>> getUserTasks(@AuthenticationPrincipal UserDetails currentUser,
                                                   @RequestParam(required = false) String search) {
        String email = currentUser.getUsername();
        List<Task> tasks = taskRepository.findByUserEmail(email);

        // Optional: perform in-memory search if the "search" parameter is provided.
        if (search != null && !search.isEmpty()) {
            String searchLower = search.toLowerCase();
            tasks.removeIf(task -> !task.getTitle().toLowerCase().contains(searchLower));
        }
        return ResponseEntity.ok(tasks);
    }

    /**
     * Endpoint to add a new task.
     * Expects payload with "taskTitle" and "taskDescription".
     */
    @PostMapping
    public ResponseEntity<Task> addTask(@RequestParam("taskTitle") String title,
                                        @RequestParam("taskDescription") String description,
                                        @RequestParam("taskDate") Date completionDate,
                                        @AuthenticationPrincipal UserDetails currentUser) {
        if (title == null || title.trim().isEmpty() ||
                description == null || description.trim().isEmpty()) {
            return ResponseEntity.badRequest().build();
        }

        Task task = new Task();
        task.setTitle(title.trim());
        task.setDescription(description.trim());
        task.setCompleted(false);       // New task not completed by default.
        task.setCompletionDate(completionDate);   // Not set until completed.
        task.setUserEmail(currentUser.getUsername());

        Task savedTask = taskRepository.save(task);
        return ResponseEntity.ok(savedTask);
    }

    /**
     * Endpoint to toggle task completion status.
     */
    @PutMapping("/{id}/toggle")
    public ResponseEntity<Task> toggleTask(@PathVariable("id") int id,
                                           @AuthenticationPrincipal UserDetails currentUser) {
        Optional<Task> optTask = taskRepository.findById(id);
        if (optTask.isEmpty()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).build();
        }
        Task task = optTask.get();

        // Ensure the task belongs to the current user.
        if (!task.getUserEmail().equals(currentUser.getUsername())) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        }

        // Toggle the completion status.
        task.setCompleted(!task.isCompleted());
        if (task.isCompleted()) {
            task.setCompletionDate(new Date());
        } else {
            task.setCompletionDate(null);
        }

        Task savedTask = taskRepository.save(task);
        return ResponseEntity.ok(savedTask);
    }

    /**
     * Endpoint to delete a task.
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteTask(@PathVariable("id") int id,
                                           @AuthenticationPrincipal UserDetails currentUser) {
        Optional<Task> optTask = taskRepository.findById(id);
        if (optTask.isEmpty()) {
            return ResponseEntity.notFound().build();
        }
        Task task = optTask.get();

        // Ensure the task belongs to the current user.
        if (!task.getUserEmail().equals(currentUser.getUsername())) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        }

        taskRepository.delete(task);
        return ResponseEntity.ok().build();
    }
}