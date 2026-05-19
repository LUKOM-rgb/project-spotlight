import db from '../Models/db.js'

// 1. Criar Relatório (POST)
export const createRelatorio = async (req, res) => {
  try {
    const {
      data_ocorrencia,
      hora_ocorrencia,
      local_ocorrencia,
      descricao,
      estado,
      id_conta,
      id_spot,
    } = req.body

    const sql = `INSERT INTO relatorio_ocorrencia
                     (data_ocorrencia, hora_ocorrencia, local_ocorrencia, descricao, estado, id_conta, id_spot)
                     VALUES (?, ?, ?, ?, ?, ?, ?)`

    const [result] = await db.query(sql, [
      data_ocorrencia,
      hora_ocorrencia,
      local_ocorrencia,
      descricao,
      estado,
      id_conta,
      id_spot,
    ])

    res.status(201).json({
      mensagem: 'Relatório criado com sucesso!',
      id_ocorrencia: result.insertId,
    })
  } catch (error) {
    res.status(500).json({ erro: 'Erro ao criar relatório', detalhes: error.message })
  }
}

// 2. Listar Todos os Relatórios (GET)
export const getAllRelatorios = async (req, res) => {
  try {
    const [rows] = await db.query('SELECT * FROM relatorio_ocorrencia')
    res.status(200).json(rows)
  } catch (error) {
    res.status(500).json({ erro: 'Erro ao procurar relatórios', detalhes: error.message })
  }
}

// 3. Obter um Relatório por ID (GET)
export const getRelatorioById = async (req, res) => {
  try {
    const { id } = req.params
    const [rows] = await db.query('SELECT * FROM relatorio_ocorrencia WHERE id_ocorrencia = ?', [
      id,
    ])

    if (rows.length === 0) {
      return res.status(404).json({ mensagem: 'Relatório não encontrado' })
    }
    res.status(200).json(rows[0])
  } catch (error) {
    res.status(500).json({ erro: 'Erro ao procurar o relatório', detalhes: error.message })
  }
}

// 4. Atualizar o Estado do Relatório (PATCH)

export const updateEstadoRelatorio = async (req, res) => {
  try {
    const { id } = req.params
    const { estado } = req.body

    const [result] = await db.query(
      'UPDATE relatorio_ocorrencia SET estado = ? WHERE id_ocorrencia = ?',
      [estado, id],
    )

    if (result.affectedRows === 0) {
      return res.status(404).json({ mensagem: 'Relatório não encontrado' })
    }
    res.status(200).json({ mensagem: 'Estado atualizado com sucesso!' })
  } catch (error) {
    res.status(500).json({ erro: 'Erro ao atualizar relatório', detalhes: error.message })
  }
}

// 5. Eliminar um Relatório (DELETE)
export const deleteRelatorio = async (req, res) => {
  try {
    const { id } = req.params
    const [result] = await db.query('DELETE FROM relatorio_ocorrencia WHERE id_ocorrencia = ?', [
      id,
    ])

    if (result.affectedRows === 0) {
      return res.status(404).json({ mensagem: 'Relatório não encontrado' })
    }
    res.status(200).json({ mensagem: 'Relatório eliminado com sucesso!' })
  } catch (error) {
    res.status(500).json({ erro: 'Erro ao eliminar relatório', detalhes: error.message })
  }
}
// No fim do ocorrencia.controller.js, exporte um objeto com as funções
export default { createRelatorio, getAllRelatorios, getRelatorioById, updateEstadoRelatorio, deleteRelatorio };
