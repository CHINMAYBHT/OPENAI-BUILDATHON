// supabaseAuth.js
// Helper functions for user authentication using Supabase
import supabase from './supabaseClient.js';

/**
 * Sign up a new user.
 * @param {{name:string, email:string, password:string}} userData
 * @returns {{success:boolean, message?:string, user?:object}}
 */
export const createUser = async ({ name, email, password }) => {
  try {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { name } },
    });
    if (error) {
      return { success: false, message: error.message };
    }
    // Supabase returns user object without password
    return { success: true, message: 'User created successfully', user: data.user };
  } catch (err) {
    return { success: false, message: err.message };
  }
};

/**
 * Authenticate an existing user.
 * @param {string} email
 * @param {string} password
 * @returns {{success:boolean, message?:string, user?:object}}
 */
export const authenticateUser = async (email, password) => {
  try {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      return { success: false, message: error.message };
    }
    return { success: true, message: 'Login successful', user: data.user };
  } catch (err) {
    return { success: false, message: err.message };
  }
};

export default { createUser, authenticateUser };
