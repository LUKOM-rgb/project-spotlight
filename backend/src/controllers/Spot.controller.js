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
    const {localizacao, longitude, latitude, abertura, fecho  } = req.body
    const newSpot=await Spot.create({
      localizacao,
      longitude,
      latitude,
      abertura,
      fecho
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
    const {localizacao, longitude, latitude, abertura, fecho  } = req.body

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
      message: 'Spot eliminado com sucesso.',
    })
  } catch (error) {
    console.error('Error deleting spot:', error)
    return res.status(500).json({ error: 'Failed to delete spot' })
  }
}

export const createReserva = async (req, res) => {
  try {
    const { id } = req.params
    const { data_evento, hora_inicio, hora_final, id_user } = req.body
    const spot = await Spot.findByPk(id)

    if (!spot) {
      return res.status(404).json({ message: 'Spot não encontrado.' })
    }

    const novaReserva = await Reservas.create({
      data_evento,
      hora_inicio,
      hora_final,
      id_user,
      id_spot: id
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
