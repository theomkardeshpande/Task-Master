package com.example.demo.Controller;

import com.example.demo.Dto.TaskRequest;
import com.example.demo.Dto.UpdateTaskRequest;
import com.example.demo.Model.CustomUserDetails;
import com.example.demo.Model.Task;
import com.example.demo.Repository.TaskRepo;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;

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
    public ResponseEntity<?> addTask(@RequestBody TaskRequest taskRequest,
            @AuthenticationPrincipal CustomUserDetails userDetails) {
        if (taskRequest.getTitle() == null || taskRequest.getDescription() == null
                || taskRequest.getDueDate() == null) {
            return ResponseEntity.badRequest().build();
        }
        Task task = new Task();
        task.setTitle(taskRequest.getTitle());
        task.setDescription(taskRequest.getDescription());
        task.setPriority(taskRequest.getPriority());
        task.setCreatedDate(taskRequest.getCreatedDate());
        task.setCompleted(false);
        task.setDueDate(taskRequest.getDueDate());
        task.setUserEmail(userDetails.getUsername());

        Task savedTask = taskRepository.save(task);

        return ResponseEntity.ok(savedTask);
    }

    /**
     * Endpoint to toggle task completion status.
     */
    @PutMapping("/tasks/{task_id}")
    public ResponseEntity<Task> toggleTask(@PathVariable("task_id") int id,
            @AuthenticationPrincipal CustomUserDetails currentUser) {
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
        task.setDueDate(newCompletionStatus ? LocalDate.now() : null);

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

    @PutMapping("/tasks/updateTask")
    public ResponseEntity<Task> updateTask(@RequestBody UpdateTaskRequest updateRequest,
    @AuthenticationPrincipal CustomUserDetails currentUser){
        
        Optional<Task> optTask = taskRepository.findById(updateRequest.getTaskId());
        if (optTask.isEmpty()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).build();
        }

        Task task = optTask.get();

        // Ensure the task belongs to the authenticated user
        if (!task.getUserEmail().equals(currentUser.getUsername())) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        }

        task.setTitle(updateRequest.getTitle());
        task.setDescription(updateRequest.getDescription());
        task.setDueDate(updateRequest.getDueDate());
        task.setPriority(updateRequest.getPriority());

        Task updatedSaved=taskRepository.save(task);
        return ResponseEntity.ok(updatedSaved);
    }

}