# Assignment 4 - Analytics Platform

## How to run

1. Install stuff:
```
npm install
```

2. Make sure MongoDB is running

3. Add sample data:
```
node seedData.js
```

4. Start server:
```
npm start
```

5. Go to http://localhost:3000

## What it does

- Shows graphs for temperature, humidity, and CO2 data
- You can pick date ranges
- Shows stats like average, min, max, std deviation
- Has 100 sample data points from January 2025

## Files

- index.js - the backend server
- seedData.js - puts fake data in database
- public/index.html - main page
- public/styles.css - makes it look nice
- public/script.js - handles buttons and graphs

## API endpoints

GET /api/measurements - gets data for graphs
- needs: field, start_date, end_date

GET /api/measurements/metrics - calculates statistics  
- needs: field
- optional: start_date, end_date

## Database

Collection: measurements
Fields: timestamp, field1 (temp), field2 (humidity), field3 (CO2)
 
## Technologies

Node.js, Express, MongoDB, Mongoose, Chart.js
