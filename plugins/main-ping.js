// ping.js - handler para Baileys (usa conn.reply(m.chat, text, m, rcanal))
const defaultRcanal = {
  isForwarded: true,
  forwardingScore: 999,
  externalAdReply: {
    showAdAttribution: true,
    title: 'Canal',
    body: 'Reenviado desde canal',
    thumbnailUrl: 'https://i.imgur.com/tuMiniatura.png',
    sourceUrl: 'https://youtube.com/tuEnlaceOcanal'
  }
};

const handler = async (m, { conn, rcanal } = {}) => {
  try {
    const start = Date.now();
    // cálculo inmediato; forzamos mínimo 33 ms como pediste
    let latency = Date.now() - start;
    latency = Math.max(latency, 33);
    const text = `¡pong! (${latency} ms`; // exactamente en el formato que pediste

    // Llamada tal cual -> '¡pong! (X ms', m, rcanal)
    await conn.reply(m.chat, text, m, rcanal || defaultRcanal);
  } catch (err) {
    console.error(err);
    try {
      await conn.reply(m.chat, 'Error al calcular ping', m, rcanal || defaultRcanal);
    } catch {}
  }
};

handler.command = ['p', 'ping'];
export default handler;