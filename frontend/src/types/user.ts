/**
 * User Type Definitions
 *
 * These types match the backend User schema.
 * DateTime fields are represented as strings (ISO 8601 format from JSON).
 */

/**
 * Complete User object returned from API
 */
export interface User {
  id: number;
  username: string;
  email: string;
  is_active: boolean;
  last_login: string | null;
  created_at: string;
  updated_at: string | null;
}

/**
 * User creation request payload
 */
export interface UserCreate {
  username: string;
  email: string;
  password: string;
}

/**
 * User login request payload
 */
export interface UserLogin {
  username: string;
  password: string;
}
