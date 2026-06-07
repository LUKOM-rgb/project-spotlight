import Artista from '../Models/artista.js';
import Seguidor from '../Models/seguidor.js';
import Utilizador from '../Models/utilizador.js';
import Categoria from '../Models/categorias.js';
import { Op } from 'sequelize';
import { notFoundError, validationError, conflictError } from '../utils/error.utils.js';
import { hashPassword } from '../utils/auth.utils.js';

//Mostrar todos os utilizadores
export const getAllUtilizadores = async (req, res, next) => {
  try {
    const { nome, username, tipo } = req.query;
    let condicoes = {};

    if (nome) condicoes.nome_utilizador = { [Op.like]: `%${nome}%` };
    if (username) condicoes.nome_utilizador = { [Op.like]: `%${username}%` };
    if (tipo) condicoes.tipo = tipo;

    const users = await Utilizador.findAll({
      where: condicoes,
      attributes: { exclude: ['password'] }
    });

    return res.status(200).json({ data: users });
  } catch (error) {
    next(error);
  }
};

//Mostrar info de utilizador específico
export const getUtilizadorById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const conta = await Utilizador.findByPk(id, {
      attributes: { exclude: ['password'] },
      include: [{ model: Artista }]
    });

    if (!conta) {
      throw notFoundError('Utilizador', id);
    }

    return res.status(200).json({ data: conta });
  } catch (error) {
    next(error);
  }
};

//Mostrar info do próprio utilizador
export const getMyProfile = async (req, res, next) => {
  try {
    const id = req.utilizador.sub;
    const conta = await Utilizador.findByPk(id, {
      attributes: { exclude: ['password'] },
      include: [{ model: Artista }]
    });

    if (!conta) {
      throw notFoundError('Utilizador', id);
    }

    return res.status(200).json({ data: conta });
  } catch (error) {
    next(error);
  }
};

//Mudar dados do próprio perfil
export const updateProfile = async (req, res, next) => {
  try {
    const id = req.utilizador.sub;
    const { email, password, nome_utilizador, numero_telemovel } = req.body;

    const conta = await Utilizador.findByPk(id);
    if (!conta) {
      throw notFoundError('Utilizador', id);
    }

    // Verificar se algum dado foi realmente enviado para ser alterado e se é diferente do atual
    const isSameEmail = !email || email === conta.email;
    const isSameNome = !nome_utilizador || nome_utilizador === conta.nome_utilizador;
    const isSameTelemovel = numero_telemovel === undefined || String(numero_telemovel) === String(conta.numero_telemovel);
    const isPasswordProvided = !!password;

    if (isSameEmail && isSameNome && isSameTelemovel && !isPasswordProvided) {
      throw validationError({
        geral: ['Nenhum dado novo foi fornecido ou os dados são iguais aos atuais. Por favor altera algum valor para atualizar o perfil.']
      });
    }

    // Verificar se o novo email, nome_utilizador ou numero_telemovel já estão em uso por outra conta
    if (email && email !== conta.email) {
      const emailExistente = await Utilizador.findOne({ where: { email } });
      if (emailExistente) {
        throw conflictError('Este email já está associado a outra conta.');
      }
    }

    if (nome_utilizador && nome_utilizador !== conta.nome_utilizador) {
      const nomeExistente = await Utilizador.findOne({ where: { nome_utilizador } });
      if (nomeExistente) {
        throw conflictError('Este nome de utilizador já está em uso.');
      }
    }

    if (numero_telemovel && String(numero_telemovel) !== String(conta.numero_telemovel)) {
      const telemovelExistente = await Utilizador.findOne({ where: { numero_telemovel } });
      if (telemovelExistente) {
        throw conflictError('Este número de telemóvel já está associado a outra conta.');
      }
    }

    // Hash da nova password, caso seja fornecida
    let novaPasswordHashed = conta.password;
    if (password) {
      if (password.length < 6) {
        throw validationError({ password: ['A password deve ter pelo menos 6 caracteres.'] });
      }
      novaPasswordHashed = await hashPassword(password);
    }

    // Validar telemóvel
    if (numero_telemovel !== undefined && numero_telemovel !== null && String(numero_telemovel).trim() !== '') {
      const isNineDigits = /^\d{9}$/.test(String(numero_telemovel));
      if (!isNineDigits) {
        throw validationError({ numero_telemovel: ['O número de telemóvel tem de conter exatamente 9 dígitos numéricos.'] });
      }
    }

    await conta.update({
      email: email || conta.email,
      password: novaPasswordHashed,
      nome_utilizador: nome_utilizador || conta.nome_utilizador,
      numero_telemovel: numero_telemovel !== undefined ? numero_telemovel : conta.numero_telemovel
    });

    return res.status(200).json({
      message: 'Perfil atualizado com sucesso!',
      data: {
        id_utilizador: conta.id_utilizador,
        email: conta.email,
        nome_utilizador: conta.nome_utilizador,
        numero_telemovel: conta.numero_telemovel
      }
    });
  } catch (error) {
    next(error);
  }
};

//Apagar utilizador
export const deleteUtilizador = async (req, res, next) => {
  try {
    const { id } = req.params;
    const conta = await Utilizador.findByPk(id);

    if (!conta) {
      throw notFoundError('Utilizador', id);
    }

    await conta.destroy();
    return res.status(200).json({ message: `Conta ${conta.email} removida com sucesso!` });
  } catch (error) {
    next(error);
  }
};

//Mudar cargo da conta
export const changeUtilizadorRole = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { tipo, numero_licenca, validade_licenca, categoria_id } = req.body;

    if (!tipo || !['artista', 'utilizador'].includes(tipo)) {
      throw validationError({ tipo: ['O campo tipo é obrigatório e deve ser "artista" ou "utilizador".'] });
    }

    const conta = await Utilizador.findByPk(id);
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

      if (!String(numero_licenca).startsWith('LIC-')) {
        throw validationError({ numero_licenca: ['O número de licença tem de começar obrigatoriamente pelo prefixo "LIC-".'] });
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

      return res.status(200).json({ message: 'Conta promovida a Artista com sucesso!', data: conta });
    }

    // Se a mudança for para UTILIZADOR
    if (tipo === 'utilizador') {
      await conta.update({ tipo: 'utilizador', id_artista: null });
      return res.status(200).json({ message: 'Conta rebaixada a Utilizador com sucesso!', data: conta });
    }

  } catch (error) {
    next(error);
  }
};
