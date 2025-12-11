import express from "express";
import { authenticate } from "../middleware/authMiddleware.js";
import { validatePayment, validateRequest } from "../middleware/validationMiddleware.js";
import {
  createPayment,
  confirmPayment,
  getPaymentsByUser,
  refundPayment,
} from "../services/paymentService.js";

const router = express.Router();

router.post("/", authenticate, validatePayment, validateRequest, async (req, res, next) => {
  try {
    const { registrationId, amount } = req.body;
    const result = await createPayment(registrationId, amount);
    res.status(201).json(result);
  } catch (error) {
    next(error);
  }
});

router.post("/confirm", authenticate, async (req, res, next) => {
  try {
    const { paymentIntentId, registrationId } = req.body;
    const payment = await confirmPayment(paymentIntentId, registrationId);
    res.json(payment);
  } catch (error) {
    next(error);
  }
});

router.get("/user/my-payments", authenticate, async (req, res, next) => {
  try {
    const payments = await getPaymentsByUser(req.user.userId);
    res.json(payments);
  } catch (error) {
    next(error);
  }
});

router.post("/:id/refund", authenticate, async (req, res, next) => {
  try {
    const payment = await refundPayment(req.params.id, req.user.userId);
    res.json(payment);
  } catch (error) {
    next(error);
  }
});

export default router;