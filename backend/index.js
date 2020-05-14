const express = require("express");
const app = express();
const morgan = require("morgan");

app.use(express.json());

morgan.token("info", req => {
  return JSON.stringify(req.body);
});

app.use(
  morgan(":method :url :status :res[content-length] - :response-time ms :info")
);

let cycles = [
  {
    start: "2020-02-05",
    end: "2020-03-05",
    length: 29,
    id: 1
  },
  {
    start: "2020-03-06",
    end: "2020-04-02",
    length: 27,
    id: 2
  },
  {
    start: "2020-04-03",
    end: "2020-04-25",
    length: 22,
    id: 3
  }
];

app.get("/", (req, res) => {
  res.send("Hello");
});

app.get("/api/cycles", (req, res) => {
  res.json(cycles);
});

app.get("/api/cycles/:id", (req, res) => {
  const id = Number(req.params.id);
  const cycle = cycles.find(c => c.id === id);
  cycle ? res.json(cycle) : res.status(404).end();
});

const generateId = () => {
  return Math.floor(Math.random() * Math.floor(1000000));
};

const dateInSec = date => {
  let day, month, year;
  [year, month, day] = date.split("-");
  let fullDate = new Date(year, month - 1, day);
  let seconds = fullDate.getTime();
  return seconds;
};

const getLength = (startDate, endDate) => {
  return Math.ceil(
    (dateInSec(endDate) - dateInSec(startDate)) / (24 * 60 * 60 * 1000)
  );
};

app.post("/api/cycles", (req, res) => {
  const body = req.body;
  const cycle = {
    start: body.start,
    end: body.end,
    length: `${getLength(body.start, body.end)} days`,
    id: generateId()
  };

  if (!cycle.start || !cycle.end) {
    return res.status(204).json({ error: "Not enough data" });
  }
  cycles = cycles.concat(cycle);
  res.json(cycle);
});

app.delete("/api/cycles/:id", (req, res) => {
  const id = Number(req.params.id);
  cycles = cycles.filter(c => c.id !== id);
  res.status(404).end();
});

PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Server running on port ${3001}`);
});
