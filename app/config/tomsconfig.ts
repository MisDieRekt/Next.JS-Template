export const tomsconfig = {
  user: 'sa',
  password: 'Tot00001',
  server: "DKFIN",
  port: 59582,
  trustServerCertificate: true,
  database: 'Totai_Toms',
  pool: {
    max: 50, // Increase the maximum number of connections in the pool
    min: 0,
    idleTimeoutMillis: 30000
  }
};