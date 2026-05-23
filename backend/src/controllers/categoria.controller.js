import Categoria from '../Models/Categorias.js';
import Artista from '../Models/Artista.js';
import ContaGlobal from '../Models/ContaGlobal.js';
import { validationError } from '../utilis/error.utils.js';

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
        return res.status(400).json({ 
          message: `Já existe uma categoria com o ID ${categoria_id}. Escolhe outro ID ou não envies o campo para ser gerado automaticamente.` 
        });
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

    const categoria = await Categoria.findByPk(id);
    if (!categoria) {
      return res.status(404).json({ message: 'Categoria não encontrada.' });
    }

    await categoria.destroy();

    return res.status(200).json({ message: 'Categoria apagada com sucesso!' });
  } catch (error) {
    // Se houver erro de foreign key, é apanhado pelo global error handler
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

    // Verificar se a categoria existe
    const categoria = await Categoria.findByPk(id);
    if (!categoria) {
      return res.status(404).json({ message: 'Categoria não encontrada.' });
    }

    // Buscar artistas associados à categoria (juntando com ContaGlobal para ter nome, email, etc.)
    const contas = await ContaGlobal.findAll({
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
