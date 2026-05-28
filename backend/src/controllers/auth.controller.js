import Utilizador from '../Models/utilizador.js'
import { hashPassword, comparePassword, generateToken } from '../utils/auth.utils.js'
import { validationError, unauthorizedError, conflictError } from '../utils/error.utils.js'

// Registar Conta
export const register = async (req, res, next) => {
  try {
    const { email, password, nome_utilizador, numero_telemovel } = req.body

    // campos obrigatórios
    const errors = {}
    if (!email) errors.email = ['O campo email é obrigatório.']
    if (!password || password.length < 6)
      errors.password = ['A password deve ter pelo menos 6 caracteres.']
    if (!nome_utilizador) errors.nome_utilizador = ['O campo nome_utilizador é obrigatório.']

    if (Object.keys(errors).length > 0) {
      throw validationError(errors)
    }

    // 2. Verificar se o email ou username já existem
    const existingAccount = await Utilizador.findOne({ where: { email } })
    if (existingAccount) {
      throw conflictError('Este email já está registado.')
    }

    // 3. Cifrar password e criar Conta Global
    const hashedPassword = await hashPassword(password)
    const novaConta = await Utilizador.create({
      email,
      password: hashedPassword,
      tipo: 'utilizador', // Corrigido de tipo_utilizador para tipo
      data_registo: new Date(),
      nome_utilizador,
      numero_telemovel
    })

    // 4. Criar o perfil específico na tabela Utilizador
    const novoUtilizador = await Utilizador.create({
      id_utilizador: novaConta.id_utilizador // Corrigido de id_user para id_utilizador
    })

    // 5. Responder com 201 Created (Sucesso no Postman)
    return res.status(201).json({
      message: 'Utilizador registado com sucesso!',
      data: {
        id_utilizador: novaConta.id_utilizador,
        nome_utilizador: novaConta.nome_utilizador,
        email: novaConta.email
      },
    })
  } catch (error) {
    next(error) // Encaminha para o teu middleware global de erros
  }
}

// tentativa do POST /users/login - Autenticar Utilizador
export const login = async (req, res, next) => {
  try {
    const { email, password } = req.body

    if (!email || !password) {
      throw validationError({ credentials: ['Email e password são obrigatórios.'] })
    }

    // 1. Procurar a conta pelo email
    const conta = await Utilizador.findOne({ where: { email } })
    if (!conta) {
      throw unauthorizedError('Credenciais de acesso inválidas.')
    }

    // 2. Verificar a password
    const isPasswordValid = await comparePassword(password, conta.password)
    if (!isPasswordValid) {
      throw unauthorizedError('Credenciais de acesso inválidas.')
    }

    // 3. Gerar o Token JWT
    const token = generateToken(conta)

    // 4. Responder com 200 OK e o Token
    return res.status(200).json({
      message: 'Login efetuado com sucesso!',
      token: token,
      token_type: 'Bearer',
    })
  } catch (error) {
    next(error)
  }
}
