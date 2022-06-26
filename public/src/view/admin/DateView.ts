import View from '../../lib/framework/View'
import { $id } from '../../lib/utils/selectors'

export default class BooksView extends View {
  protected _htmlFileName: string = 'admin'
  private dateContainer: HTMLElement
  private adminMenu: HTMLElement

  public RenderAppointments(appointments: any, date: string) {
    const colorHexs = [
      ['#5D84FE', 'white'],
      ['#8FEFE1', '#7D9CFE'],
      ['#FFC938', 'white'],
      ['#E4E4FF', '#7D9CFE'],
      ['#FF4B55', 'white'],
    ]
    const datePicker = $id('date') as HTMLInputElement

    datePicker.value = date

    this.dateContainer.innerHTML = `<div class="col">
                                        <div class="cel"></div>
                                        <div class="cel">9:00</div>
                                        <div class="cel">9:30</div>
                                        <div class="cel">10:00</div>
                                        <div class="cel">10:30</div>
                                        <div class="cel">11:00</div>
                                        <div class="cel">11:30</div>
                                        <div class="cel">12:00</div>
                                        <div class="cel">12:30</div>
                                        <div class="cel">13:00</div>
                                        <div class="cel">13:30</div>
                                        <div class="cel">14:00</div>
                                        <div class="cel">14:30</div>
                                        <div class="cel">15:00</div>
                                        <div class="cel">15:30</div>
                                        <div class="cel">16:00</div>
                                        <div class="cel">16:30</div>
                                      </div>`

    for (const appointment of appointments) {
      let html = `<div style="pointer-events: none;" class="col">
                  <div class="cel">
                    <img
                      style="
                        width: 50px;
                        height: 50px;
                        border-radius: 50%;
                        object-fit: cover;
                      "
                      src=${appointment.img}
                    />
                  </div>`

      for (const app of appointment.appointment) {
        if (app === null) {
          html += `<div class="cel"></div>`
          continue
        }

        const color: string[] =
          colorHexs[Math.floor(Math.random() * colorHexs.length)]

        html += `<div style="pointer-events: auto" data-username="${
          app.user.full_name
        }" data-date="${app.date}" data-id="${appointment.id}" class="cel${
          app.size ? '-' + app.size : ''
        } busy">
                  <div
                    style="
                      pointer-events: none;
                      background-color: ${color[0]};
                      border-radius: 5px;
                      width: 100%;
                      height: 100%;
                      color:${color[1]} ;
                    "
                  >
                    <div class="name">${app.user.full_name}</div>
                    <div class="date">${
                      app.size && app.size > 3 ? app.date : ''
                    }</div>
                  </div>
                </div>`
      }

      html += `</div>`

      this.dateContainer.insertAdjacentHTML('beforeend', html)
    }
  }

  public Start(): void {
    this.dateContainer = $id('appointments')
    this.adminMenu = $id('admin-menu')

    this.InitEvents()
  }

  public CloseMenu = (e: MouseEvent) => {
    const target = e.target as HTMLElement

    if (this.adminMenu.contains(target)) return

    this.adminMenu.style.display = 'none'
  }

  private InitEvents() {
    const date: any = $id('date')
    date.addEventListener('click', (e: Event) => {
      date.showPicker()
    })

    date.addEventListener('change', (e: any) => {
      this.Emit('dateChange', { date: e.target.value })
    })

    this.adminMenu.addEventListener('click', (e) => {
      const target = e.target as HTMLElement

      if (!target.classList.contains('delet-appointment-js')) return

      const name = target.getAttribute('data-name')
      const date = target.getAttribute('data-date')
      const localeDateString = new Date(date).toLocaleString()
      const id = target.getAttribute('data-id')

      const confirmation = confirm(
        `Biztosan törlöd az alábi időpontot? ${name} - ${localeDateString}`
      )

      if (!confirmation) return

      this.Emit('delete', { id, date })
    })

    this.dateContainer.addEventListener('contextmenu', (e: MouseEvent) => {
      e.preventDefault()

      const target = e.target as HTMLElement
      const name = target.getAttribute('data-username')
      const date = target.getAttribute('data-date')
      const localeDate = new Date(date).toLocaleString()
      const id = target.getAttribute('data-id')

      if (!name) return

      this.adminMenu.style.display = 'flex'
      this.adminMenu.style.top = e.clientY + 'px'
      this.adminMenu.style.left = e.clientX + 'px'

      this.adminMenu.innerHTML = `<p>${name}</p><p>${localeDate}</p><button data-id="${id}" data-name="${name}" data-date="${date}" class="danger delet-appointment-js">törlés</button>`
    })

    this.adminMenu.addEventListener('contextmenu', (e) => e.preventDefault())

    document.body.addEventListener('click', this.CloseMenu)
  }

  public Destroy(): void {
    document.body.removeEventListener('click', this.CloseMenu)
  }
}
