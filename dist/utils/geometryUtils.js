"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.isCentroidWithinBuffer = exports.getPolygonCentroid = exports.calculateStatistics = exports.getIntersectingPolygons = exports.geometryToWKT = exports.getSelectedBufferGeometry = exports.client = void 0;
const pg_1 = __importDefault(require("pg"));
const { Client } = pg_1.default;
exports.client = new Client({
    user: "guest",
    host: "3.235.170.15",
    database: "gis",
    password: "U8OPtddp",
    port: 5432,
});
exports.client.connect();
const getSelectedBufferGeometry = async (selectedLatitude, selectedLongitude, bufferDistance) => {
    const query = `
      SELECT ST_Buffer(ST_SetSRID(ST_MakePoint($1, $2), 4326)::geography, $3)::geometry AS buffer_geom;
    `;
    const result = await exports.client.query(query, [
        selectedLongitude,
        selectedLatitude,
        bufferDistance,
    ]);
    return result.rows[0].buffer_geom;
};
exports.getSelectedBufferGeometry = getSelectedBufferGeometry;
const geometryToWKT = async (bufferGeometry) => {
    const bufferWKTQuery = `
      SELECT ST_AsText($1::geometry) AS buffer_wkt;
    `;
    const bufferWKTResult = await exports.client.query(bufferWKTQuery, [bufferGeometry]);
    return bufferWKTResult.rows[0].buffer_wkt;
};
exports.geometryToWKT = geometryToWKT;
const getIntersectingPolygons = async (bufferWKT) => {
    const intersectingQuery = `
      SELECT "Key", income, population, spatialobj
      FROM dfw_demo
      WHERE ST_Intersects(spatialobj, ST_GeomFromText($1, 4326));
    `;
    const intersectingResult = await exports.client.query(intersectingQuery, [bufferWKT]);
    console.log("Total intersecting Polygons:", intersectingResult.rows.length);
    return intersectingResult.rows;
};
exports.getIntersectingPolygons = getIntersectingPolygons;
const calculateStatistics = async (intersectingPolygons, selectedBufferWKT) => {
    let totalPopulation = 0;
    let totalIncome = 0;
    let polygonsNum = 0;
    let totalCentroidsInBuffer = 0;
    for (const polygon of intersectingPolygons) {
        const polygonWKT = await (0, exports.geometryToWKT)(polygon.spatialobj);
        const polygonCentroid = await (0, exports.getPolygonCentroid)(polygonWKT);
        const centroidWithinBuffer = await (0, exports.isCentroidWithinBuffer)(polygonCentroid, selectedBufferWKT);
        if (centroidWithinBuffer) {
            totalCentroidsInBuffer = totalCentroidsInBuffer + 1;
            totalPopulation += polygon.population;
            totalIncome += polygon.income;
            polygonsNum += 1;
        }
    }
    if (polygonsNum === 0) {
        return [0, 0];
    }
    const averageIncome = totalIncome / polygonsNum;
    console.log("Total Intersecting Polygons centroids in buffer:", totalCentroidsInBuffer);
    return [totalPopulation, averageIncome];
};
exports.calculateStatistics = calculateStatistics;
const getPolygonCentroid = async (polygonWKT) => {
    const centroidQuery = `
      SELECT ST_AsText(ST_Centroid(ST_GeomFromText($1, 4326))) AS centroid;
    `;
    const centroidResult = await exports.client.query(centroidQuery, [polygonWKT]);
    return centroidResult.rows[0].centroid;
};
exports.getPolygonCentroid = getPolygonCentroid;
const isCentroidWithinBuffer = async (centroid, selectedBuffer) => {
    const isCentroidWithinBufferQuery = `
      SELECT ST_Within(ST_GeomFromText($1, 4326), ST_GeomFromText($2, 4326)) AS centroid_within_buffer;
    `;
    const result = await exports.client.query(isCentroidWithinBufferQuery, [
        centroid,
        selectedBuffer,
    ]);
    return result.rows[0].centroid_within_buffer;
};
exports.isCentroidWithinBuffer = isCentroidWithinBuffer;
//# sourceMappingURL=geometryUtils.js.map