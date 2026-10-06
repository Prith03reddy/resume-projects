import dotenv from 'dotenv';
import { createServer } from './server.js';
dotenv.config();
const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3001;
const app = createServer();
app.listen(PORT, '0.0.0.0', () => {
    console.log(`🛡️  Chaukanna Bharat API Engine listening on port ${PORT}`);
    console.log(`   Pipeline ready: Ingest -> Parse & Extract -> Verify -> Understand`);
    console.log(`   Zero Data Retention active: Memory ephemeral processing enforced.`);
});
