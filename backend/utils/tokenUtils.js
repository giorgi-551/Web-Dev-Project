import jwt from 'jsonwebtoken';

export const generateToken = (userId, role) => {
  // Signs the token with user info and a secret key from environment variables
  return jwt.sign({ userId, role }, process.env.JWT_SECRET, {
    expiresIn: '30d', // Token expires in 30 days
  });
};

export const verifyToken = (token) => {
  // Decodes and validates the token
  return jwt.verify(token, process.env.JWT_SECRET);
};

// install this dependency: npm install jsonwebtoken and set a JWT_SECRET key in your .env file.
