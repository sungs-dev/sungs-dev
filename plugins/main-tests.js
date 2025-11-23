import fs from 'fs'
import { join } from 'path'
import { xpRange } from '../lib/levelling.js'

const tags = {
  serbot: '𝐒𝐮𝐛-𝐁𝐨𝐭𝐬',
  downloader: '𝐃𝐞𝐬𝐜𝐚𝐫𝐠𝐚𝐬',
  tools: '𝐓𝐨𝐨𝐥𝐬',
  owner: '𝐎𝐰𝐧𝐞𝐫',
  info: '𝐈𝐦𝐟𝐨𝐫𝐦𝐚𝐜𝐢𝐨́𝐧',
  group: '𝐆𝐫𝐮𝐩𝐨𝐬',
  search: '𝐒𝐞𝐚𝐫𝐜𝐡𝐬',
  sticker: '𝐒𝐭𝐢𝐜𝐤𝐞𝐫𝐬',
  ia: '𝐈 - 𝐀',
}

const defaultMenu = {
  before: `
𝐇𝐨𝐥𝐚 @%taguser 𝐒𝐨𝐲 %botname

╭⬣「 ✰𝐈𝐧𝐟𝐨-𝐁𝐨𝐭✰ 」⬣
│⁖ฺ۟̇࣪·֗Creador: Félix
│⁖ฺ۟̇࣪·֗Actividad: %uptime
│⁖ฺ۟̇࣪·֗Registros: %totalreg
│⁖ฺ۟̇࣪·֗Comandos: %totalcomand
╰─⬣

╭⬣「 ✰𝐈𝐧𝐟𝐨-𝐔𝐬𝐞𝐫✰ 」⬣
│⁖ฺ۟̇࣪·֗Nombre: %name
│⁖ฺ۟̇࣪·֗Rango: %role
│⁖ฺ۟̇࣪·֗Nivel: %level
╰─⬣
`.trimStart(),
  header: '╭⬣「 ✰%category✰ 」⬣',
  body: '│⁖ฺ۟̇࣪·֗٬̤⃟🩵 %cmd %islimit %isPremium',
  footer: '╰─⬣\n',
  after: '> Ⓒ︎ 𝑃ᴏ𝗐𝖾𝗋𝖾𝖽 𝐵ʏ 𝙵𝚎𝚕𝚒𝚡\n%readmore'.trimStart()
}

