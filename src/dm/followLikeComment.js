const { chalk, inquirer, _, fs, instagram, print, delay } = require("./../api.js");
require('dotenv').config();

(async () => {
    print(
        chalk`{bold.green
  Follow, Like & DM from Target Followers
    }`
    );
    const questions = [       
        {
            type: "input",
            name: "target",
            message: "Input target's username (without '@'):",
            validate: (val) => val.length != 0 || "Please input target's username!",
        },
        {
            type: "input",
            name: "inputMessage",
            message: "Input text's message (more? '|') :",
            validate: (val) => val.length != 0 || "Please input text's Message!",
        },
        {
            type: "input",
            name: "perExec",
            message: "Input limit per-execution [1-5] :",
            validate: (val) => /[0-9]/.test(val) || "Only input numbers",
        },
    ];

    try {
        const { target, inputMessage, perExec } = await inquirer.prompt(questions);
        
        // Login Information
        const username = process.env.INSTAGRAM_USERNAME;
        const password = process.env.INSTAGRAM_PASSWORD;
        
        // Auto Change Delay
        function getRandomDelay() {
            const minDelay = 600000; // Minimum Delay
            const maxDelay = 1000000; // Maximum Delay
            return Math.floor(Math.random() * (maxDelay - minDelay + 1)) + minDelay;
        }
        
        // Try to login
        const ig = new instagram(username, password);
        print("Try to Login . . .", "wait", true);
        const login = await ig.login();
        print(`Logged in as @${login.username} (User ID: ${login.pk})`, "ok");
        
        // Collecting Information
        print(`Collecting information of @${target} . . .`, "wait");
        const id = await ig.getIdByUsername(target),
            info = await ig.userInfo(id);
        if (!info.is_private) {
            print(`@${target} (User ID: ${id}) => Followers : ${info.follower_count}, Following : ${info.following_count}`, "ok");
            print("Collecting followers . . .", "wait");
            const targetFollowers = await ig.followersFeed(id);
            print(`Youn will Follow, Like & DM each ${perExec} user per-execution \n`, "wait");
            do {
                let items = await targetFollowers.items();
                items = _.chunk(items, perExec);
                for (let i = 0; i < items.length; i++) {
                    await Promise.all(
                        items[i].map(async (follower) => {
                            const status = await ig.friendshipStatus(follower.pk);
                            if (!follower.is_private && !status.following && !status.followed_by) {
                                const media = await ig.userFeed(follower.pk),
                                    lastMedia = await media.items();
                                const text = inputMessage.split("|");
                                const msg = text[Math.floor(Math.random() * text.length)];
                                if (lastMedia.length != 0 && lastMedia[0].pk) {
                                    const task = [ig.follow(follower.pk), ig.like(lastMedia[0].pk), ig.sendDirectMessage(follower.pk, msg)];
                                    let [follow, like, dm] = await Promise.all(task);
                                    follow = follow ? chalk.bold.green(`Followed`) : chalk.bold.red("Not followed");
                                    like = like ? chalk.bold.green("Liked") : chalk.bold.red("Not liked");
                                    dm = dm ? chalk.bold.green("DM") : chalk.bold.red("Failed to DM");
                                    print(`• @${follower.username} : [${follow}, ${like}, ${dm}] > ${chalk.cyanBright(msg)}`);
                                } else print(chalk`• @${follower.username} : {yellow No posts yet, Skip.}`);
                            } else print(chalk`• @${follower.username} : {yellow Private or already followed/follows you, Skip.}`);
                        })
                    );
                    
                    // Sleeping
                    if (i < items.length - 1) print(`[@${login.username}] Sleeping for ${getRandomDelay()}ms.... \n`, "wait", true);
                    await delay(getRandomDelay());
                }
            } while (targetFollowers.moreAvailable);
            print(`Status: All tasks done!`, "ok", true);
        } else print(`@${target} is private account`, "err");
    } catch (err) {
        print(err, "err");
    }
})();
