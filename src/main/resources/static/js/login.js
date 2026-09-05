"use strict";
document
  .getElementById("loginForm")
  .addEventListener("submit", async (event) => {
    event.preventDefault();
    const button = document.getElementById("loginButton");
    const error = document.getElementById("loginError");
    button.disabled = true;
    button.textContent = "Signing in...";
    error.textContent = "";
    try {
      const response = await fetch("/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username: document.getElementById("username").value.trim(),
          password: document.getElementById("password").value,
        }),
      });
      if (!response.ok)
        throw new Error("Sign in is unavailable. Please try again.");
      const role = await response.text();
      if (role === "ADMIN") location.href = "admin-dashboard.html";
      else if (role === "EMPLOYEE") location.href = "employee-dashboard.html";
      else throw new Error(role);
    } catch (failure) {
      error.textContent = failure.message;
    } finally {
      button.disabled = false;
      button.textContent = "Sign in to workspace →";
    }
  });
