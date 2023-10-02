require('dotenv').config();

import DB from './utils/db';
import { app } from './app';

/** Create Server */
app.listen(process.env.PORT, () => {
    DB();
    console.log(`Server is running or PORT ${process.env.PORT}`);
});