"use strict";

// Progressive enhancement only: no timer, autoplay, tracking or scroll interception.
document.addEventListener("DOMContentLoaded", () => {
  const story = document.querySelector("[data-product-story]");
  if (!story) return;

  const tabList = story.querySelector("[data-story-tabs]");
  const tabs = Array.from(story.querySelectorAll("[data-story-tab]"));
  const panels = Array.from(story.querySelectorAll("[data-story-panel]"));
  if (!tabList || tabs.length !== panels.length || !tabs.length) return;
  if (tabs.some((tab) => !panels.some((panel) => panel.id === tab.dataset.storyTab))) return;

  const selectTab = (selected, focus = false) => {
    tabs.forEach((tab) => {
      const active = tab === selected;
      tab.setAttribute("aria-selected", String(active));
      tab.tabIndex = active ? 0 : -1;
    });
    panels.forEach((panel) => { panel.hidden = panel.id !== selected.dataset.storyTab; });
    if (focus) selected.focus();
  };

  tabList.setAttribute("role", "tablist");
  tabs.forEach((tab, index) => {
    tab.setAttribute("role", "tab");
    tab.setAttribute("aria-controls", tab.dataset.storyTab);
    const panel = panels.find((item) => item.id === tab.dataset.storyTab);
    panel.setAttribute("role", "tabpanel");
    panel.setAttribute("aria-labelledby", tab.id);
    tab.addEventListener("click", () => selectTab(tab));
    tab.addEventListener("keydown", (event) => {
      let next;
      if (event.key === "ArrowRight") next = (index + 1) % tabs.length;
      if (event.key === "ArrowLeft") next = (index - 1 + tabs.length) % tabs.length;
      if (event.key === "Home") next = 0;
      if (event.key === "End") next = tabs.length - 1;
      if (next === undefined) return;
      event.preventDefault();
      selectTab(tabs[next], true);
    });
  });

  panels.forEach((panel) => {
    const controls = panel.querySelector(".story-view-controls");
    const buttons = Array.from(panel.querySelectorAll("[data-story-view-button]"));
    const views = Array.from(panel.querySelectorAll("[data-story-view]"));
    if (!controls || !buttons.length || buttons.some((button) =>
      !views.some((view) => view.id === button.dataset.storyViewButton))) return;
    const selectView = (selected) => {
      buttons.forEach((button) => button.setAttribute("aria-pressed", String(button === selected)));
      views.forEach((view) => { view.hidden = view.id !== selected.dataset.storyViewButton; });
    };
    controls.setAttribute("role", "group");
    buttons.forEach((button) => {
      button.setAttribute("aria-controls", button.dataset.storyViewButton);
      button.addEventListener("click", () => selectView(button));
    });
    selectView(buttons[0]);
    controls.hidden = false;
  });

  selectTab(tabs[0]);
  tabList.hidden = false;
  story.classList.add("is-enhanced");
});
