const handler = async (m, { args, participants }) => {
  // Estructura: #formarsala 12vs12|18:00|México vs Chile
  const entrada = args.join(' ').trim();
  if (!entrada) return m.reply('*⚠️ Debes escribir el formato: #formarsala <vs ejemplo 1vs1|hora|clanes/países>*');
  
  const [vsRaw, horaRaw, paisRaw] = entrada.split('|').map(v => v?.trim());
  if (!vsRaw || !horaRaw || !paisRaw) return m.reply('*⚠️ Escribe todos los parámetros: VS|Hora|Países/Clanes*');
  
  // Extrae el número de jugadores por equipo
  const vsMatch = vsRaw.match(/^(\d+)\s*vs\s*(\d+)$/i);
  if (!vsMatch) return m.reply('*⚠️ El primer parámetro debe ser formato NºvsNº, ejemplo: 5vs5*');
  
  const numA = parseInt(vsMatch[1]);
  const numB = parseInt(vsMatch[2]);

  // Usuarios del grupo (filtra solo usuarios no bots)
  let members = (participants || []).filter(u => !u.isAdmin && !u.isSuperAdmin && u.id && u.name);
  // Puedes ajustar filtro si quieres incluir admins, solo elimina el filtro de admin/superadmin
  let nombres = members.map(u => u.name);

  // Total requeridos + 2 suplentes
  const totalNecesarios = numA + numB + 2;

  // No hay suficientes usuarios
  if (nombres.length < totalNecesarios) {
    return m.reply(`👑 En el grupo debe estar la cantidad de usuarios proporcionada más 2 usuarios más.\nNecesarios: ${totalNecesarios}\nEn el grupo: ${nombres.length}`);
  }

  // Mezcla aleatoriamente y selecciona
  nombres = nombres.sort(() => Math.random() - 0.5);
  const equipoA = nombres.slice(0, numA);
  const equipoB = nombres.slice(numA, numA + numB);
  const suplentes = nombres.slice(numA + numB, numA + numB + 2);

  let msg = 
`*${vsRaw}*\n
*⏰ Horario:* ${horaRaw}
*🏙 Países/Clanes:* ${paisRaw}\n
`;

  msg += `👑 *Equipo 1 (${numA} jugadores)*\n` + equipoA.map(n => `👑 ${n}`).join('\n') + '\n\n';
  msg += `👑 *Equipo 2 (${numB} jugadores)*\n` + equipoB.map(n => `👑 ${n}`).join('\n') + '\n\n';
  msg += `- Suplentes:\n` + suplentes.map(n => `🌟 ${n}`).join('\n');

  m.reply(msg);
};

handler.command = /^formarsala$/i;
handler.group = true;

export default handler;