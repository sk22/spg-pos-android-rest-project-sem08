exports.findAllController = find => async (req, res, next) => {
  res.send(await find(req.params))
}

exports.findController = find => async (req, res) => {
  const row = (await find(req.params))[0]
  if (!row) return res.sendStatus(404)
  res.send(row)
}

exports.createController = create => async (req, res) => {
  res.send(await create({ ...req.body, ...req.params }))
}

exports.deleteController = del => async (req, res) => {
  await del(req.params)
  res.send()
}
