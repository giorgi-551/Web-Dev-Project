import { PrismaClient } from "@prisma/client";
import { generateTicketCode, generateQRCode } from "../utils/qrCodeUtils.js";
import { sendRegistrationConfirmation } from "../utils/emailUtils.js";
import { AppError } from "../middleware/errorHandler.js";

const prisma = new PrismaClient();

export const registerForEvent = async (userId, eventId, ticketId) => {
  // Les do asyncronous registration process and checks 
  const event = await prisma.event.findUnique({
    where: { id: eventId },
  });

  if (!event) {
    throw new AppError("Event not found", 404);
  }

 // all the checks before handling registration
  const ticket = await prisma.ticket.findUnique({
    where: { id: ticketId },
  });

  if (!ticket) {
    throw new AppError("Ticket not found", 404);
  }

  const existingRegistration = await prisma.registration.findUnique({
    where: { userId_eventId: { userId, eventId } },
  });

  if (existingRegistration) {
    throw new AppError("You are already registered for this event", 400);
  }


  if (ticket.sold >= ticket.quantity) {
    throw new AppError("This ticket type is sold out", 400);
  }

  // generate ticket code
  const ticketCode = generateTicketCode();

  // aaand register the ticket on user
  const registration = await prisma.registration.create({
    data: {
      userId,
      eventId,
      ticketId,
      ticketCode,
      status: ticket.price > 0 ? "pending" : "confirmed",
    },
    include: { user: true, event: true, ticket: true },
  });

  // also generate the qr code for the registration
  const qrData = {
    registrationId: registration.id,
    ticketCode: registration.ticketCode,
    eventTitle: event.title,
  };
  const qrCodeUrl = await generateQRCode(qrData);

  // Update registration with QR code
  const updatedRegistration = await prisma.registration.update({
    where: { id: registration.id },
    data: { qrCodeUrl },
    include: { user: true, event: true, ticket: true },
  });

  // Send confirmation email
  /*await sendRegistrationConfirmation(
    registration.user.email,
    event.title,
    registration.ticketCode
  );

  return updatedRegistration;
};
*/
}
export const getRegistrationsByUser = async (userId) => {
  const registrations = await prisma.registration.findMany({
    where: { userId },
    include: { event: true, ticket: true },
    orderBy: { registeredAt: "desc" },
  });

  return registrations;
};

export const getRegistrationsByEvent = async (eventId, userId) => {
  // Check if user is organizer
  const event = await prisma.event.findUnique({
    where: { id: eventId },
  });

  if (!event || event.organizerId !== userId) {
    throw new AppError("You can only view registrations for your own events", 403);
  }

  const registrations = await prisma.registration.findMany({
    where: { eventId },
    include: { user: true, ticket: true },
    orderBy: { registeredAt: "desc" },
  });

  return registrations;
};

export const checkInAttendee = async (registrationId, userId) => {
  const registration = await prisma.registration.findUnique({
    where: { id: registrationId },
    include: { event: true },
  });

  if (!registration) {
    throw new AppError("Registration not found", 404);
  }

  if (registration.event.organizerId !== userId) {
    throw new AppError("You can only check in for your own events", 403);
  }

  const checkedIn = await prisma.registration.update({
    where: { id: registrationId },
    data: { checkedIn: true },
    include: { user: true, event: true },
  });

  return checkedIn;
};

export const cancelRegistration = async (registrationId, userId) => {
  const registration = await prisma.registration.findUnique({
    where: { id: registrationId },
  });

  if (!registration) {
    throw new AppError("Registration not found", 404);
  }

  if (registration.userId !== userId) {
    throw new AppError("You can only cancel your own registrations", 403);
  }

  const cancelled = await prisma.registration.update({
    where: { id: registrationId },
    data: { status: "cancelled" },
  });

  return cancelled;
};