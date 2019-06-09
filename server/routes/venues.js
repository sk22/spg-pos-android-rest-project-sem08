const { Router } = require('express')
const wrap = require('../lib/wrap-error')

const {
  findAllVenues,
  findVenue,
  createVenue,
  findUserByToken,
  findVenueEvents
} = require('../lib/api')

const  {
  findController,
  findAllController
} = require('../lib/controller')

const { auth } = require('../lib/middleware')

const router = new Router()

router.get('/', wrap(findAllController(findAllVenues)))
router.get('/:id', wrap(findController(findVenue)))
router.post('*', auth, wrap(async (req, res) => {
  const { name, address } = req.body
  const { insertId } = await createVenue(name, address)
  const venue = (await findVenue({ id: insertId }))[0]
  return res.send(venue)
}))

router.get('/:venue/events', wrap(findAllController(findVenueEvents)))


module.exports = router
