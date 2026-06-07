import Reservas from '../Models/reservas.js'
import Spot from '../Models/spot.js'
import Artista from '../Models/artista.js'

import { validationError, notFoundError, conflictError,forbiddenError} from '../utils/error.utils.js'
// Get all reservas
export const getAllReservas = async (req, res, next) => {
  try {
    const reservas = await Reservas.findAll()
    return res.status(200).json(reservas)
  } catch (error) {
    next(error)
  }
}
export const getReservaById = async (req, res, next) => {
  try {
    const { id } = req.params
    const reserva = await Reservas.findByPk(id)
    if (!reserva) {
      throw notFoundError('Reserva', id)
    }
    return res.status(200).json({
      message: 'Reserva obtida com sucesso.',
      data: reserva,
    })
  } catch (error) {
    next(error)
  }
}
export const getReservasBySpotId = async (req, res, next) => {
  try {
    const { spotId } = req.params
    const date = req.query.date
    const spot = await Spot.findByPk(spotId)
    if (!spot) {
      throw notFoundError('Spot', spotId)
    }
    let reservas = await Reservas.findAll({
      where: { id_spot: spotId },
    })
    if (date) {
      reservas = reservas.filter((r) => r.data_evento === date)
      if (reservas.length === 0) {
        return res.status(204).json({
          message: 'Nenhuma reserva encontrada para este spot e data.',
        })
      }
    }
    if (reservas.length === 0) {
      return res.status(204).json({
        message: 'Nenhuma reserva encontrada para este spot.',
      })
    }
    return res.status(200).json({
      message: 'Reservas obtidas com sucesso.',
      data: reservas,
    })
  } catch (error) {
    next(error)
  }
}
export const getReservasByArtistaId = async (req, res, next) => {
  try {
    const id_artista = req.utilizador?.id_artista || req.params.id_artista
    if (!id_artista) {
      return res.status(400).json({ message: 'ID do artista não fornecido.' })
    }
    const artista = await Artista.findByPk(id_artista)
    if (!artista) {
      throw notFoundError('Artista', id_artista)
    }
    const reservas = await Reservas.findAll({
      where: { id_artista },
    })
    if (reservas.length === 0) {
      return res.status(204).json({
        message: 'Nenhuma reserva encontrada para este artista.',
      })
    }
    return res.status(200).json({
      message: 'Reservas obtidas com sucesso.',
      data: reservas,
    })
  } catch (error) {
    next(error)
  }
}
export const updateReservaById = async (req, res, next) => {
  try {
    const { id } = req.params
    const id_artista = req.utilizador.id_artista
    if (!id_artista) {
      throw conflictError('ID do artista não fornecido.')
    }

    const { data_evento, hora_inicio, hora_fim } = req.body
    // Verificar se a reserva existe e se pertence ao artista
    const reserva = await Reservas.findOne({
      where: {
        id_reserva: id,
        id_artista,
      },
    })
    if (!reserva) {
      throw forbiddenError('Esta reserva nao pertence ao artista', id)
    }
    const originalDateTime = new Date(`${reserva.data_evento}T${reserva.hora_inicio}`)
    const vinteQuatroHorasAntes = new Date(originalDateTime.getTime() - 24 * 60 * 60 * 1000)
    if (new Date() > vinteQuatroHorasAntes) {
      throw validationError(
        'Não é possível atualizar a reserva com menos de 24 horas de antecedência.',
      )
    }
    if (data_evento) {
      const inputDate = new Date(data_evento)
      const today = new Date()
      today.setHours(0, 0, 0, 0)
      inputDate.setHours(0, 0, 0, 0)
      if (inputDate < today) {
        throw validationError({
          data_evento: ['A data do evento só pode ser a partir do dia de hoje.']
        })
      }
    }
    const novaData = data_evento || reserva.data_evento
    const novoInicio = hora_inicio || reserva.hora_inicio
    const novoFim = hora_fim || reserva.hora_fim
    const toMinutes = (t) => {
      const [h, m] = t.split(':').map(Number)
      return h * 60 + m
    }
    const start = toMinutes(novoInicio)
    const end = toMinutes(novoFim)
    if (start >= end) {
      throw validationError({
        hora_inicio: ['Tem de ser antes de hora_fim'],
      })
    }
    if (end - start > 120 || end - start < 30) {
      throw validationError({
        duracao: ['A reserva deve ter entre 30 minutos e 2 horas'],
      })
    }
    const reservasExistentes = await Reservas.findAll({
      where: {
        id_spot: reserva.id_spot,
        data_evento: novaData,
      },
    })
    for (const r of reservasExistentes) {
      if (r.id_reserva === reserva.id_reserva) continue
      const inicioExistente = toMinutes(r.hora_inicio)
      const fimExistente = toMinutes(r.hora_fim)
      const overlap = start < fimExistente && end > inicioExistente
      if (overlap) {
        throw conflictError('Já existe uma reserva neste horário.')
      }
    }
    await reserva.update({
      data_evento: novaData,
      hora_inicio: novoInicio,
      hora_fim: novoFim,
    })
    return res.status(200).json({
      message: 'Reserva atualizada com sucesso.',
      data: reserva,
    })
  } catch (error) {
    next(error)
  }
}

