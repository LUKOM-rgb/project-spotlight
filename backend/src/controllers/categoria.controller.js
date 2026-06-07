import Categoria from '../Models/categorias.js';
import Artista from '../Models/artista.js';
import Utilizador from '../Models/utilizador.js';
import { validationError, notFoundError, conflictError } from '../utils/error.utils.js';

//Adicionar Categoria
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

//Apagar Categoria
export const deleteCategoria = async (req, res, next) => {
  try {
    const { id } = req.params;

    const categoria = await Categoria.findByPk(id);
    if (!categoria) {
      throw notFoundError('Categoria', id);
    }

    // Não podemos apagar uma categoria que tenha artistas lá dentro, senão a bd explode pela foreign key
    const artistasComEstaCategoria = await Artista.count({ where: { categoria_id: id } });

    if (artistasComEstaCategoria > 0) {
      throw conflictError('Não é possível apagar esta categoria porque ainda tem artistas associados.');
    }

    await categoria.destroy();

    return res.status(200).json({ message: `Categoria ${categoria.nome_categoria} apagada com sucesso!` });
  } catch (error) {
    // Se houver erro de foreign key não detetado acima, é apanhado pelo global error handler
    next(error);
  }
};

//Ver todas as Categorias
export const getAllCategorias = async (req, res, next) => {
  try {
    const categorias = await Categoria.findAll();

    return res.status(200).json({ data: categorias });
  } catch (error) {
    next(error);
  }
};

//Ver os artistas por categoria
export const getArtistasByCategoria = async (req, res, next) => {
  try {
    const { id } = req.params;

    // Verificar se a categoria existe
    const categoria = await Categoria.findByPk(id);
    if (!categoria) {
      throw notFoundError('Categoria', id);
    }

    // Buscar artistas associados à categoria
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

    return res.status(200).json({ data: contas });
  } catch (error) {
    next(error);
  }
};
