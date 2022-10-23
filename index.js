const { chalk, inquirer, print } = require("./src/index.js");
var moment = require("moment");
var colors = require("colors");
var userHome = require("user-home");

// DETECT IP
var os = require("os");
var interfaces = os.networkInterfaces();
var addresses = [];
for (var k in interfaces) {
    for (var k2 in interfaces[k]) {
        var address = interfaces[k][k2];
        if (address.family === "IPv4" && !address.internal) {
            addresses.push(address.address);
        }
    }
}

// FEATURE OPTION
const questionTools = [
    "- Information",
    "- Like all Post on your Feed",
    "- Like all Post from Target Account",
    "- Delete all post from your Account",

    "- Follow & Like post by Target Followers",
    "- Like & Comment post by Target Followers Target",

    "- Follow, Like & Comment post by Target Followers",
    "- Follow, Like & Comment post by Target Followers [BETA]",

    "- Follow, Like & Comment post by Target Followers v2",

    "- Follow, Like & DM by Target Followers",
    "- Follow, Like & DM by Target Followers [BETA]",

    "- Follow, Like & Comment post from Hashtag",
    "- Follow, Like & Comment post from Location",

    "- Unfollow All Following",
    "- Unfollow User Not Following You Back",
    "\n",
];

// SELECTOR
const menuQuestion = {
    type: "list",
    name: "choice",
    message: "> Select tools :",
    choices: questionTools,
};

// FEATURE LIST
const main = async () => {
    try {
        const { choice } = await inquirer.prompt(menuQuestion);
        choice == questionTools[0] && require("./src/info.js");
        choice == questionTools[1] && require("./src/liketimeline.js");
        choice == questionTools[2] && require("./src/liketarget.js");
        choice == questionTools[3] && require("./src/delallmedia.js");
        choice == questionTools[4] && require("./src/flonly.js");
        choice == questionTools[5] && require("./src/lconly.js");
        choice == questionTools[6] && require("./src/fftauto.js");
        choice == questionTools[7] && require("./src/fftbetaauto.js");
        choice == questionTools[8] && require("./src/fftautov2.js");
        choice == questionTools[9] && require("./src/fftdmauto.js");
        choice == questionTools[10] && require("./src/fftdmbetaauto.js");
        choice == questionTools[11] && require("./src/fhtauto.js");
        choice == questionTools[12] && require("./src/fltauto.js");
        choice == questionTools[13] && require("./src/unfollowall.js");
        choice == questionTools[14] && require("./src/unfollnotfollback.js");
        choice == questionTools[15] && process.exit();
    } catch (err) {
        print(err, "err");
    }
};

// Welcome Header
console.log(chalk`{bold.green 

  ██╗███╗░░██╗░██████╗████████╗░█████╗░░░░░░██╗░██████╗
  ██║████╗░██║██╔════╝╚══██╔══╝██╔══██╗░░░░░██║██╔════╝
  ██║██╔██╗██║╚█████╗░░░░██║░░░███████║░░░░░██║╚█████╗░
  ██║██║╚████║░╚═══██╗░░░██║░░░██╔══██║██╗░░██║░╚═══██╗
  ██║██║░╚███║██████╔╝░░░██║░░░██║░░██║╚█████╔╝██████╔╝
  ╚═╝╚═╝░░╚══╝╚═════╝░░░░╚═╝░░░╚═╝░░╚═╝░╚════╝░╚═════╝░ 

  - https://instagram.com/hanzvibes

  Last update : 25 October 2022                               
  }`);
console.log(chalk`{bold.yellow   A tool to help increase your Instagram profile}`);
console.log(chalk`{bold.yellow   engagement & impressions easily and quickly.}`);
console.log("  —————————————————————————————————————————————\n".bold);
   
// API Limit Description
console.log(chalk`{bold.blue   Current Instagram API Limit 2022 ( Safest )\n }`);
console.log("  > DATE  : ".bold.blue + moment().format("D MMMM YYYY, h:mm:ss a"));
console.log("  > IP  : ".bold.blue + addresses);
console.log("  > Like : ".bold.blue + "±200/day");
console.log("  > Follow / Unfollow : ".bold.blue + "±150/day");
console.log("  > Direct Message : ".bold.blue + "±50/day");
console.log("  > Comments : ".bold.blue + "±100/day \n");
// Alert
console.log("  —————————————————————————————".bold.red);
console.log("  Combined actions in total is 500 actions a day.".bold.red);
console.log("  This includes the following, likes and unfollows.".bold.red);
console.log("  ——————————————————————————————————————————\n".bold.red);
main();
