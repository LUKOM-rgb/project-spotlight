// backend/src/utilis/error.utils.js

// Função modelo para construir qualquer objeto de erro na API
function createError({ status, description, errors }) {
  const error = new Error(description)
  error.status = status
  error.errors = errors
  return error
}

// Erro 400 - Falha de Validação (Campos vazios, incorretos, etc.)
export function validationError(errors) {
  return createError({
    status: 400,
    description: 'Validation failed',
    errors,
  })
}

// Erro 401 - Não Autenticado (Credenciais erradas, falta de token, token expirado)
export function unauthorizedError(message = 'Authentication required') {
  return createError({
    status: 401,
    description: message,
    errors: { authentication: ['Acesso negado. Credenciais inválidas ou token em falta.'] },
  })
}

// Erro 403 - Proibido (Token existe mas o utilizador não tem cargo suficiente, ex: tentar aceder a rotas de admin)
export function forbiddenError(message = 'Access denied') {
  return createError({
    status: 403,
    description: message,
    errors: { authorization: ['Não tens permissões administrativas para executar esta ação.'] },
  })
}

// Erro 404 - Recurso Não Encontrado (ID de spot, utilizador ou reserva inexistente na BD)
export function notFoundError(resource, id) {
  return createError({
    status: 404,
    description: 'Resource not found',
    errors: {
      [resource.toLowerCase()]: [`O recurso ${resource} com o ID ${id} não foi encontrado.`],
    },
  })
}
