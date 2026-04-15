const http = require("http");
const fs = require("fs/promises");
const path = require("path");

const PORT = Number(process.env.PORT) || 3000;
const HOST = process.env.HOST || "127.0.0.1";
const ROOT_DIR = __dirname;
const DATA_FILE = path.join(ROOT_DIR, "data", "events.json");

const MIME_TYPES = {
  ".css": "text/css; charset=utf-8",
  ".html": "text/html; charset=utf-8",
  ".js": "application/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
};

function sendJson(response, statusCode, payload) {
  response.writeHead(statusCode, {
    "Content-Type": "application/json; charset=utf-8",
  });
  response.end(JSON.stringify(payload));
}

function sanitizeEventInput(payload, existingEvents) {
  const title = String(payload.title || "").trim();
  const description = String(payload.description || "").trim();
  const location = String(payload.location || "").trim();
  const fullDate = String(payload.fullDate || "").trim();
  const date = String(payload.date || "").trim();
  const type = String(payload.type || "").trim() || "Community";
  const faculty = String(payload.faculty || "").trim() || "All Students";
  const organizer = String(payload.organizer || "").trim() || "CampusHub Club Organizer";
  const comfortNote =
    String(payload.comfortNote || "").trim() ||
    "Shared by a student organizer. Attendees can save it, invite friends, and coordinate from the event page.";
  const tags = Array.isArray(payload.tags)
    ? payload.tags.map((tag) => String(tag).trim()).filter(Boolean)
    : [];

  if (!title || !description || !location || !date || !fullDate) {
    return { error: "Missing required event fields." };
  }

  const slugBase = title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
  const uniqueSuffix = existingEvents.length + 1;

  return {
    event: {
      id: `${slugBase || "event"}-${Date.now()}-${uniqueSuffix}`,
      title,
      description,
      type,
      faculty,
      date,
      fullDate,
      location,
      attendees: ["JD"],
      attendeeCount: 1,
      saves: 0,
      tags: tags.length ? tags : [type],
      organizer,
      comfortNote,
      image: existingEvents.length % 4,
      highlight: description.slice(0, 90) + (description.length > 90 ? "..." : ""),
    },
  };
}

async function readEvents() {
  const fileContents = await fs.readFile(DATA_FILE, "utf8");
  return JSON.parse(fileContents);
}

async function writeEvents(events) {
  await fs.writeFile(DATA_FILE, JSON.stringify(events, null, 2) + "\n", "utf8");
}

async function serveStaticFile(requestPath, response) {
  const normalizedPath = requestPath === "/" ? "/index.html" : requestPath;
  const filePath = path.join(ROOT_DIR, path.normalize(normalizedPath));

  if (!filePath.startsWith(ROOT_DIR)) {
    sendJson(response, 403, { error: "Forbidden" });
    return;
  }

  try {
    const content = await fs.readFile(filePath);
    const extension = path.extname(filePath);
    response.writeHead(200, {
      "Content-Type": MIME_TYPES[extension] || "application/octet-stream",
    });
    response.end(content);
  } catch (error) {
    sendJson(response, 404, { error: "Not found" });
  }
}

const server = http.createServer(async (request, response) => {
  const requestUrl = new URL(request.url, `http://${request.headers.host}`);

  if (requestUrl.pathname === "/api/health" && request.method === "GET") {
    sendJson(response, 200, { status: "ok" });
    return;
  }

  if (requestUrl.pathname === "/api/events" && request.method === "GET") {
    try {
      const events = await readEvents();
      sendJson(response, 200, { events });
    } catch (error) {
      sendJson(response, 500, { error: "Failed to read events." });
    }
    return;
  }

  if (requestUrl.pathname === "/api/events" && request.method === "POST") {
    try {
      let body = "";
      request.on("data", (chunk) => {
        body += chunk;
      });

      request.on("end", async () => {
        try {
          const payload = JSON.parse(body || "{}");
          const events = await readEvents();
          const result = sanitizeEventInput(payload, events);

          if (result.error) {
            sendJson(response, 400, { error: result.error });
            return;
          }

          const updatedEvents = [result.event, ...events];
          await writeEvents(updatedEvents);
          sendJson(response, 201, { event: result.event });
        } catch (error) {
          sendJson(response, 400, { error: "Invalid JSON payload." });
        }
      });
    } catch (error) {
      sendJson(response, 500, { error: "Failed to create event." });
    }
    return;
  }

  serveStaticFile(requestUrl.pathname, response);
});

server.listen(PORT, HOST, () => {
  console.log(`Concordia Events server running on http://${HOST}:${PORT}`);
});
