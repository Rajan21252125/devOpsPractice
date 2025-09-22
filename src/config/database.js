import 'dotenv/config';
import { neon } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-http';


const client = neon(process.env.DATABASE_URL);
const db = drizzle(client);

export default { db , client };