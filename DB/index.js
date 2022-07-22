//shared functions
const Pool = require("pg").Pool;
const jwt_decode = require("jwt-decode");
const connectionString = process.env.DATABASE_URL;

//don't push to github - add to env and gitignore
const pool = new Pool({
  connectionString,
  ssl: {
    rejectUnauthorized: false,
  },
});

const fetchVendor = async (authorization) => {
  const decoded = jwt_decode(authorization);
  const { sub } = decoded;
  const results = await pool.query(
    "SELECT * FROM vendors WHERE auth_0_id = $1",
    [sub]
  );
  return results.rows[0];
};

module.exports = {
  pool,
  fetchVendor,
};
