const db = require('../data/db')
const bcrypt = require('bcrypt')
const { SALT_ROUNDS } = require('../config/config.js')
const { DataTypes, Op } = require('sequelize')

const userModel = db.define('new_table', {
  username: { type: DataTypes.STRING },
  password: { type: DataTypes.STRING },
  urlImagen: { type: DataTypes.STRING }
}, {
  freezeTableName: true // Evita la pluralización automática
})

class UserRepository {
  static async create ({ username, password, urlImagen }) {
    // 1. validaciones de username (opcional: usar zod)
    Validation.username(username)
    Validation.password(password)
    Validation.urlImagen(urlImagen)

    // Asegurarse de que el username no existe
    const existingUser = await userModel.findOne({
      where: { username }
    })
    if (existingUser) throw new Error('Username already exists')

    const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS)

    userModel.create({
      username,
      password: hashedPassword,
      urlImagen
    })
  }

  static async login ({ username, password }) {
    Validation.username(username)
    Validation.password(password)

    const user = await userModel.findOne({ where: { username } })
    if (!user) throw new Error('username does not exist')

    const isValid = await bcrypt.compareSync(password, user.password)
    if (!isValid) throw new Error('password is invalid')

    const { password: _, ...publicUser } = user

    return publicUser
  }

  static async update ({ id, username }) {
    // Buscar el usuario por ID
    const userToUpdate = await userModel.findByPk(id)

    if (!userToUpdate) {
      throw new Error('User not found')
    }

    // Verificar si el nombre ya existe en otro usuario
    const existingUser = await userModel.findOne({
      where: {
        username,
        id: { [Op.not]: id } // Excluir el usuario actual
      }
    })

    if (existingUser) {
      throw new Error('Username already exists')
    }

    // Actualizar el nombre del usuario
    await userToUpdate.update({ username })
  }
}

class Validation {
  static username (username) {
    if (typeof username !== 'string') throw new Error('username must be a string')
    if (username.length < 3) throw new Error('username must be at least 3 characters long')
  }

  static password (password) {
    if (typeof password !== 'string') throw new Error('password must be a string')
    if (password.length < 6) throw new Error('password must be at least 6 characters long')
  }

  static urlImagen (urlImagen) {
    if (typeof urlImagen !== 'string') throw new Error('urlImagen must be a string')
    if (urlImagen.length < 6) throw new Error('urlImagen must be at least 6 characters long')
  }
}

module.exports = { UserRepository, Validation, userModel }
