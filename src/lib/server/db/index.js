import { drizzle } from "drizzle-orm/d1";
import * as schema from "./schema";

export const getDb = (d1) => drizzle(d1, { schema });
