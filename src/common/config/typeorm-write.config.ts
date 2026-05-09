import { DataSource } from 'typeorm';
import { config } from 'dotenv';
import { join } from 'path';

config(); // Carga las variables del .env desde la raíz

export default new DataSource({
    name: 'write_connection',
    type: 'postgres',
    host: process.env.DB_HOST,
    port: parseInt(process.env.DB_PORT || '5432'),
    username: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME_WRITE,
    // Subimos dos niveles (config -> common -> src) para buscar entidades
    entities: [join(__dirname, '../../**/*.entity.ts')],
    // Las migraciones están en la carpeta hermana 'migrations'
    migrations: [join(__dirname, '../migrations/*.ts')],
});