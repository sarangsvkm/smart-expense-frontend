# ✨ SmartExpense Manager (Frontend)

[![Next.js](https://img.shields.io/badge/Next.js-000000?style=for-the-badge&logo=nextdotjs&logoColor=white)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![TailwindCSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)

SmartExpense is a premium, AI-powered financial management platform designed to automate your personal finance tracking, optimize your debt repayment strategies, and provide deep insights into your tax-saving potential.

---

## 🌟 Key Features

### 🧠 Smart AI Discovery
- **Auto-Categorization**: Enter a description (e.g., "Uber", "Zomato", "HDFC Life"), and our AI automatically suggests the most accurate category.
- **Intelligent Tax Detection**: Automatically flags expenses as tax-deductible (80C, 80D, etc.) and analyzes taxable income sources in real-time.
- **Contextual Suggestions**: Provides smart "Thinking..." feedback as you type to streamline data entry.

### 🛡️ Advanced Loan Strategy Engine
- **Multiple Repayment Models**: Out-of-the-box support for:
  - **Standard EMI**: Principal + Interest monthly reduction.
  - **Interest-Only (IO)**: Lower monthly burden for flexible liquidity.
  - **Bullet Repayment**: Single-payment maturity models (common for Gold Loans).
- **Fast Payoff Simulation**: Interactive AI dashboard that simulates how extra monthly payments can save thousands in interest and reduce tenure by years.
- **Suggested Rates**: Integrated database of typical market interest rates for different loan types (Home, Gold, Personal, etc.).

### 📊 Financial Intelligence Dashboard
- **Dynamic Charts**: Beautiful, responsive visualizations of Income vs. Expenses and Debt reduction paths.
- **Transaction History**: Real-time tracking of EMI payments and categorical spending trends.
- **Premium UI/UX**: A dark-mode ready, glassmorphic design system that feels alive and responsive.

---

## 🛠️ Technology Stack

- **Core**: Next.js 14+ (App Router)
- **Language**: TypeScript (Strongly Typed Shared Modules)
- **Styling**: Tailwind CSS with Framer Motion animations
- **Charts**: Recharts (Responsive & Interactive)
- **Icons**: Lucide React
- **API Client**: Axios with JWT Interceptors for secure communication

---

## 📂 Project Structure

```bash
smart-expense-frontend/
├── shared/             # Shared logic, API clients, and TypeScript types
│   ├── src/api/        # Centralized API service layer
│   └── src/types/      # Enterprise-grade data models
├── web/                # Next.js web application
│   ├── src/components/ # Reusable UI components (Modals, Charts, Views)
│   └── src/lib/        # Utility functions (cn, formatting)
└── .gitignore          # Optimized for Next.js and Monorepo setups
```

---

## 🚀 Getting Started

1. **Install Dependencies**:
   ```bash
   npm install
   ```

2. **Configure Environment**:
   Create a `.env.local` file with your backend API URL:
   ```env
   NEXT_PUBLIC_API_URL=http://localhost:8081/api
   ```

3. **Run Development Server**:
   ```bash
   npm run dev
   ```

---

## 📝 Recent Updates (Changelog)
- ✅ Fixed React Internal Error (Hook Violation) in Transaction Modal.
- 🚀 Implemented Real-time Smart AI Discovery integration.
- 📉 Added support for "Bullet" and "Interest-Only" loan strategies.
- 🎨 Refactored Dashboard with glassmorphic UI elements and better performance.

---

Built with ❤️ for better financial freedom.
