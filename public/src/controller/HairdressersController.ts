import Controller from '../lib/framework/Controller'
import Router from '../lib/framework/Router'
import Hairdresser from '../model/Hairdresser'
import HairdressersView from '../view/HairdressersView'
import FlashController from './layouts/FlashController'
import NavController from './layouts/NavController'

export default class HairdressersController extends Controller {
  protected _views: { [key: string]: any } = { main: HairdressersView }
  protected _layouts: { [key: string]: any } = {
    nav: NavController,
    flash: FlashController,
  }
  protected _title: string = 'Fordrászaink'

  async Start() {
    const hairdressers = await Hairdresser.GetHairdressers()

    this._activeView.RenderHairdressers(hairdressers)
    this._activeView.On('appointment', (data: any) => {
      const today = new Date()

      today.setTime(today.getTime() + 1000 * 60 * 60 * 24)

      const route = `/appointment/${data.id}/${
        today.toISOString().split('T')[0]
      }`

      Router.Navigate(route)
    })
  }
}
