const express = require("express");
const { connectDatabase } = require("../shared/database");
const { roleGuard } = require("../shared/utils");
const Stock = require("./stock.model");
const Movement = require("./movement.model");

const app = express();
const PORT = 3004;

app.use(express.json());

app.get("/", (req, res) => {
  res.json({
    service: "inventory-service",
    status: "running",
    port: PORT
  });
});

app.get("/stocks", roleGuard(["admin", "gestionnaire_stock", "vendeur"]), async (req, res) => {
  const stocks = await Stock.find().sort({ createdAt: -1 });
  res.json(stocks);
});

app.get("/stocks/:productId", roleGuard(["admin", "gestionnaire_stock", "vendeur"]), async (req, res) => {
  const stock = await Stock.findOne({ productId: req.params.productId });

  if (!stock) {
    return res.status(404).json({
      message: "Stock introuvable"
    });
  }

  res.json(stock);
});

app.post("/stocks", roleGuard(["admin", "gestionnaire_stock"]), async (req, res) => {
  const { productId, quantity } = req.body;

  if (!productId || quantity == null) {
    return res.status(400).json({
      message: "productId et quantity sont obligatoires"
    });
  }

  const existingStock = await Stock.findOne({ productId });
  if (existingStock) {
    return res.status(409).json({
      message: "Ce produit possede deja une ligne de stock"
    });
  }

  const stock = await Stock.create({
    productId,
    quantity: Number(quantity)
  });

  res.status(201).json({
    message: "Stock ajoute avec succes",
    stock
  });
});

app.post("/stocks/in", roleGuard(["admin", "gestionnaire_stock"]), async (req, res) => {
  const { productId, quantity } = req.body;
  const stock = await Stock.findOne({ productId });
  const inputQuantity = Number(quantity);

  if (!stock) {
    return res.status(404).json({
      message: "Stock introuvable"
    });
  }

  stock.quantity += inputQuantity;
  await stock.save();

  await Movement.create({
    productId,
    type: "entree",
    quantity: inputQuantity
  });

  res.json({
    message: "Entree de stock enregistree",
    stock
  });
});

app.post("/stocks/out", roleGuard(["admin", "gestionnaire_stock"]), async (req, res) => {
  const { productId, quantity } = req.body;
  const stock = await Stock.findOne({ productId });
  const outputQuantity = Number(quantity);

  if (!stock) {
    return res.status(404).json({
      message: "Stock introuvable"
    });
  }

  if (stock.quantity < outputQuantity) {
    return res.status(400).json({
      message: "Stock insuffisant"
    });
  }

  stock.quantity -= outputQuantity;
  await stock.save();

  await Movement.create({
    productId,
    type: "sortie",
    quantity: outputQuantity
  });

  res.json({
    message: "Sortie de stock enregistree",
    stock
  });
});

app.get("/movements", roleGuard(["admin", "gestionnaire_stock"]), async (req, res) => {
  const movements = await Movement.find().sort({ createdAt: -1 });
  res.json(movements);
});

connectDatabase("inventory-service").then(() => {
  app.listen(PORT, () => {
    console.log(`inventory-service running on http://localhost:${PORT}`);
  });
});
