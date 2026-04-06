const express = require("express");
const bcrypt = require("bcrypt");
const { connectDatabase } = require("../shared/database");
const User = require("./user.model");

const app = express();
const PORT = 3001;
const SALT_ROUNDS = 10;

app.use(express.json());

app.get("/", (req, res) => {
  res.json({
    service: "auth-service",
    status: "running",
    port: PORT
  });
});

app.post("/register", async (req, res) => {
  try {
    const { name, email, password, role } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({
        message: "name, email et password sont obligatoires"
      });
    }

    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return res.status(409).json({
        message: "Un utilisateur avec cet email existe deja"
      });
    }

    const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);
    const user = await User.create({
      name,
      email,
      password: hashedPassword,
      role: role || "vendeur"
    });

    res.status(201).json({
      message: "Utilisateur cree avec succes",
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    });
  } catch (error) {
    res.status(500).json({
      message: "Erreur lors de l'inscription",
      error: error.message
    });
  }
});

app.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        message: "email et password sont obligatoires"
      });
    }

    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      return res.status(404).json({
        message: "Utilisateur introuvable"
      });
    }

    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      return res.status(401).json({
        message: "Mot de passe incorrect"
      });
    }

    res.json({
      message: "Connexion reussie",
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    });
  } catch (error) {
    res.status(500).json({
      message: "Erreur lors de la connexion",
      error: error.message
    });
  }
});

app.post("/forgot-password", async (req, res) => {
  const { email } = req.body;

  if (!email) {
    return res.status(400).json({
      message: "email est obligatoire"
    });
  }

  const user = await User.findOne({ email: email.toLowerCase() });
  if (!user) {
    return res.status(404).json({
      message: "Utilisateur introuvable"
    });
  }

  res.json({
    message: "Lien de reinitialisation simule envoye",
    email
  });
});

app.get("/users", async (req, res) => {
  const sanitizedUsers = await User.find({}, { password: 0 });
  res.json(sanitizedUsers);
});

connectDatabase("auth-service").then(() => {
  app.listen(PORT, () => {
    console.log(`auth-service running on http://localhost:${PORT}`);
  });
});
