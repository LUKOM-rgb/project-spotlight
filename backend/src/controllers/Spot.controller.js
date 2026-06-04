import Spot from '../Models/spot.js'
import { validationError, notFoundError, conflictError } from '../utils/error.utils.js'
// Get all spots
export const getAllSpots = async (req, res, next) => {
  try {
    const spots = await Spot.findAll()
    return res.status(200).json({ data: spots })
  } catch (error) {
    next(error)
  }
}
export const getSpotById = async (req, res, next) => {
  try {
    const { id } = req.params
    const spot = await Spot.findByPk(id)
    if (!spot) {
      throw notFoundError('Spot', id)
    }
    return res.status(200).json({
      message: 'Spot obtido com sucesso.',
      data: spot,
    })
  } catch (error) {
    next(error)
  }
}
// - localizacao: string -longitude: decimal -latitude: decimal -abertura:time(00:00:00) -fecho:time(00:00:00)
export const createSpot = async (req, res, next) => {
  try {
    const { localizacao, longitude, latitude, abertura, fecho } = req.body

    const errors = {}

    if (!localizacao) errors.localizacao = ['O campo localização é obrigatório.']
    if (!longitude) errors.longitude = ['O campo longitude é obrigatório.']
    if (!latitude) errors.latitude = ['O campo latitude é obrigatório.']
    if (!abertura) errors.abertura = ['O campo abertura (horário) é obrigatório.']
    if (!fecho) errors.fecho = ['O campo fecho (horário) é obrigatório.']
    if (Object.keys(errors).length > 0) {
      throw validationError(errors)
    }

    // Obter todos os spots para comparar com precisão absoluta as coordenadas no JavaScript
    const todosSpots = await Spot.findAll()
    const isDuplicate = todosSpots.some((s) => 
      Number(s.latitude).toFixed(5) === Number(latitude).toFixed(5) && 
      Number(s.longitude).toFixed(5) === Number(longitude).toFixed(5)
    )

    if (isDuplicate) {
      throw conflictError('Já existe um Spot registado exatamente com esta mesma latitude e longitude.')
    }
    const newSpot = await Spot.create({
      localizacao,
      longitude,
      latitude,
      abertura,
      fecho,
    })
    return res.status(201).json({
      message: 'Spot criado com sucesso!',
      data: newSpot,
    })
  } catch (error) {
    next(error)
  }
}
export const updateSpot = async (req, res, next) => {
  try {
    const { id } = req.params
    const { localizacao, longitude, latitude, abertura, fecho } = req.body

    // Impede a mudança do id_spot
    if (req.body.id_spot) {
      throw validationError({ id_spot: ['Não é permitido alterar o ID de um spot.'] })
    }

    const spot = await Spot.findByPk(id)
    if (!spot) {
      throw notFoundError('Spot', id)
    }
    await spot.update({
      localizacao: localizacao ?? spot.localizacao,
      longitude: longitude ?? spot.longitude,
      latitude: latitude ?? spot.latitude,
      abertura: abertura ?? spot.abertura,
      fecho: fecho ?? spot.fecho,
    })
    return res.status(200).json({
      message: 'Spot atualizado com sucesso.',
      data: spot,
    })
  } catch (error) {
    next(error)
  }
}
export const deleteSpotById = async (req, res, next) => {
  try {
    const { id } = req.params
    const spot = await Spot.findByPk(id)
    if (!spot) {
      throw notFoundError('Spot', id)
    }
    await spot.destroy()
    return res.status(200).json({
      message: `Spot em ${spot.localizacao} eliminado com sucesso.`,
    })
  } catch (error) {
    next(error)
  }
}
