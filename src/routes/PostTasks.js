const express = require("express");
const pool = require("../db");

const router = express.Router();

router.post("/tasks", async (req, res) => {
  const { titulo, descricao } = req.body;

  if (!titulo || !descricao) {
    return res
      .status(400)
      .json({ message: "Campos 'titulo' e 'descricao' são obrigatórios." });
  }

  try {
    const query = `
      INSERT INTO tasks (titulo, descricao)
      VALUES ($1, $2)
      RETURNING id, titulo, descricao;
    `;

    const values = [titulo, descricao];

    const result = await pool.query(query, values);

    return res.status(201).json({
      message: "Tarefa criada com sucesso.",
      task: result.rows[0],
    });
  } catch (error) {
    console.error("Erro ao inserir tarefa:", error);
    return res.status(500).json({ message: "Erro ao criar tarefa." });
  }
});

module.exports = router;
