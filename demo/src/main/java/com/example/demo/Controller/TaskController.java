package com.example.demo.Controller;

import com.example.demo.Model.CustomUserDetails;
import com.example.demo.Model.Task;
import com.example.demo.Model.TaskRequest;
import com.example.demo.Repository.TaskRepo;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api")
public class TaskController {

    private final TaskRepo taskRepository;

    public TaskController(TaskRepo taskRepository) {
        this.taskRepository = taskRepository;
    }

    /**
     * Endpoint to retrieve all tasks for the logged-in user.
     */
    @GetMapping("/showAllTasks")
    public ResponseEntity<List<Task>> getUserTasks(@AuthenticationPrincipal CustomUserDetails currentUser,
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
    @PostMapping("/addTask")
    public ResponseEntity<?> addTask(@RequestBody TaskRequest taskRequest, @AuthenticationPrincipal CustomUserDetails userDetails) {
        if (taskRequest.getTaskTitle() == null || taskRequest.getTaskDescription() == null || taskRequest.getCompletionDate() == null) {
            return ResponseEntity.badRequest().build();
        }
        Task task = new Task();
        task.setTitle(taskRequest.getTaskTitle());
        task.setDescription(taskRequest.getTaskDescription());
        task.setCompleted(false);
        task.setCompletionDate(taskRequest.getCompletionDate());
        task.setUserEmail(userDetails.getUsername());

        Task savedTask = taskRepository.save(task);

        return ResponseEntity.ok(savedTask);
    }


    /**
     * Endpoint to toggle task completion status.
     */
    @PutMapping("/tasks/toggle/{task_id}")
    public ResponseEntity<Task> toggleTask(@PathVariable("task_id") int id,
                                           @AuthenticationPrincipal UserDetails currentUser) {
        Optional<Task> optTask = taskRepository.findById(id);
        if (optTask.isEmpty()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).build();
        }

        Task task = optTask.get();

        // Ensure the task belongs to the authenticated user
        if (!task.getUserEmail().equals(currentUser.getUsername())) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        }

        // Toggle the completion status and update the completion date
        boolean newCompletionStatus = !task.isCompleted();
        task.setCompleted(newCompletionStatus);
        task.setCompletionDate(newCompletionStatus ? LocalDateTime.now() : null);

        // Save the updated task
        Task savedTask = taskRepository.save(task);
        return ResponseEntity.ok(savedTask);
    }

    /**
     * Endpoint to delete a task.
     */
    @DeleteMapping("/tasks/{taskId}")
    public ResponseEntity<Void> deleteTask(@PathVariable("taskId") int id,
                                           @AuthenticationPrincipal CustomUserDetails currentUser) {
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