import { request, response } from 'express'

export default guest

/**
 *
 * @param {request} req
 * @param {response} res
 * @param {*} next
 */
function guest(req, res, next) {
  if (req.session.user) return res.status(403).send({ success: false })

  next()
}
