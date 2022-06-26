import Router from '../lib/framework/Router'
import View from '../lib/framework/View'
import { $, $$, $id } from '../lib/utils/selectors'

export default class AppointmentView extends View {
  protected _htmlFileName: string = 'appointment'
  private _dateInput: HTMLInputElement
  private _freeDatesDisplay: HTMLElement
  private _months = [
    'Január',
    'Február',
    'Március',
    'Április',
    'Május',
    'Június',
    'Július',
    'Augusztus',
    'Szeptember',
    'Október',
    'November',
    'December',
  ]
  private _days = [
    'Vasárnap',
    'Hétfő',
    'Kedd',
    'Szerda',
    'Csütörtök',
    'Péntek',
    'Szombat',
  ]

  public Start(): void {
    this._dateInput = $id('date') as HTMLInputElement
    this._freeDatesDisplay = $id('free-dates')

    this.InitEvents()
  }

  private InitEvents() {
    this._dateInput.addEventListener('change', (e) => {
      const target = e.target as HTMLInputElement

      this.Emit('dateChange', { date: target.value })

      Router.UpdateParams('date', target.value)
    })

    this._freeDatesDisplay.addEventListener('click', (e) => {
      const target = e.target as HTMLButtonElement

      if (!target.classList.contains('date-btn-js')) return

      this.Emit('dateSelect', target.innerHTML)
    })

    $id('book-btn').addEventListener('click', (e) => {
      this.Emit('bookNow')
    })

    $id('book-cancle').addEventListener('click', () => this.Emit('cancle'))
  }

  public UpdateHairdresser(freeDates: [], date: string, employee: any) {
    const dateDisplay = $id('date-display')
    const selectedDate = new Date(date)
    const img = $id('profile-picture') as HTMLImageElement

    img.src = employee.img

    this._freeDatesDisplay.innerHTML = ''

    this._dateInput.valueAsDate = selectedDate
    dateDisplay.innerHTML = `${
      this._months[selectedDate.getMonth()]
    } ${selectedDate.getDate()}. (${this._days[selectedDate.getDay()]})`

    if (freeDates.length === 0) {
      this._freeDatesDisplay.innerHTML =
        '<p>Sajnos erre a napra nincs szabad időpont</p>'
    }

    for (const freeDate of freeDates) {
      const html = `<button data-date="${freeDate}" class="btn btn-primary appointment-btn date-btn-js">${freeDate}</button>`

      this._freeDatesDisplay.insertAdjacentHTML('beforeend', html)
    }
  }

  public SetSelected(date: string) {
    const btn = $(`[data-date="${date}"]`)

    if (!btn) return

    const btns = $$('.date-btn-js')

    btns.forEach((e: HTMLElement) => {
      e.classList.remove('selected')
    })

    btn.classList.add('selected')
  }
}
