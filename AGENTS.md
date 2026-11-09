# EndoPrev - Project Guide

## Overview

EndoPrev is a web application that connects patients, researchers, and
associations working around endometriosis. The application is contained in the
[`demo/`](demo/) module and uses Java 25, Spring Boot 4.1.1, Gradle Kotlin DSL,
Thymeleaf, Spring Security, Spring Data JPA, and PostgreSQL.

The browser receives Thymeleaf pages and static resources. Spring controllers
serve pages, expose authentication and account-management endpoints, and
delegate persistence to the JPA repository. Demonstration content such as
studies, requests, applications, and testimonials is rendered in the browser
and persisted through browser storage.

## Global architecture

```text
Browser
  ├─ Thymeleaf pages: demo/src/main/resources/templates/
  ├─ JavaScript/CSS/images: demo/src/main/resources/static/
  └─ Browser storage for demonstration data
             │ HTTP
             ▼
Spring Boot (demo/src/main/java/com/example/demo/)
  ├─ Controller: MVC routes and REST APIs
  ├─ Security: form authentication and access rules
  ├─ Model: user entity, repository, and UserDetailsService
  ├─ Service: e-mail delivery
  └─ Utils: JWT generation and validation
             │
             ├─ PostgreSQL: users and tokens
             └─ SMTP: verification and password-reset e-mails
```

The entry point is `DemoApplication`. Spring Security allows public pages and
registration/password-recovery endpoints, while protecting `compte.html`,
`/compte`, and `/api/me`. Users must verify their e-mail address before they can
authenticate. Account types are stored in `MyAppUser.typeAccount` under the
`type_account` column; public registration accepts `patiente` and
`chercheure`.

## Root files

- [`AGENTS.md`](AGENTS.md): project guidance and architecture map for agents
  and contributors.
- [`.vscode/launch.json`](.vscode/launch.json): VS Code launch and debugging
  configurations.
- [`.vscode/settings.json`](.vscode/settings.json): editor settings.

## `demo` module

### Build and documentation

- [`build.gradle.kts`](demo/build.gradle.kts): Gradle plugins, Java 25
  toolchain, Spring/JJWT/PostgreSQL/Lombok dependencies, Hibernate
  configuration, and JUnit Platform test configuration.
- [`settings.gradle.kts`](demo/settings.gradle.kts): Gradle project name
  (`demo`).
- [`gradlew`](demo/gradlew) and [`gradlew.bat`](demo/gradlew.bat): Gradle
  wrappers; use these instead of requiring a system-wide Gradle installation.
- [`gradle/wrapper/gradle-wrapper.properties`](demo/gradle/wrapper/gradle-wrapper.properties)
  and `gradle-wrapper.jar`: Gradle wrapper version and launcher.
- [`README.md`](demo/README.md): prerequisites, environment variables, build,
  test, and launch commands, plus a structure summary.
- [`HELP.md`](demo/HELP.md): Spring Initializr reference links for Spring Web,
  Security, JPA, e-mail, and GraalVM.
- [`.gitattributes`](demo/.gitattributes) and
  [`.gitignore`](demo/.gitignore): Git normalization and module exclusions.

### Java source code

Java source code is under
[`demo/src/main/java/com/example/demo/`](demo/src/main/java/com/example/demo/).

#### Entry point

- [`DemoApplication.java`](demo/src/main/java/com/example/demo/DemoApplication.java):
  the `@SpringBootApplication` class that starts the embedded Spring Boot
  server.

#### Model and persistence

- [`Model/MyAppUser.java`](demo/src/main/java/com/example/demo/Model/MyAppUser.java):
  the JPA user entity. It stores identity data, credentials, verification
  state, verification/reset tokens, and `type_account`, which is exposed as
  `type_account` in JSON.
- [`Model/MyAppUserRepository.java`](demo/src/main/java/com/example/demo/Model/MyAppUserRepository.java):
  Spring Data repository methods for finding users by username or e-mail.
