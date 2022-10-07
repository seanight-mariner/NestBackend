import 'reflect-metadata';
import { DataSource } from 'typeorm';
import * as config from 'config';

export const AppDataSource = new DataSource({
  type: config.get('db').type,
  host: config.get('db').host,
  port: process.env.DB_PORT || config.get('db').port,
  username: config.get('db').username,
  password: config.get('db').password,
  database: config.get('db').database,
  synchronize: config.get('db').synchronize,
  // logging: config.get('server').logging,
  logging: false,
  entities: ['dist/src/**/*.entity.js'],
});
