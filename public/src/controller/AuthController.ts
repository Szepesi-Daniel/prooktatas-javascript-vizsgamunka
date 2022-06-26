import Controller from '../lib/framework/Controller'
import Router from '../lib/framework/Router'
import User from '../model/User'
import AuthView from '../view/AuthView'
import FlashController from './layouts/FlashController'
import SpinnerController from './layouts/SpinnerController'

export default class AuthController extends Controller {
  protected _views: { [key: string]: any } = { main: AuthView }
  protected _layouts: { [key: string]: any } = {
    spinner: SpinnerController,
    flash: FlashController,
  }

  protected _title: string = 'Hitelesítés'

  Start(): void {
    this._activeView.On('login', this.LoginHandler)
    this._activeView.On('register', this.RegisterHandler)
  }

  public LoginHandler = async (data: { email: string; password: string }) => {
    this._layouts.spinner.Show()

    const result = await User.Login(data)

    if (!result.success) {
      this._layouts.spinner.Hide()

      this._activeView.RenderLoginErrors(result.errors || result.error)

      return
    }

    Router.Navigate('/')
  }

  public RegisterHandler = async (data: {
    email: string
    tel: string
    password: string
    name: string
  }) => {
    this._layouts.spinner.Show()

    const res = await User.Register(data)

    this._layouts.spinner.Hide()

    if (!res.success) {
      return this._activeView.RenderRegisterErrors(res.errors)
    }

    this._layouts.flash.AddFlash('success', `Sikeresen regisztráció!`)

    Router.Navigate('/')
  }
}
