import mongoose from 'mongoose'
import UserModel from '../db/models/User.js'
import Validator from '../utils/Validator.js'
import bcrypt from 'bcrypt'
import getView from '../utils/getView.js'
import EmailController from './EmailController.js'
export default class AuthController {
  static Register = async (req, res) => {
    const { email, password, name, tel } = req.body

    // Adatok validálása

    const validator = new Validator()

    validator.Validate({
      email: [email, 'required|email'],
      password: [
        password,
        'required|max:32|min:8',
        ['[A-Z]', 'Legalább egy nagybetű megadása kötelező'],
        ['[a-z]', 'Legalább egy kisbetű megadása kötelező'],
        ['[-_.]', 'Legalább egy speciális karakter (_-.) megadása kötelező'],
        ['[0-9]', 'Legalább egy számot tartalmaznia kell'],
        [
          /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[-_.])[A-Za-z\d-_.]{8,}$/,
          'A jelszó csak gyakori írásjeleket tartalmazhat (a-Z 0-9 _-.)',
        ],
      ],
      name: [
        name,
        'required',
        [
          '([A-ZÖÜÓŐÚÁÉÍ][a-zöüóőúáéí]{3,} )([A-ZÖÜÓŐÚÁÉÍ][a-zöüóőúáéí]{3,} )?([A-ZÖÜÓŐÚÁÉÍ][a-zöüóőúáéí]{3,})',
          'Kérljük add meg a teljes neved (Kovács Lajos)',
        ],
      ],
      tel: [
        tel,
        'required',
        [
          /^(30|50|40|70){1}[-]{1}\d{3}[-]{1}\d{4}$/,
          'Rossz formátum (30-353-3322)',
        ],
      ],
    })

    // Hiba esetén, kiküldés a kliensnek
    if (Object.keys(validator.errors).length > 0) {
      return res.status(400).send({ errors: validator.errors, success: false })
    }

    try {
      // Jelszó hashelés
      const salt = await bcrypt.genSalt(10)
      const hashedPassword = await bcrypt.hash(password, salt)

      // Felhasználó létrehozása
      const user = await UserModel.create({
        email,
        password: hashedPassword,
        tel,
        full_name: name,
      })

      // Session mentése
      this.CreateSession(req, user)

      EmailController.Send(
        email,
        'Regisztráció értesítő',
        'registerNotify.html',
        { name }
      )

      // Adatok kiküldése a kliensnek
      res.send({
        success: true,
        user: {
          user_id: user._id,
          admin: user.admin,
          employee: user.employee !== null,
          name: user.full_name,
          email: user.email,
        },
      })
    } catch (err) {
      const errors = {}

      // Ha a hiba mongoose validationError akkor a hibák kiküldése a kliensnek
      if (err instanceof mongoose.Error.ValidationError) {
        for (const [key, value] of Object.entries(err.errors)) {
          errors[key] = value.message
        }

        return res.status(400).send({ success: false, errors })
      }

      // Ha a hiba duplikáció miatt keletkezet, akkor hibák kikülése a kliensken
      if (err.code && err.code === 11000) {
        for (const [key, value] of Object.entries(err.keyPattern)) {
          errors[key] = 'busy'
        }

        return res.status(400).send({ success: false, errors })
      }

      // Bármi más hiba esetén
      throw new Error(err)
    }
  }

  static Login = async (req, res) => {
    const { password, email } = req.body

    // Adatok validálása
    const validator = new Validator()

    validator.Validate({
      email: [email, 'required|email'],
      password: [
        password,
        'required|max:32|min:8',
        ['[A-Z]', 'Legalább egy nagybetű megadása kötelező'],
        ['[a-z]', 'Legalább egy kisbetű megadása kötelező'],
        ['[-_.]', 'Legalább egy speciális karakter (_-.) megadása kötelező'],
        ['[0-9]', 'Legalább egy számot tartalmaznia kell'],
        [
          /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[-_.])[A-Za-z\d-_.]{8,}$/,
          'A jelszó csak gyakori írásjeleket tartalmazhat (a-Z 0-9 _-.)',
        ],
      ],
    })

    // Hiba esetén, hiba kiküldése
    if (Object.keys(validator.errors).length > 0) {
      return res.status(400).send({ success: false, errors: validator.errors })
    }

    // Felhasználó lekérése
    const user = await UserModel.findOne({ email })

    // Ha a felhasználó nem létezik, akkor hiba kiküldése
    if (!user)
      return res.status(400).send({
        success: false,
        error: 'Hibás felhasználónév vagy jelszó',
      })

    // Jelszó egyezésének ellenőrzése
    const match = await bcrypt.compare(password, user.password)

    if (!match)
      return res.status(400).send({
        success: false,
        error: 'Hibás felhasználónév vagy jelszó',
      })

    // Session létrehozása
    this.CreateSession(req, user)

    // Válasz küldése
    res.send({
      success: true,
      user: {
        user_id: user._id,
        admin: user.admin,
        employee: user.employee !== null,
        name: user.full_name,
        email: user.email,
      },
    })
  }

  static CreateSession = (req, user) => {
    if (!mongoose.isValidObjectId(user._id)) throw new Error('Invalid id')

    req.session.user = {
      id: user._id,
      admin: user.admin,
      employee: user.employee !== null,
      name: user.name,
      email: user.email,
      tel: user.tel,
    }
  }

  static CheckLoginState(req, res) {
    if (req.session.user) {
      return res.send({ success: true, user: req.session.user })
    }
    return res.send({ success: false })
  }

  static Logout(req, res) {
    req.session.destroy()

    res.clearCookie(process.env.SESSION_NAME)

    res.send({ success: true })
  }

  static async CreateEmployee(req, res) {
    const { user_id, description, img_url } = req.body

    const validator = new Validator()

    if (!mongoose.isValidObjectId(user_id))
      return res.send({
        success: false,
        errors: { user_id: 'Érvénytelen azonosító' },
      })

    validator.Validate({
      description: [description, 'required|min:10|max:50'],
      img: [
        img_url,
        'required',
        [
          /(http[s]*:\/\/)([a-z\-_0-9\/.]+)\.([a-z.]{2,3})\/([a-z0-9\-_\/._~:?#\[\]@!$&'()*+,;=%]*)([a-z0-9]+\.)(jpg|jpeg|png)/,
          'kérjük érvényes linket adjon meg!',
        ],
      ],
    })

    if (Object.keys(validator.errors).length > 0) {
      return res.send({ success: false, errors: validator.errors })
    }

    const user = await UserModel.findById(user_id)

    if (!user)
      return res.status(400).send({
        success: false,
        errors: { user_id: 'Nincs ilyen felhasználó' },
      })

    if (user.employee !== null)
      return res.status(400).send({
        success: false,
        errors: { user_id: 'Ez a felhasználó már alkalmazot' },
      })

    user.employee = {
      description,
      profile_picture: img_url,
    }

    user.save()

    return res.send({ success: true })
  }

  static async DeleteEmployee(req, res) {
    const { user_id } = req.body

    if (!mongoose.isValidObjectId(user_id))
      return res.send({ success: false, error: 'Érvénytelen ID' })

    const user = await UserModel.findById(user_id)

    if (!user)
      return res.send({ success: false, error: 'Nincs ilyen felhasználó' })

    if (user.employee === null)
      return res.send({
        success: false,
        error: 'A felhasználó nem alkalmazott',
      })

    user.employee = null
    user.save()

    res.send({ success: true })
  }
}
