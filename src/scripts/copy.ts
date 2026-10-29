// Copy buttons of CopyCommand.astro: shown once this script runs, they copy their command.
// If the clipboard refuses, the command gets selected so that it can be copied by hand.
for (const button of document.querySelectorAll<HTMLButtonElement>("button[data-copy]")) {
  const command = button.parentElement?.querySelector("code");
  const status = button.parentElement?.querySelector("[data-copy-status]");
  let reset: ReturnType<typeof setTimeout> | undefined;

  const announce = (message: string) => {
    if (status) status.textContent = message;
    clearTimeout(reset);
    reset = setTimeout(() => {
      delete button.dataset["copied"];
      if (status) status.textContent = "";
    }, 1500);
  };

  button.hidden = false;
  button.addEventListener("click", async () => {
    try {
      await navigator.clipboard.writeText(button.dataset["copy"] ?? "");
      button.dataset["copied"] = "";
      announce("Copied");
    } catch {
      if (command) getSelection()?.selectAllChildren(command);
      announce("Could not copy: the command is selected instead");
    }
  });
}
