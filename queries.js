const Pool = require("pg").Pool;

//don't push to github - add to env and gitignore
const pool = new Pool({
  user: process.env.HEROKU_DB_USER,
  host: process.env.HEROKU_DB_HOST,
  database: process.env.HEROKU_DB_NAME,
  password: process.env.HEROKU_DB_PASSWORD,
  port: process.env.HEROKU_DB_PORT,
  ssl: {
    rejectUnauthorized: false,
  },
});

const getOrders = (request, response) => {
  pool.query("SELECT * FROM orders", (error, results) => {
    if (error) {
      throw error;
    }
    response.status(200).json(results.rows);
  });
};

const getCustomers = (request, response) => {
  pool.query("SELECT * FROM customers", (error, results) => {
    if (error) {
      throw error;
    }
    response.status(200).json(results.rows);
  });
};

const getCustomer = (request, response) => {
  const id = parseInt(request.params.id);
  pool.query(
    "SELECT * FROM customers WHERE id = $1",
    [id],
    (error, results) => {
      if (error) {
        throw error;
      }
      response.status(200).json(results.rows);
    }
  );
};

const getVendorDetails = async (request, response) => {
  const id = parseInt(request.params.id);
  try {
    const { rows: vendorRows } = await pool.query(
      "SELECT company_name, cuisine FROM vendors WHERE id = $1",
      [id]
    );
    const { rows: menuItemsRows } = await pool.query(
      "SELECT * FROM menu_items WHERE vendor_id = $1",
      [id]
    );
    const data = {
      company_name: vendorRows[0].company_name,
      cuisine: vendorRows[0].cuisine,
      menu_items: menuItemsRows,
    };
    response.status(200).json(data);
  } catch (error) {
    throw error;
  }
};

const deleteCustomer = (request, response) => {
  const id = parseInt(request.params.id);
  pool.query("DELETE FROM customers WHERE id = $1", [id], (error, results) => {
    if (error) {
      throw error;
    }
    response.status(200).send(`Customer with ID ${id} has been deleted`);
  });
};

const createCustomer = (request, response) => {
  const { name, phone_number, date_of_birth } = request.body;
  pool.query(
    "INSERT INTO customers (name, phone_number, date_of_birth) VALUES ($1, $2, $3) RETURNING *",
    [name, phone_number, date_of_birth],
    (error, results) => {
      if (error) {
        throw error;
      }
      response
        .status(200)
        .send(`Customer created with ID ${results.rows[0].id}`);
    }
  );
};

const editNumber = (request, response) => {
  const { phone_number } = request.body;
  const id = parseInt(request.params.id);
  pool.query(
    "UPDATE customers SET phone_number = $1 WHERE id = $2 RETURNING *",
    [phone_number, id],
    (error, results) => {
      if (error) {
        throw error;
      }
      response.status(200).json(results.rows);
    }
  );
};

const createOrder = (request, response) => {
  const { customer_id, address_id, vendor_id, menu_items } = request.body;
  pool.query(
    "INSERT INTO orders (requested_at, customer_id, address_id, vendor_id) VALUES (current_timestamp, $1, $2, $3) RETURNING *",
    [customer_id, address_id, vendor_id],
    (error, results) => {
      if (error) {
        throw error;
      }
      menu_items.forEach((menu_item) => {
        pool.query(
          "INSERT INTO menu_items_orders (order_id, menu_items_id) VALUES ($1, $2)",
          [results.rows[0].id, menu_item],
          (error, results) => {
            if (error) {
              throw error;
            }
            console.log(results.rows);
          }
        );
      });
      response.status(200).json(results.rows);
    }
  );
};

const getMenuItem = (request, response) => {
  const id = parseInt(request.params.id);
  pool.query(
    "SELECT * FROM menu_items WHERE id = $1",
    [id],
    (error, results) => {
      if (error) {
        throw error;
      }
      response.status(200).json(results.rows);
      console.log("results.rows", results.rows);
    }
  );
};

const updateMenuItem = (request, response) => {
  console.log("request.body", request.body);
  const { name, price, vegan, vegetarian } = request.body;
  const id = parseInt(request.params.id);
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
};

const deleteMenuItem = (request, response) => {
  const id = parseInt(request.params.id);
  pool.query("DELETE FROM menu_items WHERE id = $1", [id], (error) => {
    if (error) {
      throw error;
    }
    response.status(200).send(`Item with ID ${id} has been deleted`);
  });
};

const addMenuItem = (request, response) => {
  const { name, price, vegan, vegetarian } = request.body;
  const vendorid = parseInt(request.params.vendorid);
  pool.query(
    "INSERT INTO menu_items (name, price, vegan, vegetarian, vendor_id) VALUES ($1, $2, $3, $4, $5) RETURNING *",
    [name, price, vegan, vegetarian, vendorid],
    (error, results) => {
      if (error) {
        throw error;
      }
      response.status(200).send();
    }
  );
};

module.exports = {
  getOrders,
  getCustomers,
  getCustomer,
  createCustomer,
  deleteCustomer,
  editNumber,
  createOrder,
  getVendorDetails,
  getMenuItem,
  updateMenuItem,
  deleteMenuItem,
  addMenuItem,
};
