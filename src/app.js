const express = require("express");
const cors = require("cors");
const postTasksRouter = require("./routes/Tasks");
const getTasksRouter = require("./routes/Tasks");
const putTasksRouter = require("./routes/Tasks");

const app = express();

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.json({ message: "API funcionando, blz?" });
});

app.use(postTasksRouter);
app.use(getTasksRouter);
app.use(putTasksRouter);

module.exports = app;
