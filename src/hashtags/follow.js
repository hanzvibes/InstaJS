const { chalk, inquirer, _, fs, instagram, print, delay } = require("./../api.js");
require('dotenv').config();

(async () => {
    print(
        chalk`{bold.yellow
  Follow all user from Hashtag \n}`);
  
    const questions = [
        {
            type: "input",
            name: "hashtag",
            message: "Input hashtag (without '#') :",
            validate: (val) => val.length != 0 || "Please input hashtag!",
        },
        {
            type: "input",
            name: "perExec",
            message: "Input limit per-execution [1-5]:",
            validate: (val) => /[0-9]/.test(val) || "Only input numbers",
        },
    ];

    try {
        const { hashtag, perExec } = await inquirer.prompt(questions);
        
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
        print("Trying to log in . . .", "wait", true);
        const login = await ig.login();
        print(`Logged in as @${login.username} (User ID : ${login.pk})`, "ok");
        
        // Collecting user media
        print("Collecting users in tagged media . . .", "wait");
        const tags = await ig.tagFeed(hashtag);
        
        // Logs
        const log = fs.createWriteStream("./logs/hashtags/follow.txt", { flags: "a" });

        // Doing tasks
        print(`You will follow each ${perExec} users per-execution`, "ok");
        print(`All logs will be stored here /logs/hashtags/follow.txt \n`, "ok");
        do {
            let items = await tags.items();
            items = _.chunk(items, perExec);
            for (let i = 0; i < items.length; i++) {
                await Promise.all(
                    items[i].map(async (media) => {
                        const status = await ig.friendshipStatus(media.user.pk);
                        if (!status.following && !status.followed_by) {                            
                            const task = [ig.follow(media.user.pk)];
                            let [follow] = await Promise.all(task);
                            follow = follow ? chalk.bold.green(`Followed`) : chalk.bold.red("Not followed");                            
                            print(`• @${media.user.username} : ${follow}`);
                            log.write(`${new Date().toString()} - Followed @${media.user.username} - ${follow ? "Success" : "Failed"}\n`);
                        } else print(chalk`• {yellow Skipped @${media.user.username} because their account are already followed}`);
                    })
                );
                
                // Sleeping
                if (i < items.length - 1) print(`[@${login.username}] Sleeping for ${getRandomDelay()}ms.... \n`, "wait", true);
                await delay(getRandomDelay());
            }
        } while (tags.moreAvailable);
        print(`Status : All Tasks done!`, "ok", true);
        log.end();
    } catch (err) {
        print(err, "err");
    }
})();