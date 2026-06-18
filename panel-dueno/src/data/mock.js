export const TURNOS_HOY = [
  { hora: '14:40', nombre: 'Martín G.',     servicio: 'Corte + barba',        precio: 20000, estado: 'hecho', tipo: 'nuevo' },
  { hora: '15:20', nombre: 'Tomás R.',      servicio: 'Corte',                precio: 14000, estado: 'actual', tipo: 'nuevo' },
  { hora: '16:00', nombre: 'Andrés Sosa',   servicio: 'Corte · todos los sáb', precio: 14000, estado: 'pendiente', tipo: 'fijo' },
  { hora: '16:40', nombre: null,            servicio: null,                   precio: null,  estado: 'libre', tipo: null },
  { hora: '17:00', nombre: 'Diego & Benja', servicio: 'Promo padre/hijo',     precio: 26000, estado: 'pendiente', tipo: 'nuevo' },
  { hora: '17:40', nombre: 'Carlos M.',     servicio: 'Corte',                precio: 14000, estado: 'pendiente', tipo: 'nuevo' },
  { hora: '18:20', nombre: null,            servicio: null,                   precio: null,  estado: 'libre', tipo: null },
  { hora: '19:00', nombre: 'Roberto Díaz',  servicio: 'Corte + barba',        precio: 20000, estado: 'pendiente', tipo: 'fijo' },
]

export const SEMANA = [
  { dia: 'Lun', num: 16, turnos: 6, libres: 2, bloques: ['ocu','lib','ocu','fijo','lib','ocu'] },
  { dia: 'Mar', num: 17, turnos: 5, libres: 3, bloques: ['lib','ocu','lib','ocu','ocu'] },
  { dia: 'Mié', num: 18, turnos: 7, libres: 1, bloques: ['ocu','ocu','lib','ocu','ocu','fijo'] },
  { dia: 'Jue', num: 19, turnos: 4, libres: 4, bloques: ['lib','ocu','lib','lib','ocu'] },
  { dia: 'Vie', num: 19, turnos: 8, libres: 0, bloques: ['ocu','ocu','ocu','fijo','ocu','ocu'] },
  { dia: 'Sáb', num: 20, turnos: 8, libres: 2, hoy: true, bloques: ['ocu','lib','ocu','fijo','ocu','lib','ocu'] },
]

export const CLIENTES_FIJOS = [
  { iniciales: 'AS', nombre: 'Andrés Sosa',       servicio: 'Corte',        telefono: '+54 9 11 2345-6789', recurrencia: 'Todos los sábados · 16:00', proximo: 'hoy',    activo: true,  color: '#21458F' },
  { iniciales: 'RD', nombre: 'Roberto Díaz',       servicio: 'Corte + barba',telefono: '+54 9 11 6677-8899', recurrencia: 'Todos los viernes · 18:00', proximo: 'vie 26', activo: true,  color: '#CE2434' },
  { iniciales: 'JU', nombre: 'Juli (hijo de Pablo)',servicio: 'Corte niño',   telefono: '+54 9 11 3344-5566', recurrencia: 'Sábado por medio · 11:00',  proximo: 'sáb 27', activo: true,  color: '#3a3d44' },
  { iniciales: 'MC', nombre: 'Marce',               servicio: 'Barba',        telefono: '+54 9 11 9988-7766', recurrencia: 'Todos los lunes · 10:00',   proximo: '-',      activo: false, color: '#3a3d44' },
  { iniciales: 'PG', nombre: 'Pablo García',        servicio: 'Corte',        telefono: '+54 9 11 5544-3322', recurrencia: 'Todos los miércoles · 17:00',proximo: 'mié 25',activo: true,  color: '#CE2434' },
]
