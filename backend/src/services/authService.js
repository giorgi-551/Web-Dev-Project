import { PrismaClient } from "@prisma/client";
import { hashPassword, comparePassword } from "../utils/passwordUtils.js";
import { generateToken } from "../utils/tokenUtils.js";
import { AppError } from "../middleware/errorHandler.js";

const prisma = new PrismaClient();

export const registerUser = async (email, password, name, phone) => {
  // Check if user already exists
  const existingUser = await prisma.user.findUnique({
    where: { email },
  });

  if (existingUser) {
    throw new AppError("Email already registered", 400);
  }

  const hashedPassword = await hashPassword(password); // hash the password 

  const user = await prisma.user.create({
    data: {
      email,
      password: hashedPassword,
      name,
      phone,
      role: "user",
    },
  }); // wait for prisma to process the stuff

  const token = generateToken(user.id, user.role); // new token generation for user

  return {
    user: {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
    },
    token,
  };
}; // show the data 

export const loginUser = async (email, password) => {
  const user = await prisma.user.findUnique({
    where: { email },
  }); // asyncronous function to find user by email at login 

  if (!user) {
    throw new AppError("Invalid credentials", 401);
  }

  const isValidPassword = await comparePassword(password, user.password);

  if (!isValidPassword) {
    throw new AppError("Invalid credentials", 401);
  }

  const token = generateToken(user.id, user.role);

  return {
    user: {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
    },
    token,
  };
}; //return the data 

export const getUserById = async (userId) => {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      email: true,
      name: true,
      phone: true,
      role: true,
      createdAt: true,
    },
  }); //get user by id the same way as mail.

  if (!user) {
    throw new AppError("User not found", 404);
  }

  return user;
};