const { UserRepository, userModel } = require('../model/userModel')
const jwt = require('jsonwebtoken')
const { SECRET_JWT_KEY } = require('../config/config')
// const user = require('../model/userModel')

// Registrar usuario
const register = async (req, res) => {
  const { username, password, urlImagen } = req.body
  // console.log({ username, password, urlImagen })

  try {
    await UserRepository.create({ username, password, urlImagen })
    res.json('Usuario registrado correctamente')
  } catch (error) {
    // normalmente no es buena idea mandar el error del repositorio
    res.status(400).send(error.message)
  }
}

// Iniciar sesion
const login = async (req, res) => {
  const { username, password } = req.body

  try {
    const user = await UserRepository.login({ username, password })
    const token = jwt.sign(
      { id: user.id, username: user.username },
      SECRET_JWT_KEY,
      {
        expiresIn: '1h'
      })
    res
      .cookie('access_token', token, {
        httpOnly: true, // la cookie solo se puede acceder en el servidor
        secure: process.env.NODE_ENV === 'production', // la cookie solo se puede acceder en https
        sameSite: 'strict', // la cookie solo se puede acceder en el mismo dominio
        maxAge: 1000 * 60 * 60 // la cookie tiene un tiempo de validez de 1 hora
      })
      .send({ user, token })
  } catch (error) {
    res.status(401).send(error.message)
  }
}

// Cerrar sesion
const logout = async (req, res) => {
  res
    .clearCookie('access_token')
    .json({ message: 'Logout successful' })
}

// Acceso con token
const accessToken = async (req, res, next) => {
  const token = req.cookies.access_token
  req.session = { user: null }

  try {
    const data = jwt.verify(token, SECRET_JWT_KEY)
    req.session.user = data
  } catch {}

  next() // seguir a la siguiente ruta o middleware
}

// Acceso a la ruta
const access = async (req, res) => {
  const { user } = req.session
  res.render('index', user)
}

// Ir a la ruta protegida
const protect = async (req, res) => {
  const { user } = req.session
  if (!user) return res.status(403).send('Access not authorized')
  res.render('protected', user) // { _id, username}
}

// Traer los posteos
const getUsers = async (req, res) => {
  try {
    const users = await userModel.findAll()
    res.json(users)
  } catch (error) {
    res.json({ message: error.message })
  }
}

// Traer un usuario
const getUser = async (req, res) => {
  try {
    const user = await userModel.findByPk(req.params.id)
    res.json(user)
  } catch (error) {
    res.json({ message: error.message })
  }
}

// Editar un usuario
const updateUser = async (req, res) => {
  try {
    await UserRepository.update(req.body, {
      where: { id: req.body.id, username: req.body.username }
    })
    res.json('Usuario actualizado correctamente')
  } catch (error) {
    res.json({ message: error.message })
  }
}

// TODO
// Cuando se actualiza el usuario asegurarse de que no tenga el mismo nombre de otro usuario que ya existe

// Borrar un usuario
const deleteUser = async (req, res) => {
  try {
    await userModel.destroy({
      where: { id: req.params.id }
    })
    res.json('Usuario borrado correctamente')
  } catch (error) {
    res.json({ message: error.message })
  }
}

module.exports = { register, login, logout, accessToken, access, protect, getUsers, getUser, updateUser, deleteUser }
