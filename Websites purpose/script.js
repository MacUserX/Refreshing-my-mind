// Collects the filter controls and project cards from index.html.
const filters = document.querySelectorAll(".filter");
const projects = document.querySelectorAll(".project");
// Connects each card's data-project value to its HTML page.
const projectPages = {
  saffron: "saffron.html",
  "mono-house": "mono-house.html",
  orbit: "orbit.html",
  rhythm: "rhythm.html"
};

projects.forEach((project) => {
  // Navigates to the selected project's dedicated page.
  const openProject = () => {
    window.location.href = projectPages[project.dataset.project];
  };

  project.addEventListener("click", (event) => {
    // Stops the nested image link from triggering a second navigation.
    if (event.target.closest("a")) {
      event.preventDefault();
    }
    openProject();
  });

  project.addEventListener("keydown", (event) => {
    // Allows keyboard users to open a focused project card.
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      openProject();
    }
  });
});

filters.forEach((filter) => {
  filter.addEventListener("click", () => {
    // Activates one filter and hides cards from other categories.
    filters.forEach((item) => item.classList.remove("active"));
    filter.classList.add("active");
    const category = filter.dataset.filter;

    projects.forEach((project) => {
      const visible = category === "all" || project.dataset.category === category;
      project.hidden = !visible;
    });
  });
});

