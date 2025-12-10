import React from "react";
import "./EventCard.css";

const EventCard = ({
  event,
  role,
  currentUser,
  onRegister,
  onDelete,
  registrations,
  onDeleteRegistration
}) => {
  return (
    <div className="event-card">
      <h3>{event.title}</h3>
      <p>Date: {event.date}</p>
      <p>Time: {event.time}</p>

      {/* User view: Register button */}
      {role === "user" && (
        <>
          {registrations.find(r => r.user === currentUser) ? (
            <p>You are already registered ✅</p>
          ) : (
            <button onClick={onRegister} className="register-btn">
              Register
            </button>
          )}

          {/* Show delete registration button */}
          {registrations
            .filter(r => r.user === currentUser)
            .map(r => (
              <button
                key={r.id}
                onClick={() => onDeleteRegistration(r.id)}
                className="delete-reg-btn"
              >
                Delete Registration
              </button>
            ))}
        </>
      )}

      {/* Organizer view: Delete event */}
      {role === "organizer" && (
        <button onClick={onDelete} className="delete-event-btn">
          Delete Event
        </button>
      )}

      {/* Admin view: Show attendees */}
      {role === "admin" && registrations.length > 0 && (
        <div className="attendee-list">
          <h4>Attendees:</h4>
          <ul>
            {registrations.map(r => (
              <li key={r.id}>{r.user}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default EventCard;
