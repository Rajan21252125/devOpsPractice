import express from 'express';
import logger from '#config/logger.js';
import helmet from 'helmet';
import morgan from 'morgan';
import cors from 'cors';
import cookieParser from 'cookie-parser';

const app = express();
// Middleware
app.use(helmet());
app.use(cors());
app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
// HTTP request logger
app.use(morgan('combined', { stream: { write: message => logger.info(message.trim()) } }));


app.get('/', (req, res) => {
  logger.info('Hello from my app');
  res.send('Hello, from my app!');
});

export default app;
