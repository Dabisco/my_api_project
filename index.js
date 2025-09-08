import express from "express";
import axios from "axios";
import path from "path";
import { fileURLToPath } from "url";
// import livereload from "livereload";
// import connectLivereload from "connect-livereload";
import dotenv from "dotenv";

dotenv.config();

const __filePath = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filePath);

const server = express();

const port = 3000;

console.log("NODE_ENV is:", process.env.NODE_ENV);

// LiveReload Setup for only dev mode

if (process.env.NODE_ENV !== "production") {
  const livereloadServer = livereload.createServer({
    exts: ["ejs", "css", "js"],
    liveCSS: true,
  });
  livereloadServer.watch(path.join(__dirname, "views"));
  livereloadServer.watch(path.join(__dirname, "public"));

  livereloadServer.server.once("connection", () => {
    console.log("Livereload connected");
    console.log("Livereload is watching 'views' and 'public'");
  });

  // Inject LiveReload script before static files and routes
  server.use(connectLivereload());

  // Disable caching in dev
  server.use((req, res, next) => {
    res.set("cache-control", "no-store");
    next();
  });
}
//Middleware
server.use(express.static("public"));
server.use(express.urlencoded({ extended: true }));

function errorHandler(error) {
  let error_Message;

  if (error.response) {
    //If there is a response from server
    if (error.response.status === 404) {
      error_Message = "There is no match for this activity!";
    } else {
      error_Message = `Failed with status ${error.response.status}: ${error.response.statusText}`;
    }
  } else if (error.request) {
    //request made but no response
    error_Message = `No response received from server: ${error.message}`;
  } else {
    // Something else (like config error)
    error_Message = `Something is not right with the request setup: ${error.message}`;
  }

  return error_Message;
}

server.get("/", async (req, res) => {
  try {
    const response = await axios.get("https://bored-api.appbrewery.com/random");
    const activity = response.data;
    res.render("index.ejs", { activity });
  } catch (error) {
    let error_Message = errorHandler(error);
    console.log(error_Message);
    res.render("index.ejs", { error_Message });
  }
});

server.get("/find-activity", async (req, res) => {
  const type = req.query.type;
  const numOfParticipants = req.query.participants;
  try {
    const response = await axios.get(
      `https://bored-api.appbrewery.com/filter?type=${type}&participants=${numOfParticipants}`
    );
    const activities = response.data;
    const activity = activities[Math.floor(Math.random() * activities.length)];
    console.log(activity);
    res.render("index.ejs", { activity });
  } catch (error) {
    let error_Message = errorHandler(error);
    console.log(error_Message);
    res.render("index.ejs", { error_Message });
  }
});

server.listen(port, () => {
  console.log("Server listening on port ", port);
});
