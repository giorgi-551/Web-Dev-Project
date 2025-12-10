import React from "react";
import "./TicketModal.css";

function TicketModal({ ticket, event, onClose }) {
  if (!event) return null;

  return (
    <div className="ticket-modal">
      <div className="ticket-content">
        <h2>🎫 Ticket</h2>
        <p>Event: {event.title}</p>
        <p>Date: {event.date}</p>
        <p>Time: {event.time}</p>
        <p>Ticket ID: {ticket.ticketId}</p>
        <button onClick={onClose}>Close</button>
      </div>
    </div>
  );
}

export default TicketModal;
