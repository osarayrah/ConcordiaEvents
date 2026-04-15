import React, { useMemo, useState } from "react";
import {
  Platform,
  Pressable,
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  useWindowDimensions,
  View,
} from "react-native";
import { StatusBar as ExpoStatusBar } from "expo-status-bar";

const INITIAL_EVENTS = [
  {
    id: "networking-night",
    title: "Networking Night",
    type: "Career",
    faculty: "JMSB",
    date: "Tonight · 7:00 PM",
    fullDate: "Thursday, March 28 · 7:00 PM",
    location: "John Molson Atrium",
    attendees: ["MP", "KL", "AY"],
    attendeeCount: 146,
    saves: 218,
    tags: ["Networking", "Career", "Free"],
    organizer: "JMSB Career Management Services",
    comfortNote: "Drop in anytime during the first hour. Most students arrive in small groups and name tags are provided.",
    image: 0,
    highlight: "Meet alumni, recruiters, and student founders in one evening.",
    description:
      "A polished evening mixer for Concordia students to meet alumni, club leaders, startup founders, and recruiters in a low-pressure networking setting.",
  },
  {
    id: "engineering-career-fair",
    title: "Engineering Career Fair",
    type: "Career",
    faculty: "Engineering & CS",
    date: "Fri · 11:00 AM",
    fullDate: "Friday, March 29 · 11:00 AM",
    location: "EV Building Hall",
    attendees: ["RS", "AM", "JD"],
    attendeeCount: 312,
    saves: 164,
    tags: ["Engineering", "Internships", "Career"],
    organizer: "Gina Cody School Career Services",
    comfortNote: "Bring your student ID and resume if you want, but many students come just to explore booths first.",
    image: 1,
    highlight: "Top employers, internship booths, and resume feedback.",
    description:
      "A faculty-wide career fair featuring engineering employers, recruiters, capstone showcases, and rapid resume review stations for students.",
  },
  {
    id: "hackathon",
    title: "Hackathon",
    type: "Career",
    faculty: "Engineering & CS",
    date: "Fri · 5:30 PM",
    fullDate: "Friday, March 29 · 5:30 PM",
    location: "JMSB Innovation Lab",
    attendees: ["SJ", "LM", "TN"],
    attendeeCount: 201,
    saves: 201,
    tags: ["Hackathon", "Tech", "Teams"],
    organizer: "ConUHacks Student Team",
    comfortNote: "Solo students are welcome. Team matching opens at the start so you do not need to arrive with a group.",
    image: 2,
    highlight: "Build fast, find teammates, and pitch by midnight.",
    description:
      "A beginner-friendly overnight build challenge where students team up, solve a campus problem, and get feedback from mentors and judges.",
  },
  {
    id: "club-social",
    title: "Club Social",
    type: "Community",
    faculty: "All Students",
    date: "Sat · 1:00 PM",
    fullDate: "Saturday, March 30 · 1:00 PM",
    location: "Grey Nuns Lounge",
    attendees: ["NB", "EL", "PM"],
    attendeeCount: 143,
    saves: 143,
    tags: ["Social", "Clubs", "Snacks"],
    organizer: "Concordia Student Union",
    comfortNote: "This is a casual mixer with games and snacks, designed to be easy to join even if you come alone.",
    image: 3,
    highlight: "Casual games, snacks, and easy ways to meet new people.",
    description:
      "A casual student club mixer designed for first-years, transfer students, and anyone looking to meet people without the pressure of a formal event.",
  },
  {
    id: "research-talk",
    title: "Research Talk",
    type: "Academic",
    faculty: "Arts & Science",
    date: "Sun · 6:30 PM",
    fullDate: "Sunday, March 31 · 6:30 PM",
    location: "Hall Building H-110",
    attendees: ["CR", "FS", "NL"],
    attendeeCount: 98,
    saves: 98,
    tags: ["Academic", "Talk", "Research"],
    organizer: "Faculty of Arts and Science",
    comfortNote: "No background knowledge is expected. There is a short Q&A and optional mingling after the talk.",
    image: 1,
    highlight: "Hear faculty and graduate researchers unpack emerging topics.",
    description:
      "An accessible research-focused event where students can listen to short talks, ask questions, and connect with labs or professors afterward.",
  },
  {
    id: "mental-health-workshop",
    title: "Mental Health Workshop",
    type: "Wellness",
    faculty: "Student Services",
    date: "Mon · 4:00 PM",
    fullDate: "Monday, April 1 · 4:00 PM",
    location: "Wellness Centre",
    attendees: ["JT", "OM", "RA"],
    attendeeCount: 131,
    saves: 131,
    tags: ["Wellness", "Workshop", "Support"],
    organizer: "Concordia Health Services",
    comfortNote: "Quiet setting, low-pressure format, and students can participate as much or as little as they want.",
    image: 0,
    highlight: "Practical stress tools before finals and busy weeks.",
    description:
      "A student-focused workshop on stress regulation, burnout prevention, and campus support resources led by wellness facilitators.",
  },
];

const interestOptions = [
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
];

const academicLevels = ["Undergraduate", "Graduate"];
const facultyOptions = [
  "Arts and Science",
  "Fine Arts",
  "Gina Cody School of Engineering and Computer Science",
  "John Molson School of Business",
  "School of Graduate Studies",
];

const tabItems = ["Home", "Search", "Saved", "Alerts", "Profile"];
const homeCategories = ["For You", "Career", "Community", "Wellness", "Academic", "Free"];

const screenGradients = [
  ["#7e2030", "#b44259"],
  ["#b8973d", "#d7c17c"],
  ["#4b5563", "#7a8698"],
  ["#3b6d5f", "#77a993"],
];

const SUGGESTED_FRIENDS = [
  {
    id: "maya-p",
    name: "Maya Patel",
    initials: "MP",
    faculty: "JMSB",
    mutuals: 6,
    interests: ["Career", "Networking", "Free Food"],
    note: "Usually goes to startup, networking, and speaker events.",
  },
  {
    id: "kevin-l",
    name: "Kevin Li",
    initials: "KL",
    faculty: "Engineering & CS",
    mutuals: 4,
    interests: ["Hackathons", "Tech", "Teams"],
    note: "Good match for hackathons, coding nights, and project meetups.",
  },
  {
    id: "aisha-y",
    name: "Aisha Youssef",
    initials: "AY",
    faculty: "Arts & Science",
    mutuals: 3,
    interests: ["Academic", "Talks", "Community"],
    note: "Often joins panel talks, socials, and campus community events.",
  },
  {
    id: "noah-b",
    name: "Noah Bernard",
    initials: "NB",
    faculty: "All Students",
    mutuals: 2,
    interests: ["Social", "Clubs", "Sports"],
    note: "A strong fit if you want club mixers and casual community events.",
  },
];

