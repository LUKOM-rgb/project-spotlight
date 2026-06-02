import Spot from '../Models/spot.js'
import { validationError, notFoundError } from '../utils/error.utils.js'
// Get all spots
export const getAllSpots = async (req, res, next) => {
  try {
    const spots = await Spot.findAll()
    return res.status(200).json(spots)
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

    if (!localizacao) errors.localizacao = ['Obrigatório']
    if (!longitude) errors.longitude = ['Obrigatório']
    if (!latitude) errors.latitude = ['Obrigatório']
    if (!abertura) errors.abertura = ['Obrigatório']
    if (!fecho) errors.fecho = ['Obrigatório']
    if (Object.keys(errors).length > 0) {
      throw validationError(errors)
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
