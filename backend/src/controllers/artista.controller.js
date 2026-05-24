import Artista from '../Models/Artista.js';
import ContaGlobal from '../Models/ContaGlobal.js';
import Seguidor from '../Models/Seguidor.js';
import { hashPassword } from '../utilis/auth.utils.js';
import { validationError, notFoundError, conflictError } from '../utilis/error.utils.js';

// 1. Criar Artista (Registo de um novo Artista)
export const createArtist = async (req, res, next) => {
  try {
    const { 
      email, 
      password, 
      nome_utilizador, 
      numero_telemovel, 
      numero_licenca, 
      validade_licenca, 
      categoria_id 
    } = req.body;

    // Validação básica
    const errors = {};
    if (!email) errors.email = ['O campo email é obrigatório.'];
    if (!password || password.length < 6) errors.password = ['A password deve ter pelo menos 6 caracteres.'];
    if (!nome_utilizador) errors.nome_utilizador = ['O campo nome_utilizador é obrigatório.'];
    if (!numero_licenca) errors.numero_licenca = ['O campo numero_licenca é obrigatório.'];
    if (!validade_licenca) errors.validade_licenca = ['O campo validade_licenca é obrigatório.'];
    if (!categoria_id) errors.categoria_id = ['O campo categoria_id é obrigatório.'];

    if (Object.keys(errors).length > 0) {
      throw validationError(errors);
    }

    // Verificar se o email já existe
    const existingAccount = await ContaGlobal.findOne({ where: { email } });
    if (existingAccount) {
      throw conflictError('Este email já está registado.');
    }

    // Criar o registo do Artista primeiro
    const novoArtista = await Artista.create({
      numero_licenca,
      validade_licenca,
      categoria_id
    });

    // Cifrar a password e criar a ContaGlobal ligada ao Artista
    const hashedPassword = await hashPassword(password);
    const novaConta = await ContaGlobal.create({
      email,
      password: hashedPassword,
      tipo: 'artista',
      data_registo: new Date(),
      nome_utilizador,
      numero_telemovel,
      id_artista: novoArtista.id_artista
    });

    return res.status(201).json({
      message: 'Artista criado com sucesso!',
      data: {
        id_conta: novaConta.id_conta,
        nome_utilizador: novaConta.nome_utilizador,
        email: novaConta.email,
        id_artista: novoArtista.id_artista
      }
    });
  } catch (error) {
    next(error);
  }
};

// 2. Mostrar todos os Artistas
export const getAllArtists = async (req, res, next) => {
  try {
    const contas = await ContaGlobal.findAll({
      where: { tipo: 'artista' },
      attributes: { exclude: ['password'] },
      include: [{ model: Artista }]
    });

    return res.status(200).json(contas);
  } catch (error) {
    next(error);
  }
};

// 3. Mostrar info de um Artista específico
export const getArtistById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const conta = await ContaGlobal.findOne({
      where: { id_conta: id, tipo: 'artista' },
      attributes: { exclude: ['password'] },
      include: [{ model: Artista }]
    });

    if (!conta) {
      throw notFoundError('Artista', id);
    }

    return res.status(200).json(conta);
  } catch (error) {
    next(error);
  }
};

// 4. Mudar dados do Artista
export const updateArtist = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { nome_utilizador, numero_telemovel, numero_licenca, validade_licenca, categoria_id } = req.body;

    const conta = await ContaGlobal.findOne({ where: { id_conta: id, tipo: 'artista' } });
    if (!conta || !conta.id_artista) {
      throw notFoundError('Conta de Artista', id);
    }

    const artista = await Artista.findByPk(conta.id_artista);
    if (!artista) {
      throw notFoundError('Perfil de Artista', conta.id_artista);
    }

    // Atualizar ContaGlobal
    await conta.update({
      nome_utilizador: nome_utilizador || conta.nome_utilizador,
      numero_telemovel: numero_telemovel !== undefined ? numero_telemovel : conta.numero_telemovel
    });

    // Atualizar Artista
    await artista.update({
      numero_licenca: numero_licenca || artista.numero_licenca,
      validade_licenca: validade_licenca || artista.validade_licenca,
      categoria_id: categoria_id || artista.categoria_id
    });

    return res.status(200).json({ message: 'Dados de artista atualizados com sucesso!', conta });
  } catch (error) {
    next(error);
  }
};

// 5. Apagar Artista
export const deleteArtist = async (req, res, next) => {
  try {
    const { id } = req.params;
    const conta = await ContaGlobal.findOne({ where: { id_conta: id, tipo: 'artista' } });
    
    if (!conta) {
      throw notFoundError('Artista', id);
    }

    // Destruir Artista primeiro, depois a Conta (ou a BD faz cascade se configurado, mas vamos forçar)
    const idArtista = conta.id_artista;
    await conta.destroy();
    if (idArtista) {
      await Artista.destroy({ where: { id_artista: idArtista } });
    }

    return res.status(200).json({ message: `Artista ${conta.nome_utilizador} removido com sucesso!` });
  } catch (error) {
    next(error);
  }
};
