const express = require("express");
const cors = require("cors");
const taskRouter = require("./routes/Tasks");
const authRouter = require("./routes/Auth");
const authMiddleware = require("./middlewares/auth");

const app = express();

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.json({ message: "API funcionando, blz?" });
});

app.use("/auth", authRouter);
app.use(
  "/tasks",
  //  authMiddleware,
  taskRouter,
);
module.exports = app;
