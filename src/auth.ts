/**
 * Thai Learning Manager - Authentication Module
 * Version: 1.0.0-thai-multiuser
 * 
 * Handles user authentication, JWT tokens, and password hashing
 */

import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import { nanoid } from 'nanoid'

// JWT Configuration
const JWT_SECRET = process.env.JWT_SECRET || 'thai-learning-secret-change-in-production'
const JWT_EXPIRES_IN = '7d' // Token expires in 7 days

// Password Configuration
const SALT_ROUNDS = 10

/**
 * User Interface
 */
export interface User {
  id: string
  email: string
  name?: string
  preferences?: any
  created_at?: string
  last_login?: string
  is_active?: number
  is_admin?: number
  subscription_status?: string
}

/**
 * JWT Payload Interface
 */
export interface JWTPayload {
  userId: string
  email: string
  iat?: number
  exp?: number
}

/**
 * Hash a password using bcrypt
 */
export async function hashPassword(password: string): Promise<string> {
  return await bcrypt.hash(password, SALT_ROUNDS)
}

/**
 * Verify a password against a hash
 */
export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return await bcrypt.compare(password, hash)
}

/**
 * Generate a unique user ID
 */
export function generateUserId(): string {
  return nanoid(21) // 21 characters, URL-safe
}

/**
 * Create a JWT token for a user
 */
export function createToken(payload: JWTPayload): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN })
}

/**
 * Verify and decode a JWT token
 */
export function verifyToken(token: string): JWTPayload | null {
  try {
    return jwt.verify(token, JWT_SECRET) as JWTPayload
  } catch (error) {
    console.error('JWT verification failed:', error)
    return null
  }
}

/**
 * Extract token from Authorization header
 */
export function extractToken(authHeader: string | undefined): string | null {
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return null
  }
  return authHeader.substring(7)
}

/**
 * Validate email format
 */
export function validateEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

/**
 * Validate password strength
 * Requirements: At least 6 characters
 */
export function validatePassword(password: string): { valid: boolean; message?: string } {
  if (password.length < 6) {
    return { valid: false, message: 'Password must be at least 6 characters long' }
  }
  return { valid: true }
}

/**
 * Sanitize user object (remove sensitive data)
 */
export function sanitizeUser(user: any): User {
  const { password_hash, ...sanitized } = user
  return sanitized as User
}

/**
 * Generate a password reset token (expires in 1 hour)
 */
export function generateResetToken(): string {
  return nanoid(32) // 32 characters for security
}

/**
 * Create a JWT token for password reset (expires in 1 hour)
 */
export function createResetToken(email: string, resetToken: string): string {
  return jwt.sign({ email, resetToken }, JWT_SECRET, { expiresIn: '1h' })
}

/**
 * Verify and decode a password reset JWT token
 */
export function verifyResetToken(token: string): { email: string; resetToken: string } | null {
  try {
    return jwt.verify(token, JWT_SECRET) as { email: string; resetToken: string }
  } catch (error) {
    console.error('Reset token verification failed:', error)
    return null
  }
}
