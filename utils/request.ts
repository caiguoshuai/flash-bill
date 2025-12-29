import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse, InternalAxiosRequestConfig } from 'axios';
import { ApiResponse } from '../types/transaction';
import { Toast } from 'antd-mobile';

// Base configuration
const config: AxiosRequestConfig = {
  baseURL: process.env.REACT_APP_API_URL || '/api/v1',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
};

const request: AxiosInstance = axios.create(config);

// Request Interceptor
request.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    // Inject Token if available
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.set('Authorization', `Bearer ${token}`);
    }
    return config;
  },
  (error: any) => {
    return Promise.reject(error);
  }
);

// Response Interceptor
request.interceptors.response.use(
  (response: AxiosResponse<ApiResponse>) => {
    const { code, msg, data } = response.data;

    // Assuming code 0 is success
    if (code === 0) {
      return response.data as any; // Return the full ApiResponse object or just data depending on preference
    } else {
      // Business logic error
      Toast.show({
        content: msg || 'Error',
        icon: 'fail',
      });
      return Promise.reject(new Error(msg || 'Error'));
    }
  },
  (error: any) => {
    // HTTP Status errors
    let message = 'Network Error';
    if (error.response) {
      switch (error.response.status) {
        case 401:
          message = 'Unauthorized';
          // Handle logout redirection here
          break;
        case 403:
          message = 'Forbidden';
          break;
        case 404:
          message = 'Resource not found';
          break;
        case 500:
          message = 'Server Error';
          break;
        default:
          message = error.message;
      }
    }
    Toast.show({
      content: message,
      icon: 'fail',
    });
    return Promise.reject(error);
  }
);

export default request;