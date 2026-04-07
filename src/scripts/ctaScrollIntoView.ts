const ctaScrollIntoView = (
  actionButton: HTMLButtonElement,
  targetSection: Element,
) => {
    console.log(actionButton, targetSection)
  if (!actionButton || !targetSection) return;
  actionButton.addEventListener("click", () => {
    targetSection.scrollIntoView({ behavior: "smooth" });
  });
};

export default ctaScrollIntoView;