const handler = async (m, { conn, usedPrefix: _p }) => {
  try {
    const { exp, limit, level } = global.db.data.users[m.sender]
    const { min, xp, max } = xpRange(level, global.multiplier)
    const name = await conn.getName(m.sender)

    const d = new Date(Date.now() + 3600000)
    const locale = 'es'
    const week = d.toLocaleDateString(locale, { weekday: 'long' })
    const date = d.toLocaleDateString(locale, { day: 'numeric', month: 'long', year: 'numeric' })
    const time = d.toLocaleTimeString(locale, { hour: 'numeric', minute: 'numeric' })

    const totalreg = Object.keys(global.db.data.users).length
    const rtotalreg = Object.values(global.db.data.users).filter(user => user.registered).length

    const help = Object.values(global.plugins).filter(plugin => !plugin.disabled).map(plugin => ({
      help: Array.isArray(plugin.help) ? plugin.help : [plugin.help],
      tags: Array.isArray(plugin.tags) ? plugin.tags : [plugin.tags],
      prefix: 'customPrefix' in plugin,
      limit: plugin.limit,
      premium: plugin.premium
    }))

    const totalcomand = help.map(h => h.help.length).reduce((a, b) => a + b, 0)
    const role = global.db.data.users[m.sender]?.role || 'Usuario'

    let nombreBot = global.namebot || 'Bot'
    let bannerFinal = './storage/img/menu.jpg'

    const botActual = conn.user?.jid?.split('@')[0].replace(/\D/g, '')
    const configPath = join('./JadiBots', botActual, 'config.json')
    if (fs.existsSync(configPath)) {
      try {
        const config = JSON.parse(fs.readFileSync(configPath))
        if (config.name) nombreBot = config.name
        if (config.banner) bannerFinal = config.banner
      } catch (err) {
        console.log('「🩵」 No se pudo leer config del subbot:', err)
      }
    }

    const esPrincipal = botActual === '+18293142989'.replace(/\D/g, '')
    const tipoBot = esPrincipal ? '*Bot:* OficialBot' : '*Bot:* Sub-Bot'

    const menuConfig = conn.menu || defaultMenu
    const _text = [
      tipoBot,
      menuConfig.before,
      ...Object.keys(tags).map(tag => {
        return [
          menuConfig.header.replace(/%category/g, tags[tag]),
          help.filter(menu => menu.tags?.includes(tag)).map(menu => {
            return menu.help.map(helpText => {
              return menuConfig.body
                .replace(/%cmd/g, menu.prefix ? helpText : `${_p}${helpText}`)
                .replace(/%islimit/g, menu.limit ? '◜🩵◞' : '')
                .replace(/%isPremium/g, menu.premium ? '◜🏆◞' : '')
                .trim()
            }).join('\n')
          }).join('\n'),
          menuConfig.footer
        ].join('\n')
      }),
      menuConfig.after
    ].join('\n')

    const replace = {
      '%': '%',
      p: _p,
      botname: nombreBot,
      taguser: m.sender.split('@')[0],
      exp: exp - min,
      maxexp: xp,
      totalexp: exp,
      xp4levelup: max - exp,
      level,
      limit,
      name,
      week,
      date,
      time,
      totalreg,
      rtotalreg,
      totalcomand,
      uptime: clockString(process.uptime() * 1000),
      role,
      readmore: readMore,
      greeting,
    }

    const text = _text.replace(
      new RegExp(`%(${Object.keys(replace).sort((a, b) => b.length - a.length).join('|')})`, 'g'),
      (_, name) => String(replace[name])
    )

    const isURL = typeof bannerFinal === 'string' && /^https?:\/\//i.test(bannerFinal)
    const imageContent = isURL ? { image: { url: bannerFinal } } : { image: fs.readFileSync(bannerFinal) }

    const rcanal = {
      contextInfo: {
        isForwarded: true,
        forwardedNewsletterMessageInfo: {
          newsletterJid: channelRD.id,
          serverMessageId: 100,
          newsletterName: global.channelRD
        }
      }
    }

    await conn.sendMessage(m.chat, {
      ...imageContent,
      caption: text.trim(),
      ...rcanal
    }, { quoted: m })

  } catch (e) {
    console.error('❌ Error en el menú:', e)
    conn.reply(m.chat, '❎ Lo sentimos, el menú tiene un error.', m)
  }
}

handler.command = ['menutedt', 'helptest', 'menútest']
export default handler

// Utilidades
const more = String.fromCharCode(8206)
const readMore = more.repeat(4001)

function clockString(ms) {
  let h = isNaN(ms) ? '--' : Math.floor(ms / 3600000)
  let m = isNaN(ms) ? '--' : Math.floor(ms / 60000) % 60
  let s = isNaN(ms) ? '--' : Math.floor(ms / 1000) % 60
  return [h, m, s].map(v => v.toString().padStart(2, '0')).join(':')
}

const ase = new Date()
let hour = ase.getHours()
const greetingMap = {
  0: 'una linda noche 🌙', 1: 'una linda noche 💤', 2: 'una linda noche 🦉',
  3: 'una linda mañana ✨', 4: 'una linda mañana 💫', 5: 'una linda mañana 🌅',
  6: 'una linda mañana 🌄', 7: 'una linda mañana 🌅', 8: 'una linda mañana 💫',
  9: 'una linda mañana ✨', 10: 'un lindo día 🌞', 11: 'un lindo día 🌨',
  12: 'un lindo día ❄', 13: 'un lindo día 🌤', 14: 'una linda tarde 🌇',
  15: 'una linda tarde 🥀', 16: 'una linda tarde 🌹', 17: 'una linda tarde 🌆',
  18: 'una linda noche 🌙', 19: 'una linda noche 🌃', 20: 'una linda noche 🌌',
  21: 'una linda noche 🌃', 22: 'una linda noche 🌙', 23: 'una linda noche 🌃',
}
var greeting = 'espero que tengas ' + (greetingMap[hour] || 'un buen día')