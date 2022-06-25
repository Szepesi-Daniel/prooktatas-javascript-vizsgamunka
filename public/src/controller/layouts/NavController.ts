import Controller from '../../lib/framework/Controller'
import Router from '../../lib/framework/Router'
import Flash from '../../model/Flash'
import User from '../../model/User'
import NavView from '../../view/layouts/NavView'

export default class NavController extends Controller {
  protected _views: { [key: string]: any } = { main: NavView }

  protected Start(): void {
    this._activeView.On('logout', async () => {
      await User.Logout()
      Router.Navigate('/auth')

      Flash.flash = { type: 'success', message: 'Sikeres kijelentkezés' }
    })

    if (User.IsEmployee()) {
      this._activeView.ShowEmployeeButton()

      this._activeView.On('employeeBtnClick', () => {
        const today = new Date()
        Router.Navigate('/admin/' + today.toISOString().split('T')[0])
      })
    }
  }
}
