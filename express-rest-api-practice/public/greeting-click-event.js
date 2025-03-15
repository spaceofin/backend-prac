window.addEventListener("DOMContentLoaded", (event) => {
  document.querySelectorAll(".greet-message").forEach((elem) => {
    elem.addEventListener("click", (event) => {
      event.target.style.color = "green";
      event.target.style.fontWeight = "bold";
    });
  });
});
