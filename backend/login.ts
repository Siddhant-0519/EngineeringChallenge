// Import necessary modules and models
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import User from './user'; // Assuming you have a UserModel

// Function to handle user login
export async function loginUser(username: string, password: string): Promise<{ token?: string; refreshToken?: string; userId?: string; username?: string; error?: string } | null> {
    try {
      // Find the user by username in the database
      const user = await User.findOne({ username });
  
      // If the user is not found, return an appropriate response
      if (!user) {
        return { error: 'User not found' };
      }
  
      // If the password is incorrect, return null
      if (!(await bcrypt.compare(password, user.password))) {
        return null;
      }
  
      // If the credentials are valid, generate a JWT token
      const token = jwt.sign({ userId: user._id }, 'your-secret-key', { expiresIn: '6h' });
      const refreshToken = jwt.sign({ userId: user._id }, 'refresh-secret-key', { expiresIn: '7d' });
  
      // Return the token and user information
      return { token, refreshToken, userId: user._id, username: user.username };
    } catch (error) {
      console.error('Error during login:', error);
      return { error: 'Internal server error' };
    }
  }
  
  
