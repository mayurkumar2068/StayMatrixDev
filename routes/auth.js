const express = require("express");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const db = require("../db");

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Auth
 *   description: Authentication APIs
 */

/* ======================
   REGISTER
====================== */
/**
 * @swagger
 * /api/auth/register:
 *   post:
 *     summary: Register a new user
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - firstname
 *               - lastname
 *               - email
 *               - password
 *               - mobileno
 *             properties:
 *               firstname:
 *                 type: string
 *                 example: Mayur
 *               lastname:
 *                 type: string
 *                 example: Bobade
 *               email:
 *                 type: string
 *                 example: mayur@test.com
 *               password:
 *                 type: string
 *                 example: 123456
 *               mobileno:
 *                 type: string
 *                 example: "9988776655"
 *     responses:
 *       201:
 *         description: Registration successful
 *       409:
 *         description: Email or mobile already exists
 */
router.post("/register", (req, res) => {
  let { firstname, lastname, email, password, mobileno } = req.body;

  if (!firstname || !lastname || !email || !password || !mobileno) {
    return res.status(400).json({ message: "All fields are required" });
  }

  mobileno = Number(mobileno); // 🔥 FIX

  if (isNaN(mobileno)) {
    return res.status(400).json({ message: "Invalid mobile number" });
  }

  const checkSql =
    "SELECT id FROM users WHERE email = ? OR mobileno = ?";

  db.query(checkSql, [email, mobileno], async (err, result) => {
    if (err) {
      console.error("Check user error:", err);
      return res.status(500).json({ message: err.sqlMessage });
    }

    if (result.length > 0) {
      return res.status(409).json({
        message: "Email or mobile already registered",
      });
    }

    try {
      const hashed = await bcrypt.hash(password, 10);

      const insertSql = `
        INSERT INTO users 
        (firstname, lastname, email, password_hash, mobileno)
        VALUES (?, ?, ?, ?, ?)
      `;

      db.query(
        insertSql,
        [firstname, lastname, email, hashed, mobileno],
        (err2, insertRes) => {
          if (err2) {
            console.error("Insert error:", err2);
            return res.status(500).json({ message: err2.sqlMessage });
          }

          const userId = insertRes.insertId;

          const token = jwt.sign(
            { userId, email },
            process.env.JWT_SECRET,
            { expiresIn: process.env.JWT_EXPIRES_IN || "7d" }
          );

          res.status(201).json({
            message: "Registration successful",
            token,
            user: {
              id: userId,
              firstname,
              lastname,
              email,
              mobileno,
            },
          });
        }
      );
    } catch (e) {
      console.error("Hashing error:", e);
      return res.status(500).json({ message: e.message });
    }
  });
});


/* ======================
   LOGIN
====================== */
/**
 * @swagger
 * /api/auth/login:
 *   post:
 *     summary: Login user
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *                 example: mayur@test.com
 *               password:
 *                 type: string
 *                 example: 123456
 *     responses:
 *       200:
 *         description: Login successful
 *       401:
 *         description: Invalid credentials
 */
router.post("/login", (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: "Email & password required" });
  }

  const sql = "SELECT * FROM users WHERE email = ?";

  db.query(sql, [email], async (err, result) => {
    if (err) {
      console.error("Login DB error:", err);
      return res.status(500).json({ message: "Server error" });
    }

    if (result.length === 0) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    const user = result[0];
    const match = await bcrypt.compare(password, user.password_hash);

    if (!match) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    const token = jwt.sign(
      { userId: user.id },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || "7d" }
    );

    res.status(200).json({
      message: "Login successful",
      token,
      user: {
        id: user.id,
        firstname: user.firstname,
        lastname: user.lastname,
        email: user.email,
        mobileno: user.mobileno || null,
      },
    });
  });
});

module.exports = router;
