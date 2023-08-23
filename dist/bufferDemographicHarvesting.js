"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.bufferDemographicHarvesting = void 0;
const pg_1 = __importDefault(require("pg"));
const { Client } = pg_1.default;
const bufferDemographicHarvesting = async (client, selectedLatitude, selectedLongitude, bufferDistance) => {
    //   // Edge case where the centroids of  all intersecting polygons are outside the buffer
    //   selectedLatitude = 33.2174;
    //   selectedLongitude = -96.80906;
    //   bufferDistance = 20000; // in meters
    const selectedBufferGeometry = await getSelectedBufferGeometry(client, selectedLatitude, selectedLongitude, bufferDistance);
    const selectedBufferWKT = await bufferGeometryToWKT(client, selectedBufferGeometry);
    const intersectingPolygons = await getIntersectingPolygons(client, selectedBufferWKT);
    console.log("Buffer WKT:", selectedBufferWKT);
    const [totalPopulation, averageIncome] = await calculateStatistics(client, intersectingPolygons, selectedBufferWKT);
    console.log("Total Population:", totalPopulation);
    console.log("Average Income:", averageIncome);
    return [totalPopulation, averageIncome];
};
exports.bufferDemographicHarvesting = bufferDemographicHarvesting;
// Utils
const getSelectedBufferGeometry = async (client, selectedLatitude, selectedLongitude, bufferDistance) => {
    const query = `
    SELECT ST_Buffer(ST_SetSRID(ST_MakePoint($1, $2), 4326)::geography, $3)::geometry AS buffer_geom;
  `;
    const result = await client.query(query, [
        selectedLongitude,
        selectedLatitude,
        bufferDistance,
    ]);
    return result.rows[0].buffer_geom;
};
const bufferGeometryToWKT = async (client, bufferGeometry) => {
    const bufferWKTQuery = `
    SELECT ST_AsText($1::geometry) AS buffer_wkt;
  `;
    const bufferWKTResult = await client.query(bufferWKTQuery, [bufferGeometry]);
    return bufferWKTResult.rows[0].buffer_wkt;
};
const getIntersectingPolygons = async (client, bufferWKT) => {
    const intersectingQuery = `
    SELECT "Key", income, population, spatialobj
    FROM dfw_demo
    WHERE ST_Intersects(spatialobj, ST_GeomFromText($1, 4326));
  `;
    const intersectingResult = await client.query(intersectingQuery, [bufferWKT]);
    return intersectingResult.rows;
};
const calculateStatistics = async (client, intersectingPolygons, selectedBufferWKT) => {
    let totalPopulation = 0;
    let totalIncome = 0;
    let polygonsNum = 0;
    for (const polygon of intersectingPolygons) {
        const polygonWKT = await bufferGeometryToWKT(client, polygon.spatialobj);
        const polygonCentroid = await getPolygonCentroid(client, polygonWKT);
        const centroidWithinBuffer = await isCentroidWithinBuffer(client, polygonCentroid, selectedBufferWKT);
        if (centroidWithinBuffer) {
            totalPopulation += polygon.population;
            totalIncome += polygon.income;
            polygonsNum += 1;
        }
    }
    const averageIncome = totalIncome / polygonsNum;
    return [totalPopulation, averageIncome];
};
const getPolygonCentroid = async (client, polygonWKT) => {
    const centroidQuery = `
    SELECT ST_AsText(ST_Centroid(ST_GeomFromText($1, 4326))) AS centroid;
  `;
    const centroidResult = await client.query(centroidQuery, [polygonWKT]);
    return centroidResult.rows[0].centroid;
};
const isCentroidWithinBuffer = async (client, centroid, selectedBuffer) => {
    const isCentroidWithinBufferQuery = `
    SELECT ST_Within(ST_GeomFromText($1, 4326), ST_GeomFromText($2, 4326)) AS centroid_within_buffer;
  `;
    const result = await client.query(isCentroidWithinBufferQuery, [
        centroid,
        selectedBuffer,
    ]);
    return result.rows[0].centroid_within_buffer;
};
//# sourceMappingURL=bufferDemographicHarvesting.js.map