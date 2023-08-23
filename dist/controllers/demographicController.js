"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.calculateDemographics = void 0;
const bufferDemographicHarvestingService_1 = require("../services/bufferDemographicHarvestingService");
const calculateDemographics = async (req, res) => {
    try {
        const { selectedLatitude, selectedLongitude, bufferDistance } = req.body;
        const result = await (0, bufferDemographicHarvestingService_1.bufferDemographicHarvestingService)(selectedLatitude, selectedLongitude, bufferDistance);
        res.json(result);
    }
    catch (error) {
        console.error("Error:", error);
        res.status(500).json({ error: "An error occurred." });
    }
};
exports.calculateDemographics = calculateDemographics;
//# sourceMappingURL=demographicController.js.map