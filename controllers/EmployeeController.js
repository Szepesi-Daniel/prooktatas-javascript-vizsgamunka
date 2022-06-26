import mongoose from 'mongoose'
import config from '../config.js'
import UserModel from '../db/models/User.js'

export default class Hairdressers {
  static async GetHairdressers(req, res) {
    let { index } = req.params

    if (!index) index = 0

    if (isNaN(index)) return res.status(404).send({ error: 'NotFound' })

    const fields = {
      full_name: true,
      employee: {
        profile_picture: true,
        description: true,
        appointments: true,
      },
    }

    const employees = await UserModel.find(
      { employee: { $ne: null } },
      fields,
      { skip: index * 10, limit: 10 }
    )

    res.send(employees)
  }

  static async GetHairdresser(req, res) {
    let { id, date } = req.params

    if (!mongoose.isValidObjectId(id))
      return res.send({ success: false, error: 'Érvénytelen ID' })

    let d = new Date(date)

    if (isNaN(d)) d = new Date()

    const fields = {
      full_name: true,
      employee: {
        appointments: true,
        freedoms: true,
        profile_picture: true,
      },
    }

    const user = await UserModel.findOne(
      { _id: id, employee: { $ne: null } },
      fields
    )

    if (!user) return res.send({ success: false, error: 'Érvénytelen ID' })

    const response = {
      success: true,
      freeDates: [],
      date: d.getTime(),
      employee: {
        profile_picture: user.employee.profile_picture,
        full_name: user.full_name,
      },
    }

    const freedom = user.employee.freedoms.some((e) => {
      const fromDate = new Date(e.from),
        toDate = new Date(e.to)

      if (d.getTime() > fromDate.getTime() && d.getTime() < toDate.getTime()) {
        return true
      }
    })

    if (freedom) return res.send(response)

    const day = config.workingTime[d.getDay()]

    if (!day.from) return res.send(response)

    const fromDate = new Date()
    const toDate = new Date()
    const fromArray = day.from.split(':')
    const toArray = day.to.split(':')

    const from = { h: fromArray[0], m: fromArray[1] }
    const to = { h: toArray[0], m: toArray[1] }

    fromDate.setFullYear(d.getFullYear(), d.getMonth(), d.getDate())
    toDate.setFullYear(d.getFullYear(), d.getMonth(), d.getDate())
    fromDate.setHours(from.h, from.m, d.getSeconds(), d.getMilliseconds())
    toDate.setHours(to.h, to.m, d.getSeconds(), d.getMilliseconds())

    const fromMs = fromDate.getTime()
    const toMs = toDate.getTime()

    for (let i = fromMs; i < toMs; i += 1800000) {
      const busyDate = user.employee.appointments.some((e) => {
        const appointDate = new Date(e.date)
        if (fromDate.getTime() < Date.now()) return true
        if (appointDate.getTime() === fromDate.getTime()) return true
      })

      if (!busyDate) {
        response.freeDates.push(
          (fromDate.getHours() < 10
            ? '0' + fromDate.getHours()
            : fromDate.getHours()) +
            ':' +
            (fromDate.getMinutes() < 10
              ? '0' + fromDate.getMinutes()
              : fromDate.getMinutes())
        )
      }

      fromDate.setTime(fromDate.getTime() + 1800000)
    }

    res.send(response)
  }

  static async AddFreedom(req, res) {
    const { employee_id, from, to } = req.body

    if (!mongoose.isValidObjectId(employee_id))
      return res.send({ success: false, error: 'Érvénytelen azonosító' })

    const fromDate = new Date(from)
    const toDate = new Date(to)

    fromDate.setHours(0, 0, 0, 0)
    toDate.setHours(0, 0, 0, 0)

    if (isNaN(fromDate) || isNaN(toDate))
      return res.send({
        success: false,
        errors: {
          from: isNaN(fromDate) ? 'Érvénytelen dátum' : undefined,
          to: isNaN(toDate) ? 'Érvénytelen dátum' : undefined,
        },
      })

    if (
      fromDate.getTime() < Date.now() ||
      toDate.getTime() < fromDate.getTime()
    )
      return res.send({ success: false, errors: 'Érvénytelen dátum(ok)' })

    const user = await UserModel.findOne({
      _id: employee_id,
      employee: { $ne: null },
    })

    if (!user)
      return res.send({ success: false, errors: 'Érvénytelen azonosító' })

    const freedom = {
      from: fromDate,
      to: toDate,
    }

    user.employee.freedoms.push(freedom)

    user.save()

    res.send({
      success: true,
      message: `${
        user.full_name
      }-nek sikeresen szabadnapot írtál ${fromDate.toLocaleDateString()}-től ${toDate.toLocaleDateString()}-ig`,
    })
  }
}
