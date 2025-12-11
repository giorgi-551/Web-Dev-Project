import { PrismaClient } from "@prisma/client";
import { AppError } from "../middleware/errorHandler.js";

const prisma = new PrismaClient();

export const createEvent = async (eventData, organizerId) => {
  const event = await prisma.event.create({
    data: {
      title: eventData.title,
      description: eventData.description,
      imageUrl: eventData.imageUrl,
      startTime: new Date(eventData.startTime),
      endTime: new Date(eventData.endTime),
      timezone: eventData.timezone || "UTC",
      meetingLink: eventData.meetingLink,
      capacity: eventData.capacity,
      organizerId,
      categoryId: eventData.categoryId,
      status: "draft",
    },
    include: { organizer: true, category: true },
  });

  return event;
};

export const getEvents = async (filters = {}) => {
  const where = {};

  if (filters.status) where.status = filters.status;
  if (filters.categoryId) where.categoryId = filters.categoryId;
  if (filters.search) {
    where.OR = [
      { title: { contains: filters.search, mode: "insensitive" } },
      { description: { contains: filters.search, mode: "insensitive" } },
    ];
  }

  const events = await prisma.event.findMany({
    where,
    include: { organizer: true, category: true, registrations: true },
    orderBy: { createdAt: "desc" },
    skip: (filters.page || 0) * (filters.limit || 10),
    take: filters.limit || 10,
  });

  return events;
};

export const getEventById = async (eventId) => {
  const event = await prisma.event.findUnique({
    where: { id: eventId },
    include: {
      organizer: true,
      category: true,
      registrations: true,
      tickets: true,
    },
  });

  if (!event) {
    throw new AppError("Event not found", 404);
  }

  return event;
};

export const updateEvent = async (eventId, eventData, userId) => {
  const event = await getEventById(eventId);

  if (event.organizerId !== userId) {
    throw new AppError("You can only update your own events", 403);
  }

  const updatedEvent = await prisma.event.update({
    where: { id: eventId },
    data: {
      title: eventData.title || event.title,
      description: eventData.description || event.description,
      imageUrl: eventData.imageUrl || event.imageUrl,
      startTime: eventData.startTime ? new Date(eventData.startTime) : event.startTime,
      endTime: eventData.endTime ? new Date(eventData.endTime) : event.endTime,
      meetingLink: eventData.meetingLink || event.meetingLink,
      capacity: eventData.capacity || event.capacity,
      status: eventData.status || event.status,
    },
    include: { organizer: true, category: true },
  });

  return updatedEvent;
};

export const deleteEvent = async (eventId, userId) => {
  const event = await getEventById(eventId);

  if (event.organizerId !== userId) {
    throw new AppError("You can only delete your own events", 403);
  }

  await prisma.event.delete({
    where: { id: eventId },
  });

  return { message: "Event deleted successfully" };
};

export const publishEvent = async (eventId, userId) => {
  const event = await getEventById(eventId);

  if (event.organizerId !== userId) {
    throw new AppError("Publish your own events bruv", 403);
  }

  const publishedEvent = await prisma.event.update({
    where: { id: eventId },
    data: { status: "published" },
    include: { organizer: true, category: true },
  });

  return publishedEvent;
};