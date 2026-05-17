// backend/src/Controllers/auth.controller.js
import { ContaGlobal } from '../Models/ContaGlobal.js'
import { Utilizador } from '../Models/Utilizador.js'
import { hashPassword, comparePassword, generateToken } from '../utils/auth.utils.js'
import { validationError, unauthorizedError } from '../utils/error.utils.js'

// POST /users - Registar Conta
export const register = async (req, res, next) => {
  try {
    const { email, password, nome, username, data_nascimento, telemovel } = req.body

    // 1. Validações básicas de campos obrigatórios
    const errors = {}
    if (!email) errors.email = ['O campo email é obrigatório.']
    if (!password || password.length < 6)
      errors.password = ['A password deve ter pelo menos 6 caracteres.']
    if (!nome) errors.nome = ['O campo nome é obrigatório.']
    if (!username) errors.username = ['O campo username é obrigatório.']

    if (Object.keys(errors).length > 0) {
      throw validationError(errors)
    }

    // 2. Verificar se o email ou username já existem
    const existingAccount = await ContaGlobal.findOne({ where: { email } })
    if (existingAccount) {
      throw validationError({ email: ['Este email já está registado.'] })
    }

    // 3. Cifrar password e criar Conta Global
    const hashedPassword = await hashPassword(password)
    const novaConta = await ContaGlobal.create({
      email,
      password: hashedPassword,
      tipo_utilizador: 'utilizador', // Padrão inicial
    })

    // 4. Criar o perfil específico na tabela Utilizador
    const novoUtilizador = await Utilizador.create({
      id_user: novaConta.id_conta, // Chave estrangeira ligada à ContaGlobal
      nome,
      username,
      data_nascimento,
      telemovel,
    })

    // 5. Responder com 201 Created (Sucesso no Postman)
    return res.status(201).json({
      message: 'Utilizador registado com sucesso!',
      data: {
        id_user: novoUtilizador.id_user,
        nome: novoUtilizador.nome,
        username: novoUtilizador.username,
        email: novaConta.email,
      },
    })
  } catch (error) {
    next(error) // Encaminha para o teu middleware global de erros
  }
}

// POST /users/login - Autenticar Utilizador
export const login = async (req, res, next) => {
  try {
    const { email, password } = req.body

    if (!email || !password) {
      throw validationError({ credentials: ['Email e password são obrigatórios.'] })
    }

    // 1. Procurar a conta pelo email
    const conta = await ContaGlobal.findOne({ where: { email } })
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
