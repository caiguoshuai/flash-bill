/**
 * Transaction Type Enum
 * 1: Expense (支出)
 * 2: Income (收入)
 */
export enum TransactionType {
  EXPENSE = 1,
  INCOME = 2,
}

/**
 * Main Transaction Interface
 * Matches backend data structure
 */
export interface Transaction {
  uuid: string; // Front-end generated unique ID for offline sync
  ledgerId: string;
  accountId: string;
  categoryId: string;
  type: TransactionType;
  amount: number; // Stored in Cents (分)
  date: string; // ISO 8601 or YYYY-MM-DD
  note?: string;
  createdAt?: string;
  updatedAt?: string;
}

/**
 * DTO for Creating a Transaction
 */
export interface CreateTransactionParams {
  uuid: string;
  ledgerId: string;
  accountId: string;
  categoryId: string;
  type: TransactionType;
  amount: number; // Must be converted to Int64 (cents) before sending
  date: string;
  note?: string;
}

/**
 * Standard API Response Structure
 */
export interface ApiResponse<T = any> {
  code: number; // 0 usually means success
  msg: string;
  data: T;
}