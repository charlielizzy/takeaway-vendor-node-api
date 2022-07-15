const express = require("express");
const bodyParser = require("body-parser");
// const ConnectionParameters = require("pg/lib/connection-parameters");
const app = express();
const db = require("./queries");
const port = 3001;
const cors = require("cors");

app.use(cors());
app.use(bodyParser.json());
app.use(
  bodyParser.urlencoded({
    extended: true,
  })
);

app.get("/", (request, response) => {
  response.json({ hello: "world" });
});

app.get("/orders", db.getOrders);
app.get("/vendors/:id", db.getVendorDetails);
app.get("/customers", db.getCustomers);
app.get("/customers/:id", db.getCustomer);
app.post("/customers", db.createCustomer);
app.delete("/customers/:id", db.deleteCustomer);
app.patch("/customers/:id", db.editNumber);
app.post("/orders", db.createOrder);
app.patch("/vendors/menu_item/:id", db.updateMenuItem);
app.get("/vendors/menu_item/:id", db.getMenuItem);
app.delete("/vendors/menu_item/:id", db.deleteMenuItem);
app.post("/vendors/:vendorid", db.addMenuItem);

app.listen(port, () => {
  console.log("My node app is running on port", port);
});