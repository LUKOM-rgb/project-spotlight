import Utilizador from '../Models/utilizador.js'
import { hashPassword, comparePassword, generateToken } from '../utils/auth.utils.js'
import { Op } from 'sequelize'
import { validationError, unauthorizedError, conflictError } from '../utils/error.utils.js'

// Registar Conta
export const register = async (req, res, next) => {
  try {
    const { email, password, nome_utilizador, numero_telemovel } = req.body
    const errors = {}
    if (!email) errors.email = ['O campo email é obrigatório.']
    if (!password || password.length < 6)
      errors.password = ['A password deve ter pelo menos 6 caracteres.']
    if (!nome_utilizador) errors.nome_utilizador = ['O campo nome_utilizador é obrigatório.']

    // Validar telemóvel
    if (numero_telemovel) {
      const isNineDigits = /^\d{9}$/.test(String(numero_telemovel));
      if (!isNineDigits) {
        errors.numero_telemovel = ['O número de telemóvel tem de conter exatamente 9 dígitos numéricos.'];
      }
    }

    if (Object.keys(errors).length > 0) {
      throw validationError(errors)
    }

    //Verificar se o email, username ou telemóvel já existem
    const queryOr = [
      { email },
      { nome_utilizador }
    ]
    if (numero_telemovel) {
      queryOr.push({ numero_telemovel })
    }

    const existingAccount = await Utilizador.findOne({
      where: {
        [Op.or]: queryOr
      }
    })

    if (existingAccount) {
      // Específico para dps ajudar o frontend a mostrar o erro no campo certo
      if (existingAccount.email === email) {
        throw conflictError('Este email já está registado.')
      }
      if (existingAccount.nome_utilizador === nome_utilizador) {
        throw conflictError('Este nome de utilizador já está em uso.')
      }
      if (numero_telemovel && existingAccount.numero_telemovel === numero_telemovel) {
        throw conflictError('Este número de telemóvel já está associado a outra conta.')
      }
    }

    //Cifrar password e criar Conta Global
    const hashedPassword = await hashPassword(password)
    const novaConta = await Utilizador.create({
      email,
      password: hashedPassword,
      tipo: 'utilizador',
      data_registo: new Date(),
      nome_utilizador,
      numero_telemovel
    })

    //Responder com 201 Created
    return res.status(201).json({
      message: 'Utilizador registado com sucesso!',
      data: {
        id_utilizador: novaConta.id_utilizador,
        nome_utilizador: novaConta.nome_utilizador,
        email: novaConta.email
      },
    })
  } catch (error) {
    next(error)
  }
}

//Tentativa do POST /users/login - Autenticar Utilizador
export const login = async (req, res, next) => {
  try {
    // Verificar se o body tem chaves a mais
    const allowedKeys = ['email', 'nome_utilizador', 'password'];
    const bodyKeys = Object.keys(req.body);
    const hasExtraKeys = bodyKeys.some(key => !allowedKeys.includes(key));

    if (hasExtraKeys) {
      throw validationError({ request: ['No login apenas é permitido enviar os campos email (ou nome_utilizador) e password. Pedido rejeitado.'] })
    }

    const identifier = req.body.email || req.body.nome_utilizador;
    const password = req.body.password;

    if (!identifier || !password) {
      throw validationError({ credentials: ['Email (ou nome_utilizador) e password são obrigatórios.'] })
    }

    //Procurar a conta pelo email ou username
    const conta = await Utilizador.findOne({
      where: {
        [Op.or]: [
          { email: identifier },
          { nome_utilizador: identifier }
        ]
      }
    })
    if (!conta) {
      throw unauthorizedError('Credenciais de acesso inválidas.')
    }

    //Verificar a password
    const isPasswordValid = await comparePassword(password, conta.password)
    if (!isPasswordValid) {
      throw unauthorizedError('Credenciais de acesso inválidas.')
    }

    //Gerar o Token JWT
    const token = generateToken(conta)

    //Responder com 200 OK e o Token
    return res.status(200).json({
      message: 'Login efetuado com sucesso!',
      token: token,
      token_type: 'Bearer',
    })
  } catch (error) {
    next(error)
  }
}
