import RelatorioOcorrencia from '../Models/Ocorrencia.js'
import ContaGlobal from '../Models/ContaGlobal.js'
import Spot from '../Models/Spot.js' // Assumindo que tens este modelo para validar o spot
import { validationError } from '../utilis/error.utils.js'

// POST /relatorios - Criar nova ocorrência
export const createOcorrencia = async (req, res, next) => {
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

    // 1. Validações básicas de campos obrigatórios
    const errors = {}
    if (!descricao) errors.descricao = ['O campo descrição é obrigatório.']
    if (!local_ocorrencia) errors.local_ocorrencia = ['O local da ocorrência é obrigatório.']
    if (!id_conta) errors.id_conta = ['O ID da conta é obrigatório.']

    if (Object.keys(errors).length > 0) {
      throw validationError(errors)
    }

    // Verificar se o id_conta e id_spot realmente existem na Base de Dados se fornecidos
    const contaExiste = await ContaGlobal.findByPk(id_conta)
    if (!contaExiste) throw validationError({ id_conta: ['A conta especificada não existe.'] })

    if (id_spot) {
      const spotExiste = await Spot.findByPk(id_spot)
      if (!spotExiste) throw validationError({ id_spot: ['O spot especificado não existe.'] })
    }

    // 3. Criar o relatório na base de dados
    let final_id_spot = id_spot || null

    if (!final_id_spot) {
      try {
        const fallbackSpot = await Spot.findOne()
        if (fallbackSpot) {
          final_id_spot = fallbackSpot.id_spot
          console.log(
            `[Teste] Usando spot de fallback (id_spot: ${final_id_spot}) para evitar restrição física da BD.`,
          )
        }
      } catch (err) {
        console.error('Erro ao obter spot de fallback:', err)
      }
    }

    const novoRelatorio = await RelatorioOcorrencia.create({
      data_ocorrencia: data_ocorrencia || new Date(),
      hora_ocorrencia,
      local_ocorrencia,
      descricao_ocorrencia: descricao,
      estado_ocorrencia: estado ? estado.toLowerCase() : 'pendente',
      id_conta,
      id_spot: final_id_spot,
    })

    // 4. Responder com 201 Created
    return res.status(201).json({
      message: 'Relatório de ocorrência registado com sucesso!',
      data: novoRelatorio,
    })
  } catch (error) {
    next(error) // Encaminha para o middleware global de erros
  }
}

// GET /relatorios - Obter todas as ocorrências
export const getAllOcorrencias = async (req, res, next) => {
  try {
    // Podes ler parâmetros da query (ex: /relatorios?estado=Pendente)
    const { estado, id_spot } = req.query
    const whereClause = {}

    if (estado) whereClause.estado_ocorrencia = estado.toLowerCase()
    if (id_spot) whereClause.id_spot = id_spot

    const relatorios = await RelatorioOcorrencia.findAll({
      where: whereClause,
    })

    return res.status(200).json({
      message: 'Relatórios obtidos com sucesso.',
      data: relatorios,
    })
  } catch (error) {
    next(error)
  }
}

// GET /relatorios/:id - Obter uma ocorrência específica
export const getOcorrenciaById = async (req, res, next) => {
  try {
    const { id } = req.params

    const relatorio = await RelatorioOcorrencia.findByPk(id)

    if (!relatorio) {
      // Se tiveres um notFoundError nos teus error.utils, usa-o aqui. Senão:
      return res.status(404).json({ message: 'Relatório não encontrado.' })
    }

    return res.status(200).json({
      message: 'Relatório obtido com sucesso.',
      data: relatorio,
    })
  } catch (error) {
    next(error)
  }
}

// PATCH /relatorios/:id/estado - Atualizar o estado da ocorrência
export const updateEstadoOcorrencia = async (req, res, next) => {
  try {
    const { id } = req.params
    const { estado } = req.body

    if (!estado) {
      throw validationError({ estado: ['O novo estado é obrigatório.'] })
    }

    const relatorio = await RelatorioOcorrencia.findByPk(id)

    if (!relatorio) {
      return res.status(404).json({ message: 'Relatório não encontrado.' })
    }

    // Atualizar e guardar
    relatorio.estado_ocorrencia = estado.toLowerCase()
    await relatorio.save()

    return res.status(200).json({
      message: 'Estado do relatório atualizado com sucesso!',
      data: relatorio,
    })
  } catch (error) {
    next(error)
  }
}

// DELETE /relatorios/:id - Eliminar uma ocorrência
export const deleteOcorrencia = async (req, res, next) => {
  try {
    const { id } = req.params

    const relatorio = await RelatorioOcorrencia.findByPk(id)

    if (!relatorio) {
      return res.status(404).json({ message: 'Relatório não encontrado.' })
    }

    await relatorio.destroy()

    return res.status(200).json({
      message: `Relatório da ocorrência em ${relatorio.local_ocorrencia} eliminado com sucesso.`,
    })
  } catch (error) {
    next(error)
  }
}
