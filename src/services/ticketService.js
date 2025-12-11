import { PrismaClient } from "@prisma/client";
import { AppError } from "../../middleware/errorHandler.js";

const prisma = new PrismaClient();

export const createTicket = async (eventId, ticketData, userId) => {
  // all the same stuff as before in registration service. 
  const event = await prisma.event.findUnique({
    where: { id: eventId },
  });

  if (!event) {
    throw new AppError("Event not found", 404);
  }

  if (event.organizerId !== userId) {
    throw new AppError("You can only add tickets to your own events", 403);
  }

  const ticket = await prisma.ticket.create({
    data: {
      eventId,
      ticketType: ticketData.ticketType,
      name: ticketData.name,
      description: ticketData.description,
      price: parseFloat(ticketData.price) || 0,
      quantity: ticketData.quantity,
      saleStart: ticketData.saleStart ? new Date(ticketData.saleStart) : null,
      saleEnd: ticketData.saleEnd ? new Date(ticketData.saleEnd) : null,
    },
  });

  return ticket;
};

export const getTicketsByEvent = async (eventId) => {
  const tickets = await prisma.ticket.findMany({
    where: { eventId },
  });

  return tickets;
};

export const getTicketById = async (ticketId) => {
  const ticket = await prisma.ticket.findUnique({
    where: { id: ticketId },
  });

  if (!ticket) {
    throw new AppError("Ticket not found", 404);
  }

  return ticket;
};

export const updateTicket = async (ticketId, ticketData, userId) => {
  const ticket = await prisma.ticket.findUnique({
    where: { id: ticketId },
    include: { event: true },
  });

  if (!ticket) {
    throw new AppError("Ticket not found", 404);
  }

  if (ticket.event.organizerId !== userId) {
    throw new AppError("You can only update your own tickets", 403);
  }

  const updatedTicket = await prisma.ticket.update({
    where: { id: ticketId },
    data: {
      name: ticketData.name || ticket.name,
      description: ticketData.description || ticket.description,
      price: ticketData.price !== undefined ? parseFloat(ticketData.price) : ticket.price,
      quantity: ticketData.quantity || ticket.quantity,
      saleStart: ticketData.saleStart ? new Date(ticketData.saleStart) : ticket.saleStart,
      saleEnd: ticketData.saleEnd ? new Date(ticketData.saleEnd) : ticket.saleEnd,
    },
  });

  return updatedTicket;
};

export const deleteTicket = async (ticketId, userId) => {
  const ticket = await prisma.ticket.findUnique({
    where: { id: ticketId },
    include: { event: true },
  });

  if (!ticket) {
    throw new AppError("Ticket not found", 404);
  }

  if (ticket.event.organizerId !== userId) {
    throw new AppError("You can only delete your own tickets", 403);
  }

  await prisma.ticket.delete({
    where: { id: ticketId },
  });

  return { message: "Ticket deleted successfully" };
};