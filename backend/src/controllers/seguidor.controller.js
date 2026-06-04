import Utilizador from '../Models/utilizador.js';
import Artista from '../Models/artista.js';
import Seguidor from '../Models/seguidor.js';
import { validationError, notFoundError, conflictError, unauthorizedError } from '../utils/error.utils.js';

// 1. Seguir um artista
export const seguirArtista = async (req, res, next) => {
  try {
    // id_utilizador = conta de quem segue (Utilizador/Artista)
    // id_artista = conta do Artista que vai ser seguido
    const { id_utilizador, id_artista } = req.body;

    if (!id_utilizador || !id_artista) {
      throw validationError({ 
        id_utilizador: !id_utilizador ? ['O campo id_utilizador é obrigatório.'] : undefined,
        id_artista: !id_artista ? ['O campo id_artista é obrigatório.'] : undefined,
      });
    }

    // Verificar se o id_utilizador enviado no body corresponde ao utilizador logado no Token
    if (String(id_utilizador) !== String(req.utilizador.sub)) {
      throw unauthorizedError('Não podes seguir artistas em nome de outro utilizador. O id_utilizador tem de corresponder à tua conta atual.');
    }

    if (String(id_utilizador) === String(id_artista)) {
      throw conflictError('Um utilizador não pode seguir-se a si próprio.');
    }

    // Verificar se a conta seguidora existe
    const conta = await Utilizador.findByPk(id_utilizador);
    if (!conta) {
      throw notFoundError('Conta de Utilizador (Seguidor)', id_utilizador);
    }

    // Verificar se o artista alvo existe na tabela Artista
    const artista = await Artista.findByPk(id_artista);
    if (!artista) {
      throw notFoundError('Artista', id_artista);
    }

    // Verificar se já segue
    const jaSegue = await Seguidor.findOne({
      where: { id_utilizador: id_utilizador, id_artista: id_artista }
    });
    if (jaSegue) {
      throw conflictError('Já segues este artista.');
    }

    await Seguidor.create({
      id_utilizador: id_utilizador,
      id_artista: id_artista,
      data_inicio: new Date()
    });

    return res.status(201).json({ message: 'Passaste a seguir o artista com sucesso!' });
  } catch (error) {
    next(error);
  }
};

// 2. Deixar de seguir um artista
export const deixarSeguirArtista = async (req, res, next) => {
  try {
    const { id_utilizador, id_artista } = req.body;

    if (!id_utilizador || !id_artista) {
      throw validationError({ 
        id_utilizador: !id_utilizador ? ['O campo id_utilizador é obrigatório.'] : undefined,
        id_artista: !id_artista ? ['O campo id_artista é obrigatório.'] : undefined,
      });
    }

    // Verificar se o id_utilizador corresponde ao utilizador logado no Token
    if (String(id_utilizador) !== String(req.utilizador.sub)) {
      throw unauthorizedError('Não podes deixar de seguir artistas em nome de outro utilizador. O id_utilizador tem de corresponder à tua conta atual.');
    }

    // Verificar se a conta seguidora existe
    const conta = await Utilizador.findByPk(id_utilizador);
    if (!conta) {
      throw notFoundError('Conta de Utilizador (Seguidor)', id_utilizador);
    }

    // Verificar se o artista alvo existe na tabela Artista
    const artista = await Artista.findByPk(id_artista);
    if (!artista) {
      throw notFoundError('Artista', id_artista);
    }

    // Verificar a relação de seguidor
    const segue = await Seguidor.findOne({
      where: { id_utilizador: id_utilizador, id_artista: id_artista }
    });

    if (!segue) {
      throw conflictError('Não segues este artista.');
    }

    await segue.destroy();

    // Obter o nome do utilizador do artista apenas para a mensagem de sucesso
    const contaArtista = await Utilizador.findOne({ where: { id_artista: id_artista } });

    return res.status(200).json({ message: `Deixaste de seguir o artista ${contaArtista ? contaArtista.nome_utilizador : ''} com sucesso!`.trim() });
  } catch (error) {
    next(error);
  }
};

// 3. Ver seguidores / quem o utilizador segue
export const getSeguidores = async (req, res, next) => {
  try {
    const { id_utilizador, id_artista } = req.query;

    if (!id_utilizador && !id_artista) {
      throw validationError({ 
        query: ['É obrigatório enviar ?id_utilizador= ou ?id_artista= na query da pesquisa.'] 
      });
    }

    if (id_utilizador && id_artista) {
      throw validationError({ 
        query: ['Por favor, envia apenas um parâmetro: ou ?id_utilizador= ou ?id_artista=, não ambos.'] 
      });
    }

    // Se indicarmos o ID do Utilizador, mostramos todos os artistas que ele segue
    if (id_utilizador) {
      // Garantir que a conta existe
      const conta = await Utilizador.findByPk(id_utilizador);
      if (!conta) throw notFoundError('Conta de Utilizador', id_utilizador);

      // Obter as relações
      const seguindo = await Seguidor.findAll({ where: { id_utilizador } });
      const idsArtistas = seguindo.map(s => s.id_artista);

      // Obter os dados completos das contas dos artistas seguidos
      const artistasSeguidos = await Utilizador.findAll({
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
      // Procurar diretamente o artista na tabela de Artistas
      const artista = await Artista.findByPk(id_artista);
      if (!artista) throw notFoundError('Artista', id_artista);

      const seguidoresRelacoes = await Seguidor.findAll({ where: { id_artista } });
      const idsContasSeguidoras = seguidoresRelacoes.map(s => s.id_utilizador);

      // Obter as contas de quem segue o artista
      const seguidores = await Utilizador.findAll({
        where: { id_utilizador: idsContasSeguidoras },
        attributes: { exclude: ['password'] }
      });

      return res.status(200).json({
        total_seguidores: seguidores.length,
        seguidores: seguidores
      });
    }

  } catch (error) {
    next(error);
  }
};
