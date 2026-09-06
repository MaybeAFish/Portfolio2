const button = document.getElementById("copy-email");
let copyTimer;

button.addEventListener("click", async () => {
  await navigator.clipboard.writeText("amine.el.hammdaoui@hva.nl");

  clearTimeout(copyTimer);

  const text = button.querySelector("p");
  text.textContent = "Copied!";
  button.classList.add("active");

  copyTimer = setTimeout(() => {
    text.textContent = "Email";
    button.classList.remove("active");
  }, 1500);
});