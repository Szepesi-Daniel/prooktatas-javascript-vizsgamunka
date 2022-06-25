import { api } from '../lib/framework/fetch'

export default class Appointment {
  public static async GetFreeDates(id: string, date: string) {
    const result = await api(`/hairdresser/${id}/${date}`)

    if (!result.success) throw new Error('Később')

    return {
      freeDates: result.freeDates,
      date: result.date,
      employee: {
        name: result.employee.full_name,
        img: result.employee.profile_picture,
      },
    }
  }

  public static async GetAppointments(date: string) {
    const result = await api('/appointments/' + date)

    if (result.success && result.success === false) throw 'hiba' // TODO: Befejezni
    console.log(result)
    return result
  }

  public static async DeletAppointment(employee_id: string, date: string) {
    const result = await api(
      '/appointment',
      { employee_id, date },
      { method: 'DELETE' }
    )

    return result
  }

  public static async BookNow(
    date: string,
    user_id: string,
    employee_id: string
  ) {
    const result = await api(
      '/book-now',
      { date, user_id, employee_id },
      { method: 'POST' }
    )

    return result.success
  }
}
