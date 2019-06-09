const { findUserByToken } = require('../lib/api')

exports.auth = async (req, res, next) => {
  const token = req.headers.authorization.split(' ')[1]
  if (!token) return res.sendStatus(401)
  res.locals.token = token
  const user = (await findUserByToken(token))[0]
  if (!user) return res.sendStatus(401)
  res.locals.user = user
  next()
}
