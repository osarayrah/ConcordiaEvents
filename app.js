let events = [];

const fallbackEvent = {
  id: "loading",
  title: "Campus Event",
  type: "Community",
  faculty: "All Students",
  date: "TBD",
  fullDate: "To be announced",
  location: "Concordia University",
  attendees: [],
  attendeeCount: 0,
  saves: 0,
  tags: ["Campus"],
  organizer: "Concordia Events",
  comfortNote: "Event details will appear once the backend finishes loading data.",
  image: 0,
  highlight: "Loading event details.",
  description: "Event information is loading from the backend.",
};

const screens = [
  {
    id: "welcome",
    name: "Splash Screen",
    purpose:
      "Introduces the value of CampusHub and frames it as one place to discover and coordinate around campus events.",
  },
  {
    id: "auth",
    name: "Sign Up / Log In",
    purpose:
      "Gives students a quick campus-style entry point with email, SSO, and low-friction account creation.",
  },
  {
    id: "interests",
    name: "Interest Selection",
    purpose:
      "Captures preferences so the home feed feels personalized from the first session.",
  },
  {
    id: "home",
    name: "Home Feed",
    purpose:
      "Shows recommended events, social proof, and quick discovery actions in a card-based browsing experience.",
  },
  {
    id: "search",
    name: "Search & Filters",
    purpose:
      "Lets students narrow events by interest, faculty, date, and event type instead of hunting across platforms.",
  },
  {
    id: "details",
    name: "Event Details",
    purpose:
      "Provides the core decision-making view with event info, attendance context, and clear join/save actions.",
  },
  {
    id: "friends",
    name: "Friends Attending",
    purpose:
      "Solves the social coordination problem by showing who is going, who is interested, and who to invite.",
  },
  {
    id: "saved",
    name: "Saved Events",
    purpose:
      "Acts as a lightweight planning space for events students want to revisit later.",
  },
  {
    id: "notifications",
    name: "Notifications",
    purpose:
      "Keeps students on track with reminders, RSVP updates, and friend activity around upcoming events.",
  },
  {
    id: "profile",
    name: "User Profile",
    purpose:
      "Shows identity, interests, event activity, and a personal control center for the app experience.",
  },
  {
    id: "create",
    name: "Create Event",
    purpose:
      "Demonstrates how clubs or admins can publish polished events into the same discovery ecosystem.",
  },
];

const userFlow = [
  "Student lands on the welcome screen and understands CampusHub as a single source for Concordia events.",
  "They sign up with their school email or continue with SSO.",
  "They pick interests like social, networking, arts, or career events to personalize recommendations.",
  "The home feed highlights recommended events with quick context about what friends are attending.",
  "They use search and filters to narrow options by faculty, date, and event type.",
  "They open an event detail page, read the description, and tap Join Event.",
  "They check the friends screen to invite classmates and coordinate attendance.",
  "The event is saved automatically, and reminders appear in notifications before it starts.",
];

const app = document.getElementById("app");
const screenList = document.getElementById("screenList");
const flowList = document.getElementById("flowList");

const state = {
  currentScreen: "welcome",
  authMode: "signup",
  selectedEventId: null,
  savedEventIds: [],
  joinedEventIds: [],
  selectedInterests: ["Social", "Career", "Food", "International"],
  selectedFilters: {
    interest: "Social",
    faculty: "JMSB",
    date: "This Week",
    type: "Free",
  },
  homeCategory: "For You",
  searchQuery: "",
  createEventDraft: {
    title: "Concordia Club Networking Night",
    description:
      "Meet club leaders, students, and alumni for casual networking, quick intros, and a low-pressure evening mixer.",
    date: "April 12",
    time: "5:00 PM - 7:00 PM",
    location: "John Molson Lobby",
    category: "Career",
    tags: "Career, Networking, Free Food, Open to All",
    imageLabel: "Choose cover",
  },
  apiError: "",
  isSubmittingEvent: false,
};

async function init() {
  renderBrief();
  app.innerHTML = `
    <section class="screen">
      <div class="panel-card">
        <h2 class="screen-title">Loading backend data</h2>
        <p class="screen-subtitle">Fetching the latest events from the new API.</p>
      </div>
    </section>
  `;
  await loadEvents();
  render();
}

function renderBrief() {
  if (!screenList || !flowList) {
    return;
  }

  screenList.innerHTML = screens
    .map(
      (screen, index) =>
        `<li><strong>${index + 1}. ${screen.name}</strong><br>${screen.purpose}</li>`
    )
    .join("");

  flowList.innerHTML = userFlow
    .map((step, index) => `<li><strong>${index + 1}.</strong> ${step}</li>`)
    .join("");
}

function syncStateWithEvents() {
  if (!events.length) {
    state.selectedEventId = null;
    state.savedEventIds = [];
    state.joinedEventIds = [];
    return;
  }

  if (!state.selectedEventId || !events.some((event) => event.id === state.selectedEventId)) {
    state.selectedEventId = events[0].id;
  }

  if (!state.savedEventIds.length) {
    state.savedEventIds = [events[0]?.id, events[2]?.id].filter(Boolean);
  } else {
    state.savedEventIds = state.savedEventIds.filter((id) => events.some((event) => event.id === id));
  }

  if (!state.joinedEventIds.length) {
    state.joinedEventIds = [events[0]?.id].filter(Boolean);
  } else {
    state.joinedEventIds = state.joinedEventIds.filter((id) => events.some((event) => event.id === id));
  }
}

