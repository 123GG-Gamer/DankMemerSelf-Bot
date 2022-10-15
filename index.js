const SelfBot = require("./selfbotIndex.js");
const information = require("./config/botInformation.js");

//bot controls
const bots = [];
const runBots = true;
console.log("RUN BOTS:", runBots);

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

//run bots if bots is true
if (runBots) {
  /* loop through the list of bot information */
  for (let i = information.length; i--;) {
    /* Create SelfBot */
    bots.push(new SelfBot(information[i]));
  };
}

/* run express server to keep the bots alive, use some ping bots to keep alive 24/7 */
require("./server.js")(bots);
