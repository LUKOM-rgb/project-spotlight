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

// 5. Definir quem é Artista
export const becomeArtist = async (req, res, next) => {
  try {
    const { id } = req.params; 
    const { numero_licenca, validade_licenca, categoria_id } = req.body;

    if (!numero_licenca || !validade_licenca || !categoria_id) {
      return res.status(400).json({ message: 'numero_licenca, validade_licenca e categoria_id são obrigatórios para ser artista.' });
    }

    const conta = await ContaGlobal.findByPk(id);
    if (!conta) return res.status(404).json({ message: 'Conta não encontrada.' });

    if (conta.tipo === 'artista') return res.status(400).json({ message: 'Esta conta já tem um perfil de artista.' });

    const novoArtista = await Artista.create({
      numero_licenca,
      validade_licenca,
      categoria_id
    });

    await conta.update({ 
      tipo: 'artista',
      id_artista: novoArtista.id_artista
    });

    return res.status(201).json({ message: 'Perfil de artista criado com sucesso! A conta agora é um Artista.' });
  } catch (error) {
    next(error);
  }
};

// 6. Alterar dados específicos do Artista
export const updateArtistData = async (req, res, next) => {
  try {
    const { id } = req.params; 
    const { numero_licenca, validade_licenca, categoria_id } = req.body;

    const conta = await ContaGlobal.findByPk(id);
    if (!conta || conta.tipo !== 'artista' || !conta.id_artista) {
      return res.status(404).json({ message: 'Perfil de artista não encontrado para esta conta.' });
    }

    const artista = await Artista.findByPk(conta.id_artista);
    if (!artista) return res.status(404).json({ message: 'Perfil de artista não encontrado na base de dados.' });

    await artista.update({
      numero_licenca: numero_licenca || artista.numero_licenca,
      validade_licenca: validade_licenca || artista.validade_licenca,
      categoria_id: categoria_id || artista.categoria_id
    });

    return res.status(200).json({ message: 'Dados de artista atualizados com sucesso!', artista });
  } catch (error) {
    next(error);
  }
};

// 7. Seguir um artista
export const followArtist = async (req, res, next) => {
  try {
    const { id, artistId } = req.params;

    const conta = await ContaGlobal.findByPk(id);
    if (!conta) return res.status(404).json({ message: 'Conta não encontrada.' });

    const artista = await Artista.findByPk(artistId);
    if (!artista) return res.status(404).json({ message: 'Artista não encontrado.' });

    const jaSegue = await Seguidor.findOne({
      where: { id_conta: id, id_artista: artistId }
    });
    if (jaSegue) return res.status(400).json({ message: 'Já segues este artista.' });

    await Seguidor.create({
      id_conta: id,
      id_artista: artistId,
      data_inicio: new Date()
    });

    return res.status(201).json({ message: 'Passaste a seguir o artista com sucesso!' });
  } catch (error) {
    next(error);
  }
};

// 8. Deixar de seguir um artista
export const unfollowArtist = async (req, res, next) => {
  try {
    const { id, artistId } = req.params;

    const segue = await Seguidor.findOne({
      where: { id_conta: id, id_artista: artistId }
    });

    if (!segue) return res.status(400).json({ message: 'Não segues este artista.' });

    await segue.destroy();

    return res.status(200).json({ message: 'Deixaste de seguir o artista com sucesso!' });
  } catch (error) {
    next(error);
  }
};