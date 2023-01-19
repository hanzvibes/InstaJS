const { chalk, inquirer, _, fs, instagram, print, delay } = require("./../api.js");
require('dotenv').config();

(async () => {
    print(
        chalk`{bold.yellow
  Follow users from Target Following \n}`);
    
    const questions = [        
        {
            type: "input",
            name: "target",
            message: "Input target's username (without '@'):",
            validate: (val) => val.length != 0 || "Please input target's username!",
        },
        {
            type: "input",
            name: "perExec",
            message: "Input limit per-execution:",
            validate: (val) => /[0-9]/.test(val) || "Only input numbers",
        },        
    ];

    try {
        const { target, perExec } = await inquirer.prompt(questions);
        
        // Login Information
        const username = process.env.INSTAGRAM_USERNAME;
        const password = process.env.INSTAGRAM_PASSWORD;
        
        // Auto Change Delay
        function getRandomDelay() {
            const minDelay = 600000; // Minimum Delay
            const maxDelay = 1000000; // Maximum Delay
            return Math.floor(Math.random() * (maxDelay - minDelay + 1)) + minDelay;
        }
        
        // Try to Login
        const ig = new instagram(username, password);
        print("Try to Login . . .", "wait", true);
        const login = await ig.login();
        print(`Logged in as @${login.username} (User ID: ${login.pk})`, "ok");
        
        // Collecting Info
        print(`Collecting information of @${target} . . .`, "wait");
        const id = await ig.getIdByUsername(target),
        info = await ig.userInfo(id);
        if (!info.is_private) {
        print("Collecting following list. . .", "wait");
        print(`@${target} (User ID: ${id}) Followers : ${info.follower_count}, Following : ${info.following_count}`, "ok");
        
        const log = fs.createWriteStream("./logs/targetFollowing/follow.txt", { flags: "a" });
            
            // Doing tasks
            const targetFollowing = await ig.followingFeed(id);
            print(`You will follow each ${perExec} user per-execution`, "ok");
            print(`All logs will be stored here /logs/targetFollowers/follow.txt \n`, "ok");
            do {
                let items = await targetFollowing.items();
                items = _.chunk(items, perExec);
                for (let i = 0; i < items.length; i++) {
                    await Promise.all(
                        items[i].map(async (following) => {
                            const status = await ig.friendshipStatus(following.pk);
                            if (!status.following && !status.followed_by) {
                                    const task = [ig.follow(following.pk)];
                                    let [follow] = await Promise.all(task);
                                    follow = follow ? chalk.bold.green(`Followed`) : chalk.bold.red("Not Followed");
                                    print(`• @${following.username} is ${follow}`);
                                    log.write(`${new Date().toString()} - Followed @${follower.username} - ${follow ? "Success" : "Failed"}\n`);
                                } else print(chalk`Skipped @${following.username} {yellow because their account is already followed or following you}`);
                        })
                    );
                    
                    // Sleeping
                    if (i < items.length - 1) print(`[@${login.username}] Sleeping for ${getRandomDelay()}ms.... \n`, "wait", true);
                    await delay(getRandomDelay());
                }
            } while (targetFollowings.moreAvailable);
            print(`Status: All tasks done!`, "ok", true);
            log.end();
        }
    } catch (err) {
        print(err, "err");
    }
})();
