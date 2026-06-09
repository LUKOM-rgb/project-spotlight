import Artista from '../Models/artista.js';
import Utilizador from '../Models/utilizador.js';
import Seguidor from '../Models/seguidor.js';
import { generateToken } from '../utils/auth.utils.js';
import { validationError, notFoundError, conflictError } from '../utils/error.utils.js';

// Obter os top 3 artistas com mais seguidores
export const getTopArtists = async (req, res, next) => {
  try {
    const contas = await Utilizador.findAll({
      where: { tipo: 'artista' },
      attributes: ['nome_utilizador'],
      include: [
        {
          model: Artista,
          include: [{ model: Seguidor }]
        }
      ]
    });

    const artistsWithFollowers = contas
      .map(conta => {
        const artistaObj = conta.Artistum || conta.Artista;
        return {
          name: conta.nome_utilizador,
          followers: artistaObj && artistaObj.Seguidors ? artistaObj.Seguidors.length : 0
        };
      })
      .filter(artist => artist.followers > 0);

    artistsWithFollowers.sort((a, b) => b.followers - a.followers);

    return res.status(200).json({ data: artistsWithFollowers.slice(0, 3) });
  } catch (error) {
    next(error);
  }
};

//Criar Artista
export const createArtist = async (req, res, next) => {
  try {
    const id_utilizador = req.utilizador.sub;

    const {
      numero_licenca,
      validade_licenca,
      categoria_id
    } = req.body;
    // Validação básica
    const errors = {};
    if (!numero_licenca) errors.numero_licenca = ['O campo numero_licenca é obrigatório.'];
    if (!validade_licenca) errors.validade_licenca = ['O campo validade_licenca é obrigatório.'];
    if (!categoria_id) errors.categoria_id = ['O campo categoria_id é obrigatório.'];

    if (Object.keys(errors).length > 0) {
      throw validationError(errors);
    }

    if (!String(numero_licenca).startsWith('LIC-')) {
      throw validationError({ numero_licenca: ['O número de licença tem de começar obrigatoriamente pelo prefixo "LIC-".'] });
    }

    // Verificar se o Utilizador já existe e já é artista ANTES de criar
    const novaConta = await Utilizador.findOne({ where: { id_utilizador } });
    if (!novaConta) {
      throw notFoundError('Conta de Utilizador', id_utilizador);
    }
    if (novaConta.tipo === 'artista') {
      throw conflictError('Esta conta já possui o cargo de artista. Não podes registar-te novamente.');
    }

    const licencaExistente = await Artista.findOne({ where: { numero_licenca } });
    if (licencaExistente) {
      throw conflictError('O número de licença fornecido já está registado noutro artista.');
    }

    // Criar o registo do Artista primeiro
    const novoArtista = await Artista.create({
      numero_licenca,
      validade_licenca,
      categoria_id
    });

    novaConta.id_artista = novoArtista.id_artista;
    novaConta.tipo = 'artista';
    await novaConta.save();
    const token = generateToken(novaConta);

    return res.status(201).json({
      message: 'Artista criado com sucesso!',
      data: {
        id_utilizador: novaConta.id_utilizador,
        nome_utilizador: novaConta.nome_utilizador,
        email: novaConta.email,
        id_artista: novoArtista.id_artista
      },
      bearerToken: token
    });
  } catch (error) {
    next(error);
  }
};

//Mostrar todos os Artistas
export const getAllArtists = async (req, res, next) => {
  try {
    const contas = await Utilizador.findAll({
      where: { tipo: 'artista' },
      attributes: { exclude: ['password'] },
      include: [
        {
          model: Artista,
          include: [{ model: Seguidor }]
        }
      ]
    });

    return res.status(200).json({ data: contas });
  } catch (error) {
    next(error);
  }
};

//Mostrar info de um Artista específico
export const getArtistById = async (req, res, next) => {
  try {
    const { id_artista } = req.params;
    const conta = await Utilizador.findOne({
      where: { id_artista: id_artista, tipo: 'artista' },
      attributes: { exclude: ['password', 'id_artista'] },
      include: [{ model: Artista }]
    });

    if (!conta) {
      throw notFoundError('Artista', id_artista);
    }

    return res.status(200).json({ data: conta });
  } catch (error) {
    next(error);
  }
};

//Mudar dados do Artista
export const updateArtist = async (req, res, next) => {
  try {
    const id_artista = req.utilizador.id_artista || req.params.id_artista;
    const { numero_licenca, validade_licenca, categoria_id } = req.body;

    const artista = await Artista.findByPk(id_artista);
    if (!artista) {
      throw notFoundError('Perfil de Artista', id_artista);
    }

    if (numero_licenca && !String(numero_licenca).startsWith('LIC-')) {
      throw validationError({ numero_licenca: ['O número de licença tem de começar obrigatoriamente pelo prefixo "LIC-".'] });
    }

    if (numero_licenca) {
      const licencaExistente = await Artista.findOne({ where: { numero_licenca } });
      if (licencaExistente && licencaExistente.id_artista !== parseInt(id_artista)) {
        throw conflictError('O número de licença fornecido já está registado noutro artista.');
      }
    }

    await artista.update({
      numero_licenca: numero_licenca ?? artista.numero_licenca,
      validade_licenca: validade_licenca ?? artista.validade_licenca,
      categoria_id: categoria_id ?? artista.categoria_id
    });

    return res.status(200).json({ message: 'Dados de artista atualizados com sucesso!', data: artista });
  } catch (error) {
    next(error);
  }
};

//Apagar Artista
export const deleteArtist = async (req, res, next) => {
  try {
    const { id_artista } = req.params;
    const conta = await Utilizador.findOne({ where: { id_artista: id_artista} });

    if (!conta) {
      throw notFoundError('Artista', id_artista);
    }

    conta.tipo = 'utilizador';
    conta.id_artista = null;
    await conta.save();

    await Artista.destroy({ where: { id_artista: id_artista } });

    return res.status(200).json({ message: `Artista ${conta.nome_utilizador} removido com sucesso!` });
  } catch (error) {
    next(error);
  }
};
