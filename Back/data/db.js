const { Sequelize } = require('sequelize')

const db = new Sequelize('usuarios1', 'root', '', {
  host: 'localhost',
  dialect: 'mysql',
  port: 3306
})

module.exports = db
