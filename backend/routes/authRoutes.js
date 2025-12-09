import { PrismaClient } from "@prisma/client";
import { hashPassword, comparePassword } from "../utils/passwordUtils.js";
import { generateToken } from "../utils/tokenUtils.js";
import { AppError } from "../middleware/errorHandler.js";

const prisma = new PrismaClient();

export const registerUser = async (email, password, name, phone) => {
  // all the user checks an bull....
  const existingUser = await prisma.user.findUnique({
    where: { email },
  }); // why are there funcions for everything, lemme do some algorithms stuff.

  if (existingUser) {
    // i will optimize this later
    throw new AppError("Email already registered", 400);
  }
  // hash the pword although everyone makes the same password dd
  const hashedPassword = await hashPassword(password);

  const user = await prisma.user.create({
    data: {
      email,
      password: hashedPassword,
      name,
      phone,
      role: "user",
    },
  });
  //token and user
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
};
//login search by email
export const loginUser = async (email, password) => {
  const user = await prisma.user.findUnique({
    where: { email },
  });
  //user check
  if (!user) {
    throw new AppError("Invalid credentials", 401);
  }
  // password check
  const isValidPassword = await comparePassword(password, user.password);
  //validate password
  if (!isValidPassword) {
    throw new AppError("Invalid credentials", 401);
  }
  //if al good generate token
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
};
// same stuff as above just search by id
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
  });

  if (!user) {
    throw new AppError("User not found", 404);
  }

  return user;
};
