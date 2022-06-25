import View from '../../lib/framework/View'
import { $, $id } from '../../lib/utils/selectors'

export default class NavView extends View {
  protected _htmlFileName: string = 'nav'
  _root: string = 'nav'

  public Start(): void {
    $id('logout-btn').addEventListener('click', (e) => this.Emit('logout'))
  }

  public HideLogoutBtn() {
    $id('logout-button').classList.add('hide')
  }

  public ShowLogoutBtn() {
    $id('logout-button').classList.remove('hide')
    $id('logout-button').addEventListener('click', () => {
      console.log(this._events)
      this.Emit('logout')
    })
  }

  public ShowEmployeeButton() {
    $id('employee-btn').style.display = 'block'

    $id('employee-btn').addEventListener('click', e => this.Emit('employeeBtnClick'))
  }
}
