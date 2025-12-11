export const fakeApi = (endpoint, data) => {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      switch (endpoint) {
        case "/register":
          resolve({ success: true, message: "User registered!" });
          break;
        case "/login":
          resolve({ success: true, user: data });
          break;
        case "/forgot-password":
          resolve({ success: true, code: "123456" });
          break;
        case "/reset-password":
          resolve({ success: true });
          break;
        case "/events":
          resolve({ success: true, events: JSON.parse(localStorage.getItem("events") || "[]") });
          break;
        case "/register-event":
          resolve({ success: true });
          break;
        default:
          reject("Endpoint not found");
      }
    }, 800);
  });
};
