import nodemailer from 'nodemailer'
import fs from 'fs'
import { config } from 'dotenv'
import getView from '../utils/getView.js'
config()

export default class EmailController {
  static _service = process.env.SERVICE
  static _email = process.env.EMAIL
  static _password = process.env.PASSWORD

  static async Send(to, subject, fileName, params) {
    try {
      let html = fs.readFileSync(getView('/mails/' + fileName), 'utf-8')

      if (params)
        for await (const [key, value] of Object.entries(params)) {
          const regex = new RegExp(`{${key}}`, 'g')

          const count = html.match(regex).length

          for (let i = 0; i < count; i++) html = html.replace(`{${key}}`, value)
        }

      this.CreateTransporter().sendMail({
        to,
        subject: subject,
        html,
      })
    } catch (e) {
      console.error(e)
    }
  }

  static CreateTransporter() {
    if (!this._service || !this._email || !this._password) {
      return console.error(
        `Email küldés sikertelen, Kérlek add meg a(z) ${this._service ? '' : 'SERVICE,'} ${
          this._email ? '' : 'EMAIL,'
        } ${this._password ? '' : 'PASSWORD,'} környezeti változó(kat)`
      )
    }

    return nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: this._email,
        pass: this._password,
      },
    })
  }
}