async function loadEvents() {
  try {
    const response = await fetch("/api/events");
    if (!response.ok) {
      throw new Error("Unable to load events from the backend.");
    }

    const payload = await response.json();
    events = Array.isArray(payload.events) ? payload.events : [];
    state.apiError = "";
    syncStateWithEvents();
  } catch (error) {
    state.apiError = "Backend unavailable. Start the Node server to load live event data.";
    events = [];
    syncStateWithEvents();
  }
}

function goTo(screenId) {
  state.currentScreen = screenId;
  render();
}

function getSelectedEvent() {
  return events.find((event) => event.id === state.selectedEventId) || events[0] || fallbackEvent;
}

function isSaved(id) {
  return state.savedEventIds.includes(id);
}

function isJoined(id) {
  return state.joinedEventIds.includes(id);
}

function toggleSave(id) {
  if (isSaved(id)) {
    state.savedEventIds = state.savedEventIds.filter((eventId) => eventId !== id);
  } else {
    state.savedEventIds = [...state.savedEventIds, id];
  }
  render();
}

function joinEvent(id) {
  if (!isJoined(id)) {
    state.joinedEventIds = [...state.joinedEventIds, id];
  }
  if (!isSaved(id)) {
    state.savedEventIds = [...state.savedEventIds, id];
  }
  render();
}

function toggleInterest(label) {
  if (state.selectedInterests.includes(label)) {
    state.selectedInterests = state.selectedInterests.filter((item) => item !== label);
  } else {
    state.selectedInterests = [...state.selectedInterests, label];
  }
  render();
}

function setHomeCategory(category) {
  state.homeCategory = category;
  render();
}

function setSearchQuery(query) {
  state.searchQuery = query;
  render();
}

function setFilter(group, value) {
  state.selectedFilters[group] = value;
  render();
}

function updateCreateEventDraft(field, value) {
  state.createEventDraft[field] = value;
}

function formatShortDate(dateValue, timeValue) {
  if (!dateValue) {
    return timeValue || "TBD";
  }

  const parsed = new Date(`${dateValue} 2026`);
  if (Number.isNaN(parsed.getTime())) {
    return `${dateValue}${timeValue ? ` · ${timeValue}` : ""}`;
  }

  const weekday = parsed.toLocaleDateString("en-CA", { weekday: "short" });
  return `${weekday} · ${timeValue || "TBD"}`;
}

async function publishCreatedEvent() {
  const draft = state.createEventDraft;
  const cleanTitle = draft.title.trim();
  const cleanDescription = draft.description.trim();
  const cleanLocation = draft.location.trim();
  const cleanDate = draft.date.trim();
  const cleanTime = draft.time.trim();
  const cleanCategory = draft.category.trim() || "Community";
  const cleanTags = draft.tags
    .split(",")
    .map((tag) => tag.trim())
    .filter(Boolean);

  if (!cleanTitle || !cleanDescription || !cleanLocation || !cleanDate || !cleanTime) {
    return;
  }

  state.isSubmittingEvent = true;
  state.apiError = "";
  render();

  const createdEventPayload = {
    title: cleanTitle,
    description: cleanDescription,
    type: cleanCategory,
    faculty: "All Students",
    date: formatShortDate(cleanDate, cleanTime),
    fullDate: `${cleanDate} · ${cleanTime}`,
    location: cleanLocation,
    attendees: ["JD"],
    attendeeCount: 1,
    saves: 0,
    tags: cleanTags.length ? cleanTags : [cleanCategory],
    organizer: "CampusHub Club Organizer",
    comfortNote: "Shared by a student organizer. Attendees can save it, invite friends, and coordinate from the event page.",
    highlight: cleanDescription.slice(0, 90) + (cleanDescription.length > 90 ? "..." : ""),
  };

  try {
    const response = await fetch("/api/events", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(createdEventPayload),
    });

    const payload = await response.json();

    if (!response.ok) {
      throw new Error(payload.error || "Unable to publish event.");
    }

    const createdEvent = payload.event;
    events = [createdEvent, ...events];
    state.selectedEventId = createdEvent.id;
    state.savedEventIds = [createdEvent.id, ...state.savedEventIds.filter((id) => id !== createdEvent.id)];
    state.currentScreen = "details";
    state.createEventDraft = {
      ...state.createEventDraft,
      title: "Concordia Club Networking Night",
      description:
        "Meet club leaders, students, and alumni for casual networking, quick intros, and a low-pressure evening mixer.",
      date: "April 12",
      time: "5:00 PM - 7:00 PM",
      location: "John Molson Lobby",
      category: "Career",
      tags: "Career, Networking, Free Food, Open to All",
      imageLabel: "Choose cover",
    };
  } catch (error) {
    state.apiError = error.message;
  } finally {
    state.isSubmittingEvent = false;
  }
}