- [`Model/MyAppUserService.java`](demo/src/main/java/com/example/demo/Model/MyAppUserService.java):
  the `UserDetailsService` implementation used by Spring Security. It loads
  users and disables accounts that have not been verified.

#### Security and tokens

- [`Security/SecurityConfig.java`](demo/src/main/java/com/example/demo/Security/SecurityConfig.java):
  configures BCrypt, form authentication, the login page, public and protected
  URLs, and authentication-failure messages.
- [`Utils/JwtTokenUtil.java`](demo/src/main/java/com/example/demo/Utils/JwtTokenUtil.java):
  generates and validates JWTs used by e-mail verification and password-reset
  links.

#### Controllers

- [`Controller/ContentController.java`](demo/src/main/java/com/example/demo/Controller/ContentController.java):
  maps public routes to Thymeleaf templates and passes login errors or
  password-reset tokens to views.
- [`Controller/RegistrationController.java`](demo/src/main/java/com/example/demo/Controller/RegistrationController.java):
  handles `POST /req/signup` and `POST /api/signup`, validates fields and public
  account types, encodes passwords, persists users, and sends verification
  e-mails.
- [`Controller/VerificationController.java`](demo/src/main/java/com/example/demo/Controller/VerificationController.java):
  validates the JWT received by e-mail, checks it against the user, and
  activates the account.
- [`Controller/AccountController.java`](demo/src/main/java/com/example/demo/Controller/AccountController.java):
  exposes `GET /api/me` and returns the authenticated user's profile.
- [`Controller/AccountWebController.java`](demo/src/main/java/com/example/demo/Controller/AccountWebController.java):
  serves the account page and handles profile-update submissions. Additional
  business fields remain extension points.
- [`Controller/ForgotPasswordController.java`](demo/src/main/java/com/example/demo/Controller/ForgotPasswordController.java):
  implements password-reset requests and password changes with neutral
  responses that do not reveal whether an account exists.

#### Services

- [`Service/EmailService.java`](demo/src/main/java/com/example/demo/Service/EmailService.java):
  builds and sends verification and password-reset e-mails through SMTP,
  logs operations without exposing complete addresses, and turns delivery
  failures into explicit exceptions.

### Tests

- [`DemoApplicationTests.java`](demo/src/test/java/com/example/demo/DemoApplicationTests.java):
  minimal integration test that verifies the Spring context loads.
- [`Model/MyAppUserServiceTest.java`](demo/src/test/java/com/example/demo/Model/MyAppUserServiceTest.java):
  unit tests verifying that verified users are enabled and unverified users are
  disabled in Spring Security.

### Server configuration and resources

- [`application.properties`](demo/src/main/resources/application.properties):
  HTTP port, PostgreSQL datasource, SMTP configuration, Thymeleaf settings,
  error handling, and JPA/Hibernate settings. Secrets must be supplied through
  environment variables such as `DB_PASSWORD`, `MAIL_USERNAME`, and
  `MAIL_PASSWORD`; never commit them.
- [`public/error/404.html`](demo/src/main/resources/public/error/404.html):
  static page displayed for missing resources.

### Thymeleaf templates

Templates are under
[`demo/src/main/resources/templates/`](demo/src/main/resources/templates/).
They define the HTML interface and use Thymeleaf expressions where the server
must inject data or actions.

- [`index.html`](demo/src/main/resources/templates/index.html): EndoPrev home
  page and presentation dashboard.
- [`login.html`](demo/src/main/resources/templates/login.html): login form and
  Spring Security error messages.
- [`signup.html`](demo/src/main/resources/templates/signup.html):
  registration form with identity, e-mail, password, confirmation, and
  `patiente`/`chercheure` account selection.
- [`forgot-password.html`](demo/src/main/resources/templates/forgot-password.html):
  password-reset link request form.
- [`reset-password.html`](demo/src/main/resources/templates/reset-password.html):
  new-password form populated with the URL token.