export const deleteReservaById = async (req, res, next) => {
  try {
    const { id } = req.params
    const id_artista = req.utilizador.id_artista
    // Verificar se a reserva existe e se pertence ao artista
    const reserva = await Reservas.findOne({
      where: {
        id_reserva: id,
        id_artista,
      },
    })
    if (!reserva) {
      throw notFoundError('Reserva', id)
    }
    const dataHoraReserva = new Date(`${reserva.data_evento}T${reserva.hora_inicio}`)
    const vinteQuatroHorasAntes = new Date(dataHoraReserva.getTime() - 24 * 60 * 60 * 1000)
    if (new Date() > vinteQuatroHorasAntes) {
      throw conflictError(
        'Não é possível eliminar a reserva com menos de 24 horas de antecedência.',
      )
    }
    await reserva.destroy()
    return res.status(200).json({
      message: 'Reserva eliminada com sucesso.',
    })
  } catch (error) {
    next(error)
  }
}
export const createReserva = async (req, res, next) => {
  try {
    const { id } = req.params
    const id_artista = req.utilizador.id_artista
    const { data_evento, hora_inicio, hora_fim } = req.body
    const spot = await Spot.findByPk(id)
    if (!spot) {
      throw notFoundError('Spot', id)
    }
    const toMinutes = (t) => {
      const [h, m] = t.split(':').map(Number)
      return h * 60 + m
    }
    const start = toMinutes(hora_inicio)
    const end = toMinutes(hora_fim)
    const dataHora = new Date(`${data_evento}T${hora_inicio}`)
    const limite = new Date(dataHora.getTime() - 24 * 60 * 60 * 1000)
    if (new Date() > limite) {
      throw conflictError('Não é possível criar a reserva com menos de 24 horas de antecedência.')
    }
    if (start >= end) {
      throw validationError({
        hora_inicio: ['Tem de ser antes de hora_fim'],
      })
    }
    if (end - start > 120 || end - start < 30) {
      throw validationError({
        duracao: ['Reserva inválida (30min - 2h)'],
      })
    }
    const reservasExistentes = await Reservas.findAll({
      where: {
        id_spot: id,
        data_evento,
      },
    })
    for (const r of reservasExistentes) {
      const rs = toMinutes(r.hora_inicio)
      const re = toMinutes(r.hora_fim)

      if (start < re && end > rs) {
        throw conflictError('O horário escolhido já está reservado.')
      }
    }
    const novaReserva = await Reservas.create({
      data_evento,
      hora_inicio,
      hora_fim,
      data_emissao: new Date(),
      id_spot: id,
      id_artista,
    })
    return res.status(201).json({
      message: 'Reserva criada com sucesso!',
      data: novaReserva,
    })
  } catch (error) {
    next(error)
  }
}
