import sql from "mssql";

// Add a declaration for the mssql module
declare module "mssql";

// Create a pool instance using the given configuration
declare global {
  var tomsPool: sql.ConnectionPool | undefined;
}

export const tomsconfig = {
  user: "sa",
  password: "Tot00001",
  server: "DKFIN",
  port: 59582,
  trustServerCertificate: true,
  database: "Totai_Toms",
  pool: {
    max: 50,
    min: 0,
    idleTimeoutMillis: 30000,
  },
};

let pool: sql.ConnectionPool;

export async function getTomsPool() {
  if (!global.tomsPool) {
    global.tomsPool = new sql.ConnectionPool(tomsconfig);
    pool = await global.tomsPool.connect();
  } else if (!pool) {
    pool = await global.tomsPool.connect();
  }
  return pool;
}

// Example usage in an API route
// export default async function handler(req, res) {
//   try {
//     const pool = await getTomsPool();
//     const result = await pool
//       .request()
//       .query("SELECT * FROM [Totai_Toms].[dbo].[YourTable]");
//     res.status(200).json(result.recordset);
//   } catch (err) {
//     console.error("Database query error:", err);
//     res.status(500).json({ message: "Internal Server Error" });
//   }
// }
