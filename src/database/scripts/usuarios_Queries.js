class Usuarios_Queries {
  constructor(dbManager) {
    this.db = dbManager;
  }

  async crearUsuario(datosUsuario) {
    const sql = `
      INSERT INTO usuarios (phone_number, nombre, email, fecha_registro, activo)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING id
    `;

    const params = [
      datosUsuario.numeroTelefono,
      datosUsuario.nombre,
      datosUsuario.email,
      new Date(),
      true
    ];

    return this.db.query(sql, params);
  }

  async obtenerUsuarioPorTelefono(numeroTelefono) {
    const sql = `SELECT * FROM usuarios WHERE phone_number = $1`;
    const resultado = await this.db.query(sql, [numeroTelefono]);
    return resultado[0];
  }

  async actualizarUsuario(numeroTelefono, datosActualizados) {
    const sql = `
      UPDATE usuarios 
      SET nombre = $2, email = $3, activo = $4
      WHERE phone_number = $1
      RETURNING *
    `;

    const params = [
      numeroTelefono,
      datosActualizados.nombre,
      datosActualizados.email,
      datosActualizados.activo
    ];

    return this.db.query(sql, params);
  }
}

export default Usuarios_Queries;