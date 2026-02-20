const express = require("express");
const pool = require("../db");

const router = express.Router();

//POST
router.post("/", async (req, res) => {
  const { titulo, tipo, descricao } = req.body;
  const userId = req.userId;

  if (!titulo || !tipo || !descricao) {
    return res.status(400).json({
      message: "Campos 'titulo', 'tipo' e 'descricao' são obrigatórios.",
    });
  }

  try {
    const query = `
      INSERT INTO tasks (titulo, tipo, descricao, id_usuario)
      VALUES ($1, $2, $3, $4)
      RETURNING id, titulo, tipo, descricao;
    `;

    const values = [titulo, tipo, descricao, userId];
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
router.get("/", async (req, res) => {
  try {
    const userId = req.userId;
    const query = `SELECT id, titulo, descricao FROM tasks WHERE id_usuario = $1;`;

    const result = await pool.query(query, [userId]);

    return res.status(200).json(result.rows);
  } catch (error) {
    console.error("Erro ao buscar tarefas:", error);
    return res.status(500).json({ message: "Erro ao buscar tarefas." });
  }
});

//PUT
router.put("/:id", async (req, res) => {
  const { id } = req.params;
  const { titulo, tipo, descricao } = req.body;
  const userId = req.userId;

  if (!titulo || !tipo || !descricao) {
    return res
      .status(400)
      .json({
        message: "Campos 'titulo', 'tipo' e 'descricao' são obrigatórios.",
      });
  }

  try {
    const query = `
    UPDATE tasks SET titulo = $1, tipo = $2, descricao = $3, data_atualizacao = CURRENT_TIMESTAMP
    WHERE id = $4 AND id_usuario = $5
    RETURNING *;
    `;

    const values = [titulo, tipo, descricao, id, userId];
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

//DELETE
router.delete("/:id", async (req, res) => {
  const { id } = req.params;
  const userId = req.userId;

  try {
    const query = `
    DELETE FROM tasks WHERE id = $1 AND id_usuario = $2 RETURNING *;
    `;

    const values = [id, userId];
    const result = await pool.query(query, values);

    if (result.rowCount === 0) {
      return res.status(404).json({ message: "Tarefa não encontrada." });
    }

    return res.status(200).json({
      message: "Tarefa deletada com sucesso.",
      task: result.rows[0],
    });
  } catch (error) {
    console.error("Erro ao deletar tarefa:", error);
    return res.status(500).json({ message: "Erro ao deletar tarefa." });
  }
});

module.exports = router;
