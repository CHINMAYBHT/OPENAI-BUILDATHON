import User from '../models/User.js';

// Create a new user
export const createUser = async (userData) => {
  try {
    const user = new User(userData);
    await user.save();
    
    // Return user without password
    const { password, ...userWithoutPassword } = user.toObject();
    return {
      success: true,
      message: 'User created successfully',
      user: userWithoutPassword
    };
  } catch (error) {
    return {
      success: false,
      message: error.code === 11000 ? 'Email already exists' : error.message,
      error: error.code === 11000 ? 'DUPLICATE_EMAIL' : 'VALIDATION_ERROR'
    };
  }
};

// Find user by email
export const findUserByEmail = async (email) => {
  try {
    const user = await User.findOne({ email }).select('+password');
    return {
      success: true,
      user: user
    };
  } catch (error) {
    return {
      success: false,
      message: error.message,
      error: 'QUERY_ERROR'
    };
  }
};

// Find user by ID
export const findUserById = async (id) => {
  try {
    const user = await User.findById(id);
    return {
      success: true,
      user: user
    };
  } catch (error) {
    return {
      success: false,
      message: error.message,
      error: 'QUERY_ERROR'
    };
  }
};

// Get all users
export const getAllUsers = async () => {
  try {
    const users = await User.find({}).select('-password');
    return {
      success: true,
      message: 'Users retrieved successfully',
      users: users,
      count: users.length
    };
  } catch (error) {
    return {
      success: false,
      message: error.message,
      error: 'QUERY_ERROR'
    };
  }
};

// Update user
export const updateUser = async (id, updateData) => {
  try {
    const user = await User.findByIdAndUpdate(
      id, 
      updateData, 
      { new: true, runValidators: true }
    ).select('-password');
    
    if (!user) {
      return {
        success: false,
        message: 'User not found',
        error: 'USER_NOT_FOUND'
      };
    }
    
    return {
      success: true,
      message: 'User updated successfully',
      user: user
    };
  } catch (error) {
    return {
      success: false,
      message: error.message,
      error: 'UPDATE_ERROR'
    };
  }
};

// Delete user
export const deleteUser = async (id) => {
  try {
    const user = await User.findByIdAndDelete(id);
    
    if (!user) {
      return {
        success: false,
        message: 'User not found',
        error: 'USER_NOT_FOUND'
      };
    }
    
    return {
      success: true,
      message: 'User deleted successfully'
    };
  } catch (error) {
    return {
      success: false,
      message: error.message,
      error: 'DELETE_ERROR'
    };
  }
};

// Authenticate user (login)
export const authenticateUser = async (email, password) => {
  try {
    const result = await findUserByEmail(email);
    
    if (!result.success || !result.user) {
      return {
        success: false,
        message: 'User not found',
        error: 'USER_NOT_FOUND'
      };
    }
    
    const isMatch = await result.user.comparePassword(password);
    
    if (!isMatch) {
      return {
        success: false,
        message: 'Invalid password',
        error: 'INVALID_PASSWORD'
      };
    }
    
    // Return user without password
    const { password: userPassword, ...userWithoutPassword } = result.user.toObject();
    
    return {
      success: true,
      message: 'Authentication successful',
      user: userWithoutPassword
    };
  } catch (error) {
    return {
      success: false,
      message: error.message,
      error: 'AUTH_ERROR'
    };
  }
};

export default {
  createUser,
  findUserByEmail,
  findUserById,
  getAllUsers,
  updateUser,
  deleteUser,
  authenticateUser
};