import express, {Request, Response, NextFunction} from 'express';
import {getMachineHealth} from './machineHealth';
import connectDB from './db';
import registerUser from './register';
import { loginUser } from './login';
import jwt from 'jsonwebtoken';

const app = express();
const port = 3001;

// Middleware to parse JSON request bodies
app.use(express.json());

// Connect to MongoDB
connectDB().catch((error) => {
  console.error('Error connecting to MongoDB:', error);
  process.exit(1); // Exit the application if unable to connect to the database
});

// Endpoint to register a new user
app.post('/register', async (req: Request, res: Response) => {
  try {
    const { username, password } = req.body;
    if (!username || !password) {
      return res.status(400).json({ error: 'Username and password are required' });
    }

    const registeredUser = await registerUser({ username, password });

    if (!registeredUser) {
      return res.status(500).json({ error: 'Failed to register user' });
    }

    res.status(201).json({ message: 'User registered successfully', user: registeredUser });
  } catch (error) {
    console.error('Error registering user:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Endpoint to handle user login
app.post('/login', async (req: Request, res: Response) => {
  const { username, password } = req.body;

  try {
    const loginResult = await loginUser(username, password);

    // Check the result of the login operation
    if (loginResult && loginResult.token) {
      // If login was successful, return the token and user information
      res.status(200).json(loginResult);
    } else {
      // If login failed, return an appropriate response
      res.status(401).json({ error: 'Invalid credentials' });
    }
  } catch (error) {
    console.error('Error during login:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Middleware to verify JWT token
export function authenticateToken(req: Request, res: Response, next: NextFunction) {
  const token = req.header('Authorization')?.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Access denied. Token not provided.' });
  }

  jwt.verify(token, 'your-secret-key', (err, user) => {
    if (err) {
      return res.status(403).json({ error: 'Invalid token.' });
    }

    // Attach the user information to the request for further use in the route handler
    (req as any).user = user;
    next();
  });
}

// Endpoint to get machine health score
app.post('/machine-health', authenticateToken, async (req: Request, res: Response) => {
  
  // Access the authenticated user information through (req as any).user
  const userId = (req as any).user.userId;

  const result = await getMachineHealth(req);
  if (result.error) {
    res.status(400).json(result);
  } else {
    res.json(result);
  }
});

app.listen(port, () => {
  console.log(`API is listening at http://localhost:${port}`);
});
