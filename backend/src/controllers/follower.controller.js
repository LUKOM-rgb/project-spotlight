import ContaGlobal from '../Models/ContaGlobal.js';
import Artista from '../Models/Artista.js';
import Seguidor from '../Models/Seguidor.js';
import { validationError, notFoundError, conflictError } from '../utilis/error.utils.js';

// 1. Seguir um artista
export const followArtist = async (req, res, next) => {
  try {
    // id_conta = conta de quem segue (Utilizador/Artista)
    // id_artista = conta do Artista que vai ser seguido
    const { id_conta, id_artista } = req.body;

    if (!id_conta || !id_artista) {
      throw validationError({ 
        id_conta: !id_conta ? ['O campo id_conta é obrigatório.'] : undefined,
        id_artista: !id_artista ? ['O campo id_artista é obrigatório.'] : undefined,
      });
    }

    if (String(id_conta) === String(id_artista)) {
      throw conflictError('Um utilizador não pode seguir-se a si próprio.');
    }

    // Verificar se a conta seguidora existe
    const conta = await ContaGlobal.findByPk(id_conta);
    if (!conta) {
      throw notFoundError('Conta de Utilizador (Seguidor)', id_conta);
    }

    // Verificar se o artista alvo existe e obter o seu verdadeiro id_artista
    const contaArtista = await ContaGlobal.findOne({ where: { id_conta: id_artista, tipo: 'artista' } });
    if (!contaArtista || !contaArtista.id_artista) {
      throw notFoundError('Conta de Artista (Alvo)', id_artista);
    }

    // Verificar se já segue
    const jaSegue = await Seguidor.findOne({
      where: { id_conta: id_conta, id_artista: contaArtista.id_artista }
    });
    if (jaSegue) {
      throw conflictError('Já segues este artista.');
    }

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

// 2. Deixar de seguir um artista
export const unfollowArtist = async (req, res, next) => {
  try {
    const { id_conta, id_artista } = req.body;

    if (!id_conta || !id_artista) {
      throw validationError({ 
        id_conta: !id_conta ? ['O campo id_conta é obrigatório.'] : undefined,
        id_artista: !id_artista ? ['O campo id_artista é obrigatório.'] : undefined,
      });
    }

    // Verificar se a conta seguidora existe
    const conta = await ContaGlobal.findByPk(id_conta);
    if (!conta) {
      throw notFoundError('Conta de Utilizador (Seguidor)', id_conta);
    }

    // Verificar se o artista existe e obter o seu verdadeiro id_artista
    const contaArtista = await ContaGlobal.findOne({ where: { id_conta: id_artista, tipo: 'artista' } });
    if (!contaArtista || !contaArtista.id_artista) {
      throw notFoundError('Conta de Artista (Alvo)', id_artista);
    }

    // Verificar a relação de seguidor
    const segue = await Seguidor.findOne({
      where: { id_conta: id_conta, id_artista: contaArtista.id_artista }
    });

    if (!segue) {
      throw conflictError('Não segues este artista.');
    }

    await segue.destroy();

    return res.status(200).json({ message: 'Deixaste de seguir o artista com sucesso!' });
  } catch (error) {
    next(error);
  }
};

// 3. Ver seguidores / quem o utilizador segue
export const getFollowers = async (req, res, next) => {
  try {
    const { id_conta, id_artista } = req.query;

    if (!id_conta && !id_artista) {
      throw validationError({ 
        query: ['É obrigatório enviar ?id_conta= ou ?id_artista= na query da pesquisa.'] 
      });
    }

    if (id_conta && id_artista) {
      throw validationError({ 
        query: ['Por favor, envia apenas um parâmetro: ou ?id_conta= ou ?id_artista=, não ambos.'] 
      });
    }

    // Se indicarmos o ID do Utilizador, mostramos todos os artistas que ele segue
    if (id_conta) {
      // Garantir que a conta existe
      const conta = await ContaGlobal.findByPk(id_conta);
      if (!conta) throw notFoundError('Conta de Utilizador', id_conta);

      // Obter as relações
      const seguindo = await Seguidor.findAll({ where: { id_conta } });
      const idsArtistas = seguindo.map(s => s.id_artista);

      // Obter os dados completos das contas dos artistas seguidos
      const artistasSeguidos = await ContaGlobal.findAll({
        where: { tipo: 'artista', id_artista: idsArtistas },
        attributes: { exclude: ['password'] },
        include: [{ model: Artista }]
      });

      return res.status(200).json({
        utilizador: conta.nome_utilizador,
        artistas_que_segue: artistasSeguidos
      });
    }

    // Se indicarmos o ID do Artista, mostramos todos os seus seguidores
    if (id_artista) {
      // Obter o verdadeiro id_artista da tabela de artistas através da ContaGlobal
      const contaArtista = await ContaGlobal.findOne({ where: { id_conta: id_artista, tipo: 'artista' } });
      if (!contaArtista || !contaArtista.id_artista) throw notFoundError('Conta de Artista', id_artista);

      const seguidoresRelacoes = await Seguidor.findAll({ where: { id_artista: contaArtista.id_artista } });
      const idsContasSeguidoras = seguidoresRelacoes.map(s => s.id_conta);

      // Obter as contas de quem segue o artista
      const seguidores = await ContaGlobal.findAll({
        where: { id_conta: idsContasSeguidoras },
        attributes: { exclude: ['password'] }
      });

      return res.status(200).json({
        artista: contaArtista.nome_utilizador,
        total_seguidores: seguidores.length,
        seguidores: seguidores
      });
    }

  } catch (error) {
    next(error);
  }
};
