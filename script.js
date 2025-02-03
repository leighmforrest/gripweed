const navbarHandler = () => {
  // Get the DOM reference for the menu
  const navLinks = document.querySelector(".nav-links");

  navLinks.classList.toggle("active");
  hamburger.classList.toggle("active");
};

document.addEventListener("DOMContentLoaded", () => {
  // DOM elements
  const hamburger = document.querySelector("#hamburger");

  // Add event handlers
  hamburger.addEventListener("click", navbarHandler);
});
