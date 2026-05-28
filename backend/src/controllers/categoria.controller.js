import Categoria from '../Models/categorias.js';
import Artista from '../Models/artista.js';
import Utilizador from '../Models/utilizador.js';
import { validationError, notFoundError, conflictError } from '../utilis/error.utils.js';

// 1. Adicionar Categoria
export const createCategoria = async (req, res, next) => {
  try {
    const { categoria_id, nome_categoria } = req.body;

    if (!nome_categoria) {
      throw validationError({ nome_categoria: ['O nome da categoria é obrigatório.'] });
    }

    const payload = { nome_categoria };
    if (categoria_id) {
      // Verificar se já existe alguma categoria com este ID
      const categoriaExistente = await Categoria.findByPk(categoria_id);
      if (categoriaExistente) {
        throw conflictError(`Já existe uma categoria com o ID ${categoria_id}. Escolhe outro ID ou não envies o campo para ser gerado automaticamente.`);
      }
      payload.categoria_id = categoria_id;
    }

    const novaCategoria = await Categoria.create(payload);

    return res.status(201).json({
      message: 'Categoria criada com sucesso!',
      data: novaCategoria
    });
  } catch (error) {
    next(error);
  }
};

// 2. Apagar Categoria
export const deleteCategoria = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (!id) {
      throw validationError({ id: ['O ID da categoria a apagar é obrigatório.'] });
    }

    const categoria = await Categoria.findByPk(id);
    if (!categoria) {
      throw notFoundError('Categoria', id);
    }

    // Verificar se existem artistas associados a esta categoria antes de apagar
    const artistasAssociados = await Artista.count({ where: { categoria_id: id } });
    if (artistasAssociados > 0) {
      throw conflictError('Não podes apagar esta categoria porque ainda tem artistas associados.');
    }

    await categoria.destroy();

    return res.status(200).json({ message: `Categoria ${categoria.nome_categoria} apagada com sucesso!` });
  } catch (error) {
    // Se houver erro de foreign key não detetado acima, é apanhado pelo global error handler
    next(error);
  }
};

// 3. Ver todas as Categorias
export const getAllCategorias = async (req, res, next) => {
  try {
    const categorias = await Categoria.findAll();

    return res.status(200).json(categorias);
  } catch (error) {
    next(error);
  }
};

// 4. Ver os artistas por categoria
export const getArtistasByCategoria = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (!id) {
      throw validationError({ id: ['O ID da categoria é obrigatório.'] });
    }

    // Verificar se a categoria existe
    const categoria = await Categoria.findByPk(id);
    if (!categoria) {
      throw notFoundError('Categoria', id);
    }

    // Buscar artistas associados à categoria (juntando com Utilizador para ter nome, email, etc.)
    const contas = await Utilizador.findAll({
      where: { tipo: 'artista' },
      attributes: { exclude: ['password'] },
      include: [
        {
          model: Artista,
          where: { categoria_id: id } // Filtrar pela categoria selecionada
        }
      ]
    });

    return res.status(200).json({
      categoria: categoria.nome_categoria,
      artistas: contas
    });
  } catch (error) {
    next(error);
  }
};
