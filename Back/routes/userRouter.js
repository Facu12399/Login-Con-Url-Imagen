const express = require('express')

// controladores
const { register, login, logout, accessToken, access, protect, getUsers, getUser, updateUser, deleteUser } = require('../controllers/userControllers')

// configuracion de rutas express // metodos de HTTP
const router = express.Router()

router.post('/register', register)
router.post('/login', login)
router.post('/logout', logout)
router.get(accessToken)
router.get('/', access)
router.get('/protected', protect)
router.get('/usuarios', getUsers)
router.get('/usuarios/:id', getUser)
router.put('/usuarios/:id', updateUser)
router.delete('/usuarios/:id', deleteUser)
module.exports = router
