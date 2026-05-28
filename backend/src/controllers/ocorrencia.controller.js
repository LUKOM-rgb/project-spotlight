import RelatorioOcorrencia from '../Models/ocorrencia.js'
import Utilizador from '../Models/utilizador.js'
import Spot from '../Models/spot.js'
import { validationError, notFoundError } from '../utilis/error.utils.js'

// POST /ocorrencias - Criar nova ocorrência
export const createOcorrencia = async (req, res, next) => {
  try {
    const {
      data_ocorrencia,
      hora_ocorrencia,
      local_ocorrencia,
      descricao_ocorrencia,
      estado,
      id_utilizador,
      id_spot,
    } = req.body

    // 400 Bad Request: Validações básicas de campos obrigatórios
    const errors = {}
    if (!descricao_ocorrencia) errors.descricao_ocorrencia = ['O campo descrição é obrigatório.']
    if (!local_ocorrencia) errors.local_ocorrencia = ['O local da ocorrência é obrigatório.']
    if (!id_utilizador) errors.id_utilizador = ['O ID da conta é obrigatório.']
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

    // 404 Not Found: Verificar se o id_utilizador e id_spot realmente existem na Base de Dados
    const contaExiste = await Utilizador.findByPk(id_utilizador)
    if (!contaExiste) throw notFoundError('Conta', id_utilizador)

    const spotExiste = await Spot.findByPk(id_spot)
    if (!spotExiste) throw notFoundError('Spot', id_spot)

    // 3. Criar a ocorrência na base de dados
    const novaOcorrencia = await RelatorioOcorrencia.create({
      data_ocorrencia: data_ocorrencia || new Date(),
      data_envio: new Date(),
      hora_ocorrencia,
      local_ocorrencia,
      descricao_ocorrencia: descricao_ocorrencia,
      estado_ocorrencia: estado ? estado.toLowerCase() : 'pendente',
      id_utilizador,
      id_spot,
    })

    // 4. Responder com 201 Created
    return res.status(201).json({
      message: 'Ocorrência registada com sucesso!',
      data: novaOcorrencia,
    })
  } catch (error) {
    next(error) // Encaminha para o middleware global de erros
  }
}

// GET /ocorrencias - Obter todas as ocorrências
export const getAllOcorrencias = async (req, res, next) => {
  try {
    // Podes ler parâmetros da query (ex: /ocorrencias?estado=Pendente)
    const { estado, id_spot } = req.query
    const whereClause = {}

    if (estado) whereClause.estado_ocorrencia = estado.toLowerCase()
    if (id_spot) whereClause.id_spot = id_spot

    const ocorrencias = await RelatorioOcorrencia.findAll({
      where: whereClause,
    })

    return res.status(200).json({
      message: 'Ocorrências obtidas com sucesso.',
      data: ocorrencias,
    })
  } catch (error) {
    next(error)
  }
}

// GET /ocorrencias/:id - Obter uma ocorrência específica
export const getOcorrenciaById = async (req, res, next) => {
  try {
    const { id } = req.params

    const ocorrencia = await RelatorioOcorrencia.findByPk(id)

    if (!ocorrencia) {
      throw notFoundError('Ocorrencia', id)
    }

    return res.status(200).json({
      message: 'Ocorrência obtida com sucesso.',
      data: ocorrencia,
    })
  } catch (error) {
    next(error)
  }
}

// PATCH /ocorrencias/:id/estado - Atualizar o estado da ocorrência
export const updateEstadoOcorrencia = async (req, res, next) => {
  try {
    const { id } = req.params
    const { estado_ocorrencia } = req.body

    // 400 Bad Request: Validações básicas de campos obrigatórios
    if (!estado_ocorrencia) {
      throw validationError({ estado_ocorrencia: ['O novo estado é obrigatório.'] })
    }

    const ocorrencia = await RelatorioOcorrencia.findByPk(id)

    // 404 Not Found: Verificar se a ocorrência existe na base de dados
    if (!ocorrencia) {
      throw notFoundError('Ocorrencia', id)
    }

    // Atualizar e guardar
    ocorrencia.estado_ocorrencia = estado_ocorrencia.toLowerCase()
    await ocorrencia.save()

    return res.status(200).json({
      message: 'Estado da ocorrência atualizado com sucesso!',
      data: ocorrencia,
    })
  } catch (error) {
    next(error)
  }
}

// DELETE /ocorrencias/:id - Eliminar uma ocorrência
export const deleteOcorrencia = async (req, res, next) => {
  try {
    const { id } = req.params

    const ocorrencia = await RelatorioOcorrencia.findByPk(id)

    // 404 Not Found: Verificar se a ocorrência existe na base de dados
    if (!ocorrencia) {
      throw notFoundError('Ocorrencia', id)
    }

    await ocorrencia.destroy()

    return res.status(200).json({
      message: `Ocorrência em ${ocorrencia.local_ocorrencia} eliminada com sucesso.`,
    })
  } catch (error) {
    next(error)
  }
}
