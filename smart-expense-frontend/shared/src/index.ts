/**
 * @file shared/src/index.ts
 * Barrel export for the @smart-expense/shared package.
 *
 * This file is compiled by tsc to dist/index.js and is the entry point
 * declared in shared/package.json → "main" and "types".
 *
 * Every consumer (web, mobile, desktop) imports from '@smart-expense/shared',
 * which resolves to dist/index.js after `npm run build:shared`.
 *
 * During local development (before build), Vite/TypeScript will resolve
 * paths directly via tsconfig path aliases pointing to src/.
 */

// ── API Client ─────────────────────────────────────────────────────────────
export { default as apiClient } from './api/client';

// ── TypeScript Interfaces / DTOs ────────────────────────────────────────────
export type {
  // Auth
  User,
  JwtResponse,
  LoginRequest,
  SignupRequest,
  MessageResponse,

  // Core Domain
  Category,
  Expense,
  Income,
  IncomeCategory,
  Loan,

  // Tax & ITR
  TaxReportResponse,
} from './types/index';
