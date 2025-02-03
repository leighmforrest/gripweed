document.addEventListener("DOMContentLoaded", () => {
    const hamburger = document.querySelector("#hamburger");
    const navLinks = document.querySelector(".nav-links");
    const darkModeButton = document.querySelector(".nav-links button");
    const darkModeIcon = darkModeButton.querySelector("i"); // get the i tag in the button
    const learnMoreButton = document.querySelector("#learn-more-btn");
    const aboutPanel = document.querySelector("section#about");
    const contactPanel = document.querySelector("section#contact");
    const body = document.body;
  
    // Function to update dark mode icon
    function updateDarkModeIcon(isDarkMode) {
      darkModeIcon.classList.remove("fa-moon", "fa-regular", "fa-circle-half-stroke", "fa-solid");
      if (isDarkMode) {
        darkModeIcon.classList.add("fa-circle-half-stroke", "fa-solid");
      } else {
        darkModeIcon.classList.add("fa-moon", "fa-regular");
      }
    }
  
    // Check dark mode preference from localStorage on page load
    if (localStorage.getItem("dark-mode") === "enabled") {
      body.classList.add("dark-mode");
      updateDarkModeIcon(true);
    } else {
      updateDarkModeIcon(false);
    }
  
    hamburger.addEventListener("click", () => {
      navLinks.classList.toggle("active");
      hamburger.classList.toggle("active");
    });
  
    darkModeButton.addEventListener("click", () => {
      const isDarkMode = !body.classList.contains("dark-mode");
      body.classList.toggle("dark-mode");
  
      // Set the cache
      localStorage.setItem("dark-mode", isDarkMode ? "enabled" : "disabled");
  
      // Update icon based on the new state
      updateDarkModeIcon(isDarkMode);
    });
  
    if (learnMoreButton) {
      learnMoreButton.addEventListener("click", () => {
        aboutPanel.scrollIntoView({ behavior: "smooth" });
      });
    }
  });
  
