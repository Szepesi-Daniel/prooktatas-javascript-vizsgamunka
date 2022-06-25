import { $id } from '../utils/selectors'

export default class Validator {
  private _errors: { [key: string]: string | boolean } = {}
  private _prefix: string = 'error-'
  private _emailRegex = /^[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+$/

  /**
   *
   * @param prefix
   */
  constructor(prefix?: string) {
    if (!prefix) return

    this._prefix = prefix

    return this
  }

  /**
   *
   * @param data
   * @description {name}
   */
  public Validate(data: { [key: string]: any[] }) {
    for (const [key, array] of Object.entries(data)) {
      const value = array[0]
      const template = array[1].split('|')

      for (const v of template) {
        this.Test(value, v.trim(), key)
      }

      if (array.length > 2) {
        for (let i = 2; i < array.length; i++) {
          if (this._errors[key]) break

          const regex = new RegExp(array[i][0])
          const errorMsg = array[i][1]
          const not = array[i][2] === undefined ? true : array[i][2]

          if (not) {
            if (!regex.test(value)) this.AddError(key, errorMsg)
          } else if (regex.test(value)) this.AddError(key, errorMsg)
        }
      }
      if (!this._errors[key]) this.AddError(key, true)
    }

    return this
  }

  /**
   * Kirelendereli a hibákat, olyan elemeket keres amelyeknek az ID ja megegyezik a megadott prefix + az invalid adat kulcsával;
   */
  public RenderErrors() {
    for (const [key, value] of Object.entries(this._errors)) {
      this.RenderError(key, value)
    }

    return this
  }

  get errors() {
    return this._errors
  }

  /**
   * Kirenderel egy hibát, olyan emelet keres amelynek ID ja megegyezik a megadott prefix + name el.
   * @param name
   * @param error
   */
  public RenderError(name: string, error: string | boolean) {
    const errorDisplay = $id(`${this._prefix}${name}`)

    if (!errorDisplay) return
    if (typeof error === 'boolean') return (errorDisplay.innerHTML = '')

    errorDisplay.innerHTML = error

    return this
  }

  /**
   * ELtávolítja az összes mentet hibát
   */
  public ClearErrors() {
    for (const [key, value] of Object.entries(this._errors)) {
      const elem = $id(`${this._prefix}${key}`)

      if (elem) elem.innerHTML = ''
    }

    this._errors = {}

    return this
  }

  private Test(value: string, v: string, key: string) {
    switch (true) {
      case value === '':
        if (v.search('required') !== -1) {
          this.AddError(key, `A mező kitöltése kötelező`)
        }
        break
      case v.startsWith('max'):
        try {
          const num = v.split(':')[1].trim()

          if (value.length > Number(num)) {
            this.AddError(key, `Nem lehet hosszabb ${num} karakternél`)
          }
        } catch (e) {
          throw 'Invalid format'
        }
        break
      case v.startsWith('min'):
        try {
          const num = v.split(':')[1].trim()

          if (value.length < Number(num)) {
            this.AddError(key, `Nem lehet rövidebb ${num} karakternél`)
          }
        } catch (e) {
          throw 'Invalid format'
        }
        break
      case v === 'email':
        if (this._emailRegex.test(value)) break

        this.AddError(key, `A megadott email formátum nem megfelelő`)

        break
    }
  }

  private AddError(key: string, value: string | boolean) {
    if (this._errors[key]) return

    this._errors[key] = value
  }

  public hasError(): boolean {
    let error = false

    for (const err of Object.values(this._errors)) {
      if (typeof err !== 'boolean') {
        error = true
        break
      }
    }

    return error
  }
}
