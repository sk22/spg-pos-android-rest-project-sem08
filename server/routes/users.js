const { Router } = require('express')

const bcrypt = require('bcrypt')
const hat = require('hat')
const { promisify } = require('util')

const compare = promisify(bcrypt.compare).bind(bcrypt)
const hash = promisify(bcrypt.hash).bind(bcrypt)
const salt = 12

const wrap = require('../lib/wrap-error')

const {
  findAllUsers,
  findUserByUsername,
  updateAuthToken,
  createUser,
  updatePassword,
  findUserEvents,
  findUserEvent,
  updateStatus,
  insertStatus,
  deleteStatus,
  findUserOrganizedEvents
} = require('../lib/api')

const {
  findAllController,
  loginController,
  createController
} = require('../lib/controller')

const { auth } = require('../lib/middleware')

const router = new Router()

const getUserFields = user => ({
  u_id: user.u_id,
  u_username: user.u_username,
  u_token: user.u_token
})


router.get('/', wrap(findAllController(findAllUsers)))

router.post('*', wrap(async (req, res) => {
  const { username, password } = req.body
  const h = await hash(password, salt)
  const user = (await findUserByUsername(username))[0]
  if (user) return res.status(409).send('User does already exist')

  await createUser(username, h, hat())
  const inserted = (await findUserByUsername(username))[0]
  res.send(getUserFields(inserted))
}))

router.patch('/:username', auth, wrap(async (req, res) => {
  const { username } = req.params
  const { newPassword, oldPassword } = req.body
  const { user } = res.locals
  if (user.u_username === username) { // user is authenticated user
    if (newPassword) { // change password
      const same = await compare(oldPassword, user.u_password)
      if (same) {
        const h = await hash(newPassword, salt)
        await updatePassword(username, h)
      } else {
        res.status(403).send('Old password does not match')
      }
    } else { // do not change password
      return res.send(getUserFields(user))
    }
  } else {
    res.sendStatus(403)
  }

  const updated = (await findUserByUsername(username))[0]
  return res.send(getUserFields(updated))
}))

router.get('/:username', wrap(async (req, res) => {
  const { username } = req.params
  const { u_id, u_username } = (await findUserByUsername(username))[0]
  return res.send({ u_id, u_username })
}))

router.patch('/:username/login', wrap(async (req, res) => {
  const { username } = req.params
  const { password } = req.body
  if (!password) return res.status(400).send('Password required')
  const user = (await findUserByUsername(username))[0]
  if (!user) return res.status(404).send('User does not exist')
  const same = await compare(password, user.u_password)
  if (same) {
    await updateAuthToken(username, hat())
    const updated = (await findUserByUsername(username))[0]
    res.send(getUserFields(updated))
  } else {
    res.status(403).send('Invalid password')
  }
}))

router.patch('/:username/logout', auth, wrap(async (req, res) => {
  const { username } = req.params
  const { user } = res.locals

  if (user.u_username === username) {
    await updateAuthToken(username, null)
    const updated = (await findUserByUsername(username))[0]
    res.send(getUserFields(updated))
  } else {
    res.sendStatus(403)
  }
}))

router.get('/:username/events', wrap(findAllController(findUserEvents)))
router.get('/:username/organizes',
  wrap(findAllController(findUserOrganizedEvents)))

router.put('/:username/events/:event', auth, wrap(async (req, res) => {
  const { status } = req.body
  const { username, event } = req.params
  const { user } = res.locals
  if (username !== user.u_username) return res.sendStatus(403)
  if (status === null || status.trim() === '') {
    await deleteStatus(user.u_id, event)
    return res.send()
  }
  try {
    const { affectedRows } = await updateStatus(user.u_id, status, event)
    if (affectedRows === 0) {
      await insertStatus(user.u_id, status, event)
    }
  } catch (err) {
    if (err.code.startsWith('ER_NO_REFERENCED_ROW')) {
      return res.sendStatus(404)
    }
    else if (err.code !== 'WARN_DATA_TRUNCATED') throw err
  }

  const row = (await findUserEvent(user.u_id, event))[0]
  res.send(row)
}))

module.exports = router