function matchesHomeCategory(event) {
  const category = state.homeCategory;
  if (category === "For You") {
    return event.tags.some((tag) => state.selectedInterests.includes(tag)) || event.type === "Career";
  }
  if (category === "Free") {
    return event.tags.includes("Free");
  }
  return event.type === category || event.tags.includes(category);
}

function matchesSearchFilters(event) {
  const query = state.searchQuery.trim().toLowerCase();
  const { interest, faculty, date, type } = state.selectedFilters;

  const matchesQuery =
    !query ||
    [
      event.title,
      event.description,
      event.location,
      event.organizer,
      event.faculty,
      event.type,
      ...(event.tags || []),
    ]
      .join(" ")
      .toLowerCase()
      .includes(query);

  const matchesInterest =
    !interest ||
    interest === "All" ||
    event.type === interest ||
    event.tags.includes(interest);

  const matchesFaculty =
    !faculty || faculty === "All" || event.faculty === faculty;

  const matchesDate =
    !date ||
    date === "This Week" ||
    (date === "Today" && event.date.toLowerCase().includes("tonight")) ||
    (date === "Weekend" && /(sat|sun)/i.test(event.date));

  const matchesType =
    !type ||
    type === "All" ||
    (type === "Free" && event.tags.includes("Free")) ||
    (type === "Workshop" && event.tags.includes("Workshop")) ||
    (type === "Talk" && (event.tags.includes("Talk") || event.type === "Academic")) ||
    (type === "Party" && event.type === "Community");

  return matchesQuery && matchesInterest && matchesFaculty && matchesDate && matchesType;
}

function getHomeEvents() {
  return events.filter(matchesHomeCategory);
}

function getSearchResults() {
  return events.filter(matchesSearchFilters);
}

function renderNav(active) {
  const items = [
    ["home", "⌂", "Home"],
    ["search", "⌕", "Search"],
    ["saved", "★", "Saved"],
    ["notifications", "◔", "Alerts"],
    ["profile", "◡", "Profile"],
  ];

  return `
    <nav class="bottom-nav">
      ${items
        .map(
          ([id, icon, label]) => `
          <button class="nav-item ${active === id ? "active" : ""}" data-nav="${id}">
            <span class="nav-icon">${icon}</span>
            <span class="nav-label">${label}</span>
          </button>
        `
        )
        .join("")}
    </nav>
  `;
}

function avatarGroup(attendees) {
  const styles = ["", "alt-a", "alt-b", "alt-c"];
  return `
    <div class="avatar-stack">
      ${attendees
        .map(
          (attendee, index) =>
            `<span class="avatar ${styles[index % styles.length]}">${attendee}</span>`
        )
        .join("")}
    </div>
  `;
}

function eventCard(event, options = {}) {
  const savedText = isSaved(event.id) ? "Saved" : "Save";
  const joinText = isJoined(event.id) ? "Joined" : "Join";
  const compact = options.compact ? "mini-card" : "event-card";
  const tagMarkup = (event.tags || [])
    .slice(0, 3)
    .map((tag) => `<span class="event-tag">${tag}</span>`)
    .join("");

  return `
    <article class="${compact}">
      <div class="event-art event-gradient-${event.image}">
        <div class="event-row">
          <span class="event-type">${event.type}</span>
          <button class="chip ${isSaved(event.id) ? "active" : ""}" data-save="${event.id}">
            ${savedText}
          </button>
        </div>
        <div>
          <h3>${event.title}</h3>
          <div class="event-meta">
            <span>${event.date}</span>
            <span>${event.faculty}</span>
          </div>
        </div>
      </div>
      <div class="event-body">
        <div>
          <strong>${event.location}</strong>
          <div class="event-location">${event.highlight}</div>
        </div>
        <div class="event-tag-row">
          ${tagMarkup}
        </div>
        <div class="meta-line">
          <span>${event.attendeeCount} attending</span>
          <span>${event.date}</span>
        </div>
        <div class="meta-line">
          <div class="event-attendance">
            ${avatarGroup(event.attendees)}
            <span>${event.saves} saved</span>
          </div>
          <button class="ghost-button inline-link" data-open="${event.id}">View</button>
        </div>
        ${
          options.hideActions
            ? ""
            : `<div class="button-column" style="margin-top: 0.85rem;">
                <button class="cta-button" data-join="${event.id}">${joinText} Event</button>
              </div>`
        }
      </div>
    </article>
  `;
}