- [`compte.html`](demo/src/main/resources/templates/compte.html): protected
  account area with profile information and update form.
- [`patientes.html`](demo/src/main/resources/templates/patientes.html):
  patient information and study-search area.
- [`chercheures.html`](demo/src/main/resources/templates/chercheures.html):
  researcher study-submission and study-browsing area.
- [`associations.html`](demo/src/main/resources/templates/associations.html):
  association information and contact form.
- [`temoignages.html`](demo/src/main/resources/templates/temoignages.html):
  testimonial browsing and publication area.
- [`qui-sommes-nous.html`](demo/src/main/resources/templates/qui-sommes-nous.html):
  team and project presentation.
- [`admin.html`](demo/src/main/resources/templates/admin.html):
  demonstration interface for reviewing and administering stored content.

### Static resources

Static resources are under
[`demo/src/main/resources/static/`](demo/src/main/resources/static/).

- [`script.js`](demo/src/main/resources/static/script.js): main site script.
  It manages authentication state, navigation between spaces, the Leaflet map,
  filters, content forms, counters, modals, and browser storage.
- [`js/signup.js`](demo/src/main/resources/static/js/signup.js): registration
  validation and submission. The `signup.html` page also uses the global logic
  in `script.js`; do not attach competing submit handlers.
- [`js/login.js`](demo/src/main/resources/static/js/login.js): displays login
  failure messages from the `error` query parameter.
- [`js/forgot-password.js`](demo/src/main/resources/static/js/forgot-password.js):
  submits password-reset requests and displays the response.
- [`js/reset-password.js`](demo/src/main/resources/static/js/reset-password.js):
  validates confirmation and submits the new password with its token.
- [`style.css`](demo/src/main/resources/static/style.css): general application
  and main-page styles.
- [`css/style.css`](demo/src/main/resources/static/css/style.css):
  authentication and password-form styles.
- `img/*.png` and `img/*.jpg`: logos, illustrations, and photographs used by
  the templates.

## Important functional flows

1. **Registration**: `signup.html` → `script.js` → `POST /api/signup` →
   `RegistrationController` validation → BCrypt/JPA → SMTP verification
   e-mail.
2. **Verification**: e-mail link → `GET /req/signup/verify` → JWT validation →
   account activation.
3. **Login**: `login.html` → Spring Security authentication → home-page
   redirect; `script.js` then checks `/api/me` to update the navigation button.
4. **Account**: `compte.html`/`/compte` and `/api/me` require authentication.
5. **Forgotten password**: form → JWT stored temporarily in the database →
   e-mail → encoded password update and token removal.
6. **Demonstration content**: publication and contact actions are handled by
   `script.js` and persisted primarily through browser storage; they are not
   yet a complete REST/JPA subsystem.

## Development commands

From the [`demo/`](demo/) directory on Windows:

```cmd
gradlew.bat test
gradlew.bat clean build
gradlew.bat bootRun
```

The application listens on `http://localhost:8080`. PostgreSQL must provide
the `auth_demo` database on port `5432`; SMTP must be configured using the
environment variables documented in [`README.md`](demo/README.md).
`spring.jpa.hibernate.ddl-auto=update` lets Hibernate update the schema during
development, but an explicit migration strategy should be used before
production.

## Contribution guidance

- Modify sources under `demo/src/`; do not edit generated files under
  `demo/build/` or Gradle caches.
- Preserve the separation between MVC controllers (template responses), REST
  controllers (JSON/text), the JPA model, and services.
- Add every new URL deliberately to
  [`SecurityConfig.java`](demo/src/main/java/com/example/demo/Security/SecurityConfig.java).
- Never log, commit, or expose passwords, SMTP secrets, encoded passwords, or
  persistent JWT signing keys.
- For an API change, update the controller, consuming JavaScript, and tests
  together.
- Run `gradlew.bat test` after changes to Java, security configuration, or
  persistence.
