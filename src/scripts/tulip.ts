// The tulip of the logo (see HomePage.astro): a click shows why it is a tulip under the name, or
// hides it again, and the tulip sways. Without JavaScript the note stays hidden.
const tulip = document.querySelector<HTMLButtonElement>("[data-tulip]");
const note = document.getElementById(tulip?.getAttribute("aria-controls") ?? "");

if (tulip && note) {
  tulip.addEventListener("click", () => {
    note.hidden = !note.hidden;
    tulip.setAttribute("aria-expanded", String(!note.hidden));
    // Restarts the sway when clicked again before it ends.
    tulip.classList.remove("sway");
    void tulip.offsetWidth;
    tulip.classList.add("sway");
  });
  tulip.addEventListener("animationend", () => tulip.classList.remove("sway"));
}
