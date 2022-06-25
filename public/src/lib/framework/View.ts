import { $, $id } from '../utils/selectors'
import config from './config'

export default class View {
  protected _htmlFileName: string
  protected _root = config.root
  protected _events: { [key: string]: Function[] } = {}

  public get htmlFileName() {
    return this._htmlFileName
  }

  public Start() {}

  public Render(htmlFile: string) {
    $id(this._root).innerHTML = htmlFile
  }

  public On(type: string, callback: Function) {
    if (!this._events[type]) this._events[type] = []

    this._events[type].push(callback)
  }

  public Emit(type: string, data?: any) {
    if (!this._events[type]) return

    for (const cb of this._events[type]) {
      cb(data || undefined)
    }
  }

  public Hide() {
    $id(this._root).style.visibility = 'hidden'
  }

  public Show() {
    $id(this._root).style.visibility = 'visible'
  }

  public ShowFlash(type: string, message: string) {
    console.log(type, message)
  }

  public Destroy() {}
}
