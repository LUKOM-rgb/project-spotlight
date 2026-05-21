import Artista from '../Models/Artista.js';
import ContaGlobal from '../Models/ContaGlobal.js';
import Seguidor from '../Models/Seguidor.js';
import { hashPassword } from '../utilis/auth.utils.js';
import { validationError } from '../utilis/error.utils.js';

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
      throw validationError({ email: ['Este email já está registado.'] });
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
      return res.status(404).json({ message: 'Artista não encontrado.' });
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
      return res.status(404).json({ message: 'Artista não encontrado.' });
    }

    const artista = await Artista.findByPk(conta.id_artista);
    if (!artista) {
      return res.status(404).json({ message: 'Perfil de artista não encontrado.' });
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
    
    if (!conta) return res.status(404).json({ message: 'Artista não encontrado.' });

    // Destruir Artista primeiro, depois a Conta (ou a BD faz cascade se configurado, mas vamos forçar)
    const idArtista = conta.id_artista;
    await conta.destroy();
    if (idArtista) {
      await Artista.destroy({ where: { id_artista: idArtista } });
    }

    return res.status(200).json({ message: 'Artista removido com sucesso!' });
  } catch (error) {
    next(error);
  }
};

// 6. Seguir um artista
export const followArtist = async (req, res, next) => {
  try {
    const { artistId } = req.params; // ID do Artista (ContaGlobal do Artista)
    const { id_conta } = req.body;   // ID da Conta que vai seguir o artista (Idealmente viria do token de Auth)

    if (!id_conta) return res.status(400).json({ message: 'id_conta é obrigatório no corpo do pedido.' });

    const conta = await ContaGlobal.findByPk(id_conta);
    if (!conta) return res.status(404).json({ message: 'Conta de utilizador não encontrada.' });

    const contaArtista = await ContaGlobal.findOne({ where: { id_conta: artistId, tipo: 'artista' } });
    if (!contaArtista || !contaArtista.id_artista) return res.status(404).json({ message: 'Artista não encontrado.' });

    const jaSegue = await Seguidor.findOne({
      where: { id_conta: id_conta, id_artista: contaArtista.id_artista }
    });
    if (jaSegue) return res.status(400).json({ message: 'Já segues este artista.' });

    await Seguidor.create({
      id_conta: id_conta,
      id_artista: contaArtista.id_artista,
      data_inicio: new Date()
    });

    return res.status(201).json({ message: 'Passaste a seguir o artista com sucesso!' });
  } catch (error) {
    next(error);
  }
};

// 7. Deixar de seguir um artista
export const unfollowArtist = async (req, res, next) => {
  try {
    const { artistId } = req.params;
    const { id_conta } = req.body;

    if (!id_conta) return res.status(400).json({ message: 'id_conta é obrigatório no corpo do pedido.' });

    const contaArtista = await ContaGlobal.findOne({ where: { id_conta: artistId, tipo: 'artista' } });
    if (!contaArtista || !contaArtista.id_artista) return res.status(404).json({ message: 'Artista não encontrado.' });

    const segue = await Seguidor.findOne({
      where: { id_conta: id_conta, id_artista: contaArtista.id_artista }
    });

    if (!segue) return res.status(400).json({ message: 'Não segues este artista.' });

    await segue.destroy();

    return res.status(200).json({ message: 'Deixaste de seguir o artista com sucesso!' });
  } catch (error) {
    next(error);
  }
};
