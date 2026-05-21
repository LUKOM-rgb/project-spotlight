import Utilizador from '../Models/Utilizador.js';
import Artista from '../Models/Artista.js';
import Seguidor from '../Models/Seguidor.js';
import ContaGlobal from '../Models/ContaGlobal.js';
import { Op } from 'sequelize';

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
      return res.status(404).json({ message: 'Conta não encontrada.' });
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
    if (!conta) return res.status(404).json({ message: 'Conta não encontrada.' });

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
    
    if (!conta) return res.status(404).json({ message: 'Conta não encontrada.' });

    await conta.destroy();
    return res.status(200).json({ message: 'Conta removida com sucesso!' });
  } catch (error) {
    next(error);
  }
};
