import bcrypt from 'bcryptjs';

// The number of salt rounds to use
const SALT_ROUNDS = 10;

/**
 * Hashes a plaintext password using bcrypt.
 * @param {string} password - The plaintext password.
 * @returns {Promise<string>} The hashed password.
 */
export const hashPassword = async (password) => {
  return await bcrypt.hash(password, SALT_ROUNDS);
};

/**
 * Compares a plaintext password with a hashed password.
 * @param {string} password - The plaintext password.
 * @param {string} hashedPassword - The stored hashed password.
 * @returns {Promise<boolean>} True if the passwords match, false otherwise.
 */
export const comparePassword = async (password, hashedPassword) => {
  return await bcrypt.compare(password, hashedPassword);
};

// Note: install this dependency: npm install bcryptjs.