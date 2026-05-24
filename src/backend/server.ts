import express from 'express';
import cors from 'cors';
import path from 'path';
import { apiRoutes } from './routes/api.routes.js';
import { oauthRoutes } from './routes/oauth.routes.js';

import * as dotenv from 'dotenv';
dotenv.config();

const app = express();
const port = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

// Serve generated outputs statically
app.use('/output', express.static(path.resolve(process.cwd(), 'output')));

// Mount routes
app.use('/api', apiRoutes);
app.use('/api/oauth', oauthRoutes);

app.listen(port, () => {
  console.log(`AutoSWOT Backend running on http://localhost:${port}`);
});
