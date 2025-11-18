import fetch from 'node-fetch';

/* URL de la API (tal como la diste) */
const CLAUDE_API_URL = 'https://api-adonix.ultraplus.click/ai/gemini?apikey=AdonixKeyd6ne2h9555';

export const handler = async (m, { conn, args, text }) => {
  try {
    const input = (text && text.trim()) || (args && args.join(' ').trim()) || '';

    if (!input) {
      // Usuario no escribió texto tras el comando
      return await conn.reply(m.chat, '👑 Ingresa un texto para generar la respuesta de la IA.', m, rcanal);
    }

    // Aviso al usuario que se está procesando la solicitud
    await conn.reply(m.chat, '🌟 Enviando tu solicitud a *GEMINI.* Por favor espera...', m, rcanal);

    // Intentamos enviar la petición POST con JSON { prompt: input }
    // (La forma exacta de la API no estaba documentada; este formato es genérico)
    const res = await fetch(CLAUDE_API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ prompt: input })
    });

    if (!res.ok) {
      const txt = await res.text().catch(() => '');
      return await conn.reply(m.chat, `😔 Error al conectar con la IA: ${res.status} ${res.statusText}\n${txt}`, m, rcanal);
    }

    const data = await res.json().catch(() => null);

    // Extraemos la respuesta en varios formatos posibles que la API podría devolver
    let aiResponse = '';
    if (!data) {
      aiResponse = '😔 La IA devolvió una respuesta vacía.';
    } else if (typeof data === 'string') {
      aiResponse = data;
    } else if (data.response) {
      aiResponse = data.response;
    } else if (data.output && (data.output.text || data.output[0])) {
      aiResponse = data.output.text || (Array.isArray(data.output) ? data.output[0] : '');
    } else if (data.result) {
      aiResponse = data.result;
    } else {
      // fallback: stringify todo el objeto
      aiResponse = JSON.stringify(data, null, 2);
    }

    // Enviamos la respuesta de la IA citando el mensaje original (m)
    await conn.reply(m.chat, aiResponse, m);

    // También (opcional) puedes enviar un mensaje privado al autor con la respuesta,
    // ejemplo de uso parecido a otros handlers previos:
    // await conn.sendMessage(m.sender, { text: `*👑 GEMINI 👑*\n\n${aiResponse}` }, { quoted: m });

  } catch (error) {
    await conn.reply(m.chat, `🌟 Error al procesar la solicitud de la IA: ${error.message}`, m, rcanal);
  }
};

handler.help = ['ia <texto>'];
handler.tags = ['ia', 'ai'];
handler.command = ['ia', 'ai'];
handler.group = true;
export default handler;