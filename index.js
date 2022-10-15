
//log time when process started
const now = new Date();
console.log(`PROCESS START: ${
  ("0" + now.getUTCMonth()).slice(-2)
}/${
  ("0" + now.getUTCDate()).slice(-2)
}/${
  ("0" + now.getUTCFullYear()).slice(-2)
} ${
  ("0" + now.getUTCHours()).slice(-2)
}:${
  ("0" + now.getUTCMinutes()).slice(-2)
}`);

module.exports = require("./selfbotIndex.js");

/* run express server to keep the bots alive, use some ping bots to keep alive 24/7 */
require("./server.js")();
