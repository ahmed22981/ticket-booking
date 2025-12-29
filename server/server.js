import "dotenv/config";
import express from "express";
import cors from "cors";
import connectDB from "./configs/db.js";
import {clerkMiddleware} from "@clerk/express";
import {serve} from "inngest/express";
import {inngest, functions} from "./inngest/index.js";
import showRouter from "./routes/show.route.js";
import bookingRouter from "./routes/booking.route.js";
import adminRouter from "./routes/admin.route.js";
import userRouter from "./routes/user.route.js";
import {stripeWebhooks} from "./controllers/stripeWebhook.js";

const app = express();
const port = 3000;

await connectDB();

//Sripe webhook route
app.use("/api/stripe", express.raw({type: "application/json"}), stripeWebhooks);

//Middleware
app.use(express.json());
app.use(cors());
app.use(clerkMiddleware());

//API Routes
app.get("/", (req, res) => res.send("Server is live!"));
// Set up the "/api/inngest" (recommended) routes with the serve handler
app.use("/api/inngest", serve({client: inngest, functions}));
app.use("/api/show", showRouter);
app.use("/api/bookings", bookingRouter);
app.use("/api/admin", adminRouter);
app.use("/api/user", userRouter);

app.listen(port, () =>
  console.log(`Server running on port http://localhost:${port}`)
);
