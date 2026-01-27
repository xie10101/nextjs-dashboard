import dotenv from 'dotenv';
import path from 'path';

// Load .env.local first (highest priority for local development secrets)
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });
// Load .env (fallback)
dotenv.config({ path: path.resolve(process.cwd(), '.env') });

import {GET} from "./route.ts";

GET();