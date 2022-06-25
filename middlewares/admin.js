import { response, request } from 'express'
import UserModel from '../db/models/User.js'

export default admin

/**
 *
 * @param {request} req
 * @param {response} res
 * @param {Function} next
 */
async function admin(req, res, next) {
  if (!req.session.user)
    return res.status(403).send({
      success: false,
    })

  const user = await UserModel.findById(req.session.user.user_id)

  if (!user || user.admin === 0)
    return res.status(403).send({
      success: false,
    })

  next()
}
