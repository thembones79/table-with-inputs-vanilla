import express from "express";
import fs from "fs";
import multer from "multer";
import cors from "cors";
const STATUS = 200;
const DELAY_IN_SECONDS = 0;
const decimal = ".";
const locked = false;
let payload = undefined;
const data = () => {
  return {
    glTable: JSON.parse(fs.readFileSync("./mock/demo_v2.json", "utf-8")),
  };
};
const app = express();
const port = 3000;

app.use(cors());
app.use(express.urlencoded({ extended: true }));
app.use((req, res, next) => {
  const delay = DELAY_IN_SECONDS * 1000;
  setTimeout(() => next(), delay);
});

app.get("/gl", (req, res) => {
  const response = {
    data: applyPayloadToData(data()[req.query.get], payload),
    locked,
    decimal,
  };
  res.status(STATUS).json(response);
});
app.post("/gl", multer().none(), (req, res) => {
  const content = req.body.json;
  try {
    console.log(JSON.parse(content).payload);
    payload = JSON.parse(content).payload;
  } catch (error) {
    console.error(error);
  }
  res.status(STATUS).json({ locked });
});

app.listen(port, () => {
  console.log(`Listening on port: ${port}`);
});

function applyPayloadToData(data, payloadString) {
  if (!payloadString) return data;
  const [header, ...rows] = payloadString.split("|");
  const [col1, col2] = header.split(",");

  if (col1 !== "calories_burned" || col2 !== "heart_rate_avg") {
    throw new Error("Nieprawidłowy nagłówek payloadu");
  }

  if (rows.length !== data.length) {
    throw new Error(
      "Liczba wierszy w payloadzie nie zgadza się z długością danych",
    );
  }

  return data.map((entry, index) => {
    const [caloriesStr, heartRateStr] = rows[index].split(",");
    return {
      ...entry,
      calories_burned: parseFloat(caloriesStr),
      heart_rate_avg: parseFloat(heartRateStr),
    };
  });
}
