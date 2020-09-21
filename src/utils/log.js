const fs = require('fs');
const path = require('path');

/**
 * 生成write stream
 * @param {*} fileName string
 */
function createWriteStream(fileName) {
  const fulFileName = path.join(__dirname, "../", "../", "logs", fileName);
  const writeStream = fs.createWriteStream(fulFileName, {
    flags: 'a', // 追加
  });
  return writeStream;
}

function writeLog(writeStream, log) {
  writeStream.write(log + '\n');
}

// 访问日志
const accessWriteStream = createWriteStream('access.log');

function access(log) {
  writeLog(accessWriteStream, log);
}

// 格式：*(min)*(hour)*(day)*(month)*(year) command
// 将access.log拷贝并重命名为2020-09-10.access.log
// 清空access.log文件，并继续积累日志

module.exports = {
  access,
};