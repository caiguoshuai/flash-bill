import request from '../utils/request';
import { CreateTransactionParams, ApiResponse, Transaction } from '../types/transaction';

/**
 * Create a new transaction
 * @param params CreateTransactionParams
 * @returns Promise<ApiResponse<Transaction>>
 */
export const createTransaction = async (
  params: CreateTransactionParams
): Promise<ApiResponse<Transaction>> => {
  return request.post<any, ApiResponse<Transaction>>('/transactions', params);
};

/**
 * Fetch transaction detail (Example)
 * @param uuid string
 */
export const getTransactionDetail = async (
  uuid: string
): Promise<ApiResponse<Transaction>> => {
  return request.get<any, ApiResponse<Transaction>>(`/transactions/${uuid}`);
};

/**
 * Fetch transaction list
 * @param params Query params
 */
export const getTransactionList = async (
  params?: { month?: string; page?: number; size?: number }
): Promise<ApiResponse<Transaction[]>> => {
  return request.get<any, ApiResponse<Transaction[]>>('/transactions', { params });
};