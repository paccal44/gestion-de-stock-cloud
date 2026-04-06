const express = require("express");
const { connectDatabase } = require("../shared/database");
const { roleGuard } = require("../shared/utils");
const Product = require("./product.model");

const app = express();
const PORT = 3002;

app.use(express.json());

app.get("/", (req, res) => {
  res.json({
    service: "product-service",
    status: "running",
    port: PORT
  });
});

app.get("/products", async (req, res) => {
  const products = await Product.find().sort({ createdAt: -1 });
  res.json(products);
});

app.get("/products/:id", async (req, res) => {
  const product = await Product.findById(req.params.id);
  if (!product) {
    return res.status(404).json({
      message: "Produit introuvable"
    });
  }

  res.json(product);
});

app.post("/products", roleGuard(["admin", "gestionnaire_stock"]), async (req, res) => {
  const { name, description, price, quantity } = req.body;

  if (!name || !description || price == null || quantity == null) {
    return res.status(400).json({
      message: "name, description, price et quantity sont obligatoires"
    });
  }

  const product = await Product.create({
    name,
    description,
    price,
    quantity
  });

  res.status(201).json({
    message: "Produit cree avec succes",
    product
  });
});

app.put("/products/:id", roleGuard(["admin", "gestionnaire_stock"]), async (req, res) => {
  const product = await Product.findById(req.params.id);

  if (!product) {
    return res.status(404).json({
      message: "Produit introuvable"
    });
  }

  const { name, description, price, quantity } = req.body;

  product.name = name ?? product.name;
  product.description = description ?? product.description;
  product.price = price ?? product.price;
  product.quantity = quantity ?? product.quantity;
  await product.save();

  res.json({
    message: "Produit mis a jour",
    product
  });
});

app.delete("/products/:id", roleGuard(["admin"]), async (req, res) => {
  const deletedProduct = await Product.findByIdAndDelete(req.params.id);

  if (!deletedProduct) {
    return res.status(404).json({
      message: "Produit introuvable"
    });
  }

  res.json({
    message: "Produit supprime",
    product: deletedProduct
  });
});

connectDatabase("product-service").then(() => {
  app.listen(PORT, () => {
    console.log(`product-service running on http://localhost:${PORT}`);
  });
});
