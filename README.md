# 💰 SmartExpense Manager – Backend (Spring Boot)

[![Spring Boot](https://img.shields.io/badge/Spring%20Boot-3.4.13-brightgreen.svg)](https://spring.io/projects/spring-boot)
[![Java](https://img.shields.io/badge/Java-17-orange.svg)](https://www.oracle.com/java/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-15-blue.svg)](https://www.postgresql.org/)
[![JWT](https://img.shields.io/badge/Security-JWT-gold.svg)](https://jwt.io/)

SmartExpense Manager is a robust financial tracking backend built with **Spring Boot 3**. It provides a centralized RESTful API to manage user authentication, expenses, income, loans, EMIs, and advanced debt repayment strategies.

---

## 🚀 Key Features

-   **Secure Auth**: JWT-based authentication with Spring Security and BCrypt password encryption.
-   **Expense Tracking**: Categorized spending logs with budget validation.
-   **Income Management**: Track multiple earning sources for accurate savings analysis.
-   **Loan & EMI Engine**: Comprehensive debt tracking with automated balance updates upon EMI payments.
-   **Debt Strategy Engine**: Dynamic repayment optimization using **Avalanche** (highest interest) and **Snowball** (lowest balance) methods.
-   **Financial Analytics**: Real-time health scores, savings percentages, and historical snapshots.

---

## 🛠 Tech Stack

-   **Language**: Java 17
-   **Framework**: Spring Boot 3.x
-   **Security**: Spring Security, JJWT
-   **Database**: PostgreSQL
-   **ORM**: Spring Data JPA / Hibernate
-   **Utilities**: Lombok, Jakarta Validation

---

## 📊 System Flow

### Authentication & Authorization Flow
```mermaid
sequenceDiagram
    participant User
    participant AuthController
    participant SecurityContext
    participant JWTProvider
    participant PostgreSQL

    User->>AuthController: POST /api/auth/signup (Registration)
    AuthController->>PostgreSQL: Save encrypted user data
    PostgreSQL-->>AuthController: User saved

    User->>AuthController: POST /api/auth/signin (Login)
    AuthController->>JWTProvider: Authenticate & Generate Token
    JWTProvider-->>User: Return JWT (Access Token)

    User->>AuthController: GET /api/expenses (Protected)
    AuthController->>SecurityContext: Validate Token
    SecurityContext->>PostgreSQL: Fetch User Expenses
    PostgreSQL-->>User: Return Data
```

---

## 💾 Database Schema (ERD)

```mermaid
erDiagram
    USER ||--o{ EXPENSE : logs
    USER ||--o{ INCOME : earns
    USER ||--o{ LOAN : owes
    USER ||--o{ BUDGET : sets
    USER ||--o{ ROLE : "has roles (M:M)"
    USER ||--o{ FINANCIAL_SNAPSHOT : "tracks history"
    USER }o--|| DEBT_STRATEGY : prefers

    EXPENSE }o--|| CATEGORY : categorized_as
    BUDGET }o--|o CATEGORY : limits_on

    LOAN ||--o{ EMI_PAYMENT : consists_of
```

---

## 🏛 Architecture Diagram

```mermaid
graph TD
    User([User]) --> AuthController
    User --> ExpenseController
    User --> LoanController
    User --> AnalyticsController
    
    subgraph "Core Components"
        SecurityLayer[Spring Security / JWT]
        AnalyticsService
        DebtStrategyService
    end
    
    subgraph "Entities (Refactored Package)"
        UserEntity[User]
        ExpenseEntity[Expense]
        LoanEntity[Loan]
        IncomeEntity[Income]
        BudgetEntity[Budget]
        DebtStrategyEntity[DebtStrategy]
        SnapshotEntity[FinancialSnapshot]
    end
    
    PostgreSQL[(PostgreSQL DB)]
    
    UserEntity --> DebtStrategyEntity
    SnapshotEntity --> UserEntity
```

---

## 📂 Project Structure

```text
src/main/java/com/srg/smartexpenseapi/
├── controller/        # REST Endpoints
├── entity/            # Data Models (JPA Entities)
├── repository/        # Data Access Layer
├── service/           # Business Logic
├── security/          # JWT & Security Config
├── payload/           # DTOs (Request/Response)
└── exception/         # Global Error Handling
```

---

## 🚦 API Endpoints (Quick Reference)

### 🔐 Authentication
| Method | Endpoint | Description |
| :--- | :--- | :--- |
| POST | `/api/auth/signup` | Register a new user |
| POST | `/api/auth/signin` | Login & receive JWT |

### 💸 Expenses & Income
| Method | Endpoint | Description |
| :--- | :--- | :--- |
| GET | `/api/expenses` | Get all expenses |
| POST | `/api/income` | Log new income |
| GET | `/api/analytics/summary` | Financial health report |

### 📈 Debt Management
| Method | Endpoint | Description |
| :--- | :--- | :--- |
| GET | `/api/strategies/recommended` | Optimized loan repayment list |
| POST | `/api/strategies/preference` | Save Avalanche/Snowball choice |

---

## ⚙️ Setup & Installation

1.  **Clone the Repository**:
    ```bash
    git clone https://github.com/yourusername/smartexpenseapi.git
    ```

2.  **Database Configuration**:
    Create a PostgreSQL database named `smartexpense_db` and update `src/main/resources/application.properties` with your credentials:
    ```properties
    spring.datasource.url=jdbc:postgresql://localhost:5432/smartexpense_db
    spring.datasource.username=your_username
    spring.datasource.password=your_password
    ```

3.  **Build & Run**:
    ```bash
    ./mvnw spring-boot:run
    ```

---

## 🤝 Contributing
Contributions are welcome! Please fork this repository and submit a pull request for any enhancements.

## 📄 License
This project is licensed under the MIT License.
