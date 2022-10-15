module.exports = {
  testingStage: false,
  botTickDelay: 500,
  guild_id: process.env.GUILD_ID,
  commands: [
    //mandatory
    "use",
    //mandatory if using hunt/fish/beg
    "buy",

    //optional
    "crime",
    "search",
    "beg",
    "hunt",
    "fish",
    "dig",
    "postmemes",
    "highlow",
    "deposit",
    "daily",
    "trivia",
  ],
  searchList: [
    "toxic waste plant",
    "dog",
    "aeradella's home",
    "tesla",
    "twitch",
    "soul's chamber",
    "grass",
    "armpit hair",
    "kitchen",
    "computer",
    "zomb's grave",
    "air",
    "police officer",
    "lego bin",
    "sewer",
    "street",
    "mailbox",
    "area51",
    "garage",
    "fridge",
    "movie theater",
    "bathroom",
    "hospital",
    "briefcase",
    "dresser",
    "dark room",
    "car",
  ],
  crimeList: [
    "tax evasion",
    "dui",
    "eating a hotdog sideways",
    "murder",
    "drug distribution"
  ]
}