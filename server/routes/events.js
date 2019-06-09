const { Router } = require('express')
const wrap = require('../lib/wrap-error')

const {
  findAllEvents,
  findEvent,
  createEvent,
  findEventUsers,
  findUserByToken,
  updateEvent,
  deleteEvent
} = require('../lib/api')

const {
  findController,
  findAllController,
  createController,
  deleteController
} = require('../lib/controller')

const { auth } = require('../lib/middleware')

const router = new Router()

router.get('/', wrap(findAllController(findAllEvents)))
router.get('/:id', wrap(findController(findEvent)))
router.post('*', auth, wrap(async (req, res) => {
  const { title, description, start_date, end_date, all_day, venue, organizer }
    = req.body
  const { user } = res.locals
  const { insertId } = await createEvent({ organizer: user.u_id, ...req.body })
  const event = (await findEvent({ id: insertId }))[0]
  return res.send(event)
}))

router.patch('/:id', auth, wrap(async (req, res) => {
  const { user } = res.locals
  const { id } = req.params
  const { title, description, start_date, end_date, all_day, venue }
    = req.body
  const event = (await findEvent({ id }))[0]
  if (!event) return res.sendStatus(404)

  if (event.e_u_organizer && user.u_id !== event.e_u_organizer) {
    // organizer is set and does not match user
    return res.sendStatus(403)
  }
  updateEvent({ id, ...req.body })
  const updated = (await findEvent({ id }))[0]
  return res.send(updated)
}))

router.delete('/:id', auth, wrap(async (req, res) => {
  const { user } = res.locals
  const event = (await findEvent(req.params))[0]
  if (!event) return res.sendStatus(404)
  if (event.e_u_organizer && user.u_id !== event.e_u_organizer) {
    return res.sendStatus(403)
  }
  await deleteEvent(req.params)
  res.send()
}))

router.get('/:event/users', wrap(findAllController(findEventUsers)))

module.exports = router
