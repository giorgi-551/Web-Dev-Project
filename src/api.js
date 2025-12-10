import axios from "axios";

const API = axios.create({ baseURL: "http://localhost:4000/api" });

// Events 
export const getEvents = () => API.get("/users/events");
export const createEvent = (data) => API.post("/users/events", data);
export const deleteEvent = (id) => API.delete(`/users/events/${id}`);

// Registrations
export const registerUser = (data) => API.post("/registaration", data);
export const getRegistrations = () => API.get("/registaration");

// Delete a registration by ID
export const deleteRegistration = (id) => API.delete(`/registaration/${id}`);
