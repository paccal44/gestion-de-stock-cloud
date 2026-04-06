const express = require("express");
const { connectDatabase } = require("../shared/database");
const { roleGuard } = require("../shared/utils");
const Order = require("./order.model");

const app = express();
const PORT = 3003;

app.use(express.json());

app.get("/", (req, res) => {
  res.json({
    service: "order-service",
    status: "running",
    port: PORT
  });
});

app.get("/orders", roleGuard(["admin", "vendeur", "gestionnaire_stock"]), async (req, res) => {
  const orders = await Order.find().sort({ createdAt: -1 });
  res.json(orders);
});

app.get("/orders/:id", roleGuard(["admin", "vendeur", "gestionnaire_stock"]), async (req, res) => {
  const order = await Order.findById(req.params.id);

  if (!order) {
    return res.status(404).json({
      message: "Commande introuvable"
    });
  }

  res.json(order);
});

app.post("/orders", roleGuard(["admin", "vendeur"]), async (req, res) => {
  const { customerName, address, products } = req.body;

  if (!customerName || !address || !Array.isArray(products) || products.length === 0) {
    return res.status(400).json({
      message: "customerName, address et products sont obligatoires"
    });
  }

  const totalQuantity = products.reduce((sum, product) => sum + Number(product.quantity || 0), 0);

  const order = await Order.create({
    customerName,
    address,
    products,
    totalQuantity,
    status: "en_attente"
  });

  res.status(201).json({
    message: "Commande creee avec succes",
    order
  });
});

app.put("/orders/:id", roleGuard(["admin", "vendeur"]), async (req, res) => {
  const order = await Order.findById(req.params.id);

  if (!order) {
    return res.status(404).json({
      message: "Commande introuvable"
    });
  }

  if (order.status === "annulee") {
    return res.status(400).json({
      message: "Impossible de modifier une commande annulee"
    });
  }

  const { customerName, address, products, status } = req.body;

  order.customerName = customerName ?? order.customerName;
  order.address = address ?? order.address;
  order.products = products ?? order.products;
  order.status = status ?? order.status;
  order.totalQuantity = order.products.reduce((sum, product) => sum + Number(product.quantity || 0), 0);
  await order.save();

  res.json({
    message: "Commande mise a jour",
    order
  });
});

app.patch("/orders/:id/cancel", roleGuard(["admin", "vendeur"]), async (req, res) => {
  const order = await Order.findById(req.params.id);

  if (!order) {
    return res.status(404).json({
      message: "Commande introuvable"
    });
  }

  order.status = "annulee";
  await order.save();

  res.json({
    message: "Commande annulee",
    order
  });
});

connectDatabase("order-service").then(() => {
  app.listen(PORT, () => {
    console.log(`order-service running on http://localhost:${PORT}`);
  });
});
