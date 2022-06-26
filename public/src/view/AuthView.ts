import Validator from '../lib/framework/Validator'
import View from '../lib/framework/View'
import { $$, $id } from '../lib/utils/selectors'

export default class AuthView extends View {
  protected _htmlFileName: string = 'login'
  private _loginViewBtn: HTMLElement
  private _registerViewBtn: HTMLElement
  private _doubleBox: HTMLElement
  private _inputs: NodeListOf<HTMLInputElement>
  private _loginForm: HTMLFormElement
  private _loginEmail: HTMLInputElement
  private _loginPassword: HTMLInputElement
  private _registerForm: HTMLFormElement
  private _registerName: HTMLInputElement
  private _registerPassword: HTMLInputElement
  private _registerEmail: HTMLInputElement
  private _registerTel: HTMLInputElement

  public Start(): void {
    this._loginViewBtn = $id('login-view-btn')
    this._registerViewBtn = $id('register-view-btn')
    this._doubleBox = $id('double-box')
    this._inputs = $$('.group-control') as NodeListOf<HTMLInputElement>
    this._loginForm = $id('login-form') as HTMLFormElement
    this._loginEmail = $id('login-email') as HTMLInputElement
    this._loginPassword = $id('login-password') as HTMLInputElement
    this._registerForm = $id('register-form') as HTMLFormElement
    this._registerEmail = $id('register-email') as HTMLInputElement
    this._registerPassword = $id('register-password') as HTMLInputElement
    this._registerName = $id('register-name') as HTMLInputElement
    this._registerTel = $id('register-tel') as HTMLInputElement

    this.InitEvents()
  }

  private InitEvents() {
    this._loginViewBtn.addEventListener('click', () =>
      this._doubleBox.classList.remove('left-active')
    )
    this._registerViewBtn.addEventListener('click', () =>
      this._doubleBox.classList.add('left-active')
    )
    this._loginForm.addEventListener('submit', (e) => {
      e.preventDefault()

      const validator = new Validator()

      validator
        .Validate({
          'login-email': [this._loginEmail.value, 'required|email'],
          'login-password': [
            this._loginPassword.value,
            'required|max:32|min:8',
            ['[A-Z]', 'Legalább egy nagybetű megadása kötelező'],
            ['[a-z]', 'Legalább egy kisbetű megadása kötelező'],
            [
              '[-_.]',
              'Legalább egy speciális karakter (_-.) megadása kötelező',
            ],
            ['[0-9]', 'Legalább egy számot tartalmaznia kell'],
            [
              /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[-_.])[A-Za-z\d-_.]{8,}$/,
              'A jelszó csak gyakori írásjeleket tartalmazhat (a-Z 0-9 _-.)',
            ],
          ],
        })
        .RenderErrors()

      if (validator.hasError()) return

      this.Emit('login', {
        email: this._loginEmail.value,
        password: this._loginPassword.value,
      })
    })
    this._registerForm.addEventListener('submit', (e) => {
      e.preventDefault()

      const validator = new Validator()

      validator
        .Validate({
          'register-email': [this._registerEmail.value, 'required|email'],
          'register-password': [
            this._registerPassword.value,
            'required|max:32|min:8',
            ['[A-Z]', 'Legalább egy nagybetű megadása kötelező'],
            ['[a-z]', 'Legalább egy kisbetű megadása kötelező'],
            [
              '[-_.]',
              'Legalább egy speciális karakter (_-.) megadása kötelező',
            ],
            ['[0-9]', 'Legalább egy számot tartalmaznia kell'],
            [
              /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[-_.])[A-Za-z\d-_.]{8,}$/,
              'A jelszó csak gyakori írásjeleket tartalmazhat (a-Z 0-9 _-.)',
            ],
          ],
          'register-name': [
            this._registerName.value,
            'required',
            [
              '([A-ZÖÜÓŐÚÁÉÍ][a-zöüóőúáéí]{3,} )([A-ZÖÜÓŐÚÁÉÍ][a-zöüóőúáéí]{3,} )?([A-ZÖÜÓŐÚÁÉÍ][a-zöüóőúáéí]{3,})',
              'Kérljük add meg a teljes neved (Kovács Lajos)',
            ],
          ],
          'register-tel': [
            this._registerTel.value,
            'required',
            [
              /^(30|50|40|70){1}[-]{1}\d{3}[-]{1}\d{4}$/,
              'Rossz formátum (30-353-3322)',
            ],
          ],
        })
        .RenderErrors()

      if (validator.hasError()) return

      this.Emit('register', {
        email: this._registerEmail.value,
        password: this._registerPassword.value,
        tel: this._registerTel.value,
        name: this._registerName.value,
      })
    })
    this._inputs.forEach((inp) => {
      inp.addEventListener('focus', (e) => {
        inp.classList.add('focus')
      })
      inp.addEventListener('blur', (e) => {
        if (inp.value.length === 0) inp.classList.remove('focus')
      })
    })
  }

  public RenderLoginErrors(errors: {} | string) {
    if (typeof errors === 'object') {
      for (const [key, value] of Object.entries(errors)) {
        $id(`error-login-${key}`).innerHTML = value.toString()
      }

      return
    }

    $id('error-login-email').innerHTML = errors.toString()
  }

  public RenderRegisterErrors(errors: {}) {
    if (!errors) return

    $id(`error-register-email`).innerHTML = ''
    $id(`error-register-password`).innerHTML = ''
    $id(`error-register-tel`).innerHTML = ''
    $id(`error-register-name`).innerHTML = ''

    for (const [key, value] of Object.entries(errors)) {
      $id(`error-register-${key}`).innerHTML =
        value === 'busy' ? `A megadot ${key} foglalt` : value.toString()
    }
  }
}
