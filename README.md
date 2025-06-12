# ToDo_ListApp

## Description

ToDo_ListApp is a web-based task management application built using Java and the Spring Boot framework. It provides users with a platform to create, organize, and track their tasks efficiently. The application offers features such as user authentication, task creation, modification, deletion, and the ability to mark tasks as complete. It also supports password reset functionality and basic user profile management.

## Features and Functionality

*   **User Authentication:** Secure user registration and login using Spring Security. Utilizes BCrypt password encoding.
*   **Task Management:**
    *   Create, read, update, and delete tasks.
    *   Mark tasks as complete.
    *   Search tasks by title.
    *   Filter tasks (all, active, completed).
*   **Password Reset:**  Users can request a password reset via email.  A token is generated and emailed to the user, allowing them to reset their password.
*   **User Profile:**  Basic user profile display (fullname, email).
*   **Theme Settings**: Dark/Light mode and color customization.
*   **Reminders**: Option to set up task reminders (email, SMS, push notifications - though SMS functionality might require additional setup).

## Technology Stack

*   **Java:**  Primary programming language.
*   **Spring Boot:**  Framework for building the application.
*   **Spring Security:**  For authentication and authorization.  `demo/src/main/java/com/example/demo/Configure/SecurityConfig.java` configures the security settings.
*   **JPA/Hibernate:** For database interaction.
*   **Thymeleaf:**  Template engine for rendering dynamic HTML pages.
*   **BCrypt:**  Password encoder. Configured in `demo/src/main/java/com/example/demo/Configure/SecurityConfig.java`.
*   **MySQL (assumed):** The application is configured for JDBC authentication, implying a relational database.  The `SecurityConfig.java` uses a `DataSource`, suggesting MySQL or PostgreSQL could be used with appropriate configuration.
*   **HTML, CSS, JavaScript:** Front-end technologies.
*   **Bootstrap:** CSS framework for styling.

## Prerequisites

Before you begin, ensure you have met the following requirements:

*   **Java Development Kit (JDK):** Version 17 or higher is recommended.
*   **Maven:**  Build automation tool.
*   **MySQL Database:**  A MySQL database server should be installed and running.
*   **An email server (e.g. Gmail):** Required for password reset functionality.
*   **Basic knowledge of Spring Boot, JPA, and Thymeleaf.**

## Installation Instructions

1.  **Clone the repository:**

    ```bash
    git clone https://github.com/theomkardeshpande/ToDo_ListApp
    cd ToDo_ListApp
    ```

2.  **Configure the Database:**

    *   Create a database named `todo_db` (or any name of your choice).
    *   Update the `src/main/resources/application.properties` file with your database credentials.  For example:

        ```properties
        spring.datasource.url=jdbc:mysql://localhost:3306/todo_db?useSSL=false&serverTimezone=UTC
        spring.datasource.username=your_username
        spring.datasource.password=your_password
        spring.jpa.hibernate.ddl-auto=update  # or create if the database is empty
        spring.jpa.properties.hibernate.dialect = org.hibernate.dialect.MySQL8Dialect  # Ensure the correct dialect is set
        spring.mail.host=smtp.gmail.com
        spring.mail.port=587
        spring.mail.username=your_email@gmail.com
        spring.mail.password=your_email_password
        spring.mail.properties.mail.smtp.auth=true
        spring.mail.properties.mail.smtp.starttls.enable=true

        ```

        **Important:** Replace `your_username`, `your_password`, `your_email@gmail.com`, and `your_email_password` with your actual database and email credentials.  For Gmail, you might need to enable "Less secure app access" or use an App Password.

3.  **Build the application:**

    ```bash
    mvn clean install
    ```

4.  **Run the application:**

    ```bash
    mvn spring-boot:run
    ```

    Alternatively, you can run the packaged jar file:

    ```bash
    java -jar demo/target/demo-0.0.1-SNAPSHOT.jar
    ```

    The application will start on `http://localhost:8080`.  You might need to adjust the port in `application.properties` using `server.port=8081` if port 8080 is already in use.

## Usage Guide

