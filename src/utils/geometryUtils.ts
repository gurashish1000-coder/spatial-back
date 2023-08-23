import pg from "pg";
const { Client } = pg;

export const client = new Client({});

client.connect();

interface Polygon {
  Key: string;
  income: number;
  population: number;
  spatialobj: string;
}

export const getSelectedBufferGeometry = async (
  selectedLatitude: number,
  selectedLongitude: number,
  bufferDistance: number
) => {
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

export const geometryToWKT = async (bufferGeometry: string) => {
  const bufferWKTQuery = `
      SELECT ST_AsText($1::geometry) AS buffer_wkt;
    `;

  const bufferWKTResult = await client.query(bufferWKTQuery, [bufferGeometry]);
  return bufferWKTResult.rows[0].buffer_wkt;
};

export const getIntersectingPolygons = async (bufferWKT: string) => {
  const intersectingQuery = `
      SELECT "Key", income, population, spatialobj
      FROM dfw_demo
      WHERE ST_Intersects(spatialobj, ST_GeomFromText($1, 4326));
    `;

  const intersectingResult = await client.query(intersectingQuery, [bufferWKT]);

  console.log("Total intersecting Polygons:", intersectingResult.rows.length);

  return intersectingResult.rows;
};

export const calculateStatistics = async (
  intersectingPolygons: Polygon[],
  selectedBufferWKT: string
) => {
  let totalPopulation = 0;
  let totalIncome = 0;
  let polygonsNum = 0;
  let totalCentroidsInBuffer = 0;

  for (const polygon of intersectingPolygons) {
    const polygonWKT = await geometryToWKT(polygon.spatialobj);
    const polygonCentroid = await getPolygonCentroid(polygonWKT);

    const centroidWithinBuffer = await isCentroidWithinBuffer(
      polygonCentroid,
      selectedBufferWKT
    );

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
  console.log(
    "Total Intersecting Polygons centroids in buffer:",
    totalCentroidsInBuffer
  );

  return [totalPopulation, averageIncome];
};

export const getPolygonCentroid = async (polygonWKT: string) => {
  const centroidQuery = `
      SELECT ST_AsText(ST_Centroid(ST_GeomFromText($1, 4326))) AS centroid;
    `;

  const centroidResult = await client.query(centroidQuery, [polygonWKT]);
  return centroidResult.rows[0].centroid;
};

export const isCentroidWithinBuffer = async (
  centroid: string,
  selectedBuffer: string
) => {
  const isCentroidWithinBufferQuery = `
      SELECT ST_Within(ST_GeomFromText($1, 4326), ST_GeomFromText($2, 4326)) AS centroid_within_buffer;
    `;

  const result = await client.query(isCentroidWithinBufferQuery, [
    centroid,
    selectedBuffer,
  ]);

  return result.rows[0].centroid_within_buffer;
};
