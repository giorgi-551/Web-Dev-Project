import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "secret key we make, but it seems only me doing this xdd";
const JWT_EXPIRES_IN = "7d";

export const generateToken = (userId, role) => {
  return jwt.sign({ userId, role }, JWT_SECRET, {
    expiresIn: JWT_EXPIRES_IN,
  });
};

export const verifyToken = (token) => {
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch (error) {
    return null;
  }
};