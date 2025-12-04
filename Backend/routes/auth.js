import express from 'express';
import { createUser, authenticateUser } from '../../Database/supabaseAuth.js';
import supabase from '../../Database/supabaseClient.js';

const router = express.Router();

// Signup route
router.post('/signup', async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Name, email, and password are required'
      });
    }

    const result = await createUser({ name, email, password });

    if (result.success) {
      // Create profile in the profiles table
      try {
        const { error: profileError } = await supabase
          .from('profiles')
          .insert({
            id: result.user.id,
            full_name: name,
          });

        if (profileError) {
          console.error('Profile creation failed:', profileError);
          // Don't fail the entire signup if profile creation fails
        }
      } catch (profileError) {
        console.error('Profile creation error:', profileError);
        // Don't fail the entire signup if profile creation fails
      }

      res.status(201).json(result);
    } else {
      res.status(400).json(result);
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
});

// Login route
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Email and password are required'
      });
    }

    const result = await authenticateUser(email, password);

    if (result.success) {
      res.status(200).json(result);
    } else {
      res.status(401).json(result);
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
});

export default router;
