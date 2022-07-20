// const Pool = require("pg").Pool;
const jwt_decode = require("jwt-decode");
const { pool, fetchVendor } = require("./index");

//don't push to github - add to env and gitignore
// const pool = new Pool({
//   user: process.env.HEROKU_DB_USER,
//   host: process.env.HEROKU_DB_HOST,
//   database: process.env.HEROKU_DB_NAME,
//   password: process.env.HEROKU_DB_PASSWORD,
//   port: process.env.HEROKU_DB_PORT,
//   ssl: {
//     rejectUnauthorized: false,
//   },
// });

// const fetchVendor = async (authorization) => {
//   const decoded = jwt_decode(authorization);
//   const { sub } = decoded;
//   const results = await pool.query(
//     "SELECT * FROM vendors WHERE auth_0_id = $1",
//     [sub]
//   );
//   return results.rows[0];
// };

const getVendorDetails = async (request, response) => {
  try {
    const vendor = await fetchVendor(request.headers.authorization);
    const { id } = vendor;
    const { rows: menuItemsRows } = await pool.query(
      "SELECT * FROM menu_items WHERE vendor_id = $1",
      [id]
    );
    const data = { ...vendor, menu_items: menuItemsRows };
    response.status(200).json(data);
  } catch (error) {
    throw error;
  }
};

const update = async (request, response) => {
  const vendor = await fetchVendor(request.headers.authorization);
  const id = parseInt(request.params.id);
  const { name, price, vegan, vegetarian } = request.body;
  const results = await pool.query(
    "SELECT vendor_id FROM menu_items WHERE id = $1",
    [id]
  );

  if (results.rows[0].vendor_id === vendor.id) {
    pool.query(
      "UPDATE menu_items SET name = $1, price = $2, vegan = $3, vegetarian = $4 WHERE id = $5",
      [name, price, vegan, vegetarian, id],
      (error, results) => {
        if (error) {
          throw error;
        }
        response.status(200).json(results.rows);
      }
    );
  } else {
    response.status(401).send("You cannot update another vendor's menu item");
  }
};

const deleteItem = async (request, response) => {
  const id = parseInt(request.params.id);
  const vendor = await fetchVendor(request.headers.authorization);
  const results = await pool.query(
    "SELECT vendor_id FROM menu_items WHERE id = $1",
    [id]
  );
  if (results.rows[0].vendor_id === vendor.id) {
    pool.query("DELETE FROM menu_items WHERE id = $1", [id], (error) => {
      if (error) {
        throw error;
      }
      response.status(200).send(`Item with ID ${id} has been deleted`);
    });
  } else {
    response.status(401).send("You cannot delete another vendor's menu item");
  }
};

const add = async (request, response) => {
  const { name, price, vegan, vegetarian } = request.body;
  try {
    const vendor = await fetchVendor(request.headers.authorization);
    const { id } = vendor;
    await pool.query(
      "INSERT INTO menu_items (name, price, vegan, vegetarian, vendor_id) VALUES ($1, $2, $3, $4, $5) RETURNING *",
      [name, price, vegan, vegetarian, id]
    );
    response.status(200).send();
  } catch (error) {
    throw error;
  }
};

module.exports = {
  getVendorDetails,
  update,
  deleteItem,
  add,
};
