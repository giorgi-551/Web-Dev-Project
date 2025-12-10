import { body, validationResult } from "express-validator";

export const validateRequest = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  next();
};

// Auth validations
export const validateRegister = [
  body("email").isEmail().normalizeEmail(),
  body("password").isLength({ min: 6 }),
  body("name").notEmpty().trim(),
];

export const validateLogin = [
  body("email").isEmail().normalizeEmail(),
  body("password").notEmpty(),
];

// Event validations
export const validateCreateEvent = [
  body("title").notEmpty().trim(),
  body("description").notEmpty().trim(),
  body("startTime").isISO8601(),
  body("endTime").isISO8601(),
  body("capacity").isInt({ min: 1 }),
  body("categoryId").notEmpty(),
];

// Registration validations
export const validateRegisterForEvent = [
  body("eventId").notEmpty(),
  body("ticketId").notEmpty(),
];

// Payment validations
export const validatePayment = [
  body("registrationId").notEmpty(),
  body("amount").isDecimal({ decimal_digits: "1,2" }),
];