# EndoPrev - Spring Boot Demo

This repository contains the demo application for **EndoPrev**, a platform designed to connect endometriosis patients with researchers in the field.

---

## Technologies & Built With

- **Java (JDK):** `25`
- **Spring Boot:** `4.1.1`
- **Gradle Wrapper:** `9.8.1`
- **Project version:** `0.1.1`

## Requirements

- **JDK 25**
- No installed Gradle is necessary: the project uses the **Gradle Wrapper**.


## Build the Project

Compile and build the application:

**Windows:**
```cmd
gradlew.bat clean build
```

**Linux / macOS:**

```bash
./gradlew clean build
```

## Execute Tests

Run the test suite:

**Windows:**

```cmd
gradlew.bat test
```

**Linux / macOS:**

```bash
./gradlew test
```

## Launch the Application

Start the embedded Spring Boot server:

**Windows:**

```cmd
gradlew.bat bootRun
```

**Linux / macOS:**

```bash
./gradlew bootRun
```

The application will be available at: [http://localhost:8080](http://localhost:8080)

## Generate & Run the JAR

Generate the executable JAR file:

**Windows:**

```cmd
gradlew.bat bootJar
```

**Linux / macOS:**

```bash
./gradlew bootJar
```

The executable JAR will be located in `build/libs/`.

To execute it:

```bash
java -jar build/libs/demo-0.1.1.jar
```

## Verify the Build

After running the build, the generated files can be found in:

- `build/libs/` for JAR files
- `build/reports/tests/test/index.html` for the test report

## Project Structure

- `build.gradle.kts`: Gradle build configuration
- `gradle/`: Gradle Wrapper configuration
- `src/main/java/`: Java source code
- `src/main/resources/templates/`: Thymeleaf HTML templates
- `src/main/resources/static/`: CSS, JavaScript and images
- `src/test/`: automated tests

## Configuration & Setup

Application properties can be configured in `src/main/resources/application.properties`.

The application requires environment variables for mail server authentication, as well as PostgreSQL database configuration.
| Variable | Description | Example |
| :--- | :--- | :--- |
| `MAIL_USERNAME` | SMTP server username or sender email address | `user@example.com` |
| `MAIL_PASSWORD` | SMTP password, App Password, or API Key | `your-secret-password` |
| `DB_PASSWORD` | PostgreSQL database password | `my_db_password` |

If you want to use the same database system as the system, create in PostgreSQL a database called auth_demo with the username `postgres` on the local port **5432**

If you use another database system you must change the variables that start with `spring.datasource`

## Dependency Management

All dependencies, plugins, and project metadata are declared inside `build.gradle.kts`.

## Author

Developed and maintained by **Caron**.
