import jwt from 'jsonwebtoken'
import bcrypt from 'bcrypt'

const JWT_SECRET = process.env.JWT_SECRET || 'chave_secreta_super_segura_esmad'

// Cifrar a password antes de guardar na BD
export async function hashPassword(password) {
  const salt = await bcrypt.genSalt(10)
  return bcrypt.hash(password, salt)
}

// Comparar a password inserida com a cifrada na BD
export async function comparePassword(password, hashedPassword) {
  return bcrypt.compare(password, hashedPassword)
}

// Gerar o Token JWT para enviar ao Postman
export function generateToken(user) {
  return jwt.sign(
    {
      sub: user.id_utilizador, // ID único da conta global
      email: user.email,
      role: user.tipo, // 'utilizador' ou 'artista' ou 'admin'
      id_artista: user.id_artista || null, // Se for artista, inclui o id_artista para facilitar consultas futuras
    },
    JWT_SECRET,
    { expiresIn: '1d' }, // Token válido por 1 dia
  )
}
