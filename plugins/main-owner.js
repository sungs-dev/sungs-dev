let handler = async (m, { conn }) => {
  // Reacciona con 🌟
  if (conn.sendMessage) {
    await conn.sendMessage(m.chat, { react: { text: '🌟', key: m.key }});
  }

  // Datos del owner
  let numberOwner = '18094374392' // Número del dueño (owner)
  let nombreOwner = '🍃 C R E A D O R 🍃'

  // vCard del owner
  let vcardOwner = `BEGIN:VCARD
VERSION:3.0
N:${nombreOwner}
FN:${nombreOwner}
TEL;waid=${numberOwner}:${numberOwner}
END:VCARD`

  // Envía el mensaje de aviso
  await conn.sendMessage(m.chat, { text: `*🍃 Aqui está el número de mi dueño.*` }, { quoted: m })

  // Envía solo la tarjeta de contacto del owner
  await conn.sendMessage(m.chat, {
    contacts: {
      displayName: 'Contacto del Creador',
      contacts: [
        { vcard: vcardOwner }
      ]
    }
  }, { quoted: m })
}

handler.help = ['owner']
handler.tags = ['main']
handler.command = ['owner', 'creator', 'creador', 'dueño']

export default handler