"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.bufferDemographicHarvestingService = void 0;
const geometryUtils_1 = require("../utils/geometryUtils");
const bufferDemographicHarvestingService = async (selectedLatitude, selectedLongitude, bufferDistance) => {
    const selectedBufferGeometry = await (0, geometryUtils_1.getSelectedBufferGeometry)(selectedLatitude, selectedLongitude, bufferDistance);
    const selectedBufferWKT = await (0, geometryUtils_1.geometryToWKT)(selectedBufferGeometry);
    const intersectingPolygons = await (0, geometryUtils_1.getIntersectingPolygons)(selectedBufferWKT);
    const [totalPopulation, averageIncome] = await (0, geometryUtils_1.calculateStatistics)(intersectingPolygons, selectedBufferWKT);
    console.log("Total Population:", totalPopulation);
    console.log("Average Income:", averageIncome);
    return { totalPopulation, averageIncome };
};
exports.bufferDemographicHarvestingService = bufferDemographicHarvestingService;
//# sourceMappingURL=bufferDemographicHarvestingService.js.map