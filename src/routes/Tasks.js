const express = require("express");
const pool = require("../db");

const router = express.Router();

//POST
router.post("/", async (req, res) => {
  const { titulo, tipo, descricao, prioridade, data_limite, estimativa } =
    req.body;
  const userId = req.userId;

  if (!titulo || !tipo || !descricao) {
    return res.status(400).json({
      message: "Campos 'titulo', 'tipo' e 'descricao' são obrigatórios.",
    });
  }

  try {
    const query = `
      INSERT INTO tasks (titulo, tipo, descricao, id_usuario, prioridade, data_limite, concluida_em, estimativa)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      RETURNING id, titulo, tipo, descricao, prioridade, data_limite, concluida_em, estimativa;
    `;

    const values = [
      titulo,
      tipo,
      descricao,
      userId,
      prioridade,
      data_limite,
      null,
      estimativa,
    ];
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

//GET TASKS
router.get("/", async (req, res) => {
  try {
    const userId = req.userId;
    const query = `
      SELECT id, titulo, tipo, descricao, id_usuario, prioridade, data_limite, concluida_em, estimativa 
      FROM tasks WHERE id_usuario = $1;
    `;

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
  const { titulo, tipo, descricao, prioridade, data_limite, estimativa } = req.body;
  const userId = req.userId;

  if (!titulo || !tipo || !descricao || !prioridade || !data_limite || !estimativa) {
    return res.status(400).json({
      message: "Campos 'titulo', 'tipo', 'descricao', 'prioridade', 'data_limite' e 'estimativa' são obrigatórios.",
    });
  }

  try {
    const query = `
    UPDATE tasks SET titulo = $1, tipo = $2, descricao = $3, prioridade = $4, data_limite = $5, estimativa = $6, data_atualizacao = CURRENT_TIMESTAMP
    WHERE id = $7 AND id_usuario = $8
    RETURNING *;
    `;

    const values = [titulo, tipo, descricao, prioridade, data_limite, estimativa, id, userId];
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

// GET METRICS
router.get("/metrics", async (req, res) => {
  const userId = req.userId;

  try {
    const query = `
      SELECT 

        COALESCE(COUNT(*) FILTER (WHERE prioridade = 'alta'), 0) as alta,
        COALESCE(COUNT(*) FILTER (WHERE prioridade = 'media'), 0) as media,
        COALESCE(COUNT(*) FILTER (WHERE prioridade = 'baixa'), 0) as baixa,
        
        COALESCE(COUNT(*) FILTER (WHERE concluida_em IS NULL AND data_limite < CURRENT_TIMESTAMP), 0) as atrasadas,
        
        COALESCE(ROUND(SUM(estimativa) / 60.0, 2), 0) as total_horas_estimadas,
        
        COUNT(*) as total_geral

      FROM tasks 
      WHERE id_usuario = $1;
    `;

    const result = await pool.query(query, [userId]);
    const metrics = result.rows[0];

    if (!metrics) {
      return res.status(200).json({ message: "Nenhum dado encontrado." });
    }

    return res.status(200).json({
      prioridades: {
        alta: parseInt(metrics.alta) || 0,
        media: parseInt(metrics.media) || 0,
        baixa: parseInt(metrics.baixa) || 0,
      },
      prazos: {
        atrasadas: parseInt(metrics.atrasadas) || 0,
        em_dia:
          (parseInt(metrics.total_geral) || 0) -
          (parseInt(metrics.atrasadas) || 0),
      },
      planejamento: {
        horas_estimadas: parseFloat(metrics.total_horas_estimadas) || 0,
        total_tarefas: parseInt(metrics.total_geral) || 0,
      },
    });
  } catch (error) {
    console.error("Erro ao calcular métricas:", error);
    return res.status(500).json({ message: "Erro ao gerar dashboard." });
  }
});

module.exports = router;
