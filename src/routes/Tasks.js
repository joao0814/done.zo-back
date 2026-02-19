const express = require("express");
const pool = require("../db");

const router = express.Router();

//POST
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

//GET
router.get("/tasks", async (req, res) => {
  try {
    const query = `SELECT id, titulo, descricao FROM tasks`;

    const result = await pool.query(query);

    return res.status(200).json(result.rows);
  } catch (error) {
    console.error("Erro ao buscar tarefas:", error);
    return res.status(500).json({ message: "Erro ao buscar tarefas." });
  }
});

//PUT
router.put("/tasks/:id", async (req, res) => {
  const { id } = req.params;
  const { titulo, descricao } = req.body;

  if (!titulo || !descricao) {
    return res
      .status(400)
      .json({ message: "Campos 'titulo' e 'descricao' são obrigatórios." });
  }

  try {
    const query = `
    UPDATE tasks SET titulo = $1, descricao = $2, data_atualizacao = CURRENT_TIMESTAMP
    WHERE id = $3 
    RETURNING *;
    `;

    const values = [titulo, descricao, id];

    const result = await pool.query(query, values);

    return res.status(200).json({
      message: "Tarefa atualizada com sucesso.",
      task: result.rows[0],
    });
  } catch (error) {
    console.error("Erro ao atualizar tarefa:", error);
    return res.status(500).json({ message: "Erro ao atualizar tarefa." });
  }
});

module.exports = router;
