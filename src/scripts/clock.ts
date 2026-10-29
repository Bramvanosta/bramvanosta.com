// Fills in the local time in south-west France (see Clock.astro) and keeps it current.
const clock = document.querySelector<HTMLElement>("[data-clock]");
const hour = clock?.querySelector("[data-clock-hour]");
const minute = clock?.querySelector("[data-clock-minute]");
const zone = clock?.querySelector("[data-clock-zone]");

if (clock && hour && minute && zone) {
  // en-GB names the zone "CET" or "CEST", where en-US would say "GMT+1".
  const format = new Intl.DateTimeFormat("en-GB", {
    timeZone: "Europe/Paris",
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
    timeZoneName: "short",
  });

  const render = () => {
    const parts = new Map(format.formatToParts(new Date()).map((part) => [part.type, part.value]));
    hour.textContent = parts.get("hour") ?? "";
    minute.textContent = parts.get("minute") ?? "";
    zone.textContent = parts.get("timeZoneName") ?? "";
  };

  render();
  clock.hidden = false;
  setInterval(render, 10_000);
}
