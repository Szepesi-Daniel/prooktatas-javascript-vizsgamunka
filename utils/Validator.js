export default class Validator {
  _errors = {}
  _emailRegex = /^[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+$/

  /**
   *
   * @param data
   * @description {name}
   */
  Validate(data) {
    for (const [key, array] of Object.entries(data)) {
      const value = array[0]
      const template = array[1].split('|')

      for (const v of template) {
        this.Test(value, v.trim(), key)
      }

      if (array.length > 2) {
        for (let i = 2; i < array.length; i++) {
          if (this.errors[key]) break

          const regex = new RegExp(array[i][0])
          const errorMsg = array[i][1]
          const not = array[i][2] === undefined ? true : array[i][2]

          if (not) {
            if (!regex.test(value)) this.AddError(key, errorMsg)
          } else if (regex.test(value)) this.AddError(key, errorMsg)
        }
      }
    }

    return this
  }

  get errors() {
    return this._errors
  }

  /**
   * ELtávolítja az összes mentet hibát
   */
  ClearErrors() {
    for (const [key, value] of Object.entries(this._errors)) {
      const elem = getById(`${this._prefix}${key}`)

      if (elem) elem.innerHTML = ''
    }

    this._errors = {}

    return this
  }

  Test(value, v, key) {
    switch (true) {
      case !value:
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

  AddError(key, value) {
    if (this._errors[key]) return

    this._errors[key] = value
  }

  HasError() {
    return Object.keys(this._errors).length > 0
  }
}
