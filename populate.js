import dotenv from 'dotenv';
import Job from './models/Job.js'
import connectDB from './db/connect.js'

// When using the latest Node.js and ES6 modules, you need to also import fs module
// to read json file. Afterwards, youcan either use readFile or readFileSync.

import fs from 'fs'

// Method 1
const jsonMockData = JSON.parse(fs.readFileSync('mock-data.json'))

dotenv.config();

const start = async () => {
    try {
        await connectDB(process.env.MONGO_URI);

        await Job.create(jsonMockData);
        console.log('Success!!!');
        process.exit(0);
    } catch (error) {
        console.log(error);
        process.exit(1);
    }
};

start();