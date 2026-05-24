import Utilizador from '../Models/Utilizador.js';
import Artista from '../Models/Artista.js';
import Seguidor from '../Models/Seguidor.js';
import ContaGlobal from '../Models/ContaGlobal.js';
import Categoria from '../Models/Categorias.js';
import { Op } from 'sequelize';
import { notFoundError, validationError, conflictError } from '../utilis/error.utils.js';

// 1. Mostrar todos os utilizadores (Com filtros)
export const getAllUsers = async (req, res, next) => {
  try {
    const { nome, username, tipo } = req.query;
    let condicoes = {};

    if (nome) condicoes.nome_utilizador = { [Op.like]: `%${nome}%` };
    if (username) condicoes.nome_utilizador = { [Op.like]: `%${username}%` };
    if (tipo) condicoes.tipo = tipo;

    const users = await ContaGlobal.findAll({
      where: condicoes,
      attributes: { exclude: ['password'] }
    });

    return res.status(200).json(users);
  } catch (error) {
    next(error);
  }
};

// 2. Mostrar info de utilizador específico
export const getUserById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const conta = await ContaGlobal.findByPk(id, {
      attributes: { exclude: ['password'] },
      include: [{ model: Artista }]
    });

    if (!conta) {
      throw notFoundError('Utilizador', id);
    }

    return res.status(200).json(conta);
  } catch (error) {
    next(error);
  }
};

// 3. Mudar dados básicos do utilizador
export const updateUser = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { nome_utilizador, numero_telemovel } = req.body;

    const conta = await ContaGlobal.findByPk(id);
    if (!conta) {
      throw notFoundError('Utilizador', id);
    }

    await conta.update({
      nome_utilizador: nome_utilizador || conta.nome_utilizador,
      numero_telemovel: numero_telemovel !== undefined ? numero_telemovel : conta.numero_telemovel
    });

    return res.status(200).json({ message: 'Dados atualizados com sucesso!', conta });
  } catch (error) {
    next(error);
  }
};

// 4. Apagar utilizador
export const deleteUser = async (req, res, next) => {
  try {
    const { id } = req.params;
    const conta = await ContaGlobal.findByPk(id);
    
    if (!conta) {
      throw notFoundError('Utilizador', id);
    }

    await conta.destroy();
    return res.status(200).json({ message: 'Conta removida com sucesso!' });
  } catch (error) {
    next(error);
  }
};

// 5. Mudar cargo (Role) da Conta (REST API)
export const changeUserRole = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { tipo, numero_licenca, validade_licenca, categoria_id } = req.body;

    if (!tipo || !['artista', 'utilizador'].includes(tipo)) {
      throw validationError({ tipo: ['O campo tipo é obrigatório e deve ser "artista" ou "utilizador".'] });
    }

    const conta = await ContaGlobal.findByPk(id);
    if (!conta) {
      throw notFoundError('Utilizador', id);
    }

    if (conta.tipo === tipo) {
      throw conflictError(`Esta conta já possui o cargo de ${tipo}.`);
    }

    // Se a mudança for para ARTISTA
    if (tipo === 'artista') {
      if (!numero_licenca || !validade_licenca || !categoria_id) {
        throw validationError({
          licenca: ['Os campos numero_licenca, validade_licenca e categoria_id são obrigatórios para atualizar para Artista.']
        });
      }

      const dataValidade = new Date(validade_licenca);
      if (isNaN(dataValidade.getTime())) {
        throw validationError({ validade_licenca: ['A validade_licenca tem um formato de data inválido.'] });
      }

      const categoria = await Categoria.findByPk(categoria_id);
      if (!categoria) {
        throw notFoundError('Categoria', categoria_id);
      }

      const licencaExistente = await Artista.findOne({ where: { numero_licenca } });
      if (licencaExistente) {
        throw conflictError('O número de licença fornecido já está registado num outro artista.');
      }

      const novoArtista = await Artista.create({ numero_licenca, validade_licenca, categoria_id });
      await conta.update({ tipo: 'artista', id_artista: novoArtista.id_artista });

      return res.status(200).json({ message: 'Conta promovida a Artista com sucesso!', conta });
    }

    // Se a mudança for para UTILIZADOR (Downgrade)
    if (tipo === 'utilizador') {
      await conta.update({ tipo: 'utilizador', id_artista: null });
      return res.status(200).json({ message: 'Conta rebaixada a Utilizador com sucesso!', conta });
    }

  } catch (error) {
    next(error);
  }
};