1.  **Access the application:** Open your web browser and navigate to `http://localhost:8080`.
2.  **Registration:** If you don't have an account, click on the "Sign Up" link and fill in the registration form (`/register`). The `RegisterValidator` (`demo/src/main/java/com/example/demo/Controller/RegisterValidator.java`) enforces email and password validation.
3.  **Login:**  Enter your registered email and password on the login page (`/login`).  The `SecurityConfig.java` configures form-based login.
4.  **Dashboard:**  After successful login, you will be redirected to the dashboard (`/dashboard`), where you can view, add, edit and manage your tasks.
5.  **Adding Tasks:** Click the "Add New Task" button to open the task creation modal. Fill in the title, description, and completion date.  Click "Add Task" to save the task.
6.  **Managing Tasks:**
    *   **Toggle Completion:**  Click the checkbox next to a task to mark it as complete or incomplete.
    *   **Edit Task:**  Click the edit icon to modify the task details.
    *   **Delete Task:**  Click the delete icon to remove a task.
    *   **Search:** Use the search bar to filter tasks by title.
    *   **Filter:** Use the filter buttons (All Tasks, Active, Completed) to view tasks based on their status.
7.  **Settings:** Access the settings page from the sidebar (`/settings`). Here you can change the theme (light/dark) and the color scheme.
8.  **Forgot Password:** If you forget your password, click the "Forgot password?" link on the login page (`/forgot-password`). Enter your email address and full name.  A password reset link will be sent to your email.
9.  **Reset Password:** Click the reset link in the email. Enter your new password on the reset password page (`/auth/reset-password`).

## API Documentation

The application exposes the following REST API endpoints under the `/api` path.  Authentication is required for these endpoints.

*   **`GET /api/showAllTasks`:** Retrieves all tasks for the logged-in user.  Accepts an optional `search` query parameter for filtering tasks by title.  Requires authentication. Returns a JSON array of `Task` objects.

    Example Response:

    ```json
    [
      {
        "task_id": 1,
        "title": "Grocery Shopping",
        "description": "Buy groceries for the week",
        "isCompleted": false,
        "completionDate": "2024-01-28T18:00:00.000",
        "userEmail": "user@example.com"
      },
      {
        "task_id": 2,
        "title": "Pay Bills",
        "description": "Pay electricity and internet bills",
        "isCompleted": true,
        "completionDate": "2024-01-27T12:00:00.000",
        "userEmail": "user@example.com"
      }
    ]
    ```

*   **`POST /api/addTask`:** Adds a new task. Requires a JSON payload with `taskTitle`, `taskDescription`, and `completionDate`.  Requires authentication.

    Request Body Example:

    ```json
    {
      "taskTitle": "New Task Title",
      "taskDescription": "New task description",
      "completionDate": "2024-02-01T00:00:00.000Z"
    }
    ```

    Response: Returns the saved `Task` object.

*   **`PUT /api/tasks/toggle/{task_id}`:** Toggles the completion status of a task.  Requires authentication.

    Example: `PUT /api/tasks/toggle/1`

    Response: Returns the updated `Task` object.

*   **`DELETE /api/tasks/{taskId}`:** Deletes a task. Requires authentication.

    Example: `DELETE /api/tasks/1`

    Response: Returns a 200 OK status on success.

*   **`PUT /api/tasks/updateTask`:** Updates an existing task.

    Request Body Example:

    ```json
    {
      "taskTitle": "Updated Task Title",
      "taskDescription": "Updated task description",
      "completionDate": "2024-02-02T00:00:00.000Z"
    }
    ```

    Response: Returns the updated `Task` object.

*   **`GET /user/profile`**: Retrieves the user profile information (fullname, email) for the currently authenticated user. Requires authentication. Returns a JSON object.

    Example Response:

    ```json
    {
      "fullname": "John Doe",
      "email": "john@example.com"
    }
    ```

## Contributing Guidelines

Contributions are welcome! To contribute to the project, please follow these steps:

1.  Fork the repository.
2.  Create a new branch for your feature or bug fix.
3.  Implement your changes.
4.  Commit your changes with descriptive commit messages.
5.  Push your branch to your forked repository.
6.  Submit a pull request to the `NewMaster` branch of the original repository.

## License Information

No license has been specified for this project. All rights are reserved by the owner.

## Contact/Support Information

For questions, support, or feature requests, please contact: theomkardeshpande@example.com (replace with the actual email).