function render() {
  const event = getSelectedEvent();
  const homeEvents = getHomeEvents();
  const recommendedEvents = homeEvents.slice(0, 2);
  const trendingEvents = [...homeEvents]
    .sort((a, b) => b.attendeeCount - a.attendeeCount)
    .slice(0, 2);
  const upcomingEvents = [...homeEvents]
    .sort((a, b) => a.attendeeCount - b.attendeeCount)
    .slice(0, 2);
  const searchResults = getSearchResults();

  const markup = {
    welcome: `
      <section class="screen welcome-screen">
        <div class="hero-panel">
          <div class="brand-mark">C</div>
          <p class="eyebrow">CampusHub</p>
          <h1 class="hero-title">Find what’s happening at Concordia.</h1>
          <p class="hero-copy">
            Stop chasing Instagram stories, Discord messages, emails, and posters.
            CampusHub brings campus life into one personalized feed.
          </p>
          <div class="signal-grid">
            <div class="signal-card">
              <span>Discover</span>
              <strong>120+ events</strong>
            </div>
            <div class="signal-card">
              <span>Coordinate</span>
              <strong>Friends going</strong>
            </div>
            <div class="signal-card">
              <span>Personalize</span>
              <strong>Smart feed</strong>
            </div>
          </div>
        </div>

          <div class="preview-stack">
          <div class="preview-card primary">
            <small>Recommended now</small>
            <h3>Networking Night</h3>
            <p>See who’s going, save it fast, and make a plan with classmates.</p>
          </div>
          <div class="preview-card secondary">
            <small>Social planning</small>
            <h3>Invite your crew</h3>
            <p>Join together, share plans, and never miss campus energy.</p>
          </div>
        </div>

        <div class="button-column">
          <button class="cta-button" data-nav="auth">Get Started</button>
          <button class="secondary-button" data-nav="home">Preview the Feed</button>
        </div>
      </section>
    `,
    auth: `
      <section class="screen">
        <div>
          <p class="eyebrow">Welcome Back</p>
          <h2 class="screen-title">Sign in to personalize your campus.</h2>
          <p class="screen-subtitle">
            Create an account to save events, see who’s attending, and get reminders before things start.
          </p>
        </div>

        <div class="auth-card stack">
          <div class="segmented">
            <button class="${state.authMode === "signup" ? "active" : ""}" data-auth-mode="signup">Sign up</button>
            <button class="${state.authMode === "login" ? "active" : ""}" data-auth-mode="login">Log in</button>
          </div>
          <div>
            <label class="field-label">Concordia Email</label>
            <input class="input-field" value="example@gmail.com" />
          </div>
          <div>
            <label class="field-label">${state.authMode === "signup" ? "Create Password" : "Password"}</label>
            <input class="input-field" type="password" value="password" />
          </div>
          ${state.authMode === "signup" ? `
          <div>
            <label class="field-label">Confirm Password</label>
            <input class="input-field" type="password" value="password" />
          </div>
          ` : ""}
          <button class="cta-button" data-nav="interests">Continue</button>
          <button class="secondary-button">Continue with Concordia SSO</button>
          <p class="helper-text">
            By continuing you agree to event reminders and campus club updates.
          </p>
        </div>
      </section>
    `,
    interests: `
      <section class="screen">
        <div>
          <p class="eyebrow">Personalize</p>
          <h2 class="screen-title">What do you want more of?</h2>
          <p class="screen-subtitle">
            Pick a few interests so CampusHub can recommend events that feel relevant from day one.
          </p>
        </div>

        <div class="panel-card">
          <h3 class="section-label">Recommended for first-year students</h3>
          <p class="section-copy">Choose at least 3 to unlock your feed.</p>
          <div class="interest-grid" style="margin-top: 1rem;">
            ${[
              "Social",
              "Career",
              "Arts",
              "Food",
              "Networking",
              "International",
              "Wellness",
              "Engineering",
              "Business",
              "Free Stuff",
            ]
              .map(
                (label) => `
                <button
                  class="interest-pill ${state.selectedInterests.includes(label) ? "active" : ""}"
                  data-interest="${label}"
                >
                  ${label}
                </button>
              `
              )
              .join("")}
          </div>
        </div>

        <div class="panel-card">
          <h3 class="section-label">Your feed will prioritize</h3>
          <div class="chip-row" style="margin-top: 0.85rem;">
            ${state.selectedInterests
              .map((label) => `<span class="chip active">${label}</span>`)
              .join("")}
          </div>
        </div>

        <div class="button-column" style="margin-top: auto;">
          <button class="cta-button" data-nav="home">Build My Feed</button>
          <button class="secondary-button" data-nav="welcome">Back</button>
        </div>
      </section>
    `,
    home: `
      <section class="screen">
        <div class="screen-header">
          <div>
            <p class="eyebrow">Discover</p>
            <h2 class="screen-title">Hi, something good is happening today.</h2>
            <p class="screen-subtitle">Personalized picks, popular campus moments, and what's coming up next.</p>
          </div>
          <button class="icon-button chip" data-nav="create">+</button>
        </div>

        <div class="search-bar">
          <span>⌕</span>
          <input value="${state.searchQuery}" placeholder="Search events, clubs, topics" data-search-input />
          <button class="chip active" data-nav="search">Filter</button>
        </div>

        ${state.apiError ? `
          <div class="panel-card">
            <h3 class="section-label">Backend status</h3>
            <p class="section-copy">${state.apiError}</p>
          </div>
        ` : ""}

        <div class="chip-row">
          ${["For You", "Career", "Community", "Wellness", "Academic", "Free"]
            .map(
              (chip) => `
                <button class="chip ${state.homeCategory === chip ? "active" : ""}" data-home-category="${chip}">
                  ${chip}
                </button>
              `
            )
            .join("")}
        </div>

        <div class="feed-banner">
          <strong>For You</strong>
          <h2>3 friends are going to events this week</h2>
          <p>CampusHub brings your best matches to the top so you can decide quickly and coordinate easily.</p>
          <div class="banner-stats">
            <div><span>12</span><small>Live today</small></div>
            <div><span>38</span><small>This week</small></div>
            <div><span>3</span><small>Friends going</small></div>
          </div>
        </div>

        <div class="section-head">
          <div>
            <h3 class="section-label">Recommended</h3>
            <p class="section-copy">Picked from your interests in career, social, and community events.</p>
          </div>
          <button class="ghost-button inline-link" data-nav="search">See all</button>
        </div>
        ${recommendedEvents.length ? recommendedEvents.map((item) => eventCard(item)).join("") : `<div class="panel-card"><p class="section-copy">No events match this category yet. Try another filter.</p></div>`}

        <div class="section-head">
          <div>
            <h3 class="section-label">Trending</h3>
            <p class="section-copy">Popular across SGW right now.</p>
          </div>
          <button class="ghost-button inline-link" ${trendingEvents[0] ? `data-open="${trendingEvents[0].id}"` : `data-nav="search"`}>Open</button>
        </div>
        ${trendingEvents.length ? trendingEvents.map((item) => eventCard(item, { compact: true, hideActions: true })).join("") : `<div class="panel-card"><p class="section-copy">No trending events in this view yet.</p></div>`}

        <div class="section-head">
          <div>
            <h3 class="section-label">Upcoming</h3>
            <p class="section-copy">Worth saving before your week fills up.</p>
          </div>
          <button class="ghost-button inline-link" data-nav="saved">Saved</button>
        </div>
        ${upcomingEvents.length ? upcomingEvents.map((item) => eventCard(item, { compact: true, hideActions: true })).join("") : `<div class="panel-card"><p class="section-copy">No upcoming events match this category.</p></div>`}
        ${renderNav("home")}
      </section>
    `,
    search: `
      <section class="screen">
        <div class="screen-header">
          <div>
            <h2 class="screen-title">Search & Filters</h2>
            <p class="screen-subtitle">Narrow down the right event in seconds.</p>
          </div>
          <button class="chip" data-nav="home">Done</button>
        </div>

        <div class="search-bar">
          <span>⌕</span>
          <input value="${state.searchQuery}" placeholder="networking, hackathon, workshop..." data-search-input />
        </div>

        <div class="panel-card stack">
          <div>
            <label class="field-label">Interests</label>
            <div class="chip-row">
              ${["Social", "Career", "Academic", "Wellness", "All"]
                .map(
                  (chip) => `
                    <button class="chip ${state.selectedFilters.interest === chip ? "active" : ""}" data-filter-group="interest" data-filter-value="${chip}">
                      ${chip}
                    </button>
                  `
                )
                .join("")}
            </div>
          </div>
          <div>
            <label class="field-label">Faculty</label>
            <div class="chip-row">
              ${["JMSB", "Engineering & CS", "Arts & Science", "All Students", "All"]
                .map(
                  (chip) => `
                    <button class="chip ${state.selectedFilters.faculty === chip ? "active" : ""}" data-filter-group="faculty" data-filter-value="${chip}">
                      ${chip}
                    </button>
                  `
                )
                .join("")}
            </div>
          </div>
          <div>
            <label class="field-label">Date</label>
            <div class="chip-row">
              ${["This Week", "Today", "Weekend"]
                .map(
                  (chip) => `
                    <button class="chip ${state.selectedFilters.date === chip ? "active" : ""}" data-filter-group="date" data-filter-value="${chip}">
                      ${chip}
                    </button>
                  `
                )
                .join("")}
            </div>
          </div>
          <div>
            <label class="field-label">Event Type</label>
            <div class="chip-row">
              ${["Free", "Workshop", "Party", "Talk", "All"]
                .map(
                  (chip) => `
                    <button class="chip ${state.selectedFilters.type === chip ? "active" : ""}" data-filter-group="type" data-filter-value="${chip}">
                      ${chip}
                    </button>
                  `
                )
                .join("")}
            </div>
          </div>
        </div>

        <div class="section-head">
          <div>
            <h3 class="section-label">Matching Events</h3>
            <p class="section-copy">${searchResults.length} result${searchResults.length === 1 ? "" : "s"} found</p>
          </div>
          <button class="ghost-button inline-link" data-clear-filters="true">Clear</button>
        </div>
        ${searchResults.length ? searchResults.map((item) => eventCard(item, { compact: true, hideActions: true })).join("") : `<div class="panel-card"><p class="section-copy">No events match these filters. Try clearing a few chips.</p></div>`}
        ${renderNav("search")}
      </section>
    `,
    details: `
      <section class="screen">
        <div class="screen-header">
          <button class="chip" data-nav="home">Back</button>
          <button class="chip" data-nav="friends">Friends</button>
        </div>

        <div class="detail-hero event-gradient-${event.image}">
          <div>
            <span class="event-badge">${event.type}</span>
            <h2 class="detail-title">${event.title}</h2>
            <p class="detail-summary">${event.description}</p>
          </div>
          <div class="event-meta">
            <span>${event.fullDate}</span>
            <span>${event.location}</span>
          </div>
        </div>

        <div class="stat-row">
          <div class="stat-chip">
            <strong>${event.attendeeCount} attending</strong>
            <span>Strong student turnout</span>
          </div>
          <div class="stat-chip">
            <strong>3 friends going</strong>
            <span>You will not be showing up alone</span>
          </div>
        </div>

        <div class="panel-card stack">
          <div>
            <h3 class="section-label">Event Info</h3>
            <div class="detail-info detail-info-grid">
              <div class="info-chip">
                <strong>Date & Time</strong>
                <span>${event.fullDate}</span>
              </div>
              <div class="info-chip">
                <strong>Location</strong>
                <span>${event.location}</span>
              </div>
              <div class="info-chip">
                <strong>Organizer</strong>
                <span>${event.organizer}</span>
              </div>
              <div class="info-chip">
                <strong>Entry</strong>
                <span>Free with student ID</span>
              </div>
            </div>
          </div>
          <div>
            <h3 class="section-label">Description</h3>
            <p class="section-copy">
              ${event.description}
            </p>
          </div>
          <div>
            <h3 class="section-label">Tags</h3>
            <div class="event-tag-row" style="margin-top: 0.7rem;">
              ${(event.tags || []).map((tag) => `<span class="event-tag">${tag}</span>`).join("")}
            </div>
          </div>
          <div>
            <h3 class="section-label">What to Expect</h3>
            <p class="section-copy">${event.comfortNote}</p>
          </div>
        </div>

        <div class="panel-card stack">
          <div class="section-head">
            <div>
              <h3 class="section-label">Friends Attending</h3>
              <p class="section-copy">Seeing familiar faces helps reduce the uncertainty of showing up.</p>
            </div>
            <button class="ghost-button inline-link" data-nav="friends">See all</button>
          </div>
          <div class="friend-preview-row">
            <div class="friend-preview-card">
              <span class="avatar">MP</span>
              <div>
                <strong>Maya P.</strong>
                <span>Already joined</span>
              </div>
            </div>
            <div class="friend-preview-card">
              <span class="avatar alt-a">KL</span>
              <div>
                <strong>Kevin L.</strong>
                <span>Thinking about it</span>
              </div>
            </div>
            <div class="friend-preview-card">
              <span class="avatar alt-b">AY</span>
              <div>
                <strong>Aisha Y.</strong>
                <span>Free that evening</span>
              </div>
            </div>
          </div>
        </div>

        <div class="detail-action-row" style="margin-top: auto;">
          <button class="secondary-button detail-mini-action ${isSaved(event.id) ? "active-outline" : ""}" data-save="${event.id}">
            ${isSaved(event.id) ? "Saved" : "Save"}
          </button>
          <button class="cta-button detail-primary-action" data-join="${event.id}">
            ${isJoined(event.id) ? "You’re Going" : "Join Event"}
          </button>
          <button class="secondary-button detail-mini-action" data-nav="friends">Invite</button>
        </div>
      </section>
    `,
    friends: `
      <section class="screen">
        <div class="screen-header">
          <div>
            <h2 class="screen-title">Coordinate With Friends</h2>
            <p class="screen-subtitle">See who is going, who might join, and make a simple plan.</p>
          </div>
          <button class="chip" data-nav="details">Back</button>
        </div>

        <div class="panel-card stack">
          <div class="section-head">
            <div>
              <h3 class="section-label">${event.title}</h3>
              <p class="section-copy">${event.fullDate} · ${event.location}</p>
            </div>
            <button class="cta-button coordination-invite">Invite Friends</button>
          </div>
          <div class="status-legend">
            <span class="status-pill going">Going</span>
            <span class="status-pill interested">Interested</span>
            <span class="status-pill invited">Invited</span>
          </div>
        </div>

        <div class="friend-card">
          <div class="friend-row">
            <div class="friend-meta">
              <span class="avatar">MP</span>
              <div><strong>Maya P.</strong><span>Already joined · in your ECON class</span></div>
            </div>
            <span class="status-pill going">Going</span>
          </div>
        </div>

        <div class="friend-card">
          <div class="friend-row">
            <div class="friend-meta">
              <span class="avatar alt-a">KL</span>
              <div><strong>Kevin L.</strong><span>Interested · waiting to confirm</span></div>
            </div>
            <span class="status-pill interested">Interested</span>
          </div>
        </div>

        <div class="friend-card">
          <div class="friend-row">
            <div class="friend-meta">
              <span class="avatar alt-b">AY</span>
              <div><strong>Aisha Y.</strong><span>Free after 6:30 PM · invite sent</span></div>
            </div>
            <span class="status-pill invited">Invited</span>
          </div>
        </div>

        <div class="panel-card stack">
          <div>
            <h3 class="section-label">Small Group Plan</h3>
            <p class="section-copy">Keep coordination lightweight with a few simple plan details.</p>
          </div>
          <div class="planning-grid">
            <div class="planning-card">
              <strong>Meetup Spot</strong>
              <span>JMSB front steps</span>
            </div>
            <div class="planning-card">
              <strong>Meetup Time</strong>
              <span>6:45 PM</span>
            </div>
            <div class="planning-card">
              <strong>Group Size</strong>
              <span>3 confirmed</span>
            </div>
            <div class="planning-card">
              <strong>Plan Note</strong>
              <span>Walk in together</span>
            </div>
          </div>
          <div class="chip-row">
            <button class="invite-pill">Suggest meetup</button>
            <button class="invite-pill">Share event link</button>
            <button class="invite-pill">Remind invited friends</button>
          </div>
        </div>

        <div class="button-column" style="margin-top: auto;">
          <button class="cta-button" data-nav="saved">Save Plan</button>
          <button class="secondary-button" data-nav="details">Back to Event</button>
        </div>
      </section>
    `,
    saved: `
      <section class="screen">
        <div class="screen-header">
          <div>
            <h2 class="screen-title">Saved Events</h2>
            <p class="screen-subtitle">Your shortlist for this week.</p>
          </div>
          <button class="chip" data-nav="home">Browse</button>
        </div>

        <div class="panel-card">
          <h3 class="section-label">Upcoming</h3>
          <p class="section-copy">Events you bookmarked or joined appear here for quick planning.</p>
        </div>

        ${events
          .filter((item) => isSaved(item.id))
          .map((item) => eventCard(item, { hideActions: true }))
          .join("")}

        ${renderNav("saved")}
      </section>
    `,
    notifications: `
      <section class="screen">
        <div class="screen-header">
          <div>
            <h2 class="screen-title">Notifications</h2>
            <p class="screen-subtitle">Reminders, RSVP updates, and friend activity.</p>
          </div>
          <button class="chip">Mark all read</button>
        </div>

        <div class="notification-card">
          <div class="notification-row">
            <div class="notification-meta">
              <span class="avatar">⏰</span>
              <div><strong>Reminder set</strong><span>Networking Night starts in 2 hours</span></div>
            </div>
            <div class="toggle active"></div>
          </div>
        </div>

        <div class="notification-card">
          <div class="notification-row">
            <div class="notification-meta">
              <span class="avatar alt-a">MP</span>
              <div><strong>Maya joined your event</strong><span>She’s going to Networking Night too</span></div>
            </div>
            <button class="chip" data-nav="friends">View</button>
          </div>
        </div>

        <div class="notification-card">
          <div class="notification-row">
            <div class="notification-meta">
              <span class="avatar alt-b">★</span>
              <div><strong>New match for you</strong><span>Hackathon fits your Career and Networking interests</span></div>
            </div>
            <button class="chip" data-open="hackathon">Open</button>
          </div>
        </div>

        <div class="panel-card">
          <h3 class="section-label">Notification Preferences</h3>
          <div class="stack" style="margin-top: 0.8rem;">
            <div class="notification-row">
              <div><strong>Event reminders</strong><div class="helper-text">24 hours and 2 hours before</div></div>
              <div class="toggle active"></div>
            </div>
            <div class="notification-row">
              <div><strong>Friend activity</strong><div class="helper-text">When friends join or save events</div></div>
              <div class="toggle active"></div>
            </div>
            <div class="notification-row">
              <div><strong>Club announcements</strong><div class="helper-text">For followed clubs and categories</div></div>
              <div class="toggle"></div>
            </div>
          </div>
        </div>

        ${renderNav("notifications")}
      </section>
    `,
    profile: `
      <section class="screen">
        <div class="profile-header">
          <div class="profile-top">
            <div class="profile-avatar">FL</div>
            <div>
              <h2>First name Last name</h2>
              <p>Undergraduate · JMSB · Montreal</p>
            </div>
          </div>
          <div class="stats-grid">
            <div><strong>14</strong><span>Saved</span></div>
            <div><strong>6</strong><span>Joined</span></div>
            <div><strong>9</strong><span>Interests</span></div>
          </div>
        </div>

        <div class="panel-card">
          <h3 class="section-label">Your interests</h3>
          <div class="chip-row" style="margin-top: 0.75rem;">
            ${state.selectedInterests.map((item) => `<span class="chip active">${item}</span>`).join("")}
          </div>
        </div>

        <div class="panel-card">
          <h3 class="section-label">Account</h3>
          <div class="stack" style="margin-top: 0.8rem;">
            <button class="secondary-button">Edit profile</button>
            <button class="secondary-button">Manage notifications</button>
            <button class="secondary-button" data-nav="create">Club/admin mode</button>
          </div>
        </div>

        <div class="panel-card">
          <h3 class="section-label">Prototype highlights</h3>
          <p class="section-copy">
            This screen shows how CampusHub can blend identity, preferences, and engagement history in one student-friendly profile space.
          </p>
        </div>

        ${renderNav("profile")}
      </section>
    `,
    create: `
      <section class="screen">
        <div class="screen-header">
          <div>
            <h2 class="screen-title">Create Event</h2>
            <p class="screen-subtitle">Post a campus event in under a minute.</p>
          </div>
          <button class="chip" data-nav="profile">Close</button>
        </div>

        ${state.apiError ? `
          <div class="panel-card">
            <h3 class="section-label">Publishing status</h3>
            <p class="section-copy">${state.apiError}</p>
          </div>
        ` : ""}

        <div class="creator-card stack">
          <div class="creator-topbar">
            <span class="event-tag">Club Organizer</span>
            <span class="helper-text">Draft autosaved</span>
          </div>
          <div>
            <label class="field-label">Event Title</label>
            <input class="input-field" value="${state.createEventDraft.title}" data-create-field="title" />
          </div>
          <div>
            <label class="field-label">Description</label>
            <textarea class="textarea-field" data-create-field="description">${state.createEventDraft.description}</textarea>
          </div>
          <div class="creator-grid">
            <div>
              <label class="field-label">Date</label>
              <input class="input-field" value="${state.createEventDraft.date}" data-create-field="date" />
            </div>
            <div>
              <label class="field-label">Time</label>
              <input class="input-field" value="${state.createEventDraft.time}" data-create-field="time" />
            </div>
          </div>
          <div>
            <label class="field-label">Location</label>
            <input class="input-field" value="${state.createEventDraft.location}" data-create-field="location" />
          </div>
          <div class="creator-grid">
            <div>
              <label class="field-label">Category</label>
              <select class="select-field" data-create-field="category">
                ${["Career", "Community", "Academic", "Wellness"].map((option) => `<option ${state.createEventDraft.category === option ? "selected" : ""}>${option}</option>`).join("")}
              </select>
            </div>
            <div>
              <label class="field-label">Upload Image</label>
              <button class="upload-field" data-upload-trigger="true">
                <span class="upload-icon">＋</span>
                <span>${state.createEventDraft.imageLabel}</span>
              </button>
            </div>
          </div>
          <div>
            <label class="field-label">Tags</label>
            <input class="input-field" value="${state.createEventDraft.tags}" data-create-field="tags" />
          </div>
          <div class="creator-footer">
            <p class="helper-text">Students will see this in personalized recommendations and search.</p>
            <button class="cta-button" data-publish-event="true" ${state.isSubmittingEvent ? "disabled" : ""}>
              ${state.isSubmittingEvent ? "Publishing..." : "Publish Event"}
            </button>
          </div>
        </div>

        <div class="panel-card">
          <h3 class="section-label">Quick Publishing</h3>
          <p class="section-copy">
            Keep it short, add a strong title and cover, and CampusHub handles discovery through feed placement and filters.
          </p>
        </div>
      </section>
    `,
  };

  app.innerHTML = markup[state.currentScreen];
  bindInteractions();
}

