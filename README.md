# EndoPrev - Spring Boot Demo

This repository contains the demo application for **EndoPrev**, a platform designed to connect endometriosis patients with researchers in the field.

The Spring Boot application is located in the [`demo/`](demo/) directory. The commands below are intended to be run from the repository root.

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
demo\gradlew.bat clean build
```

**Linux / macOS:**

```bash
./demo/gradlew clean build
```

## Execute Tests

Run the test suite:

**Windows:**

```cmd
demo\gradlew.bat test
```

**Linux / macOS:**

```bash
./demo/gradlew test
```

## Launch the Application

Start the embedded Spring Boot server:

**Windows:**

```cmd
demo\gradlew.bat bootRun
```

**Linux / macOS:**

```bash
./demo/gradlew bootRun
```

The application will be available at: [http://localhost:8080](http://localhost:8080)

## Generate & Run the JAR

Generate the executable JAR file:

**Windows:**

```cmd
demo\gradlew.bat bootJar
```

**Linux / macOS:**

```bash
./demo/gradlew bootJar
```

The executable JAR will be located in `demo/build/libs/`.

To execute it:

```bash
java -jar demo/build/libs/demo-0.1.1.jar
```

## Verify the Build

After running the build, the generated files can be found in:

- `demo/build/libs/` for JAR files
- `demo/build/reports/tests/test/index.html` for the test report

## Project Structure

- `demo/build.gradle.kts`: Gradle build configuration
- `demo/gradle/`: Gradle Wrapper configuration
- `demo/src/main/java/`: Java source code
- `demo/src/main/resources/templates/`: Thymeleaf HTML templates
- `demo/src/main/resources/static/`: CSS, JavaScript and images
- `demo/src/test/`: automated tests

## Configuration & Setup

Application properties can be configured in `demo/src/main/resources/application.properties`.

The application requires environment variables for mail server authentication, as well as PostgreSQL database configuration.
| Variable | Description | Example |
| :--- | :--- | :--- |
| `MAIL_USERNAME` | SMTP server username or sender email address | `user@example.com` |
| `MAIL_PASSWORD` | SMTP password, App Password, or API Key | `your-secret-password` |
| `DB_PASSWORD` | PostgreSQL database password | `my_db_password` |

If you want to use the same database system as the system, create in PostgreSQL a database called auth_demo with the username `postgres` on the local port **5432**

If you use another database system you must change the variables that start with `spring.datasource`

## Dependency Management

All dependencies, plugins, and project metadata are declared inside `demo/build.gradle.kts`.

## Author

Developed and maintained by **Caron**.
