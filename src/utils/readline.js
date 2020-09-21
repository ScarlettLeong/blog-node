const fs = require('fs');
const path = require('path');
const readline = require('readline');

// 日志分析
const fulFileName = path.join(__dirname, "../", "../", "logs", "access.log");

const readStream = fs.createReadStream(fulFileName);
const rl = readline.createInterface({
  input: readStream,
});

// 统计chrome占比
let lineSum = 0;
let chromeSum = 0;
//逐行读取
rl.on('line', (lineData) => {
  if (!lineData) {
    return;
  }
  lineSum++;
  const logArr = lineData.split(" -- ");
  if (logArr[2].indexOf("Chrome") > 0) {
    chromeSum++;
  }
});

rl.on('close', () => {
  console.log(chromeSum, lineSum)
  console.log(chromeSum / lineSum);
})