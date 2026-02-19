const express = require("express");
const cors = require("cors");
const taskRouter = require("./routes/Tasks");

const app = express();

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.json({ message: "API funcionando, blz?" });
});

app.use("/tasks", taskRouter);
module.exports = app;
