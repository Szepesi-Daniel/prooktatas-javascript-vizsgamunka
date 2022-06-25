import Controller from '../lib/framework/Controller'
import Router from '../lib/framework/Router'
import Appointment from '../model/Appointment'
import Hairdresser from '../model/Hairdresser'
import User from '../model/User'
import AppointmentView from '../view/AppointmentView'
import FlashController from './layouts/FlashController'
import NavController from './layouts/NavController'

export default class AppointmentController extends Controller {
  protected _views: { [key: string]: any } = { main: AppointmentView }
  protected _layouts: { [key: string]: any } = {
    flash: FlashController,
    nav: NavController,
  }
  protected _title: string = 'Időpont foglalás'
  private _selectedDate: string

  protected async Start() {
    const data = await Appointment.GetFreeDates(
      Router.params.id,
      Router.params.date
    )

    this._activeView.UpdateHairdresser(data.freeDates, data.date, data.employee)

    this._activeView.On('dateChange', async (data: { date: string }) => {
      const result = await Appointment.GetFreeDates(Router.params.id, data.date)

      this._activeView.UpdateHairdresser(
        result.freeDates,
        result.date,
        result.employee
      )
    })

    this._activeView.On('dateSelect', (data: string) => {
      this._selectedDate = data

      console.log(this._selectedDate)
    })

    this._activeView.On('bookNow', async () => {
      const result = await Appointment.BookNow(
        `${Router.params.date} ${this._selectedDate}`,
        User.user.id,
        Router.params.id
      )

      if (!result) throw new Error('hiba') // TODO: Befejezni

      this._layouts.flash.AddFlash(
        'success',
        `Sikeresen lefoglaltad a ${Router.params.date} ${this._selectedDate} időpontot!`
      )

      Router.Navigate('/')
    })

    this._activeView.On('cancle', () => Router.Navigate('/'))
  }
}
