const { chalk, inquirer, print } = require("./src/api.js");
var moment = require("moment");
var colors = require("colors");
var userHome = require("user-home");
var open = require('open');
var os = require("os");

// List
const questionTools = [
    "- About",
    "- Unfollow Inactive user for 90 days [DONATE ONLY]",
    "- Unfollow user if they haven't any post [DONATE ONLY]",
    "- Like all post on your Feed",
    "- Like all post from Target Account",
    "- Like all post from Hashtag [NEW]",
    "- Like all post from Location [NEW]",
    "- Like & Comment post from Target Followers",
    "- Like & Comment post from feeds [NEW]",
    "- View all story from Followers [DONATE ONLY]",
    "- View all story from Following [DONATE ONLY]",
    "- Comment all post from Hashtag [NEW]",
    "- Comment all post from Location [NEW]",
    "- Follow account from Target Followers [NEW]",
    "- Follow account from Target Following [NEW]",
    "- Follow account from Hashtag [NEW]",
    "- Follow account from Location [NEW]",
    "- Follow, Like & Comment post from Hashtag [BEST RESULT]",
    "- Follow, Like & Comment post from Target Followers",
    "- Follow, Like & Comment post from Target Followers [Multiple Target]",
    "- Follow, Like & Comment post from Location",
    "- Follow & Like post from Target Followers",
    "- Follow, Like & DM from Target Followers",
    "- Follow, Like & DM from Target Followers [Multiple Target]",
    "- Delete all post from your Account",
    "- Unfollow all Following",
    "- Unfollow user who not following you back",
    "\n",
];

// SELECTOR
const menuQuestion = {
    type: "list",
    name: "choice",
    message: "> Select tools :",
    choices: questionTools,
};

// Tools List
const main = async () => {
    try {
        const { choice } = await inquirer.prompt(menuQuestion);
        choice == questionTools[0] && require("./src/info.js");
        choice == questionTools[1] && require("./src/feeds/story_views.js");
        choice == questionTools[2] && require("./src/feeds/story_views.js");
        choice == questionTools[3] && require("./src/feeds/like.js");
        choice == questionTools[4] && require("./src/targets/like.js");
        choice == questionTools[5] && require("./src/hashtags/like.js");
        choice == questionTools[6] && require("./src/targetLocation/like.js");
        choice == questionTools[7] && require("./src/targetFollowers/LikeComment.js");
        choice == questionTools[8] && require("./src/feeds/likeComment.js");
        choice == questionTools[9] && require("./src/feeds/story_views.js");
        choice == questionTools[10] && require("./src/feeds/story_views.js");
        choice == questionTools[11] && require("./src/hashtags/comment.js");
        choice == questionTools[12] && require("./src/targetLocation/comment.js");
        choice == questionTools[13] && require("./src/targetFollowers/follow.js");
        choice == questionTools[14] && require("./src/targetFollowings/follow.js");
        choice == questionTools[15] && require("./src/hashtags/follow.js");
        choice == questionTools[16] && require("./src/targetLocation/follow.js");
        choice == questionTools[17] && require("./src/hashtags/followLikeComment.js");
        choice == questionTools[18] && require("./src/targetFollowers/followLikeComment.js");
        choice == questionTools[19] && require("./src/targetFollowers/followLikeComment2.js");
        choice == questionTools[20] && require("./src/targetLocation/followLikeComment.js");
        choice == questionTools[21] && require("./src/targetFollowers/followLike.js");
        choice == questionTools[22] && require("./src/dm/followLikeComment.js");
        choice == questionTools[23] && require("./src/dm/followLikeComment2.js");
        choice == questionTools[24] && require("./src/accounts/cleanMedia.js");
        choice == questionTools[25] && require("./src/accounts/cleanFollowing.js");
        choice == questionTools[26] && require("./src/accounts/notFollback.js");
        choice == questionTools[27] && process.exit();
    } catch (err) {
        print(err, "err");
    }
};

// Open @hanzvibes Instagram Profile
const link = 'https://www.instagram.com/hanzvibes';
open(link);

console.log(chalk`{bold.green 

  ██╗███╗░░██╗░██████╗████████╗░█████╗░░░░░░██╗░██████╗
  ██║████╗░██║██╔════╝╚══██╔══╝██╔══██╗░░░░░██║██╔════╝
  ██║██╔██╗██║╚█████╗░░░░██║░░░███████║░░░░░██║╚█████╗░
  ██║██║╚████║░╚═══██╗░░░██║░░░██╔══██║██╗░░██║░╚═══██╗
  ██║██║░╚███║██████╔╝░░░██║░░░██║░░██║╚█████╔╝██████╔╝
  ╚═╝╚═╝░░╚══╝╚═════╝░░░░╚═╝░░░╚═╝░░╚═╝░╚════╝░╚═════╝░ 

  - https://instagram.com/hanzvibes

  Last update : 19 January 2023
  Version : 3.1
  Donate : 089666205133 ( GOPAY, OVO, DANA, Shopeepay )}\n`);
console.log(chalk`{bold   Donate Kalo Pengen Update-an Lancar}\n`)
console.log(chalk`{bold.yellow   An automation tools to help increase your}`);
console.log(chalk`{bold.yellow   Instagram engagement & impressions}`);
console.log("  —————————————————————————————————————————————\n".bold);
   
// Update Changelog
console.log(chalk`{bold.blue   What's new in v3.1 ?\n }`);
console.log("  - Auto View Stories".bold);
console.log("  - Auto Unfollow Inactive user".bold);
console.log("  - Auto Unfollow user if they haven't any post".bold);
console.log("  - Auto Like and Comment on feeds".bold);
console.log("  - Auto Like all posts from location (Like only)".bold);
console.log("  - Auto Comment all posts from location (Comment only)".bold);
console.log("  - Auto Follow all people from location (Follow only))".bold);
console.log("  - Auto-set and change delays to simulate human behavior".bold);
console.log("  - Automatically save logs in the './logs/' folder".bold , '\n');

// Alert
console.log("  —————————————————————————————".bold.red);
console.log("  if you have problems logging in,".bold.red);
console.log("  this is happening from Instagram so don't complain to me bastard".bold.red);
console.log("  unless you find bugs in this tool just report to me".bold.red);
console.log("  ——————————————————————————————————————————\n".bold.red);
main();
