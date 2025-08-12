package com.example.demo.service;

import com.example.demo.model.Task;
import com.example.demo.repository.TaskRepo;
import org.springframework.stereotype.Service;

import java.time.Duration;
import java.time.LocalDate;
import java.util.List;

@Service
public class TaskService {

    private final TaskRepo taskRepository;

    public TaskService(TaskRepo taskRepository) {
        this.taskRepository = taskRepository;
    }

    public List<Task> getTasksDueWithin(int userId, Duration duration) {
        LocalDate today = LocalDate.now();
        LocalDate endDate = today.plusDays(duration.toDays() + 1);

        return taskRepository.findTasksDueWithinDateRange(userId, today, endDate);
    }

    // Your existing task methods...
}
