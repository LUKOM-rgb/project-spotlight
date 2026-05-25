import Reservas from '../Models/Reservas.js'

// Get all reservas
export const getAllReservas = async (req, res) => {
  try {
    const reservas = await Reservas.findAll()
    res.json(reservas)
  } catch (error) {
    console.error('Error fetching reservas:', error)
    res.status(500).json({ error: 'Failed to fetch reservas' })
  }
}
export const getReservaById = async (req, res) => {
  try {
    const { id } = req.params
    const reserva = await Reservas.findByPk(id)

    if (!reserva) {
      return res.status(404).json({ message: 'Reserva não encontrada.' })
    }

    return res.status(200).json({
      message: 'Reserva obtida com sucesso.',
      data: reserva,
    })
  } catch (error) {
    console.error('Error fetching reserva:', error)
    return res.status(500).json({ error: 'Failed to fetch reserva' })
  }
}
export const getReservasBySpotId = async (req, res) => {
  try {
    const { spotId } = req.params
    const reservas = await Reservas.findAll({ where: { id_spot: spotId } })

    if (reservas.length === 0) {
      return res.status(404).json({ message: 'Nenhuma reserva encontrada para este spot.' })
    }

    return res.status(200).json({
      message: 'Reservas obtidas com sucesso.',
      data: reservas,
    })
  } catch (error) {
    console.error('Error fetching reservas by spot ID:', error)
    return res.status(500).json({ error: 'Failed to fetch reservas by spot ID' })
  }
}
export const getReservasByArtistaId = async (req, res) => {
  try {
    const { artistaId } = req.params
    const reservas = await Reservas.findAll({ where: { id_artista: artistaId } })

    if (reservas.length === 0) {
      return res.status(404).json({ message: 'Nenhuma reserva encontrada para este artista.' })
    }
    return res.status(200).json({
      message: 'Reservas obtidas com sucesso.',
      data: reservas,
    })
  } catch (error) {
    console.error('Error fetching reservas by artista ID:', error)
    return res.status(500).json({ error: 'Failed to fetch reservas by artista ID' })
  }
}
export const updateReservaById = async (req, res) => {
  try {
    const { id } = req.params
    const { data_evento, hora_inicio, hora_fim } = req.body
    const reserva = await Reservas.findByPk(id)
    if (!reserva) {
      return res.status(404).json({ message: 'Reserva não encontrada.' })
    }
    // 24 horas antes
    const originalDateTime = new Date(
      `${reserva.data_evento}T${reserva.hora_inicio}`
    )
    const vinteQuatroHorasAntes = new Date(
      originalDateTime.getTime() - 24 * 60 * 60 * 1000
    )
    const agora = new Date()
    if (agora > vinteQuatroHorasAntes) {
      return res.status(400).json({
        message:
          'Não é possível atualizar a reserva com menos de 24 horas de antecedência.',
      })
    }
    const novaData = data_evento || reserva.data_evento
    const novoInicio = hora_inicio || reserva.hora_inicio
    const novoFim = hora_fim || reserva.hora_fim

    const toMinutes = (time) => {
      const [h, m] = time.split(':').map(Number)
      return h * 60 + m
    }
    const start = toMinutes(novoInicio)
    const end = toMinutes(novoFim)
    if (start >= end) {
      return res.status(400).json({
        message: 'hora_inicio tem de ser antes de hora_fim',
      })
    }
    if (end - start > 120 || end - start < 30) {
      return res.status(400).json({
        message: 'A reserva não pode exceder 2 horas de duração e deve ter no mínimo 30 minutos de duração.',
      })
    }
    const reservasExistentes = await Reservas.findAll({
      where: {
        id_spot: reserva.id_spot,
        data_evento: novaData,
      },
    })
// Não se pode sobrepor com outras
    for (const r of reservasExistentes) {
      if (r.id_reserva === reserva.id_reserva) continue
      const inicioExistente = toMinutes(r.hora_inicio)
      const fimExistente = toMinutes(r.hora_fim)
      const overlap =
        start < fimExistente && end > inicioExistente
      if (overlap) {
        return res.status(400).json({
          message: 'Já existe uma reserva neste horário.',
        })
      }
    }
    reserva.data_evento = novaData
    reserva.hora_inicio = novoInicio
    reserva.hora_fim = novoFim
    await reserva.save()
    return res.status(200).json({
      message: 'Reserva atualizada com sucesso.',
      data: reserva,
    })
  } catch (error) {
    console.error('Error updating reserva:', error)
    return res.status(500).json({ error: 'Failed to update reserva' })
  }
}

export const deleteReservaById = async (req, res) => {
  try {
    const { id } = req.params

    const reserva = await Reservas.findByPk(id)

    if (!reserva) {
      return res.status(404).json({ message: 'Reserva não encontrada.' })
    }

    const agora = new Date()

    // data_evento já é string YYYY-MM-DD
    const data = reserva.data_evento

    const dataHoraReserva = new Date(`${data}T${reserva.hora_inicio}`)

    const vinteQuatroHorasAntes = new Date(
      dataHoraReserva.getTime() - 24 * 60 * 60 * 1000
    )

    if (agora > vinteQuatroHorasAntes) {
      return res.status(400).json({
        message:
          'Não é possível eliminar a reserva com menos de 24 horas de antecedência.',
      })
    }

    await reserva.destroy()

    return res.status(200).json({
      message: 'Reserva eliminada com sucesso.',
    })
  } catch (error) {
    console.error('Error deleting reserva:', error)
    return res.status(500).json({ error: error.message })
  }
}
export const getreservasBySpotIdAndDate = async (req, res) => {
  try {
    const { spotId, date } = req.params

    const reservas = await Reservas.findAll({
      where: {
        id_spot: spotId,
        data_evento: date,
      },
      order: [['hora_inicio', 'ASC']],
    })

    return res.status(200).json({
      message: 'Reservas obtidas com sucesso.',
      data: reservas,
    })
  } catch (error) {
    console.error('Error fetching reservas by spot ID and date:', error)
    return res.status(500).json({ error: 'Failed to fetch reservas' })
  }
}
