package com.example.demo.Repository;

import com.example.demo.Model.Task;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface TaskRepo extends JpaRepository<Task, Integer> {

    List<Task> findByUserEmail(String email);
}
