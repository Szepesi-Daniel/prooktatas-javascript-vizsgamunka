import View from '../lib/framework/View'
import { $id } from '../lib/utils/selectors'

export default class HairdressersView extends View {
  protected _htmlFileName: string = 'hairdressers'

  public RenderHairdressers(hairdressers: any) {
    for (const hairdresser of hairdressers) {
      const html = `<div class="card">
                      <div class="head">
                        <img
                          src="${hairdresser.employee.profile_picture}"
                        />
                      </div>
                      <div class="body">
                        <p class="title">${hairdresser.full_name}</p>
                        <p>FODRÁSZ</p>
                        <p>
                          ${hairdresser.employee.description}
                        </p>
                        <button class="btn btn-primary" data-id="${hairdresser._id}">IDŐPONTFOGLALÁS</button>
                      </div>
                    </div>`

      $id('hairdressers').insertAdjacentHTML('beforeend', html)
    }
  }

  public Start(): void {
    $id('hairdressers').addEventListener('click', (e) => {
      const target = e.target as HTMLElement
      const id = target.getAttribute('data-id')

      if (!id) return

      this.Emit('appointment', { id })
    })
  }
}
