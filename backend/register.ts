import mongoose from 'mongoose';
import bcrypt from 'bcrypt';
import User from './user';

interface RegistrationInput {
  username: string;
  password: string;
}

async function registerUser({ username, password }: RegistrationInput): Promise<any> {
  try {
    // Check if the username is already taken
    const existingUser = await User.findOne({ username });
    if (existingUser) {
      throw new Error('Username is already taken');
    }

    // Hash the password before storing it
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create a new user document
    const newUser = new User({
      username,
      password: hashedPassword,
    });

    // Save the user to the database
    const savedUser = await newUser.save();

    return savedUser;
  } catch (error) {
    console.error('Error registering user:', error);
    return null;
  }
}

export default registerUser;
