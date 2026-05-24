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
    const { data_evento, hora_inicio, hora_final } = req.body

    const reserva = await Reservas.findByPk(id)

    if (!reserva) {
      return res.status(404).json({ message: 'Reserva não encontrada.' })
    }
    const dataHoraReserva = new Date(`${reserva.data_evento}T${reserva.hora_inicio}`)

    const vinteQuatroHorasAntes = new Date(dataHoraReserva.getTime() - 24 * 60 * 60 * 1000)

    const agora = new Date()

    if (agora > vinteQuatroHorasAntes) {
      return res.status(400).json({ message: 'Não é possível atualizar a reserva com menos de 24 horas de antecedência.' })
    }
    reserva.data_evento = data_evento || reserva.data_evento
    reserva.hora_inicio = hora_inicio || reserva.hora_inicio
    reserva.hora_final = hora_final || reserva.hora_final

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
    const dataHoraReserva = new Date(`${reserva.data_evento}T${reserva.hora_inicio}`)

    const vinteQuatroHorasAntes = new Date(dataHoraReserva.getTime() - 24 * 60 * 60 * 1000)

    const agora = new Date()

    if (agora > vinteQuatroHorasAntes) {
      return res.status(400).json({ message: 'Não é possível eliminar a reserva com menos de 24 horas de antecedência.' })
    }
    await reserva.destroy()

    return res.status(200).json({
      message: `Reserva do dia ${reserva.data_evento} eliminada com sucesso.`,
    })
  } catch (error) {
    console.error('Error deleting reserva:', error)
    return res.status(500).json({ error: 'Failed to delete reserva' })
  }
}
