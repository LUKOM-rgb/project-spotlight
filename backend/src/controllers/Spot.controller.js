import Spot from '../Models/Spot.js'
import Reservas from '../Models/Reservas.js'
// Get all spots
export const getAllSpots = async (req, res) => {
  try {
    const spots = await Spot.findAll()
    res.json(spots)
  } catch (error) {
    console.error('Error fetching spots:', error)
    res.status(500).json({ error: 'Failed to fetch spots' })
  }
}
export const getSpotById = async (req, res) => {
  try {
    const { id } = req.params
    const spot = await Spot.findByPk(id)

    if (!spot) {
      return res.status(404).json({ message: 'Spot não encontrado.' })
    }

    return res.status(200).json({
      message: 'Spot obtido com sucesso.',
      data: spot,
    })
  } catch (error) {
    console.error('Error fetching spot:', error)
    return res.status(500).json({ error: 'Failed to fetch spot' })
  }
}
// - localizacao: string -longitude: decimal -latitude: decimal -abertura:time(00:00:00) -fecho:time(00:00:00)
export const createSpot = async (req, res) => {
  try {
    const { localizacao, longitude, latitude, abertura, fecho } = req.body
    const newSpot = await Spot.create({
      localizacao,
      longitude,
      latitude,
      abertura,
      fecho,
    })
    res.status(201).json({
      message: 'Spot criado com sucesso!',
      data: newSpot,
    })
  } catch (error) {
    console.error('Error creating spot:', error)
    res.status(500).json({ error: 'Failed to create spot' })
  }
}
export const updateSpot = async (req, res) => {
  try {
    const { id } = req.params
    const { localizacao, longitude, latitude, abertura, fecho } = req.body

    const spot = await Spot.findByPk(id)

    if (!spot) {
      return res.status(404).json({ message: 'Spot não encontrado.' })
    }

    spot.localizacao = localizacao || spot.localizacao
    spot.longitude = longitude || spot.longitude
    spot.latitude = latitude || spot.latitude
    spot.abertura = abertura || spot.abertura
    spot.fecho = fecho || spot.fecho

    await spot.save()

    return res.status(200).json({
      message: 'Spot atualizado com sucesso.',
      data: spot,
    })
  } catch (error) {
    console.error('Error updating spot:', error)
    return res.status(500).json({ error: 'Failed to update spot' })
  }
}
export const deleteSpotById = async (req, res) => {
  try {
    const { id } = req.params
    const spot = await Spot.findByPk(id)

    if (!spot) {
      return res.status(404).json({ message: 'Spot não encontrado.' })
    }

    await spot.destroy()

    return res.status(200).json({
      message: `Spot em ${spot.localizacao} eliminado com sucesso.`,
    })
  } catch (error) {
    console.error('Error deleting spot:', error)
    return res.status(500).json({ error: 'Failed to delete spot' })
  }
}

export const createReserva = async (req, res) => {
  try {
    const { id } = req.params
    const { data_evento, hora_inicio, hora_fim, id_artista } = req.body
    const spot = await Spot.findByPk(id)
    if (!spot) {
      return res.status(404).json({ message: 'Spot não encontrado.' })
    }
    const toMinutes = (time) => {
      const [h, m] = time.split(':').map(Number)
      return h * 60 + m
    }
    const start = toMinutes(hora_inicio)
    const end = toMinutes(hora_fim)
    // 24 horas antes
    const diaAntesHora = new Date(`${data_evento}T${hora_inicio}`)
    const vinteQuatroHorasAntes = new Date(
      diaAntesHora.getTime() - 24 * 60 * 60 * 1000
    )
    const agora = new Date()
    if (agora > vinteQuatroHorasAntes) {
      return res.status(400).json({
        message:
          'Não é possível criar a reserva com menos de 24 horas de antecedência.',
      })
    }
    // hora de inicio tem que ser antes da hora de fim e a reserva n pode ter mais que 2 horas de duração

    if(start)
    if (start >= end) {
      return res.status(409).json({
        message: 'hora_inicio tem de ser antes de hora_fim',
      })
    } else if (end - start > 120 || end - start < 30) {
      return res.status(409).json({
        message: 'A reserva não pode ter menos que 30 minutos ou mais que 2 horas de duração.',
      })
    }
    const reservasExistentes = await Reservas.findAll({
      where: {
        id_spot: id,
        data_evento,
      },
    })
    // Verifica se as reservas n se sobrepõem
    for (const reserva of reservasExistentes) {
      const reservaStart = toMinutes(reserva.hora_inicio)
      const reservaEnd = toMinutes(reserva.hora_fim)
      if (
        (start >= reservaStart && start < reservaEnd) ||
        (end > reservaStart && end <= reservaEnd) ||
        (start <= reservaStart && end >= reservaEnd)
      ) {
        return res.status(400).json({
          message: 'O horário escolhido já está reservado.',
        })
      }
    }
    const data_emissao = new Date()

    const novaReserva = await Reservas.create({
      data_evento,
      hora_inicio,
      hora_fim,
      data_emissao,
      id_spot: id,
      id_artista,
    })

    return res.status(201).json({
      message: 'Reserva criada com sucesso!',
      data: novaReserva,
    })
  } catch (error) {
    console.error('Error creating reserva:', error)
    return res.status(500).json({ error: 'Failed to create reserva' })
  }
}
