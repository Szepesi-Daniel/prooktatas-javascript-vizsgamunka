import { response, request } from 'express'

export default auth

/**
 *
 * @param {request} req
 * @param {response} res
 * @param {*} next
 */
function auth(req, res, next) {
  if (!req.session.user) return res.status(403).send({ success: false })

  next()
}
