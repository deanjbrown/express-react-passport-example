import cookieParser from "cookie-parser";
import cors from "cors";
import express from "express";
import session from "express-session";
import passport from "passport";
import accountRoutes from "./routes/accountRoutes";
import passportConfig from "./utils/auth";
import env from "./utils/env";
import postRoutes from "./routes/postRoutes";
import adminRoutes from "./routes/adminRoutes";

// Create the express app
const app = express();
const host = env.EXPRESS_HOST;
const port = env.EXPRESS_PORT;

// Configure passport strategies
passportConfig();

// Set up CORS
app.use(
  cors({
    origin: "http://localhost:5173",
    credentials: true,
  })
);

app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(
  session({
    secret: env.PASSPORT_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: { secure: !env.IS_DEV, httpOnly: true, sameSite: "lax" },
  })
);

// Initialize passport
app.use(passport.initialize());
app.use(passport.session());

// Load our routes
app.use("/account", accountRoutes);
app.use("/posts", postRoutes);
app.use("/admin", adminRoutes);

// Start listening on the specified port and host
app.listen(port, () => {
  console.log(`⚡️[server]: Server is running at ${host}:${port}`);
});
