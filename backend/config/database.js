import { Sequelize } from 'sequelize';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.join(process.cwd(), '.env') });

const isDevelopment = process.env.NODE_ENV !== 'production';

// Usando SQLite para o ambiente de preview do AI Studio, mas preparado para MySQL
const sequelize = process.env.DB_DIALECT === 'sqlite' 
  ? new Sequelize({
      dialect: 'sqlite',
      storage: process.env.DB_STORAGE || './backend/database/database.sqlite',
      logging: false
    })
  : new Sequelize(
      process.env.DB_NAME,
      process.env.DB_USER,
      process.env.DB_PASS,
      {
        host: process.env.DB_HOST,
        dialect: 'mysql',
        logging: false,
        define: {
          charset: 'utf8mb4',
          collate: 'utf8mb4_unicode_ci',
          timestamps: true
        }
      }
    );

export default sequelize;
