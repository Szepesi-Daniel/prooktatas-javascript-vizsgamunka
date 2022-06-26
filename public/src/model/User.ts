import config from '../lib/framework/config'
import { api } from '../lib/framework/fetch'
import { UserType } from '../lib/types/UserType'
import { checkCookie } from '../lib/utils/cookies'

export default class User {
  private static _user: UserType = {}

  public static async IsLoggedIn() {
    if (this._user.id && checkCookie(config.sessionCookie)) return true

    const result = await api('/auth/is-logged-in').catch((e) => false)

    if (!result.success) return false

    this._user.id = result.user.id
    this._user.email = result.user.email
    this._user.tel = result.user.tel
    this._user.name = result.user.name
    this._user.employee = result.user.employee

    return true
  }

  public static IsEmployee(): boolean {
    return this._user.employee
  }

  static get user() {
    return this._user
  }

  public static async Logout() {
    if (!checkCookie(config.sessionCookie)) return true

    const result = await api('/auth/logout', {}, { method: 'POST' }).catch(
      (e) => false
    )

    if (!result.success) return false

    return true
  }

  public static async Login(data: { email: string; password: string }) {
    const result = await api('/auth/login', data, { method: 'POST' })

    if (result.success) {
      this._user = result.user
    }

    return result
  }

  public static async Register(data: {
    email: string
    password: string
    tel: string
    name: string
  }) {
    const result = await api('/auth/register', data, { method: 'POST' })

    if (!result.success) return result

    this._user = result.user

    console.log(result)

    return result
  }
}
