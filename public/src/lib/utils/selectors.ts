/**
 * Megkeresi az első elemet amely rendelkezik a 'selector' classal majd visszatér vele;
 *
 * @param selector
 * @returns
 */
const $ = (selector: string) => document.querySelector(selector)
/**
 * Megkeresi az összes elemet amely rendelkezik a 'selector' classal majd visszatér velük;
 *
 * @param selector
 * @returns
 */
const $$ = (selector: string) => document.querySelectorAll(selector)
/**
 * Megkeresi az adott id alapján az elemet és visszatér vele;
 * @param id
 * @returns
 */
const $id = (id: string): HTMLElement => document.getElementById(id)

export { $, $$, $id }
