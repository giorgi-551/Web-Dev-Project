import React, { useState, useMemo, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "./LandingPage.css";
import { useAuth } from "../context/AuthContext";

export default function LandingPage() {
  const [activeSort, setActiveSort] = useState("new");
  const [showDropdown, setShowDropdown] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [registrations, setRegistrations] = useState([]);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [events, setEvents] = useState([]);

  const navigate = useNavigate();
  const { user, token, isAuthenticated, isOrganizer, isAdmin, logout } =
    useAuth();

  // Load events from backend
  useEffect(() => {
    const loadEvents = async () => {
      try {
        const res = await fetch("/api/events");
        const data = await res.json();

        // try to be robust (array or {items: []} or {events: []})
        const list = Array.isArray(data)
          ? data
          : data.items || data.events || [];

        setEvents(list);
      } catch (err) {
        console.error("Failed to load events", err);
      }
    };

    loadEvents();
  }, []);

  // Load current user's registrations from backend
  useEffect(() => {
    if (!token) {
      setRegistrations([]);
      return;
    }

    const loadRegistrations = async () => {
      try {
        const res = await fetch("/api/registrations/user/my-registrations", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!res.ok) {
          console.warn("Could not load registrations");
          return;
        }

        const data = await res.json();
        setRegistrations(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error("Failed to load registrations", err);
      }
    };

    loadRegistrations();
  }, [token]);

  const sortedEvents = useMemo(() => {
    const eventsList = [...events];

    switch (activeSort) {
      case "new":
        // Assuming higher id = newer
        return eventsList.sort((a, b) => (b.id || 0) - (a.id || 0));

      case "trending":
        return eventsList.sort(
          (a, b) => (b.registrationsCount || 0) - (a.registrationsCount || 0)
        );

      case "soon":
      case "future":
        return eventsList.sort((a, b) => {
          const dateA = new Date(a.date || a.startDate || 0);
          const dateB = new Date(b.date || b.startDate || 0);
          return dateA - dateB;
        });

      default:
        return eventsList;
    }
  }, [activeSort, events]);

  const isRegistered = (eventId) =>
    registrations.some((r) => r.eventId === eventId);

  const handleViewClick = (eventId) => {
    if (!isAuthenticated) {
      navigate("/signin");
      return;
    }
    const event = events.find((e) => e.id === eventId);
    setSelectedEvent(event || null);
  };

  const handleSignOut = () => {
    logout();
    setShowDropdown(false);
    navigate("/signin");
  };

  // Register for event
  const handleRegister = async () => {
    if (!token || !selectedEvent) return;

    try {
      const ticketId =
        selectedEvent.tickets && selectedEvent.tickets.length
          ? selectedEvent.tickets[0].id
          : null;

      const body = {
        eventId: selectedEvent.id,
      };

      if (ticketId !== null) body.ticketId = ticketId;

      const res = await fetch("/api/registrations", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(body),
      });

      const data = await res.json();

      if (!res.ok) {
        alert(data.message || "Failed to register for event.");
        return;
      }

      // data should be the registration object
      setRegistrations((prev) => [...prev, data]);
      setSelectedEvent(null);
    } catch (err) {
      console.error(err);
      alert("Something went wrong while registering.");
    }
  };

  // Cancel registration (we must know reg id)
  const handleCancelRegistration = async () => {
    if (!token || !selectedEvent) return;

    const reg = registrations.find((r) => r.eventId === selectedEvent.id);
    if (!reg) return;

    try {
      const res = await fetch(`/api/registrations/${reg.id}/cancel`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await res.json();

      if (!res.ok) {
        alert(data.message || "Failed to cancel registration.");
        return;
      }

      setRegistrations((prev) => prev.filter((r) => r.id !== reg.id));
      setSelectedEvent(null);
    } catch (err) {
      console.error(err);
      alert("Something went wrong while cancelling.");
    }
  };

  // Admin / organizer delete event
  const handleDeleteEvent = async () => {
    if (!token || !selectedEvent) return;

    if (!window.confirm("Are you sure you want to delete this event?")) return;

    try {
      const res = await fetch(`/api/events/${selectedEvent.id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await res.json();

      if (!res.ok) {
        alert(data.message || "Failed to delete event.");
        return;
      }

      setEvents((prev) => prev.filter((e) => e.id !== selectedEvent.id));
      setSelectedEvent(null);
      alert("Event deleted successfully!");
    } catch (err) {
      console.error(err);
      alert("Something went wrong while deleting.");
    }
  };

  // Organizer create event
  const handleCreateEvent = async (e) => {
    e.preventDefault();
    if (!token || !user) return;

    const formData = new FormData(e.target);

    const newEventPayload = {
      title: formData.get("name"),
      description: formData.get("description"),
      location: formData.get("location"),
      date: formData.get("date"),
    };

    try {
      const res = await fetch("/api/events", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(newEventPayload),
      });

      const data = await res.json();

      if (!res.ok) {
        alert(data.message || "Failed to create event.");
        return;
      }

      setEvents((prev) => [...prev, data]);
      setShowCreateModal(false);
      alert("Event created successfully!");
    } catch (err) {
      console.error(err);
      alert("Something went wrong while creating event.");
    }
  };

  return (
    <>
      <nav className="navbar">
        <div className="nav-container">
          <div className="logo">🎟️ Event Manager</div>
          <div className="nav-buttons">
            {isOrganizer && (
              <button
                className="create-event-btn"
                onClick={() => setShowCreateModal(true)}
              >
                + Create Event
              </button>
            )}
            {isAuthenticated ? (
              <div className="user-dropdown">
                <button
                  className="user-btn"
                  onClick={() => setShowDropdown(!showDropdown)}
                >
                  👤 {user?.name || user?.email}
                </button>
                {showDropdown && (
                  <div className="dropdown-menu">
                    <button
                      onClick={handleSignOut}
                      className="signout-btn"
                    >
                      Sign Out
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <button
                className="log-in"
                onClick={() => navigate("/signin")}
              >
                Sign In
              </button>
            )}
          </div>
        </div>
      </nav>

      <div className="main-content">
        <section className="hero-section">
          <h1>
            Discover{" "}
            <span className="gradient-text">Amazing Events</span> Near You
          </h1>
          <p className="subtitle">Best event near you!</p>
        </section>

        <div className="content-layout">
          <div className="sidebar">
            <button
              className={`sidebar-btn ${
                activeSort === "new" ? "active" : ""
              }`}
              onClick={() => setActiveSort("new")}
            >
              <span className="emoji">✨</span> New
            </button>
            <button
              className={`sidebar-btn ${
                activeSort === "trending" ? "active" : ""
              }`}
              onClick={() => setActiveSort("trending")}
            >
              <span className="emoji">🔥</span> Trending
            </button>
            <button
              className={`sidebar-btn ${
                activeSort === "soon" ? "active" : ""
              }`}
              onClick={() => setActiveSort("soon")}
            >
              <span className="emoji">⚡</span> Soon
            </button>
            <button
              className={`sidebar-btn ${
                activeSort === "future" ? "active" : ""
              }`}
              onClick={() => setActiveSort("future")}
            >
              <span className="emoji">📅</span> In Future
            </button>
          </div>

          <div className="events-list">
            {sortedEvents.map((event) => (
              <div className="event-card" key={event.id}>
                <div className="event-info">
                  <h3 className="event-name">
                    {event.title || event.name}
                  </h3>
                  <p className="event-date">
                    📅 {event.date || event.startDate || "TBA"}
                  </p>
                  <p className="event-organizer">
                    👤 Organized by{" "}
                    {event.organizerName ||
                      event.organizer ||
                      "Unknown"}
                  </p>
                  {isAuthenticated && isRegistered(event.id) && (
                    <span className="registered-badge">
                      ✓ Registered
                    </span>
                  )}
                </div>
                <button
                  className="view-btn"
                  onClick={() => handleViewClick(event.id)}
                >
                  View
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Event Detail Modal */}
      {selectedEvent && (
        <div
          className="modal-overlay"
          onClick={() => setSelectedEvent(null)}
        >
          <div
            className="modal-content"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              className="modal-close"
              onClick={() => setSelectedEvent(null)}
            >
              ×
            </button>
            <h2 className="modal-title">
              {selectedEvent.title || selectedEvent.name}
            </h2>
            <div className="modal-details">
              <p>
                <strong>📅 Date:</strong>{" "}
                {selectedEvent.date ||
                  selectedEvent.startDate ||
                  "TBA"}
              </p>
              <p>
                <strong>👤 Organizer:</strong>{" "}
                {selectedEvent.organizerName ||
                  selectedEvent.organizer ||
                  "Unknown"}
              </p>
              <p>
                <strong>📍 Location:</strong>{" "}
                {selectedEvent.location || "TBA"}
              </p>
              <p>
                <strong>📝 Description:</strong>{" "}
                {selectedEvent.description ||
                  "No description available"}
              </p>
            </div>
            <div className="modal-actions">
              {isAdmin ? (
                <button
                  className="delete-btn"
                  onClick={handleDeleteEvent}
                >
                  Delete Event
                </button>
              ) : (
                <>
                  {isRegistered(selectedEvent.id) ? (
                    <button
                      className="cancel-btn"
                      onClick={handleCancelRegistration}
                    >
                      Cancel Registration
                    </button>
                  ) : (
                    <button
                      className="register-btn"
                      onClick={handleRegister}
                    >
                      Register for Event
                    </button>
                  )}
                </>
              )}
              <button
                className="close-btn"
                onClick={() => setSelectedEvent(null)}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Create - For Organizers */}
      {showCreateModal && (
        <div
          className="modal-overlay"
          onClick={() => setShowCreateModal(false)}
        >
          <div
            className="modal-content"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              className="modal-close"
              onClick={() => setShowCreateModal(false)}
            >
              ×
            </button>
            <h2 className="modal-title">Create New Event</h2>
            <form
              onSubmit={handleCreateEvent}
              className="create-event-form"
            >
              <div className="form-group">
                <label>Event Name</label>
                <input
                  type="text"
                  name="name"
                  required
                  className="form-input"
                />
              </div>
              <div className="form-group">
                <label>Date</label>
                <input
                  type="date"
                  name="date"
                  required
                  className="form-input"
                />
              </div>
              <div className="form-group">
                <label>Location</label>
                <input
                  type="text"
                  name="location"
                  required
                  className="form-input"
                />
              </div>
              <div className="form-group">
                <label>Description</label>
                <textarea
                  name="description"
                  rows="4"
                  required
                  className="form-input"
                ></textarea>
              </div>
              <div className="modal-actions">
                <button type="submit" className="register-btn">
                  Create Event
                </button>
                <button
                  type="button"
                  className="close-btn"
                  onClick={() => setShowCreateModal(false)}
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
