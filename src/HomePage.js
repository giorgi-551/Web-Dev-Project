import "./App.css";
import React, { useState, useEffect } from "react";
import EventCard from "./components/EventCard";
import TicketModal from "./components/TicketModal";
import FirstPage from "./pages/FirstPage";
import HomePage from "./HomePage";

import SignInPage from "./pages/SignInPage";
import Confetti from "react-confetti";

import {
  getEvents,
  createEvent,
  registerUser,
  deleteEvent,
  getRegistrations,
  deleteRegistration
} from "./api";

function HomePage() {
  // States
  const [events, setEvents] = useState([]);
  const [registrations, setRegistrations] = useState([]);
  const [role, setRole] = useState("user");
  const [showConfetti, setShowConfetti] = useState(false);
  const currentUser = "John Doe";

  // Load events and registrations
  useEffect(() => {
    loadEvents();
    loadRegistrations();
  }, []);

  const loadEvents = () => {
    getEvents()
      .then(res => setEvents(res.data))
      .catch(err => console.log(err));
  };

  const loadRegistrations = () => {
    getRegistrations()
      .then(res => setRegistrations(res.data))
      .catch(err => console.log(err));
  };

  // Event handlers
  const handleRegister = (event) => {
    const alreadyRegistered = registrations.find(
      r => r.eventId === event.id && r.user === currentUser
    );
    if (alreadyRegistered) {
      alert("You are already registered for this event!");
      return;
    }

    registerUser({ eventId: event.id, user: currentUser })
      .then(res => {
        setRegistrations([...registrations, res.data]);
        setShowConfetti(true);
        setTimeout(() => setShowConfetti(false), 5000); 
        alert("Registered successfully!");
      })
      .catch(err => console.log(err));
  };

  const handleDeleteEvent = (id) => {
    deleteEvent(id)
      .then(() => {
        setEvents(events.filter(e => e.id !== id));
        setRegistrations(registrations.filter(r => r.eventId !== id));
      })
      .catch(err => console.log(err));
  };

  const handleDeleteRegistration = (regId) => {
    deleteRegistration(regId)
      .then(() => {
        setRegistrations(registrations.filter(r => r.id !== regId));
      })
      .catch(err => console.log(err));
  };

  const handleCreateEvent = (newEvent) => {
    createEvent(newEvent)
      .then(res => setEvents([...events, res.data]))
      .catch(err => console.log(err));
  };

  // Event reminders
  useEffect(() => {
    const interval = setInterval(() => {
      const now = new Date();
      events.forEach(event => {
        const eventTime = new Date(event.date + " " + event.time);
        const diff = eventTime - now;
        if (diff > 0 && diff <= 3600000) { // 1 hour before event reminder
          alert(`Reminder: Event "${event.title}" starts in less than 1 hour!`);
        }
      });
    }, 1200000); // check every 20 minute
    return () => clearInterval(interval);
  }, [events]);

  // Render
  return (
    <div className="HomePage">
      {showConfetti && <Confetti />}
      <h1>🎉 Online Event Registration</h1>

      {/* Role switch */}
      <div className="role-switch">
        <button onClick={() => setRole("user")}>User</button>
        <button onClick={() => setRole("organizer")}>Organizer</button>
        <button onClick={() => setRole("admin")}>Admin</button>
      </div>

      {/* Create event form for Organizer */}
      {role === "organizer" && (
        <div className="create-event-form">
          <h3>Create Event</h3>
          <input type="text" placeholder="Title" id="title" />
          <input type="date" id="date" />
          <input type="time" id="time" />
          <button
            onClick={() => {
              const title = document.getElementById("title").value;
              const date = document.getElementById("date").value;
              const time = document.getElementById("time").value;
              if (!title || !date || !time) {
                alert("Please fill all fields!");
                return;
              }
              handleCreateEvent({ title, date, time });
            }}
          >
            Create Event
          </button>
        </div>
      )}

      <h2>Events</h2>
      <div className="event-list">
        {events.map(event => (
          <EventCard
            key={event.id}
            event={event}
            role={role}
            currentUser={currentUser}
            onRegister={() => handleRegister(event)}
            onDelete={() => handleDeleteEvent(event.id)}
            registrations={registrations.filter(r => r.eventId === event.id)}
            onDeleteRegistration={handleDeleteRegistration}
          />
        ))}
      </div>
    </div>
  );
}

export default Homepage;