function bindInteractions() {
  document.querySelectorAll("[data-nav]").forEach((button) => {
    button.addEventListener("click", () => {
      goTo(button.dataset.nav);
    });
  });

  document.querySelectorAll("[data-open]").forEach((button) => {
    button.addEventListener("click", () => {
      state.selectedEventId = button.dataset.open;
      goTo("details");
    });
  });

  document.querySelectorAll("[data-save]").forEach((button) => {
    button.addEventListener("click", () => {
      toggleSave(button.dataset.save);
    });
  });

  document.querySelectorAll("[data-join]").forEach((button) => {
    button.addEventListener("click", () => {
      state.selectedEventId = button.dataset.join;
      joinEvent(button.dataset.join);
      goTo("friends");
    });
  });

  document.querySelectorAll("[data-interest]").forEach((button) => {
    button.addEventListener("click", () => {
      toggleInterest(button.dataset.interest);
    });
  });

  document.querySelectorAll("[data-home-category]").forEach((button) => {
    button.addEventListener("click", () => {
      setHomeCategory(button.dataset.homeCategory);
    });
  });

  document.querySelectorAll("[data-filter-group]").forEach((button) => {
    button.addEventListener("click", () => {
      setFilter(button.dataset.filterGroup, button.dataset.filterValue);
    });
  });

  document.querySelectorAll("[data-search-input]").forEach((input) => {
    input.addEventListener("input", () => {
      setSearchQuery(input.value);
    });
  });

  document.querySelectorAll("[data-clear-filters]").forEach((button) => {
    button.addEventListener("click", () => {
      state.searchQuery = "";
      state.selectedFilters = {
        interest: "All",
        faculty: "All",
        date: "This Week",
        type: "All",
      };
      render();
    });
  });

  document.querySelectorAll("[data-create-field]").forEach((field) => {
    const handler = () => {
      updateCreateEventDraft(field.dataset.createField, field.value);
    };
    field.addEventListener("input", handler);
    field.addEventListener("change", handler);
  });

  document.querySelectorAll("[data-upload-trigger]").forEach((button) => {
    button.addEventListener("click", () => {
      updateCreateEventDraft("imageLabel", "Cover selected");
      render();
    });
  });

  document.querySelectorAll("[data-auth-mode]").forEach((button) => {
    button.addEventListener("click", () => {
      state.authMode = button.dataset.authMode;
      render();
    });
  });

  document.querySelectorAll("[data-publish-event]").forEach((button) => {
    button.addEventListener("click", async () => {
      await publishCreatedEvent();
      render();
    });
  });
}

init();
