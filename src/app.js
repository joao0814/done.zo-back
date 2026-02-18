const express = require("express");
const cors = require("cors");
const postTasksRouter = require("./routes/Tasks");
const getTasksRouter = require("./routes/Tasks");

const app = express();

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.json({ message: "API funcionando, blz?" });
});

app.use(postTasksRouter);
app.use(getTasksRouter);

module.exports = app;