function Screen({ children, footer, contentWidth, horizontalPadding, footerBottomOffset }) {
  const { width } = useWindowDimensions();
  const isCompact = width < 390;

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" />
      <ExpoStatusBar style="dark" />
      <View style={styles.background}>
        <View style={styles.glowLeft} />
        <View style={styles.glowRight} />
        <View style={styles.screenShell}>
          <ScrollView
            contentContainerStyle={[
              styles.scrollContent,
              { paddingHorizontal: horizontalPadding },
              footer && styles.scrollContentWithFooter,
            ]}
            showsVerticalScrollIndicator={false}
          >
            <View
              style={[
                styles.contentWrap,
                { maxWidth: contentWidth },
                isCompact && styles.contentWrapCompact,
              ]}
            >
              {children}
            </View>
          </ScrollView>
          {footer ? (
            <View
              style={[
                styles.fixedFooter,
                {
                  left: horizontalPadding,
                  right: horizontalPadding,
                  bottom: footerBottomOffset,
                  maxWidth: contentWidth,
                },
              ]}
            >
              {footer}
            </View>
          ) : null}
        </View>
      </View>
    </SafeAreaView>
  );
}

function Chip({ label, active, onPress, wide }) {
  return (
    <Pressable onPress={onPress} style={[styles.chip, active && styles.chipActive, wide && styles.chipWide]}>
      <Text style={[styles.chipText, active && styles.chipTextActive]}>{label}</Text>
    </Pressable>
  );
}

