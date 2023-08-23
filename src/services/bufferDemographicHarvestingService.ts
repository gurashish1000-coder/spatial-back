import {
  getSelectedBufferGeometry,
  geometryToWKT,
  getIntersectingPolygons,
  calculateStatistics,
} from "../utils/geometryUtils";

export const bufferDemographicHarvestingService = async (
  selectedLatitude: number,
  selectedLongitude: number,
  bufferDistance: number
) => {
  const selectedBufferGeometry = await getSelectedBufferGeometry(
    selectedLatitude,
    selectedLongitude,
    bufferDistance
  );

  const selectedBufferWKT = await geometryToWKT(selectedBufferGeometry);
  const intersectingPolygons = await getIntersectingPolygons(selectedBufferWKT);

  const [totalPopulation, averageIncome] = await calculateStatistics(
    intersectingPolygons,
    selectedBufferWKT
  );

  console.log("Total Population:", totalPopulation);
  console.log("Average Income:", averageIncome);

  return { totalPopulation, averageIncome };
};
