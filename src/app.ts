import * as dotenv from "dotenv";
import express from "express";
import { calculateDemographics } from "./controllers/demographicController";

dotenv.config();
const cors = require("cors");
const app = express();
const port = process.env.PORT || 4000;

app.use(express.json());
app.use(cors());

app.post("/calculate", calculateDemographics);

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
