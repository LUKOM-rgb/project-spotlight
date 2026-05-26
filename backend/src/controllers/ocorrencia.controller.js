import RelatorioOcorrencia from '../Models/Ocorrencia.js'
import ContaGlobal from '../Models/ContaGlobal.js'
import Spot from '../Models/Spot.js'
import { validationError, notFoundError } from '../utilis/error.utils.js'

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

    // 400 Bad Request: Validações básicas de campos obrigatórios
    const errors = {}
    if (!descricao) errors.descricao = ['O campo descrição é obrigatório.']
    if (!local_ocorrencia) errors.local_ocorrencia = ['O local da ocorrência é obrigatório.']
    if (!id_conta) errors.id_conta = ['O ID da conta é obrigatório.']
    if (!id_spot) errors.id_spot = ['O ID do spot é obrigatório.']

    // Validar se a data de ocorrência não é no futuro (no máximo o dia de hoje)
    if (data_ocorrencia) {
      const dataInserida = new Date(data_ocorrencia)
      if (isNaN(dataInserida.getTime())) {
        errors.data_ocorrencia = ['A data da ocorrência fornecida é inválida.']
      } else {
        const hoje = new Date()
        const dataInseridaSemHora = new Date(
          dataInserida.getFullYear(),
          dataInserida.getMonth(),
          dataInserida.getDate(),
        )
        const hojeSemHora = new Date(hoje.getFullYear(), hoje.getMonth(), hoje.getDate())

        if (dataInseridaSemHora > hojeSemHora) {
          errors.data_ocorrencia = ['Data de ocorrência inválida.']
        }
      }
    }

    if (Object.keys(errors).length > 0) {
      throw validationError(errors)
    }

    // 404 Not Found: Verificar se o id_conta e id_spot realmente existem na Base de Dados
    const contaExiste = await ContaGlobal.findByPk(id_conta)
    if (!contaExiste) throw notFoundError('Conta', id_conta)

    const spotExiste = await Spot.findByPk(id_spot)
    if (!spotExiste) throw notFoundError('Spot', id_spot)

    // 3. Criar o relatório na base de dados
    const novoRelatorio = await RelatorioOcorrencia.create({
      data_ocorrencia: data_ocorrencia || new Date(),
      data_envio: new Date(),
      hora_ocorrencia,
      local_ocorrencia,
      descricao_ocorrencia: descricao,
      estado_ocorrencia: estado ? estado.toLowerCase() : 'pendente',
      id_conta,
      id_spot,
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
      throw notFoundError('RelatorioOcorrencia', id)
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

    // 400 Bad Request: Validações básicas de campos obrigatórios
    if (!estado) {
      throw validationError({ estado: ['O novo estado é obrigatório.'] })
    }

    const relatorio = await RelatorioOcorrencia.findByPk(id)

    // 404 Not Found: Verificar se o relatório existe na base de dados
    if (!relatorio) {
      throw notFoundError('RelatorioOcorrencia', id)
    }

    // Atualizar e guardar
    relatorio.estado_ocorrencia = estado.toLowerCase()
    await relatorio.save()

    return res.status(200).json({
      message: 'Estado do relatório updated com sucesso!',
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

    // 404 Not Found: Verificar se o relatório existe na base de dados
    if (!relatorio) {
      throw notFoundError('RelatorioOcorrencia', id)
    }

    await relatorio.destroy()

    return res.status(200).json({
      message: `Relatório da ocorrência em ${relatorio.local_ocorrencia} eliminado com sucesso.`,
    })
  } catch (error) {
    next(error)
  }
}
