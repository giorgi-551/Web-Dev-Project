import { PrismaClient } from "@prisma/client";
import Stripe from "stripe";
import { sendPaymentReceipt } from "../utils/emailUtils.js";
import { AppError } from "../middleware/errorHandler.js";

const prisma = new PrismaClient();
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

export const createPayment = async (registrationId, amount) => {
  const registration = await prisma.registration.findUnique({
    where: { id: registrationId },
    include: { user: true, event: true, ticket: true },
  });

  if (!registration) {
    throw new AppError("Registration not found", 404);
  }

  try {
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(amount * 100), // Convert to cents
      currency: "usd",
      metadata: {
        registrationId,
        userId: registration.userId,
        eventId: registration.eventId,
      },
    });

    const payment = await prisma.payment.create({
      data: {
        stripePaymentId: paymentIntent.id,
        amount,
        currency: "usd",
        status: "pending",
      },
    });

    return {
      payment,
      clientSecret: paymentIntent.client_secret,
    };
  } catch (error) {
    throw new AppError("Payment creation failed", 400);
  }
};

export const confirmPayment = async (paymentIntentId, registrationId) => {
  try {
    const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);

    if (paymentIntent.status !== "succeeded") {
      throw new AppError("Payment not successful", 400);
    }

    const payment = await prisma.payment.findUnique({
      where: { stripePaymentId: paymentIntentId },
    });

    if (!payment) {
      throw new AppError("Payment record not found", 404);
    }

    const updatedPayment = await prisma.payment.update({
      where: { id: payment.id },
      data: { status: "completed" },
    });

    // Update registration status and link payment
    const registration = await prisma.registration.update({
      where: { id: registrationId },
      data: {
        status: "confirmed",
        paymentId: payment.id,
      },
      include: { user: true, event: true, ticket: true },
    });

    // Send payment receipt email
    await sendPaymentReceipt(
      registration.user.email,
      registration.event.title,
      payment.amount
    );

    return updatedPayment;
  } catch (error) {
    if (error.statusCode) throw error;
    throw new AppError("Payment confirmation failed", 400);
  }
};

export const getPaymentsByUser = async (userId) => {
  const payments = await prisma.payment.findMany({
    where: {
      registration: {
        userId,
      },
    },
    include: {
      registration: {
        include: { event: true },
      },
    },
    orderBy: { paidAt: "desc" },
  });

  return payments;
};

export const refundPayment = async (paymentId, userId) => {
  const payment = await prisma.payment.findUnique({
    where: { id: paymentId },
    include: {
      registration: {
        include: { event: true },
      },
    },
  });

  if (!payment) {
    throw new AppError("Payment not found", 404);
  }

  if (payment.registration.userId !== userId) {
    throw new AppError("You can only refund your own payments", 403);
  }

  try {
    const refund = await stripe.refunds.create({
      payment_intent: payment.stripePaymentId,
    });

    const updatedPayment = await prisma.payment.update({
      where: { id: paymentId },
      data: { status: "refunded" },
    });

    // Update registration status
    await prisma.registration.update({
      where: { id: payment.registration.id },
      data: { status: "refunded" },
    });

    return updatedPayment;
  } catch (error) {
    throw new AppError("Refund failed", 400);
  }
};