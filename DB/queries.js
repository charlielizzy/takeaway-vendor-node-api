const { pool } = require("./index");
const jwt_decode = require("jwt-decode");

const createVendor = (request, response, authorization) => {
  // const { company_name, cuisine, postcode, description } = request.body;
  try {
    const decoded = jwt_decode(authorization);
    const { sub } = decoded;
    console.log("sub", sub);
    //   const results = await pool.query(
    //     "INSERT INTO vendors (company_name, cuisine, postcode, description, auth_0_id) VALUES ($1, $2, $3, $4, $5)",
    //     [company_name, cuisine, postcode, description, sub],
    //     (error) => {
    //       response
    //         .status(200)
    //         .send(`New vendor created called ${results.rows[0].company_name}`);
    //     }
    //   );
  } catch (error) {
    throw error;
  }
  // console.log("create vendor endpoint hit");
};

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
  getMenuItem,
  createVendor,
};
