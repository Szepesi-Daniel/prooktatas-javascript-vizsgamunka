import { response, request } from 'express'
import UserModel from '../db/models/User.js'

export default employee

/**
 *
 * @param {request} req
 * @param {response} res
 * @param {Function} next
 */
async function employee(req, res, next) {
  if (!req.session.user)
    return res.status(403).send({
      success: false,
    })
  const user = await UserModel.findOne({
    _id: req.session.user.id,
    employee: { $ne: null },
  })

  if (!user)
    return res.status(403).send({
      success: false,
    })

  next()
}
