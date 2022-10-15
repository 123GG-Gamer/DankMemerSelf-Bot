const Discord = require("discord.js-selfbot-v13");
const { exec } = require("child_process");
let config = require('./defaultBotConfig.js');
/* destructuring and caching */
const {
  ceil,
  round,
  floor,
  random,
} = Math;
const { parse, stringify } = JSON;
const { now: globalGetTime } = Date;

const timeTable = {
  "s": 1e3,
  "m": 1e3 * 60,
  "h": 1e3 * 60 * 60,
  "d": 1e3 * 60 * 60 * 24,
}
const bots = [];

var BOT_COLLISIONS = 0;

module.exports = class {
  /* Object of all existing bots*/
  get Bots() {
    return bots;
  }

  /* gets time, localized to its time offset */
  get getTime() {
    return globalGetTime() + this.timeOffset;
  }

  /* check commands if we need to respond to them (eg click button) */
  checkForResponse = (message, embed) => {
    /* if we in a bankrob, return */
    if (embed.description && embed.description.includes("middle of a bankrob")) {
      /* wait 1 min for the bank rob to pass */
      return this.wait = this.getTime + 60000;
    }

    /* loop through all the commands and check if any respond */
    for (let i = this.commands.length; i--;) {
      /* if a command responds with truthy, break */
      if (this.commands[i].response(message, embed)) {
        break;
      }
    }
  }

  /* cache integrations so we can run them later */
  checkForCachedIntegrations = (message) => {
    /* if we don't have any uncached commands, return */
    if (!this.commandsCache.includes(undefined)) {
      return;
    }
    /* loop through all the commands */
    for (let i = this.commandsCache.length; i--;) {
      /* if caching command or already cached it, continue*/
      if (this.commandsCache[i] !== undefined) {
        continue;
      }

      (async () => {
        /* set commands cache to 0, to indicate we are caching it */
        this.commandsCache[i] = 0;

        try {
          /* search for command */
          await message.guild.searchInteraction({
            query: config.commands[i],
            botId: "270904126974590976",
            type: 1
          }).catch(e => {
            console.log(this.prefix, "error while caching interactions", err);
          /* if there's an error, reset cache */
          this.commandsCache[i] = undefined;
          });

          /*
          * set commands cache to command (String)
          * this way we can use this.commandsCache.includes("cmdName")
          */
          this.commandsCache[i] = this.commands[i];

          /* eat apple at startup */
          if(config.commands[i] === "use") {
            /* use apple */
            this.channel.sendSlash("270904126974590976", "use", "Apple");
            this.wait = this.getTime + 3000;
          }
        } catch (err) {
          console.log(this.prefix, "error while caching interactions", err);
          /* if there's an error, reset cache */
          this.commandsCache[i] = undefined;
        }
      })();
    }
  }

  /*
  * @param {Object} info
  */
  constructor(info, Config) {
    /* Configuration */
    config = {...Config, ...config}
    /* global stuff */
    console.log(`created new bot: ${info.prefix}`);
    bots.push(this);

    /* localize commands */
    this.commands = parse(stringify(config.commands));

    /* loop through all the commands */
    for (let i = 0; i < this.commands.length; i++) {
      /* set index of commands to the response of the module */
      this.commands[i] = require(`./commands/${this.commands[i]}.js`)(this);
    }
    //information defines
    /* String */
    this.token = process.env[info.prefix];
    /* String */
    this.channelID = info.channel;
    /* String */
    this.prefix = info.prefix;
    /* Number */
    this.timeOffset = info.timeOffset * timeTable.d;

    //other declarations
    /* Object (discord.js-selfbot-v13 npm package) */
    this.client = new Discord.Client({ checkUpdate: false });
    /* circular (this.client.control.client) */
    this.client.control = this;
    /* Number */
    this.wait = Infinity;
    /* Object */
    this.commandsCache = new Array(config.commands.length);
    /* Boolean */
    this.loggedIn = false;
    /* Boolean */
    this.active = false;

    /* unused until after startup */
    this.messageCheck = null;
    this.channel = null;
    this.buttonInterval = null;

    /* automated bot logs */
    this.client.on("debug", message => {
      /* this message is rate limit message */
      if (message.startsWith("Hit a 429")) {
        /* Number (1000) */
        let time = parseInt(message.split("limit: ").pop());
        console.log(this.prefix, "limited for", time, "ms");

        /* if time is bigger than 1 million ms */
        if (time > 1000000) {
          /* reset container and repl ip */
          exec("kill 1");
        } else {
          /* wait the rate limit to avoid more limits */
          this.wait = this.getTime + time * 2;
          /* log and increase collision counter */
          console.log(this.prefix, "collided:", ++BOT_COLLISIONS);
          /* after 10 minutes, decrease collisions */
          setTimeout(() => { BOT_COLLISIONS-- }, 600000);
        }
      }
    });

    this.client.on("ready", () => {
      this.loggedIn = true;
      console.log(this.prefix, "logged in as", this.client.user.username);
      /* fetch channel we are going to be grinding in */
      this.client.channels.fetch(this.channelID).then(c => {
        this.init(c);
      });
    });

    this.client.on("messageCreate", message => {
      if (!message.guild) {
        this.checkDMS(message);
        //checkForDeaths(message, message.embeds?.[0]);
        /* non guild msgs code here */
        return;
      }

      if (message.guild.id !== config.GUILD_ID) {
        /* non specified guild msgs code here */
        return;
      }

      /* check if author is dank memer */
      if (message.author.id === "270904126974590976") {
        /* Object (MessageEmbed- discord.js-selfbot-v13) */
        let embed = message.embeds?.[0];
        if (!embed) {
          /* non embed msgs code here */
          return;
        }

        /* EVENT RESPONDERS */
        
        if (embed.description) {
          /* attack boss for rewards */
          if (embed.description.includes("Attack the boss")) {
            /* wait until we are done interaction */
            this.wait = Infinity;
            /* 
            * click first button (idx 0) of first row (idx 0)
            */
            this.clickButton(message, 0, 0);
          } else if(embed.description === "F") {
            /* add wait timer */
            this.wait += 2000;
            /* click first button (idx 0) of first row (idx 0) */
            this.clickButton(message, 0, 0);
            /* if it isn't a message interaction */
          } else if(!message.interaction) {
            /* trivia event */
            if(embed.description.includes("seconds to answer*")) {
              /* add wait timer */
              this.wait += 2000;
              /* click random button (idx 0 - 3) of first row (idx 0) */
              this.clickButton(message, 0, floor(random() * 4));
            } else if (embed.description.includes("**value** of this item?")) {
              /* add wait timer */
              this.wait += 2000;
              /* click random button (idx 0 - 3) of first row (idx 0) */
              this.clickButton(message, 0, floor(random() * 4));
            }
          }
        }

        this.checkForResponse(message, embed);
      } else if (message.author.id === this.client.user.id) {
        /* check for cached integrations */
        this.checkForCachedIntegrations(message);
      }
    });
    this.client.on("messageUpdate", (oldMsg, newMsg) => {
      if (!newMsg.guild) {
        /* non guild msgs code here */
        return;
      }

      if (newMsg.guild.id !== GUILD_ID) {
        /* non specified guild msgs code here */
        return;
      }

      /* check if author is dank memer */
      if (newMsg.author.id === "270904126974590976") {
        /* Object (MessageEmbed- discord.js-selfbot-v13) */
        let embed = newMsg.embeds?.[0];
        if (!embed) {
          /* non embed msgs code here */
          return;
        }

        if (embed.description) {
          /* attack boss for rewards */
          if (embed.description.includes("Attack the boss")) {
            this.wait = this.getTime + 3000;
            /* clicks button when dank updates event interaction
            (first row, first button (idx 0, idx 0))*/
            setTimeout(() => {
              this.clickButton(newMsg, 0, 0);
            }, 1000);
          }
        }
      }
    });

    /* login to selfbot */
    this.login();
  }

  /* click specified button, returns success (Boolean) */
  clickButton = (msg, rowidx, buttonidx) => {
    /* Boolean */
    let success = true;
    try {
      msg.clickButton(msg.components[rowidx].components[buttonidx].customId);
    } catch (e) {
      /* if there was an error clicking the button, success = false */
      success = false;
      /* log if we need to debug */
      //console.log(e);
    }

    return success;
  }

  /* check dms that dank memer sends you */
  checkDMS = (message, embed) => {
    if(!embed) {
      //idk if theres a message without embeds
      return;
    }
    /* check if author is dank memer */
    if (message.author.id === "270904126974590976") {
      /* embed needs a description */
      if (!embed.description) return;
      /* apple expired */
      if (embed.description.includes("Apple expired")) {
        this.wait = this.getTime + 5000;
        this.channel.sendSlash("270904126974590976", "use", "Apple");
      }
    }
  }

  /* 
  * attempt to send commands
  * @param {time} Number- Date.now()
  */
  sendCommands = (time) => {
    /* loop through all commands */
    for (let i = 0, l = this.commands.length, module; i < l; i++) {
      /* if the command's cooldown is up */
      if (time - (module = this.commands[i]).lastUsed > module.cooldown) {
        /* and the bot's wait timer is up */
        if (time > this.wait + 2 ** BOT_COLLISIONS) {
          /* if we didn't cache the command yet, ignore */
          if (!this.commandsCache[i]) continue;
          /* 
          * set wait to 3mins later, if we recieve 
          * a response, the bot automatically
          * reset wait back to 2 seconds
          */
          this.wait = time + 180000;
          /* set commands cooldown */
          module.lastUsed = time;
          /* send slash command */
          module.run(this.channel);
        }
      }
    }
  }

  /* login to bot */
  login = () => {
    this.client.login(this.token).catch(error => {
      /* error occured while logging-in, log the error */
      console.log(this.prefix, "unable to login:", error);
    });
  }

  /* bot tick, performs active/inactive/message checks */
  tick = () => {
    /* Number (Date.now() + timeOffset) */
    let time = this.getTime;
    /* if we are testing, ignore active and inactive states */
    if (config.testingStage) {
      /* send commands */
      this.sendCommands(time);
      return;
    }
    /* if active and loggedin, check for inactive */
    if ((this.active === true) * this.loggedIn) {
      /* if it is currently not half past, go inactive */
      if (time % 3.6e6 < 1.8e6) {
        this.active = false;
        this.channel.send("inactive");
        return;
      }
      /* if we are active after the inactive check, send commands */
      if (this.active) {
        this.sendCommands(time);
      }
    }
    /* if it is currently past half past, go active or log in */
    else if (time % 3.6e6 > 1.8e6) {
      /* if we are already loggedIn, go active */
      if (this.loggedIn) {
        this.active = true;
        this.channel.send("active");
        return;
      }
      /* if we aren't loggedIn, log in*/
      this.loggedIn = true;
      /* 
      * set wait to 2 mins later to avoid
      * instant messaging (sus for discord)
      */
      this.wait = time + 120000;
      /* login */
      this.login();
    }
  }

  /* init, sets messageCheck interval */
  init = (channel) => {
    /* set channel and send message */
    (this.channel = channel).send("online");
    /* set messaging interval */
    this.messageCheck = setInterval(this.tick, config.botTickDelay);
  }
}
