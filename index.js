const express = require("express");
const bodyParser = require("body-parser");
// const ConnectionParameters = require("pg/lib/connection-parameters");
const app = express();
const dotenv = require("dotenv");
dotenv.config();
const db = require("./DB/queries");
const menu_items = require("./DB/menu_items");
const cors = require("cors");
const { expressjwt: jwt } = require("express-jwt");
const jwksRsa = require("jwks-rsa");
const port = process.env.PORT || 3001;

const checkJwt = jwt({
  secret: jwksRsa.expressJwtSecret({
    cache: true,
    rateLimit: true,
    jwksRequestsPerMinute: 5,
    jwksUri: `https://paddington.eu.auth0.com/.well-known/jwks.json`,
  }),
  audience: "https://paddington.eu.auth0.com/api/v2/",
  issuer: "https://paddington.eu.auth0.com/",
  algorithms: ["RS256"],
});

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

app.get("/vendor_details", checkJwt, menu_items.getVendorDetails);
app.patch("/vendors/menu_item/:id", checkJwt, menu_items.update);
app.delete("/vendors/menu_item/:id", checkJwt, menu_items.deleteItem);
app.post("/vendors", checkJwt, menu_items.add);
app.post("/create_vendor", checkJwt, db.createVendor);

app.get("/orders", db.getOrders);
app.get("/customers", db.getCustomers);
app.get("/customers/:id", db.getCustomer);
app.post("/customers", db.createCustomer);
app.delete("/customers/:id", db.deleteCustomer);
app.patch("/customers/:id", db.editNumber);
app.post("/orders", db.createOrder);

app.get("/vendors/menu_item/:id", db.getMenuItem);

app.listen(port, () => {
  console.log("My node app is running on port", port);
});
