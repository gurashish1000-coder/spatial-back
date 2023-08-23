import { Request, Response } from "express";
import { bufferDemographicHarvestingService } from "../services/bufferDemographicHarvestingService";

export const calculateDemographics = async (req: Request, res: Response) => {
  try {
    const { selectedLatitude, selectedLongitude, bufferDistance } = req.body;
    const result = await bufferDemographicHarvestingService(
      selectedLatitude,
      selectedLongitude,
      bufferDistance
    );
    res.json(result);
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({ error: "An error occurred." });
  }
};
