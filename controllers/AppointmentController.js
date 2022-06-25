import mongoose from 'mongoose'
import config from '../config.js'
import UserModel from '../db/models/User.js'

export default class AppointmentController {
  static async Create(req, res) {
    // Alkalmazott azonosító, felhasználó azonosító és a időpont
    const { employee_id, user_id, date } = req.body

    // ID validálása
    const [employee_id_valid, user_id_valid] = [
      mongoose.isValidObjectId(employee_id),
      mongoose.isValidObjectId(user_id),
    ]

    // Ha hibás az ID akkor hiba üzenet elküldése
    if (!employee_id_valid || !user_id_valid)
      return res.status(400).send({
        success: false,
        errors: {
          user_id: user_id_valid ? undefined : 'Érvénytelen user_id',
          employee_id: employee_id_valid
            ? undefined
            : 'Érvénytelen employee_id',
        },
      })

    // Alkalmazott lekérdezése
    const employee = await UserModel.findOne({
      _id: employee_id,
      employee: { $ne: null },
    })

    // Felhasználó lekérdezése
    const user = await UserModel.findById(user_id)

    // Ha a felhasználó vagy az alkalmazott nem létezik, hiba kiküldése a kliensnek
    if (!user || !employee) {
      return res.status(400).send({
        success: false,
        errors: {
          user: user ? undefined : 'Érvénytelen ID',
          hairdresser: hairdresser ? undefined : 'Érvénytelen ID',
        },
      })
    }

    // Dátum objektum létrehozása
    const d = new Date(date)

    // Dátum objektum valdálása
    if (isNaN(d))
      return res
        .status(400)
        .send({ success: false, errors: { date: 'Érvénytelen dátum' } })

    // Ha a foglalás múltbéli időpontra érkezik
    if (d.getTime() < Date.now())
      return res.status(400).send({
        success: false,
        error: 'Kérjük válaszon másik időpontot',
      })

    // Ha az időpont perce nem egyenlő 0 val || 30 al
    if (d.getMinutes() !== 0 && d.getMinutes() !== 30)
      return res
        .status(400)
        .send({ success: false, error: 'Kérjük válaszon másik időpontot' })

    // Dátum ellenőrzése, hogy ünnepre esik-e
    for (const holiday of config.holidays) {
      const holidayDate = new Date(holiday)

      if (
        d.getFullYear() === holidayDate.getFullYear() &&
        d.getMonth() === holidayDate.getMonth() &&
        d.getDate() === holidayDate.getDate()
      )
        return res.send({ success: false, error: 'Kérlek válasz másik napot' })
    }

    // Aznapi munkaidő kiolvasása a config.js ből
    const day = config.workingTime[d.getDay()]

    // Ha aznap nem dolgoznak
    if (!day.from)
      return res.send({ success: false, error: 'Kérjük válaszon másik napot' })

    // Munkaidő kezdete
    const startOfWork = {
      h: Number(day.from.split(':')[0]),
      m: Number(day.from.split(':')[1]),
    }

    // Munkaidő vége
    const endOfWork = {
      h: Number(day.to.split(':')[0]),
      m: Number(day.to.split(':')[1]),
    }

    /*     if (d.getHours() > to.h || d.getHours() < from.h)
      return res.send({
        success: false,
        error: 'Kérlek válasz másik időpontot! ',
      }) */

    // Az időpont ellenőrzése, hogy munkaidőre essen
    if (
      (d.getHours() === endOfWork.h && d.getMinutes() > endOfWork.m) ||
      (d.getHours() === startOfWork.h && d.getMinutes() < startOfWork.m)
    )
      return res.status(400).send({
        success: false,
        error: 'Kérlek válasz másik időpontot! ',
      })

    // Az alkalmazott ellenőrzése, hogy aznap szabadságon van-e
    const isFreedom = employee.employee.freedoms.some((e) => {
      if (e.from.getTime() <= d.getTime() && e.to.getTime() >= d.getTime())
        return true

      return false
    })

    if (isFreedom)
      return res.status(400).send({
        success: false,
        error:
          'A megadot dátum a fodrásznak nem megfelelő, kérjük válaszon másikat',
      })

    const appointment = {
      user_id: user_id,
      date: d,
    }

    // Leellenőrzi, hogy az időpont foglalt-e
    const exits = employee.employee.appointments.some(
      (e) => e.date.getTime() === d.getTime()
    )

    // Ha foglalt hiba kezelése
    if (exits)
      return res.status(400).send({
        success: false,
        error: 'A dátum foglalt, kérjük válaszon másikat',
      })

    // Ha szabad időpont mentése
    employee.employee.appointments.push(appointment)

    employee.save()

    /*     if (Number(exits)) {
      return false
    } */

    res.send({
      success: true,
    })
  }

  static async GetByDate(req, res) {
    const date = new Date(req.params.date)
    const dayAfterDate = new Date(date)

    dayAfterDate.setDate(date.getDate() + 1)

    if (isNaN(date)) {
      res.status(400).send({ success: false })
    }

    try {
      const employees = await UserModel.aggregate([
        {
          $match: {
            employee: { $ne: null },
          },
        },
        {
          $project: {
            'employee.profile_picture': true,
            full_name: true,
            'employee.appointments': {
              $filter: {
                input: '$employee.appointments',
                as: 'appointment',
                cond: {
                  $and: [
                    { $gt: ['$$appointment.date', date] },
                    { $lt: ['$$appointment.date', dayAfterDate] },
                  ],
                },
              },
            },
          },
        },
        { $unwind: '$employee.appointments' },
        { $sort: { 'employee.appointments.date': 1 } },
        {
          $group: {
            _id: '$_id',
            appointments: { $push: '$employee.appointments' },
            name: { $first: '$full_name' },
            img: { $first: '$employee.profile_picture' },
          },
        },
      ])
      const result = []

      for await (const employee of employees) {
        const data = []

        for await (const appointment of employee.appointments) {
          const fields = {
            full_name: true,
            tel: true,
            email: true,
          }

          const user = await UserModel.findById(appointment.user_id, fields)
          appointment.user = user
          appointment.user_id = undefined
          data.push(appointment)
        }

        employee.appointments = data
        result.push(employee)
      }

      res.send(result)
    } catch (err) {
      console.log(err)
    }
  }

  static async Delete(req, res) {
    const { employee_id, date } = req.body

    const d = new Date(date)

    const employee = await UserModel.findOne({
      _id: employee_id,
      employee: { $ne: null },
    })

    if (!employee) return res.status(400).send({ success: false })

    const appointments = employee.employee.appointments

    const index = appointments.findIndex(
      (e) => e.date.getTime() === d.getTime()
    )

    if (index === -1) return res.send({ success: false })

    appointments.splice(index, 1)

    employee.employee.appointments = appointments

    employee.save()

    res.send({ success: true })
  }
}