function SectionTitle({ eyebrow, title, subtitle }) {
  return (
    <View style={styles.sectionTitle}>
      {eyebrow ? <Text style={styles.eyebrow}>{eyebrow}</Text> : null}
      <Text style={styles.title}>{title}</Text>
      {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
    </View>
  );
}

function EventArt({ event }) {
  const palette = screenGradients[event.image % screenGradients.length];
  return (
    <View style={[styles.eventArt, { backgroundColor: palette[0], borderColor: palette[1] }]}>
      <View style={[styles.eventGlow, { backgroundColor: palette[1] }]} />
      <Text style={styles.eventTypeBadge}>{event.type}</Text>
      <Text style={styles.eventTitle}>{event.title}</Text>
      <Text style={styles.eventMeta}>{event.date} · {event.faculty}</Text>
    </View>
  );
}

function EventCard({ event, saved, joined, compact, hideActions, onSave, onOpen, onJoin }) {
  return (
    <View style={[styles.card, compact && styles.cardCompact]}>
      <EventArt event={event} />
      <View style={styles.cardBody}>
        <View style={styles.rowBetween}>
          <View style={styles.flexOne}>
            <Text style={styles.cardHeading}>{event.location}</Text>
            <Text style={styles.cardSubcopy}>{event.highlight}</Text>
          </View>
          <Chip label={saved ? "Saved" : "Save"} active={saved} onPress={onSave} />
        </View>
        <View style={styles.tagRow}>
          {event.tags.slice(0, 3).map((tag) => (
            <View key={tag} style={styles.tag}>
              <Text style={styles.tagText}>{tag}</Text>
            </View>
          ))}
        </View>
        <View style={styles.rowBetween}>
          <Text style={styles.helper}>{event.attendeeCount} attending</Text>
          <Pressable onPress={onOpen}>
            <Text style={styles.link}>View</Text>
          </Pressable>
        </View>
        {!hideActions ? (
          <Pressable onPress={onJoin} style={styles.primaryButton}>
            <Text style={styles.primaryButtonText}>{joined ? "Leave Event" : "Join Event"}</Text>
          </Pressable>
        ) : null}
      </View>
    </View>
  );
}

export default function App() {
  const { width } = useWindowDimensions();
  const isCompact = width < 390;
  const isVeryCompact = width < 350;
  const horizontalPadding = width < 390 ? 14 : 18;
  const contentWidth = Math.min(width - horizontalPadding * 2, 430);
  const footerBottomOffset = Platform.OS === "ios" ? 8 : 12;
  const [events, setEvents] = useState(INITIAL_EVENTS);
  const [screen, setScreen] = useState("auth");
  const [authMode, setAuthMode] = useState("signup");
  const [authForm, setAuthForm] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [selectedEventId, setSelectedEventId] = useState(INITIAL_EVENTS[0].id);
  const [savedEventIds, setSavedEventIds] = useState([]);
  const [joinedEventIds, setJoinedEventIds] = useState([]);
  const [connectedFriendIds, setConnectedFriendIds] = useState(["maya-p", "kevin-l"]);
  const [selectedInterests, setSelectedInterests] = useState(["Social", "Career", "Food", "International"]);
  const [academicLevel, setAcademicLevel] = useState("Undergraduate");
  const [facultyName, setFacultyName] = useState("John Molson School of Business");
  const [homeCategory, setHomeCategory] = useState("For You");
  const [searchQuery, setSearchQuery] = useState("");
  const [filters, setFilters] = useState({
    interest: "All",
    faculty: "All",
    date: "This Week",
    type: "All",
  });
  const [draft, setDraft] = useState({
    title: "Concordia Club Networking Night",
    description:
      "Meet club leaders, students, and alumni for casual networking, quick intros, and a low-pressure evening mixer.",
    date: "April 12",
    time: "5:00 PM - 7:00 PM",
    location: "John Molson Lobby",
    category: "Career",
    tags: "Career, Networking, Free Food, Open to All",
  });

  const selectedEvent = useMemo(
    () => events.find((event) => event.id === selectedEventId) || events[0],
    [events, selectedEventId]
  );

  const homeEvents = useMemo(() => {
    return events.filter((event) => {
      if (homeCategory === "For You") {
        return event.tags.some((tag) => selectedInterests.includes(tag)) || event.type === "Career";
      }
      if (homeCategory === "Free") {
        return event.tags.includes("Free");
      }
      return event.type === homeCategory || event.tags.includes(homeCategory);
    });
  }, [events, homeCategory, selectedInterests]);

  const searchResults = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    return events.filter((event) => {
      const matchesQuery =
        !query ||
        [
          event.title,
          event.description,
          event.location,
          event.organizer,
          event.faculty,
          event.type,
          ...event.tags,
        ]
          .join(" ")
          .toLowerCase()
          .includes(query);

      const matchesInterest =
        filters.interest === "All" ||
        event.type === filters.interest ||
        event.tags.includes(filters.interest);

      const matchesFaculty = filters.faculty === "All" || event.faculty === filters.faculty;
      const matchesDate =
        filters.date === "This Week" ||
        (filters.date === "Today" && event.date.toLowerCase().includes("tonight")) ||
        (filters.date === "Weekend" && /(sat|sun)/i.test(event.date));
      const matchesType =
        filters.type === "All" ||
        (filters.type === "Free" && event.tags.includes("Free")) ||
        (filters.type === "Workshop" && event.tags.includes("Workshop")) ||
        (filters.type === "Talk" && (event.tags.includes("Talk") || event.type === "Academic")) ||
        (filters.type === "Party" && event.type === "Community");

      return matchesQuery && matchesInterest && matchesFaculty && matchesDate && matchesType;
    });
  }, [events, filters, searchQuery]);

  const savedEvents = useMemo(
    () => events.filter((event) => savedEventIds.includes(event.id)),
    [events, savedEventIds]
  );
  const profileName = authForm.name.trim() || "First name Last name";
  const profileInitials = profileName
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() || "")
    .join("") || "FL";
  const connectedFriends = useMemo(
    () => SUGGESTED_FRIENDS.filter((friend) => connectedFriendIds.includes(friend.id)),
    [connectedFriendIds]
  );
  const suggestedFriends = useMemo(
    () => SUGGESTED_FRIENDS.filter((friend) => !connectedFriendIds.includes(friend.id)),
    [connectedFriendIds]
  );
  const isAuthValid =
    authForm.email.trim() &&
    authForm.password.trim() &&
    (authMode === "login" ||
      (authForm.name.trim() &&
        authForm.confirmPassword.trim() &&
        authForm.password === authForm.confirmPassword));

  function toggleSave(id) {
    setSavedEventIds((current) =>
      current.includes(id) ? current.filter((eventId) => eventId !== id) : [...current, id]
    );
  }

  function joinEvent(id) {
    const isAlreadyJoined = joinedEventIds.includes(id);

    if (isAlreadyJoined) {
      setJoinedEventIds((current) => current.filter((eventId) => eventId !== id));
      setSavedEventIds((current) => current.filter((eventId) => eventId !== id));
      setSelectedEventId(id);
      setScreen("details");
      return;
    }

    setJoinedEventIds((current) => [...current, id]);
    setSavedEventIds((current) => (current.includes(id) ? current : [...current, id]));
    setSelectedEventId(id);
    setScreen("friends");
  }

  function toggleInterest(label) {
    setSelectedInterests((current) =>
      current.includes(label) ? current.filter((item) => item !== label) : [...current, label]
    );
  }

  function toggleFriendConnection(id) {
    setConnectedFriendIds((current) =>
      current.includes(id) ? current.filter((friendId) => friendId !== id) : [...current, id]
    );
  }

  function publishEvent() {
    if (!draft.title || !draft.description || !draft.date || !draft.time || !draft.location) {
      return;
    }

    const createdEvent = {
      id: `${draft.title.toLowerCase().replace(/[^a-z0-9]+/g, "-")}-${Date.now()}`,
      title: draft.title,
      type: draft.category,
      faculty: "All Students",
      date: `${draft.date} · ${draft.time}`,
      fullDate: `${draft.date} · ${draft.time}`,
      location: draft.location,
      attendees: ["JD"],
      attendeeCount: 1,
      saves: 0,
      tags: draft.tags.split(",").map((tag) => tag.trim()).filter(Boolean),
      organizer: "CampusHub Club Organizer",
      comfortNote: "Shared by a student organizer. Attendees can save it, invite friends, and coordinate from the event page.",
      image: events.length % screenGradients.length,
      highlight: draft.description.slice(0, 90) + (draft.description.length > 90 ? "..." : ""),
      description: draft.description,
    };

    setEvents((current) => [createdEvent, ...current]);
    setSavedEventIds((current) => [createdEvent.id, ...current]);
    setSelectedEventId(createdEvent.id);
    setScreen("details");
  }

  function openEvent(id) {
    setSelectedEventId(id);
    setScreen("details");
  }

  function renderBottomNav(active) {
    return (
      <View style={styles.bottomNav}>
        {tabItems.map((item) => {
          const target =
            item === "Alerts" ? "notifications" : item === "Profile" ? "profile" : item.toLowerCase();
          return (
            <Pressable
              key={item}
              onPress={() => setScreen(target)}
              style={[styles.navItem, active === target && styles.navItemActive]}
            >
              <Text style={[styles.navText, active === target && styles.navTextActive]}>{item}</Text>
            </Pressable>
          );
        })}
      </View>
    );
  }

  if (screen === "welcome") {
    return (
      <Screen
        footer={renderBottomNav("home")}
        contentWidth={contentWidth}
        horizontalPadding={horizontalPadding}
        footerBottomOffset={footerBottomOffset}
      >
        <View style={styles.heroCard}>
          <Text style={styles.brandMark}>C</Text>
          <Text style={styles.eyebrow}>CampusHub Mobile</Text>
          <Text
            style={[
              styles.heroTitle,
              isCompact && styles.heroTitleCompact,
              isVeryCompact && styles.heroTitleVeryCompact,
            ]}
          >
            Find what&apos;s happening at Concordia.
          </Text>
          <Text style={styles.subtitle}>
            One app for campus events, social planning, and quick discovery without the scattered posters and links.
          </Text>
          <View style={[styles.statsRow, isCompact && styles.statsRowCompact]}>
            <View style={styles.statCard}>
              <Text style={styles.statValue}>120+</Text>
              <Text style={styles.statLabel}>Events</Text>
            </View>
            <View style={styles.statCard}>
              <Text style={styles.statValue}>3</Text>
              <Text style={styles.statLabel}>Friends going</Text>
            </View>
            <View style={styles.statCard}>
              <Text style={styles.statValue}>1</Text>
              <Text style={styles.statLabel}>Clean feed</Text>
            </View>
          </View>
        </View>
        <View style={styles.previewPanel}>
          <Text style={styles.sectionLabel}>What the app shows</Text>
          <Text style={styles.cardSubcopy}>Personalized events, fast filters, event details, invites, and lightweight organizer publishing.</Text>
        </View>
        <Pressable style={styles.primaryButton} onPress={() => setScreen("auth")}>
          <Text style={styles.primaryButtonText}>Open the App</Text>
        </Pressable>
        <Pressable style={styles.secondaryButton} onPress={() => setScreen("home")}>
          <Text style={styles.secondaryButtonText}>Skip to Feed</Text>
        </Pressable>
      </Screen>
    );
  }

  if (screen === "auth") {
    return (
      <Screen
        contentWidth={contentWidth}
        horizontalPadding={horizontalPadding}
        footerBottomOffset={footerBottomOffset}
      >
        <SectionTitle
          eyebrow="Welcome Back"
          title="Sign in to personalize your campus."
          subtitle="Create an account to save events, see who is attending, and get reminders before things start."
        />
        <View style={styles.panel}>
          <View style={[styles.segmented, isVeryCompact && styles.segmentedCompact]}>
            <Chip label="Sign Up" active={authMode === "signup"} onPress={() => setAuthMode("signup")} wide />
            <Chip label="Log In" active={authMode === "login"} onPress={() => setAuthMode("login")} wide />
          </View>
          {authMode === "signup" ? (
            <TextInput
              style={styles.input}
              value={authForm.name}
              onChangeText={(value) => setAuthForm((current) => ({ ...current, name: value }))}
              placeholder="Full name"
              placeholderTextColor="#8c7d80"
            />
          ) : null}
          <TextInput
            style={styles.input}
            value={authForm.email}
            onChangeText={(value) => setAuthForm((current) => ({ ...current, email: value }))}
            placeholder="Concordia email"
            placeholderTextColor="#8c7d80"
            autoCapitalize="none"
            keyboardType="email-address"
          />
          <TextInput
            style={styles.input}
            value={authForm.password}
            onChangeText={(value) => setAuthForm((current) => ({ ...current, password: value }))}
            placeholder={authMode === "signup" ? "Create password" : "Password"}
            placeholderTextColor="#8c7d80"
            secureTextEntry
          />
          {authMode === "signup" ? (
            <TextInput
              style={styles.input}
              value={authForm.confirmPassword}
              onChangeText={(value) => setAuthForm((current) => ({ ...current, confirmPassword: value }))}
              placeholder="Confirm password"
              placeholderTextColor="#8c7d80"
              secureTextEntry
            />
          ) : null}
          {authMode === "signup" &&
          authForm.confirmPassword &&
          authForm.password !== authForm.confirmPassword ? (
            <Text style={styles.errorText}>Passwords must match to continue.</Text>
          ) : null}
        </View>
        <Pressable
          style={[styles.primaryButton, !isAuthValid && styles.primaryButtonDisabled]}
          onPress={() => {
            if (isAuthValid) {
              setScreen("interests");
            }
          }}
        >
          <Text style={styles.primaryButtonText}>Continue</Text>
        </Pressable>
      </Screen>
    );
  }

  if (screen === "interests") {
    return (
      <Screen
        contentWidth={contentWidth}
        horizontalPadding={horizontalPadding}
        footerBottomOffset={footerBottomOffset}
      >
        <SectionTitle
          eyebrow="Personalize"
          title="What do you want more of?"
          subtitle="Pick a few interests so the feed feels relevant right away."
        />
        <View style={styles.panel}>
          <Text style={styles.sectionLabel}>Academic Level</Text>
          <View style={styles.wrapRow}>
            {academicLevels.map((level) => (
              <Chip
                key={level}
                label={level}
                active={academicLevel === level}
                onPress={() => setAcademicLevel(level)}
              />
            ))}
          </View>
        </View>
        <View style={styles.panel}>
          <Text style={styles.sectionLabel}>Faculty</Text>
          <View style={styles.wrapRow}>
            {facultyOptions.map((faculty) => (
              <Chip
                key={faculty}
                label={faculty}
                active={facultyName === faculty}
                onPress={() => setFacultyName(faculty)}
              />
            ))}
          </View>
        </View>
        <View style={styles.panel}>
          <Text style={styles.sectionLabel}>Interests</Text>
          <View style={styles.wrapRow}>
            {interestOptions.map((label) => (
              <Chip
                key={label}
                label={label}
                active={selectedInterests.includes(label)}
                onPress={() => toggleInterest(label)}
              />
            ))}
          </View>
        </View>
        <Pressable style={styles.primaryButton} onPress={() => setScreen("home")}>
          <Text style={styles.primaryButtonText}>Build My Feed</Text>
        </Pressable>
      </Screen>
    );
  }

  if (screen === "home") {
    return (
      <Screen
        footer={renderBottomNav("home")}
        contentWidth={contentWidth}
        horizontalPadding={horizontalPadding}
        footerBottomOffset={footerBottomOffset}
      >
        <SectionTitle
          eyebrow="Discover"
          title="Hi, something good is happening today."
          subtitle="Personalized picks, popular campus moments, and what is coming up next."
        />
        <View style={[styles.searchBar, isVeryCompact && styles.searchBarCompact]}>
          <TextInput
            style={styles.searchInput}
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholder="Search events, clubs, topics"
            placeholderTextColor="#8c7d80"
          />
          <Pressable onPress={() => setScreen("search")}>
            <Text style={styles.link}>Filter</Text>
          </Pressable>
        </View>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.horizontalChips}>
          {homeCategories.map((category) => (
            <Chip
              key={category}
              label={category}
              active={homeCategory === category}
              onPress={() => setHomeCategory(category)}
            />
          ))}
        </ScrollView>
        <View style={styles.banner}>
          <Text style={styles.sectionLabel}>For You</Text>
          <Text style={styles.bannerTitle}>3 friends are going to events this week</Text>
        
        </View>
        {homeEvents.map((event) => (
          <EventCard
            key={event.id}
            event={event}
            saved={savedEventIds.includes(event.id)}
            joined={joinedEventIds.includes(event.id)}
            onSave={() => toggleSave(event.id)}
            onOpen={() => openEvent(event.id)}
            onJoin={() => joinEvent(event.id)}
          />
        ))}
      </Screen>
    );
  }

  if (screen === "search") {
    return (
      <Screen
        footer={renderBottomNav("search")}
        contentWidth={contentWidth}
        horizontalPadding={horizontalPadding}
        footerBottomOffset={footerBottomOffset}
      >
        <SectionTitle
          title="Search & Filters"
          subtitle="Narrow down the right event in seconds."
        />
        <View style={styles.panel}>
          <TextInput
            style={styles.input}
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholder="networking, hackathon, workshop..."
            placeholderTextColor="#8c7d80"
          />
          <Text style={styles.sectionLabel}>Interest</Text>
          <View style={styles.wrapRow}>
            {["Social", "Career", "Academic", "Wellness", "All"].map((item) => (
              <Chip
                key={item}
                label={item}
                active={filters.interest === item}
                onPress={() => setFilters((current) => ({ ...current, interest: item }))}
              />
            ))}
          </View>
        </View>
        {searchResults.map((event) => (
          <EventCard
            key={event.id}
            event={event}
            compact
            hideActions
            saved={savedEventIds.includes(event.id)}
            joined={joinedEventIds.includes(event.id)}
            onSave={() => toggleSave(event.id)}
            onOpen={() => openEvent(event.id)}
            onJoin={() => joinEvent(event.id)}
          />
        ))}
      </Screen>
    );
  }

  if (screen === "details") {
    return (
      <Screen
        footer={renderBottomNav("saved")}
        contentWidth={contentWidth}
        horizontalPadding={horizontalPadding}
        footerBottomOffset={footerBottomOffset}
      >
        <Pressable onPress={() => setScreen("home")}>
          <Text style={styles.link}>Back</Text>
        </Pressable>
        <EventArt event={selectedEvent} />
        <View style={styles.panel}>
          <Text style={styles.title}>{selectedEvent.title}</Text>
          <Text style={styles.subtitle}>{selectedEvent.description}</Text>
          <View style={styles.infoGrid}>
            <View style={styles.infoCard}>
              <Text style={styles.sectionLabel}>Date & Time</Text>
              <Text style={styles.cardSubcopy}>{selectedEvent.fullDate}</Text>
            </View>
            <View style={styles.infoCard}>
              <Text style={styles.sectionLabel}>Location</Text>
              <Text style={styles.cardSubcopy}>{selectedEvent.location}</Text>
            </View>
            <View style={styles.infoCard}>
              <Text style={styles.sectionLabel}>Organizer</Text>
              <Text style={styles.cardSubcopy}>{selectedEvent.organizer}</Text>
            </View>
            <View style={styles.infoCard}>
              <Text style={styles.sectionLabel}>Entry</Text>
              <Text style={styles.cardSubcopy}>Free with student ID</Text>
            </View>
          </View>
          <Text style={styles.sectionLabel}>What to Expect</Text>
          <Text style={styles.cardSubcopy}>{selectedEvent.comfortNote}</Text>
        </View>
        <View style={[styles.actionRow, isCompact && styles.actionRowCompact]}>
          <Pressable style={styles.secondaryButtonTight} onPress={() => toggleSave(selectedEvent.id)}>
            <Text style={styles.secondaryButtonText}>
              {savedEventIds.includes(selectedEvent.id) ? "Saved" : "Save"}
            </Text>
          </Pressable>
          <Pressable style={styles.primaryButtonFlex} onPress={() => joinEvent(selectedEvent.id)}>
            <Text style={styles.primaryButtonText}>
              {joinedEventIds.includes(selectedEvent.id) ? "Leave Event" : "Join Event"}
            </Text>
          </Pressable>
        </View>
      </Screen>
    );
  }

  if (screen === "friends") {
    return (
      <Screen
        footer={renderBottomNav("saved")}
        contentWidth={contentWidth}
        horizontalPadding={horizontalPadding}
        footerBottomOffset={footerBottomOffset}
      >
        <SectionTitle
          title="Coordinate With Friends"
          subtitle="See who is going, who might join, and make a simple plan."
        />
        <View style={styles.panel}>
          <Text style={styles.sectionLabel}>{selectedEvent.title}</Text>
          <Text style={styles.cardSubcopy}>{selectedEvent.fullDate} · {selectedEvent.location}</Text>
        </View>
        {[
          ["Maya P.", "Already joined", "Going"],
          ["Kevin L.", "Interested · waiting to confirm", "Interested"],
          ["Aisha Y.", "Free after 6:30 PM · invite sent", "Invited"],
        ].map(([name, note, status]) => (
          <View key={name} style={[styles.friendCard, isCompact && styles.friendCardCompact]}>
            <View style={styles.avatar} />
            <View style={styles.flexOne}>
              <Text style={styles.cardHeading}>{name}</Text>
              <Text style={styles.cardSubcopy}>{note}</Text>
            </View>
            <Text style={styles.statusPill}>{status}</Text>
          </View>
        ))}
        <Pressable style={styles.primaryButton} onPress={() => setScreen("saved")}>
          <Text style={styles.primaryButtonText}>Save Plan</Text>
        </Pressable>
      </Screen>
    );
  }

  if (screen === "saved") {
    return (
      <Screen
        footer={renderBottomNav("saved")}
        contentWidth={contentWidth}
        horizontalPadding={horizontalPadding}
        footerBottomOffset={footerBottomOffset}
      >
        <SectionTitle title="Saved Events" subtitle="Your shortlist for this week." />
        {savedEvents.length ? (
          savedEvents.map((event) => (
            <EventCard
              key={event.id}
              event={event}
              hideActions
              saved
              joined={joinedEventIds.includes(event.id)}
              onSave={() => toggleSave(event.id)}
              onOpen={() => openEvent(event.id)}
              onJoin={() => joinEvent(event.id)}
            />
          ))
        ) : (
          <View style={styles.panel}>
            <Text style={styles.sectionLabel}>Nothing saved yet</Text>
            <Text style={styles.cardSubcopy}>
              Save an event or join one from the feed, search results, or event details and it will appear here.
            </Text>
          </View>
        )}
      </Screen>
    );
  }

  if (screen === "notifications") {
    return (
      <Screen
        footer={renderBottomNav("notifications")}
        contentWidth={contentWidth}
        horizontalPadding={horizontalPadding}
        footerBottomOffset={footerBottomOffset}
      >
        <SectionTitle title="Notifications" subtitle="Reminders, RSVP updates, and friend activity." />
        {[
          "Networking Night starts in 2 hours",
          "Maya joined your event",
          "Hackathon fits your Career and Networking interests",
        ].map((item) => (
          <View key={item} style={styles.panel}>
            <Text style={styles.cardHeading}>{item}</Text>
          </View>
        ))}
      </Screen>
    );
  }

  if (screen === "profile") {
    return (
      <Screen
        footer={renderBottomNav("profile")}
        contentWidth={contentWidth}
        horizontalPadding={horizontalPadding}
        footerBottomOffset={footerBottomOffset}
      >
        <View style={styles.profileHero}>
          <View style={styles.profileAvatar}>
            <Text style={styles.profileAvatarText}>{profileInitials}</Text>
          </View>
          <Text style={styles.title}>{profileName}</Text>
          <Text style={styles.subtitle}>{academicLevel} · {facultyName} · Montreal</Text>
        </View>
        <View style={[styles.statsRow, isCompact && styles.statsRowCompact]}>
          {[
            ["14", "Saved"],
            ["6", "Joined"],
            [String(connectedFriendIds.length), "Friends"],
          ].map(([value, label]) => (
            <View key={label} style={styles.statCard}>
              <Text style={styles.statValue}>{value}</Text>
              <Text style={styles.statLabel}>{label}</Text>
            </View>
          ))}
        </View>
        <View style={styles.panel}>
          <Text style={styles.sectionLabel}>Academic Profile</Text>
          <View style={styles.wrapRow}>
            <Chip label={academicLevel} active />
            <Chip label={facultyName} active />
          </View>
        </View>
        <View style={styles.panel}>
          <Text style={styles.sectionLabel}>Your interests</Text>
          <View style={styles.wrapRow}>
            {selectedInterests.map((interest) => (
              <Chip key={interest} label={interest} active />
            ))}
          </View>
        </View>
        <Pressable style={styles.primaryButton} onPress={() => setScreen("create")}>
          <Text style={styles.primaryButtonText}>Club / Admin Mode</Text>
        </Pressable>
        <Pressable style={styles.secondaryButton} onPress={() => setScreen("discoverFriends")}>
          <Text style={styles.secondaryButtonText}>Find Friends</Text>
        </Pressable>
      </Screen>
    );
  }

  if (screen === "discoverFriends") {
    return (
      <Screen
        footer={renderBottomNav("profile")}
        contentWidth={contentWidth}
        horizontalPadding={horizontalPadding}
        footerBottomOffset={footerBottomOffset}
      >
        <SectionTitle
          title="Add Friends"
          subtitle="Find classmates with shared interests so events feel easier to join together."
        />

        <View style={styles.panel}>
          <Text style={styles.sectionLabel}>Connected Friends</Text>
          {connectedFriends.length ? (
            connectedFriends.map((friend) => (
              <View key={friend.id} style={styles.friendDiscoveryCard}>
                <View style={styles.friendIdentity}>
                  <View style={styles.friendBadge}>
                    <Text style={styles.friendBadgeText}>{friend.initials}</Text>
                  </View>
                  <View style={styles.flexOne}>
                    <Text style={styles.cardHeading}>{friend.name}</Text>
                    <Text style={styles.cardSubcopy}>
                      {friend.faculty} · {friend.mutuals} mutuals
                    </Text>
                  </View>
                </View>
                <View style={styles.tagRow}>
                  {friend.interests.map((interest) => (
                    <View key={interest} style={styles.tag}>
                      <Text style={styles.tagText}>{interest}</Text>
                    </View>
                  ))}
                </View>
                <Text style={styles.cardSubcopy}>{friend.note}</Text>
                <Pressable
                  style={styles.secondaryButton}
                  onPress={() => toggleFriendConnection(friend.id)}
                >
                  <Text style={styles.secondaryButtonText}>Remove Friend</Text>
                </Pressable>
              </View>
            ))
          ) : (
            <Text style={styles.cardSubcopy}>No friends added yet. Start with the suggestions below.</Text>
          )}
        </View>

        <View style={styles.panel}>
          <Text style={styles.sectionLabel}>Suggested For You</Text>
          {suggestedFriends.map((friend) => (
            <View key={friend.id} style={styles.friendDiscoveryCard}>
              <View style={styles.friendIdentity}>
                <View style={[styles.friendBadge, styles.friendBadgeAlt]}>
                  <Text style={styles.friendBadgeText}>{friend.initials}</Text>
                </View>
                <View style={styles.flexOne}>
                  <Text style={styles.cardHeading}>{friend.name}</Text>
                  <Text style={styles.cardSubcopy}>
                    {friend.faculty} · {friend.mutuals} mutuals
                  </Text>
                </View>
              </View>
              <View style={styles.tagRow}>
                {friend.interests.map((interest) => (
                  <View key={interest} style={styles.tag}>
                    <Text style={styles.tagText}>{interest}</Text>
                  </View>
                ))}
              </View>
              <Text style={styles.cardSubcopy}>{friend.note}</Text>
              <Pressable
                style={styles.primaryButton}
                onPress={() => toggleFriendConnection(friend.id)}
              >
                <Text style={styles.primaryButtonText}>Add Friend</Text>
              </Pressable>
            </View>
          ))}
        </View>
      </Screen>
    );
  }

  return (
    <Screen
      footer={renderBottomNav("profile")}
      contentWidth={contentWidth}
      horizontalPadding={horizontalPadding}
      footerBottomOffset={footerBottomOffset}
    >
      <SectionTitle title="Create Event" subtitle="Post a campus event in under a minute." />
      <View style={styles.panel}>
        <TextInput style={styles.input} value={draft.title} onChangeText={(value) => setDraft((current) => ({ ...current, title: value }))} placeholder="Event title" placeholderTextColor="#8c7d80" />
        <TextInput style={[styles.input, styles.textArea]} value={draft.description} onChangeText={(value) => setDraft((current) => ({ ...current, description: value }))} placeholder="Description" placeholderTextColor="#8c7d80" multiline />
        <TextInput style={styles.input} value={draft.date} onChangeText={(value) => setDraft((current) => ({ ...current, date: value }))} placeholder="Date" placeholderTextColor="#8c7d80" />
        <TextInput style={styles.input} value={draft.time} onChangeText={(value) => setDraft((current) => ({ ...current, time: value }))} placeholder="Time" placeholderTextColor="#8c7d80" />
        <TextInput style={styles.input} value={draft.location} onChangeText={(value) => setDraft((current) => ({ ...current, location: value }))} placeholder="Location" placeholderTextColor="#8c7d80" />
        <TextInput style={styles.input} value={draft.category} onChangeText={(value) => setDraft((current) => ({ ...current, category: value }))} placeholder="Category" placeholderTextColor="#8c7d80" />
        <TextInput style={styles.input} value={draft.tags} onChangeText={(value) => setDraft((current) => ({ ...current, tags: value }))} placeholder="Tags" placeholderTextColor="#8c7d80" />
      </View>
      <Pressable style={styles.primaryButton} onPress={publishEvent}>
        <Text style={styles.primaryButtonText}>Publish Event</Text>
      </Pressable>
      <Pressable style={styles.secondaryButton} onPress={() => setScreen("profile")}>
        <Text style={styles.secondaryButtonText}>Close</Text>
      </Pressable>
    </Screen>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#f7f1ee",
  },
  background: {
    flex: 1,
    backgroundColor: "#f7f1ee",
  },
  screenShell: {
    flex: 1,
  },
  glowLeft: {
    position: "absolute",
    width: 240,
    height: 240,
    borderRadius: 120,
    backgroundColor: "rgba(145, 35, 56, 0.16)",
    top: -40,
    left: -70,
  },
  glowRight: {
    position: "absolute",
    width: 260,
    height: 260,
    borderRadius: 130,
    backgroundColor: "rgba(203, 181, 118, 0.18)",
    bottom: -70,
    right: -90,
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 14,
    paddingBottom: 32,
  },
  scrollContentWithFooter: {
    paddingBottom: 132,
  },
  contentWrap: {
    width: "100%",
    alignSelf: "center",
    maxWidth: 430,
    gap: 14,
  },
  contentWrapCompact: {
    gap: 12,
  },
  fixedFooter: {
    position: "absolute",
    width: "100%",
    alignSelf: "center",
  },
  heroCard: {
    backgroundColor: "#ffffff",
    borderRadius: 30,
    padding: 24,
    borderWidth: 1,
    borderColor: "rgba(145, 35, 56, 0.08)",
    shadowColor: "#2c2c2c",
    shadowOpacity: 0.1,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: 12 },
    elevation: 4,
  },
  brandMark: {
    width: 58,
    height: 58,
    borderRadius: 29,
    backgroundColor: "#912338",
    color: "#ffffff",
    textAlign: "center",
    textAlignVertical: "center",
    fontSize: 28,
    fontWeight: "800",
    overflow: "hidden",
    marginBottom: 16,
    paddingTop: 10,
  },
  eyebrow: {
    color: "#912338",
    fontSize: 12,
    fontWeight: "800",
    textTransform: "uppercase",
    letterSpacing: 1.3,
    marginBottom: 8,
  },
  heroTitle: {
    color: "#1f1719",
    fontSize: 34,
    lineHeight: 36,
    fontWeight: "800",
    marginBottom: 12,
  },
  heroTitleCompact: {
    fontSize: 30,
    lineHeight: 33,
  },
  heroTitleVeryCompact: {
    fontSize: 26,
    lineHeight: 29,
  },
  title: {
    color: "#1f1719",
    fontSize: 28,
    lineHeight: 31,
    fontWeight: "800",
  },
  subtitle: {
    color: "#6f6165",
    fontSize: 15,
    lineHeight: 23,
    marginTop: 10,
  },
  sectionTitle: {
    gap: 2,
  },
  sectionLabel: {
    color: "#2f2327",
    fontSize: 14,
    fontWeight: "800",
    marginBottom: 8,
  },
  previewPanel: {
    backgroundColor: "rgba(255,255,255,0.82)",
    borderRadius: 24,
    padding: 18,
    borderWidth: 1,
    borderColor: "rgba(145, 35, 56, 0.08)",
  },
  panel: {
    backgroundColor: "rgba(255,255,255,0.88)",
    borderRadius: 24,
    padding: 18,
    borderWidth: 1,
    borderColor: "rgba(145, 35, 56, 0.08)",
    gap: 12,
  },
  searchBar: {
    backgroundColor: "rgba(255,255,255,0.88)",
    borderRadius: 22,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: "rgba(145, 35, 56, 0.08)",
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  searchBarCompact: {
    paddingHorizontal: 14,
    gap: 8,
  },
  searchInput: {
    flex: 1,
    color: "#1f1719",
    fontSize: 15,
  },
  input: {
    backgroundColor: "#f8f3f1",
    borderRadius: 18,
    paddingHorizontal: 14,
    paddingVertical: 13,
    color: "#1f1719",
    fontSize: 15,
    borderWidth: 1,
    borderColor: "rgba(145, 35, 56, 0.08)",
  },
  textArea: {
    minHeight: 110,
    textAlignVertical: "top",
  },
  segmented: {
    flexDirection: "row",
    gap: 10,
  },
  segmentedCompact: {
    flexDirection: "column",
  },
  wrapRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
  },
  horizontalChips: {
    gap: 10,
    paddingRight: 18,
  },
  chip: {
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 999,
    backgroundColor: "#f0e4e5",
  },
  chipWide: {
    flex: 1,
    alignItems: "center",
  },
  chipActive: {
    backgroundColor: "#912338",
  },
  chipText: {
    color: "#7d3947",
    fontSize: 13,
    fontWeight: "700",
  },
  chipTextActive: {
    color: "#ffffff",
  },
  banner: {
    backgroundColor: "#912338",
    borderRadius: 28,
    padding: 20,
  },
  bannerTitle: {
    color: "#ffffff",
    fontSize: 24,
    lineHeight: 28,
    fontWeight: "800",
    marginBottom: 8,
  },
  card: {
    backgroundColor: "rgba(255,255,255,0.9)",
    borderRadius: 28,
    borderWidth: 1,
    borderColor: "rgba(145, 35, 56, 0.08)",
    overflow: "hidden",
  },
  cardCompact: {
    borderRadius: 22,
  },
  eventArt: {
    minHeight: 146,
    padding: 18,
    justifyContent: "space-between",
    overflow: "hidden",
  },
  eventGlow: {
    position: "absolute",
    width: 180,
    height: 180,
    borderRadius: 90,
    opacity: 0.25,
    right: -30,
    top: -20,
  },
  eventTypeBadge: {
    alignSelf: "flex-start",
    backgroundColor: "rgba(255,255,255,0.18)",
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
    color: "#ffffff",
    fontWeight: "700",
    fontSize: 12,
  },
  eventTitle: {
    color: "#ffffff",
    fontSize: 26,
    lineHeight: 28,
    fontWeight: "800",
    marginTop: 20,
  },
  eventMeta: {
    color: "rgba(255,255,255,0.88)",
    fontSize: 13,
    fontWeight: "600",
    marginTop: 10,
  },
  cardBody: {
    padding: 18,
    gap: 12,
  },
  rowBetween: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    gap: 12,
  },
  flexOne: {
    flex: 1,
    minWidth: 0,
  },
  cardHeading: {
    color: "#1f1719",
    fontSize: 16,
    fontWeight: "800",
  },
  cardSubcopy: {
    color: "#6f6165",
    fontSize: 14,
    lineHeight: 21,
  },
  tagRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  tag: {
    backgroundColor: "#f3ece8",
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  tagText: {
    color: "#7c6469",
    fontSize: 12,
    fontWeight: "700",
  },
  helper: {
    color: "#7c6469",
    fontSize: 13,
    fontWeight: "600",
  },
  link: {
    color: "#912338",
    fontSize: 14,
    fontWeight: "800",
  },
  primaryButton: {
    backgroundColor: "#912338",
    borderRadius: 18,
    paddingVertical: 15,
    alignItems: "center",
  },
  primaryButtonDisabled: {
    opacity: 0.45,
  },
  primaryButtonFlex: {
    flex: 1,
    backgroundColor: "#912338",
    borderRadius: 18,
    paddingVertical: 15,
    alignItems: "center",
  },
  primaryButtonText: {
    color: "#ffffff",
    fontSize: 14,
    fontWeight: "800",
    textAlign: "center",
  },
  secondaryButton: {
    borderRadius: 18,
    paddingVertical: 15,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "rgba(145, 35, 56, 0.14)",
    backgroundColor: "rgba(255,255,255,0.88)",
  },
  secondaryButtonTight: {
    minWidth: 110,
    flexGrow: 1,
    borderRadius: 18,
    paddingVertical: 15,
    paddingHorizontal: 18,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "rgba(145, 35, 56, 0.14)",
    backgroundColor: "rgba(255,255,255,0.88)",
  },
  secondaryButtonText: {
    color: "#6f1829",
    fontSize: 14,
    fontWeight: "800",
    textAlign: "center",
  },
  errorText: {
    color: "#912338",
    fontSize: 13,
    fontWeight: "700",
  },
  bottomNav: {
    flexDirection: "row",
    flexWrap: "wrap",
    backgroundColor: "rgba(255,255,255,0.9)",
    borderRadius: 22,
    padding: 8,
    borderWidth: 1,
    borderColor: "rgba(145, 35, 56, 0.08)",
    gap: 6,
    shadowColor: "#2c2c2c",
    shadowOpacity: 0.08,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 8 },
    elevation: 6,
  },
  navItem: {
    flex: 1,
    minWidth: 56,
    borderRadius: 16,
    paddingVertical: 10,
    alignItems: "center",
  },
  navItemActive: {
    backgroundColor: "#912338",
  },
  navText: {
    color: "#7d3947",
    fontSize: 12,
    fontWeight: "700",
  },
  navTextActive: {
    color: "#ffffff",
  },
  statsRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
    marginTop: 18,
  },
  statsRowCompact: {
    gap: 8,
  },
  statCard: {
    flex: 1,
    minWidth: 90,
    backgroundColor: "#f6ece8",
    borderRadius: 20,
    padding: 14,
  },
  statValue: {
    color: "#1f1719",
    fontSize: 22,
    fontWeight: "800",
  },
  statLabel: {
    color: "#7c6469",
    fontSize: 12,
    fontWeight: "700",
    marginTop: 4,
  },
  infoGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
  },
  infoCard: {
    flexGrow: 1,
    flexBasis: "47%",
    minWidth: 140,
    backgroundColor: "#f8f3f1",
    borderRadius: 18,
    padding: 12,
  },
  actionRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
  },
  actionRowCompact: {
    gap: 8,
  },
  friendCard: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    backgroundColor: "rgba(255,255,255,0.9)",
    borderRadius: 22,
    padding: 16,
    borderWidth: 1,
    borderColor: "rgba(145, 35, 56, 0.08)",
  },
  friendCardCompact: {
    alignItems: "flex-start",
  },
  friendDiscoveryCard: {
    backgroundColor: "#f8f3f1",
    borderRadius: 20,
    padding: 14,
    gap: 12,
  },
  friendIdentity: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  friendBadge: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "#912338",
    alignItems: "center",
    justifyContent: "center",
  },
  friendBadgeAlt: {
    backgroundColor: "#b8973d",
  },
  friendBadgeText: {
    color: "#ffffff",
    fontSize: 15,
    fontWeight: "800",
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "#d9c4c8",
  },
  statusPill: {
    color: "#912338",
    fontSize: 12,
    fontWeight: "800",
    marginTop: 2,
  },
  profileHero: {
    backgroundColor: "#ffffff",
    borderRadius: 30,
    padding: 24,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "rgba(145, 35, 56, 0.08)",
  },
  profileAvatar: {
    width: 82,
    height: 82,
    borderRadius: 41,
    backgroundColor: "#912338",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 16,
  },
  profileAvatarText: {
    color: "#ffffff",
    fontSize: 26,
    fontWeight: "800",
  },
});
