const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const pool = require("../db");

const router = express.Router();

router.post("/register", async (req, res) => {
  const { nome, email, senha } = req.body;
  const hashSenha = await bcrypt.hash(senha, 10);

  try {
    const query = `
    INSERT INTO usuarios (nome, email, senha) 
    VALUES($1, $2, $3) 
    RETURNING id, nome, email`;

    const result = await pool.query(query, [nome, email, hashSenha]);

    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(400).json({ message: "Erro ao registrar usuário" });
  }
});

router.post("/login", async (req, res) => {
  const { email, senha } = req.body;

  try {
    const user = await pool.query("SELECT * FROM usuarios WHERE email = $1", [
      email,
    ]);

    if (user.rows.length === 0) {
      return res.status(400).json({ message: "Usuário não encontrado" });
    }

    const senhaValida = await bcrypt.compare(senha, user.rows[0].senha);

    if (!senhaValida) {
      return res.status(401).json({ message: "Senha incorreta" });
    }

    const token = jwt.sign(
      { id: user.rows[0].id },
      process.env.JWT_SECRET || "chave_reserva_caso_env_nao_funcione",
      { expiresIn: "1d" },
    );

    res.json({
      user: { id: user.rows[0].id, nome: user.rows[0].nome },
      token,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Erro no servidor" });
  }
});

module.exports = router;
