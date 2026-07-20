const XLSX = require('xlsx');
const fs = require('fs');

const csvData = `Question,Option A,Option B,Option C,Option D,Correct Answer (A/B/C/D)
Q1,A,B,C,D,A`;
fs.writeFileSync('test.csv', csvData);

const data = fs.readFileSync('test.csv');
const wb = XLSX.read(data, { type: 'buffer' });
const ws = wb.Sheets[wb.SheetNames[0]];
const rows = XLSX.utils.sheet_to_json(ws);
console.log(rows);
