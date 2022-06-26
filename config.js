import { fileURLToPath } from 'url'
import { dirname } from 'path'

export default {
  basePath: dirname(fileURLToPath(import.meta.url)),
  workingTime: [
    {
      name: 'vasárnap',
      from: false,
      to: false,
    },
    {
      name: 'hétfő',
      from: '9:00',
      to: '17:00',
    },
    {
      name: 'kedd',
      from: '9:00',
      to: '17:00',
    },
    {
      name: 'szerda',
      from: '9:00',
      to: '17:00',
    },
    {
      name: 'csütörtök',
      from: '9:00',
      to: '17:00',
    },
    {
      name: 'péntek',
      from: '9:00',
      to: '17:00',
    },
    {
      name: 'szombat',
      from: '9:00',
      to: '17:00',
    },
  ],
  holidays: ['2022-12-24', '2022-12-25', '2022-12-26'],
}
