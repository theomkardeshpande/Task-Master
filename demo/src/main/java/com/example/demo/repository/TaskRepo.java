package com.example.demo.repository;

import com.example.demo.model.Task;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

public interface TaskRepo extends JpaRepository<Task, Integer> {

    List<Task> findByUserEmail(String email);

    @Query("SELECT t FROM Task t " +
            "WHERE t.id = :userId " +
            "AND t.dueDate BETWEEN :startDate AND :endDate " +
            "AND t.completed = FALSE")
    List<Task> findTasksDueWithinDateRange(
            @Param("userId") int userId,
            @Param("startDate") LocalDate startDate,
            @Param("endDate") LocalDate endDate
    );

}
