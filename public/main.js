var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __asyncValues = (this && this.__asyncValues) || function (o) {
    if (!Symbol.asyncIterator) throw new TypeError("Symbol.asyncIterator is not defined.");
    var m = o[Symbol.asyncIterator], i;
    return m ? m.call(o) : (o = typeof __values === "function" ? __values(o) : o[Symbol.iterator](), i = {}, verb("next"), verb("throw"), verb("return"), i[Symbol.asyncIterator] = function () { return this; }, i);
    function verb(n) { i[n] = o[n] && function (v) { return new Promise(function (resolve, reject) { v = o[n](v), settle(resolve, reject, v.done, v.value); }); }; }
    function settle(resolve, reject, d, v) { Promise.resolve(v).then(function(v) { resolve({ value: v, done: d }); }, reject); }
};
define("lib/types/FlashType", ["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
});
define("lib/framework/config", ["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.default = {
        server_url: '/',
        root: 'app',
        sessionCookie: 'MY_SESSION',
    };
});
define("lib/framework/fetch", ["require", "exports", "lib/framework/config"], function (require, exports, config_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.api = exports.getHtml = void 0;
    function getHtml(fileName) {
        return __awaiter(this, void 0, void 0, function* () {
            const result = yield (yield fetch(config_1.default.server_url + 'html/' + fileName + '.html')).text();
            return result;
        });
    }
    exports.getHtml = getHtml;
    function api(path, data, cfg = { method: 'GET' }) {
        return __awaiter(this, void 0, void 0, function* () {
            let result;
            if (cfg.method === 'GET') {
                result = yield yield (yield fetch(config_1.default.server_url + 'api' + path, Object.assign({}, cfg))).json();
            }
            else {
                result = yield yield (yield fetch(config_1.default.server_url + 'api' + path, Object.assign(Object.assign({ headers: {
                        'Content-Type': 'application/json',
                    } }, cfg), { body: JSON.stringify(data) || null }))).json();
            }
            return result;
        });
    }
    exports.api = api;
});
define("lib/framework/Controller", ["require", "exports", "lib/framework/fetch"], function (require, exports, fetch_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    class Controller {
        constructor() {
            this._views = {};
            this._layouts = {};
            this._defaultViewKey = 'main';
        }
        Start() { }
        Destroy() {
            this._activeView.Destroy();
        }
        get title() {
            return this._title;
        }
        Control() {
            return __awaiter(this, void 0, void 0, function* () {
                if (!this._views[this._defaultViewKey])
                    throw new Error(`A ${this._defaultViewKey} view nincs megadva a _views ban`);
                this._activeView = new this._views[this._defaultViewKey]();
                const htmlFileName = this._activeView.htmlFileName;
                const htmlFile = yield (0, fetch_1.getHtml)(htmlFileName);
                this._activeView.Render(htmlFile);
                for (const [key, value] of Object.entries(this._layouts)) {
                    this._layouts[key] = new value();
                    this._layouts[key].Control();
                }
                this.Start();
                this._activeView.Start();
            });
        }
    }
    exports.default = Controller;
});
define("lib/types/RouterTypes", ["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
});
define("lib/framework/Router", ["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    class Router {
        static get route() {
            return this._route.route;
        }
        static set notFoundController(controller) {
            this._notFoundController = controller;
        }
        static get params() {
            return this._params;
        }
        static AddRoute(route) {
            const valid = this._routeRegex.test(route.route);
            if (!valid)
                throw new Error('Hibás útvonal');
            this._routes.push(route);
        }
        static RemoveRoute(route) {
            const index = this._routes.findIndex((e) => e.route === route);
            this._routes.splice(index, 1);
        }
        static Navigate(route, title, queries) {
            const valid = this._routeRegex.test(route);
            if (!valid)
                throw new Error('Hibás útvonal');
            history.pushState({}, null, route);
            if (title)
                document.title = title;
            this.CalcRoute();
            return this;
        }
        static On(type, callback) { }
        static Emit(type) { }
        static Off(type, callback) { }
        static CalcRoute() {
            var e_1, _a;
            var _b, _c;
            return __awaiter(this, void 0, void 0, function* () {
                const path = location.pathname;
                let found = false;
                for (const route of this._routes) {
                    const arr = route.route.split('/');
                    const arr2 = path.split('/');
                    arr.splice(0, 1);
                    arr2.splice(0, 1);
                    const params = {};
                    for (const [index, str] of arr2.entries()) {
                        const str2 = arr[index];
                        const isOptional = str2 === null || str2 === void 0 ? void 0 : str2.endsWith('?');
                        const isKey = str2 === null || str2 === void 0 ? void 0 : str2.startsWith(':');
                        if (!isOptional && str2 === undefined)
                            break;
                        if (!isKey && str2 !== str)
                            break;
                        if (!str && str2.length !== 0)
                            break;
                        if (arr.length !== arr2.length)
                            break;
                        if (isKey)
                            params[str2.slice(1)] = str;
                        if (!isOptional)
                            if (index !== arr.length - 1)
                                continue;
                        this._params = params;
                        found = route;
                    }
                    if (found) {
                        this._route = found;
                        break;
                    }
                }
                if (!found) {
                    if (this._activeController !== null)
                        (_b = this._activeController) === null || _b === void 0 ? void 0 : _b.Destroy();
                    this._activeController = new this._notFoundController();
                    this._activeController.Control();
                    this._route = {
                        route: 'notFound',
                        controller: this._activeController,
                    };
                    this.SetTitle();
                    return;
                }
                const middlewares = found.middlewares || [];
                let success = true;
                try {
                    for (var middlewares_1 = __asyncValues(middlewares), middlewares_1_1; middlewares_1_1 = yield middlewares_1.next(), !middlewares_1_1.done;) {
                        const middlewear = middlewares_1_1.value;
                        const res = yield middlewear();
                        if (!res) {
                            success = false;
                            break;
                        }
                    }
                }
                catch (e_1_1) { e_1 = { error: e_1_1 }; }
                finally {
                    try {
                        if (middlewares_1_1 && !middlewares_1_1.done && (_a = middlewares_1.return)) yield _a.call(middlewares_1);
                    }
                    finally { if (e_1) throw e_1.error; }
                }
                if (!success)
                    return;
                if (this._activeController !== null)
                    (_c = this._activeController) === null || _c === void 0 ? void 0 : _c.Destroy();
                this._activeController = new found.controller();
                this._activeController.Control();
                this.SetTitle();
            });
        }
        static SetTitle(title) {
            document.title = title || this._activeController.title;
        }
        static UpdateParams(key, value) {
            const route = Router.route;
            const path = location.pathname;
            if (route.search(':' + key) === -1 || !this._params[key])
                return;
            const routeArr = route.split('/');
            const pathArr = path.split('/');
            const index = routeArr.findIndex((e) => e === ':' + key);
            pathArr[index] = value;
            this._params[key] = value;
            history.replaceState({}, null, pathArr.join('/'));
        }
        static Run() {
            this.CalcRoute();
            window.addEventListener('popstate', (e) => {
                this.CalcRoute();
            });
        }
    }
    exports.default = Router;
    Router._routes = [];
    Router._query = {};
    Router._params = {};
    Router._events = {};
    Router._routeRegex = /^([/]{1}[A-z0-9:-]{0,})+$/;
});
define("model/Appointment", ["require", "exports", "lib/framework/fetch"], function (require, exports, fetch_2) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    class Appointment {
        static GetFreeDates(id, date) {
            return __awaiter(this, void 0, void 0, function* () {
                const result = yield (0, fetch_2.api)(`/hairdresser/${id}/${date}`);
                if (!result.success)
                    throw new Error('Később');
                return {
                    freeDates: result.freeDates,
                    date: result.date,
                    employee: {
                        name: result.employee.full_name,
                        img: result.employee.profile_picture,
                    },
                };
            });
        }
        static GetAppointments(date) {
            return __awaiter(this, void 0, void 0, function* () {
                const result = yield (0, fetch_2.api)('/appointments/' + date);
                if (result.success && result.success === false)
                    throw 'hiba';
                return result;
            });
        }
        static DeletAppointment(employee_id, date) {
            return __awaiter(this, void 0, void 0, function* () {
                const result = yield (0, fetch_2.api)('/appointment', { employee_id, date }, { method: 'DELETE' });
                return result;
            });
        }
        static BookNow(date, user_id, employee_id) {
            return __awaiter(this, void 0, void 0, function* () {
                const result = yield (0, fetch_2.api)('/book-now', { date, user_id, employee_id }, { method: 'POST' });
                return result.success;
            });
        }
    }
    exports.default = Appointment;
});
define("model/Hairdresser", ["require", "exports", "lib/framework/fetch"], function (require, exports, fetch_3) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    class Hairdresser {
        static GetHairdressers() {
            return __awaiter(this, void 0, void 0, function* () {
                const result = yield yield (0, fetch_3.api)('/hairdressers');
                return result;
            });
        }
    }
    exports.default = Hairdresser;
});
define("lib/types/UserType", ["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
});
define("lib/utils/cookies", ["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.checkCookie = exports.getCookie = exports.setCookie = void 0;
    function setCookie(cname, cvalue, exdays) {
        const d = new Date();
        d.setTime(d.getTime() + exdays * 24 * 60 * 60 * 1000);
        let expires = 'expires=' + d.toUTCString();
        document.cookie = cname + '=' + cvalue + ';' + expires + ';path=/';
    }
    exports.setCookie = setCookie;
    function getCookie(cname) {
        let name = cname + '=';
        let ca = document.cookie.split(';');
        for (let i = 0; i < ca.length; i++) {
            let c = ca[i];
            while (c.charAt(0) == ' ') {
                c = c.substring(1);
            }
            if (c.indexOf(name) == 0) {
                return c.substring(name.length, c.length);
            }
        }
        return false;
    }
    exports.getCookie = getCookie;
    function checkCookie(cname) {
        let cookie = getCookie(cname);
        if (!cookie)
            return false;
        return true;
    }
    exports.checkCookie = checkCookie;
});
define("model/User", ["require", "exports", "lib/framework/config", "lib/framework/fetch", "lib/utils/cookies"], function (require, exports, config_2, fetch_4, cookies_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    class User {
        static IsLoggedIn() {
            return __awaiter(this, void 0, void 0, function* () {
                if (this._user.id && (0, cookies_1.checkCookie)(config_2.default.sessionCookie))
                    return true;
                const result = yield (0, fetch_4.api)('/auth/is-logged-in').catch((e) => false);
                if (!result.success)
                    return false;
                this._user.id = result.user.id;
                this._user.email = result.user.email;
                this._user.tel = result.user.tel;
                this._user.name = result.user.name;
                this._user.employee = result.user.employee;
                return true;
            });
        }
        static IsEmployee() {
            return this._user.employee;
        }
        static get user() {
            return this._user;
        }
        static Logout() {
            return __awaiter(this, void 0, void 0, function* () {
                const result = yield (0, fetch_4.api)('/auth/logout', {}, { method: 'POST' }).catch((e) => false);
                if (!result.success)
                    return false;
                return true;
            });
        }
        static Login(data) {
            return __awaiter(this, void 0, void 0, function* () {
                const result = yield (0, fetch_4.api)('/auth/login', data, { method: 'POST' });
                if (result.success) {
                    this._user = result.user;
                }
                return result;
            });
        }
        static Register(data) {
            return __awaiter(this, void 0, void 0, function* () {
                const result = yield (0, fetch_4.api)('/auth/register', data, { method: 'POST' });
                if (!result.success)
                    return result;
                this._user = result.user;
                return result;
            });
        }
    }
    exports.default = User;
    User._user = {};
});
define("lib/utils/selectors", ["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$id = exports.$$ = exports.$ = void 0;
    const $ = (selector) => document.querySelector(selector);
    exports.$ = $;
    const $$ = (selector) => document.querySelectorAll(selector);
    exports.$$ = $$;
    const $id = (id) => document.getElementById(id);
    exports.$id = $id;
});
define("lib/framework/View", ["require", "exports", "lib/utils/selectors", "lib/framework/config"], function (require, exports, selectors_1, config_3) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    class View {
        constructor() {
            this._root = config_3.default.root;
            this._events = {};
        }
        get htmlFileName() {
            return this._htmlFileName;
        }
        Start() { }
        Render(htmlFile) {
            (0, selectors_1.$id)(this._root).innerHTML = htmlFile;
        }
        On(type, callback) {
            if (!this._events[type])
                this._events[type] = [];
            this._events[type].push(callback);
        }
        Emit(type, data) {
            if (!this._events[type])
                return;
            for (const cb of this._events[type]) {
                cb(data || undefined);
            }
        }
        Hide() {
            (0, selectors_1.$id)(this._root).style.visibility = 'hidden';
        }
        Show() {
            (0, selectors_1.$id)(this._root).style.visibility = 'visible';
        }
        Destroy() { }
    }
    exports.default = View;
});
define("view/AppointmentView", ["require", "exports", "lib/framework/Router", "lib/framework/View", "lib/utils/selectors"], function (require, exports, Router_1, View_1, selectors_2) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    class AppointmentView extends View_1.default {
        constructor() {
            super(...arguments);
            this._htmlFileName = 'appointment';
            this._months = [
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
            ];
            this._days = [
                'Vasárnap',
                'Hétfő',
                'Kedd',
                'Szerda',
                'Csütörtök',
                'Péntek',
                'Szombat',
            ];
        }
        Start() {
            this._dateInput = (0, selectors_2.$id)('date');
            this._freeDatesDisplay = (0, selectors_2.$id)('free-dates');
            this.InitEvents();
        }
        InitEvents() {
            this._dateInput.addEventListener('change', (e) => {
                const target = e.target;
                this.Emit('dateChange', { date: target.value });
                Router_1.default.UpdateParams('date', target.value);
            });
            this._freeDatesDisplay.addEventListener('click', (e) => {
                const target = e.target;
                if (!target.classList.contains('date-btn-js'))
                    return;
                this.Emit('dateSelect', target.innerHTML);
            });
            (0, selectors_2.$id)('book-btn').addEventListener('click', (e) => {
                this.Emit('bookNow');
            });
            (0, selectors_2.$id)('book-cancle').addEventListener('click', () => this.Emit('cancle'));
        }
        UpdateHairdresser(freeDates, date, employee) {
            const dateDisplay = (0, selectors_2.$id)('date-display');
            const selectedDate = new Date(date);
            const img = (0, selectors_2.$id)('profile-picture');
            img.src = employee.img;
            this._freeDatesDisplay.innerHTML = '';
            this._dateInput.valueAsDate = selectedDate;
            dateDisplay.innerHTML = `${this._months[selectedDate.getMonth()]} ${selectedDate.getDate()}. (${this._days[selectedDate.getDay()]})`;
            if (freeDates.length === 0) {
                this._freeDatesDisplay.innerHTML =
                    '<p>Sajnos erre a napra nincs szabad időpont</p>';
            }
            for (const freeDate of freeDates) {
                const html = `<button data-date="${freeDate}" class="btn btn-primary appointment-btn date-btn-js">${freeDate}</button>`;
                this._freeDatesDisplay.insertAdjacentHTML('beforeend', html);
            }
        }
        SetSelected(date) {
            const btn = (0, selectors_2.$)(`[data-date="${date}"]`);
            if (!btn)
                return;
            const btns = (0, selectors_2.$$)('.date-btn-js');
            btns.forEach((e) => {
                e.classList.remove('selected');
            });
            btn.classList.add('selected');
        }
    }
    exports.default = AppointmentView;
});
define("model/Flash", ["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    class Flash {
    }
    exports.default = Flash;
});
define("view/layouts/FlashView", ["require", "exports", "lib/framework/View", "lib/utils/selectors"], function (require, exports, View_2, selectors_3) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    class FlashView extends View_2.default {
        constructor() {
            super(...arguments);
            this._htmlFileName = 'flash';
            this._root = 'flash';
        }
        Start() {
            (0, selectors_3.$id)('close-flash').addEventListener('click', (e) => {
                (0, selectors_3.$id)('flash').classList.remove('active');
                (0, selectors_3.$id)('flash').classList.add('close');
            });
        }
        ShowFlash(type, message) {
            (0, selectors_3.$id)(this._root).classList.add(`flash-${type}`);
            (0, selectors_3.$id)(this._root).classList.add('active');
            (0, selectors_3.$id)('flash-message').innerHTML = message;
        }
    }
    exports.default = FlashView;
});
define("controller/layouts/FlashController", ["require", "exports", "lib/framework/Controller", "model/Flash", "view/layouts/FlashView"], function (require, exports, Controller_1, Flash_1, FlashView_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    class FlashController extends Controller_1.default {
        constructor() {
            super(...arguments);
            this._views = { main: FlashView_1.default };
        }
        Start() {
            this.ShowFlash();
        }
        ShowFlash() {
            if (Flash_1.default.flash) {
                const flash = Flash_1.default.flash;
                Flash_1.default.flash = null;
                this._activeView.ShowFlash(flash.type, flash.message);
            }
        }
        AddFlash(type, message) {
            Flash_1.default.flash = { type, message };
        }
    }
    exports.default = FlashController;
});
define("view/layouts/NavView", ["require", "exports", "lib/framework/View", "lib/utils/selectors"], function (require, exports, View_3, selectors_4) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    class NavView extends View_3.default {
        constructor() {
            super(...arguments);
            this._htmlFileName = 'nav';
            this._root = 'nav';
        }
        Start() {
            (0, selectors_4.$id)('logout-btn').addEventListener('click', (e) => this.Emit('logout'));
        }
        HideLogoutBtn() {
            (0, selectors_4.$id)('logout-button').classList.add('hide');
        }
        ShowLogoutBtn() {
            (0, selectors_4.$id)('logout-button').classList.remove('hide');
            (0, selectors_4.$id)('logout-button').addEventListener('click', () => {
                this.Emit('logout');
            });
        }
        ShowEmployeeButton() {
            (0, selectors_4.$id)('employee-btn').style.display = 'block';
            (0, selectors_4.$id)('employee-btn').addEventListener('click', (e) => this.Emit('employeeBtnClick'));
        }
    }
    exports.default = NavView;
});
define("controller/layouts/NavController", ["require", "exports", "lib/framework/Controller", "lib/framework/Router", "model/Flash", "model/User", "view/layouts/NavView"], function (require, exports, Controller_2, Router_2, Flash_2, User_1, NavView_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    class NavController extends Controller_2.default {
        constructor() {
            super(...arguments);
            this._views = { main: NavView_1.default };
        }
        Start() {
            this._activeView.On('logout', () => __awaiter(this, void 0, void 0, function* () {
                yield User_1.default.Logout();
                Router_2.default.Navigate('/auth');
                Flash_2.default.flash = { type: 'success', message: 'Sikeres kijelentkezés' };
            }));
            if (User_1.default.IsEmployee()) {
                this._activeView.ShowEmployeeButton();
                this._activeView.On('employeeBtnClick', () => {
                    const today = new Date();
                    Router_2.default.Navigate('/admin/' + today.toISOString().split('T')[0]);
                });
            }
        }
    }
    exports.default = NavController;
});
define("controller/AppointmentController", ["require", "exports", "lib/framework/Controller", "lib/framework/Router", "model/Appointment", "model/User", "view/AppointmentView", "controller/layouts/FlashController", "controller/layouts/NavController"], function (require, exports, Controller_3, Router_3, Appointment_1, User_2, AppointmentView_1, FlashController_1, NavController_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    class AppointmentController extends Controller_3.default {
        constructor() {
            super(...arguments);
            this._views = { main: AppointmentView_1.default };
            this._layouts = {
                flash: FlashController_1.default,
                nav: NavController_1.default,
            };
            this._title = 'Időpont foglalás';
        }
        Start() {
            return __awaiter(this, void 0, void 0, function* () {
                const data = yield Appointment_1.default.GetFreeDates(Router_3.default.params.id, Router_3.default.params.date);
                this._activeView.UpdateHairdresser(data.freeDates, data.date, data.employee);
                this._activeView.On('dateChange', (data) => __awaiter(this, void 0, void 0, function* () {
                    const result = yield Appointment_1.default.GetFreeDates(Router_3.default.params.id, data.date);
                    this._activeView.UpdateHairdresser(result.freeDates, result.date, result.employee);
                }));
                this._activeView.On('dateSelect', (data) => {
                    this._selectedDate = data;
                    this._activeView.SetSelected(data);
                });
                this._activeView.On('bookNow', () => __awaiter(this, void 0, void 0, function* () {
                    const result = yield Appointment_1.default.BookNow(`${Router_3.default.params.date} ${this._selectedDate}`, User_2.default.user.id, Router_3.default.params.id);
                    if (!result)
                        throw new Error('hiba');
                    this._layouts.flash.AddFlash('success', `Sikeresen lefoglaltad a ${Router_3.default.params.date} ${this._selectedDate} időpontot!`);
                    Router_3.default.Navigate('/');
                }));
                this._activeView.On('cancle', () => Router_3.default.Navigate('/'));
            });
        }
    }
    exports.default = AppointmentController;
});
define("lib/framework/Validator", ["require", "exports", "lib/utils/selectors"], function (require, exports, selectors_5) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    class Validator {
        constructor(prefix) {
            this._errors = {};
            this._prefix = 'error-';
            this._emailRegex = /^[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+$/;
            if (!prefix)
                return;
            this._prefix = prefix;
            return this;
        }
        Validate(data) {
            for (const [key, array] of Object.entries(data)) {
                const value = array[0];
                const template = array[1].split('|');
                for (const v of template) {
                    this.Test(value, v.trim(), key);
                }
                if (array.length > 2) {
                    for (let i = 2; i < array.length; i++) {
                        if (this._errors[key])
                            break;
                        const regex = new RegExp(array[i][0]);
                        const errorMsg = array[i][1];
                        const not = array[i][2] === undefined ? true : array[i][2];
                        if (not) {
                            if (!regex.test(value))
                                this.AddError(key, errorMsg);
                        }
                        else if (regex.test(value))
                            this.AddError(key, errorMsg);
                    }
                }
                if (!this._errors[key])
                    this.AddError(key, true);
            }
            return this;
        }
        RenderErrors() {
            for (const [key, value] of Object.entries(this._errors)) {
                this.RenderError(key, value);
            }
            return this;
        }
        get errors() {
            return this._errors;
        }
        RenderError(name, error) {
            const errorDisplay = (0, selectors_5.$id)(`${this._prefix}${name}`);
            if (!errorDisplay)
                return;
            if (typeof error === 'boolean')
                return (errorDisplay.innerHTML = '');
            errorDisplay.innerHTML = error;
            return this;
        }
        ClearErrors() {
            for (const [key, value] of Object.entries(this._errors)) {
                const elem = (0, selectors_5.$id)(`${this._prefix}${key}`);
                if (elem)
                    elem.innerHTML = '';
            }
            this._errors = {};
            return this;
        }
        Test(value, v, key) {
            switch (true) {
                case value === '':
                    if (v.search('required') !== -1) {
                        this.AddError(key, `A mező kitöltése kötelező`);
                    }
                    break;
                case v.startsWith('max'):
                    try {
                        const num = v.split(':')[1].trim();
                        if (value.length > Number(num)) {
                            this.AddError(key, `Nem lehet hosszabb ${num} karakternél`);
                        }
                    }
                    catch (e) {
                        throw 'Invalid format';
                    }
                    break;
                case v.startsWith('min'):
                    try {
                        const num = v.split(':')[1].trim();
                        if (value.length < Number(num)) {
                            this.AddError(key, `Nem lehet rövidebb ${num} karakternél`);
                        }
                    }
                    catch (e) {
                        throw 'Invalid format';
                    }
                    break;
                case v === 'email':
                    if (this._emailRegex.test(value))
                        break;
                    this.AddError(key, `A megadott email formátum nem megfelelő`);
                    break;
            }
        }
        AddError(key, value) {
            if (this._errors[key])
                return;
            this._errors[key] = value;
        }
        hasError() {
            let error = false;
            for (const err of Object.values(this._errors)) {
                if (typeof err !== 'boolean') {
                    error = true;
                    break;
                }
            }
            return error;
        }
    }
    exports.default = Validator;
});
define("view/AuthView", ["require", "exports", "lib/framework/Validator", "lib/framework/View", "lib/utils/selectors"], function (require, exports, Validator_1, View_4, selectors_6) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    class AuthView extends View_4.default {
        constructor() {
            super(...arguments);
            this._htmlFileName = 'login';
        }
        Start() {
            this._loginViewBtn = (0, selectors_6.$id)('login-view-btn');
            this._registerViewBtn = (0, selectors_6.$id)('register-view-btn');
            this._doubleBox = (0, selectors_6.$id)('double-box');
            this._inputs = (0, selectors_6.$$)('.group-control');
            this._loginForm = (0, selectors_6.$id)('login-form');
            this._loginEmail = (0, selectors_6.$id)('login-email');
            this._loginPassword = (0, selectors_6.$id)('login-password');
            this._registerForm = (0, selectors_6.$id)('register-form');
            this._registerEmail = (0, selectors_6.$id)('register-email');
            this._registerPassword = (0, selectors_6.$id)('register-password');
            this._registerName = (0, selectors_6.$id)('register-name');
            this._registerTel = (0, selectors_6.$id)('register-tel');
            this.InitEvents();
        }
        InitEvents() {
            this._loginViewBtn.addEventListener('click', () => this._doubleBox.classList.remove('left-active'));
            this._registerViewBtn.addEventListener('click', () => this._doubleBox.classList.add('left-active'));
            this._loginForm.addEventListener('submit', (e) => {
                e.preventDefault();
                const validator = new Validator_1.default();
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
                    .RenderErrors();
                if (validator.hasError())
                    return;
                this.Emit('login', {
                    email: this._loginEmail.value,
                    password: this._loginPassword.value,
                });
            });
            this._registerForm.addEventListener('submit', (e) => {
                e.preventDefault();
                const validator = new Validator_1.default();
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
                    .RenderErrors();
                if (validator.hasError())
                    return;
                this.Emit('register', {
                    email: this._registerEmail.value,
                    password: this._registerPassword.value,
                    tel: this._registerTel.value,
                    name: this._registerName.value,
                });
            });
            this._inputs.forEach((inp) => {
                inp.addEventListener('focus', (e) => {
                    inp.classList.add('focus');
                });
                inp.addEventListener('blur', (e) => {
                    if (inp.value.length === 0)
                        inp.classList.remove('focus');
                });
            });
        }
        RenderLoginErrors(errors) {
            if (typeof errors === 'object') {
                for (const [key, value] of Object.entries(errors)) {
                    (0, selectors_6.$id)(`error-login-${key}`).innerHTML = value.toString();
                }
                return;
            }
            (0, selectors_6.$id)('error-login-email').innerHTML = errors.toString();
        }
        RenderRegisterErrors(errors) {
            if (!errors)
                return;
            (0, selectors_6.$id)(`error-register-email`).innerHTML = '';
            (0, selectors_6.$id)(`error-register-password`).innerHTML = '';
            (0, selectors_6.$id)(`error-register-tel`).innerHTML = '';
            (0, selectors_6.$id)(`error-register-name`).innerHTML = '';
            for (const [key, value] of Object.entries(errors)) {
                (0, selectors_6.$id)(`error-register-${key}`).innerHTML =
                    value === 'busy' ? `A megadot ${key} foglalt` : value.toString();
            }
        }
    }
    exports.default = AuthView;
});
define("view/layouts/SpinnerView", ["require", "exports", "lib/framework/View"], function (require, exports, View_5) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    class SpinnerView extends View_5.default {
        constructor() {
            super(...arguments);
            this._htmlFileName = 'spinner';
            this._root = 'spinner';
        }
    }
    exports.default = SpinnerView;
});
define("controller/layouts/SpinnerController", ["require", "exports", "lib/framework/Controller", "view/layouts/SpinnerView"], function (require, exports, Controller_4, SpinnerView_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    class SpinnerController extends Controller_4.default {
        constructor() {
            super(...arguments);
            this._views = { main: SpinnerView_1.default };
        }
        Hide() {
            this._activeView.Hide();
        }
        Show() {
            this._activeView.Show();
        }
    }
    exports.default = SpinnerController;
});
define("controller/AuthController", ["require", "exports", "lib/framework/Controller", "lib/framework/Router", "model/User", "view/AuthView", "controller/layouts/FlashController", "controller/layouts/SpinnerController"], function (require, exports, Controller_5, Router_4, User_3, AuthView_1, FlashController_2, SpinnerController_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    class AuthController extends Controller_5.default {
        constructor() {
            super(...arguments);
            this._views = { main: AuthView_1.default };
            this._layouts = {
                spinner: SpinnerController_1.default,
                flash: FlashController_2.default,
            };
            this._title = 'Hitelesítés';
            this.LoginHandler = (data) => __awaiter(this, void 0, void 0, function* () {
                this._layouts.spinner.Show();
                const result = yield User_3.default.Login(data);
                if (!result.success) {
                    this._layouts.spinner.Hide();
                    this._activeView.RenderLoginErrors(result.errors || result.error);
                    return;
                }
                Router_4.default.Navigate('/');
            });
            this.RegisterHandler = (data) => __awaiter(this, void 0, void 0, function* () {
                this._layouts.spinner.Show();
                const res = yield User_3.default.Register(data);
                this._layouts.spinner.Hide();
                if (!res.success) {
                    return this._activeView.RenderRegisterErrors(res.errors);
                }
                this._layouts.flash.AddFlash('success', `Sikeresen regisztráció!`);
                Router_4.default.Navigate('/');
            });
        }
        Start() {
            this._activeView.On('login', this.LoginHandler);
            this._activeView.On('register', this.RegisterHandler);
        }
    }
    exports.default = AuthController;
});
define("view/admin/DateView", ["require", "exports", "lib/framework/View", "lib/utils/selectors"], function (require, exports, View_6, selectors_7) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    class BooksView extends View_6.default {
        constructor() {
            super(...arguments);
            this._htmlFileName = 'admin';
            this.CloseMenu = (e) => {
                const target = e.target;
                if (this.adminMenu.contains(target))
                    return;
                this.adminMenu.style.display = 'none';
            };
        }
        RenderAppointments(appointments, date) {
            const colorHexs = [
                ['#5D84FE', 'white'],
                ['#8FEFE1', '#7D9CFE'],
                ['#FFC938', 'white'],
                ['#E4E4FF', '#7D9CFE'],
                ['#FF4B55', 'white'],
            ];
            const datePicker = (0, selectors_7.$id)('date');
            datePicker.value = date;
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
                                      </div>`;
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
                  </div>`;
                for (const app of appointment.appointment) {
                    if (app === null) {
                        html += `<div class="cel"></div>`;
                        continue;
                    }
                    const color = colorHexs[Math.floor(Math.random() * colorHexs.length)];
                    html += `<div style="pointer-events: auto" data-username="${app.user.full_name}" data-date="${app.date}" data-id="${appointment.id}" class="cel${app.size ? '-' + app.size : ''} busy">
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
                    <div class="date">${app.size && app.size > 3 ? app.date : ''}</div>
                  </div>
                </div>`;
                }
                html += `</div>`;
                this.dateContainer.insertAdjacentHTML('beforeend', html);
            }
        }
        Start() {
            this.dateContainer = (0, selectors_7.$id)('appointments');
            this.adminMenu = (0, selectors_7.$id)('admin-menu');
            this.InitEvents();
        }
        InitEvents() {
            const date = (0, selectors_7.$id)('date');
            date.addEventListener('click', (e) => {
                date.showPicker();
            });
            date.addEventListener('change', (e) => {
                this.Emit('dateChange', { date: e.target.value });
            });
            this.adminMenu.addEventListener('click', (e) => {
                const target = e.target;
                if (!target.classList.contains('delet-appointment-js'))
                    return;
                const name = target.getAttribute('data-name');
                const date = target.getAttribute('data-date');
                const localeDateString = new Date(date).toLocaleString();
                const id = target.getAttribute('data-id');
                const confirmation = confirm(`Biztosan törlöd az alábi időpontot? ${name} - ${localeDateString}`);
                if (!confirmation)
                    return;
                this.Emit('delete', { id, date });
            });
            this.dateContainer.addEventListener('contextmenu', (e) => {
                e.preventDefault();
                const target = e.target;
                const name = target.getAttribute('data-username');
                const date = target.getAttribute('data-date');
                const localeDate = new Date(date).toLocaleString();
                const id = target.getAttribute('data-id');
                if (!name)
                    return;
                this.adminMenu.style.display = 'flex';
                this.adminMenu.style.top = e.clientY + 'px';
                this.adminMenu.style.left = e.clientX + 'px';
                this.adminMenu.innerHTML = `<p>${name}</p><p>${localeDate}</p><button data-id="${id}" data-name="${name}" data-date="${date}" class="danger delet-appointment-js">törlés</button>`;
            });
            this.adminMenu.addEventListener('contextmenu', (e) => e.preventDefault());
            document.body.addEventListener('click', this.CloseMenu);
        }
        Destroy() {
            document.body.removeEventListener('click', this.CloseMenu);
        }
    }
    exports.default = BooksView;
});
define("controller/admin/DateController", ["require", "exports", "lib/framework/Controller", "lib/framework/Router", "model/Appointment", "view/admin/DateView"], function (require, exports, Controller_6, Router_5, Appointment_2, DateView_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    class BooksController extends Controller_6.default {
        constructor() {
            super(...arguments);
            this._views = { main: DateView_1.default };
            this._title = 'Admin - Időpontok';
            this.DatesHandler = () => __awaiter(this, void 0, void 0, function* () {
                const employees = yield Appointment_2.default.GetAppointments(Router_5.default.params.date);
                const startOfWorkHours = '9:00';
                const endOfWorkHours = '17:00';
                const step = 30;
                const dateOfStart = new Date(Router_5.default.params.date);
                const dateOfEnd = new Date(Router_5.default.params.date);
                dateOfStart.setHours(Number(startOfWorkHours.split(':')[0]), Number(startOfWorkHours.split(':')[1]), 0);
                dateOfEnd.setHours(Number(endOfWorkHours.split(':')[0]), Number(endOfWorkHours.split(':')[1]), 0);
                const dateOfEndMs = dateOfEnd.getTime();
                const dateOfStartMs = dateOfStart.getTime();
                const array = [];
                const lastIndex = (dateOfEndMs - dateOfStartMs) / (1000 * 60 * step);
                for (const employee of employees) {
                    const data = {};
                    let index = 0;
                    data.name = employee.name;
                    data.img = employee.img;
                    data.id = employee._id;
                    data.appointment = [];
                    for (const [i, appointment] of employee.appointments.entries()) {
                        const app = {};
                        const d = new Date(appointment.date).getTime();
                        app.user = appointment.user;
                        app.id = appointment._id;
                        app.startIndex =
                            (d - dateOfStartMs + 1000 * 60 * step) / (1000 * 60 * step);
                        app.date = appointment.date;
                        for (let i = index; i < app.startIndex - 1; i++) {
                            data.appointment.push(null);
                        }
                        index = app.startIndex;
                        data.appointment.push(app);
                        if (i === employee.appointments.length - 1) {
                            for (let i = 0; data.appointment.length < lastIndex; i++) {
                                data.appointment.push(null);
                            }
                        }
                    }
                    array.push(data);
                }
                this._activeView.RenderAppointments(array, Router_5.default.params.date);
            });
        }
        Start() {
            return __awaiter(this, void 0, void 0, function* () {
                this.DatesHandler();
                this._activeView.On('dateChange', (e) => {
                    Router_5.default.UpdateParams('date', e.date);
                    this.DatesHandler();
                });
                this._activeView.On('delete', (data) => __awaiter(this, void 0, void 0, function* () {
                    const res = yield Appointment_2.default.DeletAppointment(data.id, data.date);
                    if (!res.success)
                        return;
                    this.DatesHandler();
                }));
            });
        }
    }
    exports.default = BooksController;
});
define("view/HairdressersView", ["require", "exports", "lib/framework/View", "lib/utils/selectors"], function (require, exports, View_7, selectors_8) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    class HairdressersView extends View_7.default {
        constructor() {
            super(...arguments);
            this._htmlFileName = 'hairdressers';
        }
        RenderHairdressers(hairdressers) {
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
                    </div>`;
                (0, selectors_8.$id)('hairdressers').insertAdjacentHTML('beforeend', html);
            }
        }
        Start() {
            (0, selectors_8.$id)('hairdressers').addEventListener('click', (e) => {
                const target = e.target;
                const id = target.getAttribute('data-id');
                if (!id)
                    return;
                this.Emit('appointment', { id });
            });
        }
    }
    exports.default = HairdressersView;
});
define("controller/HairdressersController", ["require", "exports", "lib/framework/Controller", "lib/framework/Router", "model/Hairdresser", "view/HairdressersView", "controller/layouts/FlashController", "controller/layouts/NavController"], function (require, exports, Controller_7, Router_6, Hairdresser_1, HairdressersView_1, FlashController_3, NavController_2) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    class HairdressersController extends Controller_7.default {
        constructor() {
            super(...arguments);
            this._views = { main: HairdressersView_1.default };
            this._layouts = {
                nav: NavController_2.default,
                flash: FlashController_3.default,
            };
            this._title = 'Fordrászaink';
        }
        Start() {
            return __awaiter(this, void 0, void 0, function* () {
                const hairdressers = yield Hairdresser_1.default.GetHairdressers();
                this._activeView.RenderHairdressers(hairdressers);
                this._activeView.On('appointment', (data) => {
                    const today = new Date();
                    today.setTime(today.getTime() + 1000 * 60 * 60 * 24);
                    const route = `/appointment/${data.id}/${today.toISOString().split('T')[0]}`;
                    Router_6.default.Navigate(route);
                });
            });
        }
    }
    exports.default = HairdressersController;
});
define("view/NotFoundView", ["require", "exports", "lib/framework/View"], function (require, exports, View_8) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    class NotFoundView extends View_8.default {
        constructor() {
            super(...arguments);
            this._htmlFileName = '404';
        }
    }
    exports.default = NotFoundView;
});
define("view/layouts/FooterView", ["require", "exports", "lib/framework/View"], function (require, exports, View_9) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    class FooterView extends View_9.default {
        constructor() {
            super(...arguments);
            this._htmlFileName = 'footer';
            this._root = 'footer';
        }
    }
    exports.default = FooterView;
});
define("controller/layouts/FooterController", ["require", "exports", "lib/framework/Controller", "view/layouts/FooterView"], function (require, exports, Controller_8, FooterView_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    class FooterController extends Controller_8.default {
        constructor() {
            super(...arguments);
            this._views = { main: FooterView_1.default };
        }
    }
    exports.default = FooterController;
});
define("controller/NotFoundController", ["require", "exports", "lib/framework/Controller", "view/NotFoundView", "controller/layouts/NavController"], function (require, exports, Controller_9, NotFoundView_1, NavController_3) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    class NotFoundController extends Controller_9.default {
        constructor() {
            super(...arguments);
            this._views = { main: NotFoundView_1.default };
            this._layouts = {
                nav: NavController_3.default,
            };
            this._title = '404';
        }
    }
    exports.default = NotFoundController;
});
define("lib/middlewares/auth", ["require", "exports", "model/User", "lib/framework/Router"], function (require, exports, User_4, Router_7) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.default = auth;
    function auth() {
        return __awaiter(this, void 0, void 0, function* () {
            const state = yield User_4.default.IsLoggedIn();
            if (!state)
                Router_7.default.Navigate('/auth');
            return state;
        });
    }
});
define("lib/middlewares/employee", ["require", "exports", "model/User", "lib/framework/Router"], function (require, exports, User_5, Router_8) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.default = employee;
    function employee() {
        const employee = User_5.default.IsEmployee();
        if (!employee) {
            Router_8.default.Navigate('/');
            return false;
        }
        return true;
    }
});
define("lib/middlewares/guest", ["require", "exports", "model/User", "lib/framework/Router"], function (require, exports, User_6, Router_9) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.default = guest;
    function guest() {
        return __awaiter(this, void 0, void 0, function* () {
            const state = yield User_6.default.IsLoggedIn();
            if (state)
                Router_9.default.Navigate('/');
            return !state;
        });
    }
});
define("main", ["require", "exports", "controller/AppointmentController", "controller/AuthController", "controller/admin/DateController", "controller/HairdressersController", "controller/NotFoundController", "lib/framework/Router", "lib/middlewares/auth", "lib/middlewares/employee", "lib/middlewares/guest"], function (require, exports, AppointmentController_1, AuthController_1, DateController_1, HairdressersController_1, NotFoundController_1, Router_10, auth_1, employee_1, guest_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    Router_10.default.notFoundController = NotFoundController_1.default;
    Router_10.default.AddRoute({
        route: '/auth',
        controller: AuthController_1.default,
        middlewares: [guest_1.default],
    });
    Router_10.default.AddRoute({
        route: '/',
        controller: HairdressersController_1.default,
        middlewares: [auth_1.default],
    });
    Router_10.default.AddRoute({
        route: '/appointment/:id/:date',
        controller: AppointmentController_1.default,
        middlewares: [auth_1.default],
    });
    Router_10.default.AddRoute({
        route: '/admin/:date',
        controller: DateController_1.default,
        middlewares: [auth_1.default, employee_1.default],
    });
    Router_10.default.Run();
});
//# sourceMappingURL=main.js.map