import Controller from '../../lib/framework/Controller'
import Router from '../../lib/framework/Router'
import Appointment from '../../model/Appointment'
import DateView from '../../view/admin/DateView'

export default class BooksController extends Controller {
  protected _views: { [key: string]: any } = { main: DateView }
  protected _title: string = 'Admin - Időpontok'

  protected async Start() {
    this.DatesHandler()

    this._activeView.On('dateChange', (e: any) => {
      Router.UpdateParams('date', e.date)
      this.DatesHandler()
    })

    this._activeView.On(
      'delete',
      async (data: { id: string; date: string }) => {
        const res = await Appointment.DeletAppointment(data.id, data.date)

        if (!res.success) return

        this.DatesHandler()
      }
    )
  }

  private DatesHandler = async () => {
    const employees = await Appointment.GetAppointments(Router.params.date)
    const startOfWorkHours = '9:00'
    const endOfWorkHours = '17:00'
    const step = 30

    const dateOfStart = new Date(Router.params.date)
    const dateOfEnd = new Date(Router.params.date)

    dateOfStart.setHours(
      Number(startOfWorkHours.split(':')[0]),
      Number(startOfWorkHours.split(':')[1]),
      0
    )
    dateOfEnd.setHours(
      Number(endOfWorkHours.split(':')[0]),
      Number(endOfWorkHours.split(':')[1]),
      0
    )

    const dateOfEndMs = dateOfEnd.getTime()
    const dateOfStartMs = dateOfStart.getTime()

    const array: any = []

    const lastIndex = (dateOfEndMs - dateOfStartMs) / (1000 * 60 * step)

    for (const employee of employees) {
      const data: any = {}
      let index = 0

      data.name = employee.name
      data.img = employee.img
      data.id = employee._id
      data.appointment = []

      for (const [i, appointment] of employee.appointments.entries()) {
        const app: any = {}
        const d = new Date(appointment.date).getTime()

        app.user = appointment.user
        app.id = appointment._id
        app.startIndex =
          (d - dateOfStartMs + 1000 * 60 * step) / (1000 * 60 * step)
        app.date = appointment.date

        for (let i = index; i < app.startIndex - 1; i++) {
          data.appointment.push(null)
        }

        index = app.startIndex

        data.appointment.push(app)

        if (i === employee.appointments.length - 1) {
          for (let i = 0; data.appointment.length < lastIndex; i++) {
            data.appointment.push(null)
          }
        }
      }

      array.push(data)
    }

    this._activeView.RenderAppointments(array, Router.params.date)
  }
}
