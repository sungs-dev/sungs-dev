import axios from 'axios';

const handler = async (m, { args }) => {
  // Validaciones básicas
  const enlace = args[0]?.trim();

  if (!enlace) {
    return m.reply('👑 Debes escribir el enlace del canal de WhatsApp.');
  }
  if (!/^https:\/\/whatsapp\.com\/channel\//.test(enlace)) {
    return m.reply('❌ Solo se permiten enlaces de canales de WhatsApp.');
  }

  // Datos de APIs
  const api1 = "https://api.stellarwa.xyz/whatsapp/channel-info";
  const api2 = "https://rest.alyabotpe.xyz/whatsapp/channel-info";
  const key1 = "stellar-5ny4YdAV";
  const key2 = "stellar-0QNEPI8v";
  const url = encodeURIComponent(enlace);

  // Función para obtener info con fallback
  const getInfo = async () => {
    try {
      const res = await axios.get(`${api1}?url=${url}&key=${key1}`);
      if (res.data?.status) return res.data;
    } catch (e) {}
    // Fallback
    try {
      const res = await axios.get(`${api2}?url=${url}&key=${key2}`);
      if (res.data?.status) return res.data;
    } catch (e) {}
    return null;
  };

  const info = await getInfo();
  if (!info || !info.result) {
    return m.reply('❌ Ocurrió un error al obtener la información del canal.');
  }

  const canal = info.result;
  let msg = `🌐 *Información del Canal de WhatsApp*\n\n`;
  if (canal.preview) msg += `🖼️ Imagen: ${canal.preview}\n`;
  msg += `📄 *Nombre:* ${canal.name}\n`;
  msg += `👤 *Creador:* ${info.creator ?? 'Desconocido'}\n`;
  msg += `🟢 *Estado:* ${canal.state}\n`;
  if (canal.description) msg += `📝 *Descripción:*\n${canal.description}\n`;
  msg += `👥 *Suscriptores:* ${canal.subscribers}\n`;
  msg += `🔗 Enlace: https://whatsapp.com/channel/${canal.invite}\n`;
  msg += `🔑 Verificación: ${canal.verification}\n`;

  m.reply(msg);
};

// Define el patrón de comando al final del archivo
handler.command = /^inspect$/i;

export default handler;