const { chalk, inquirer, _, fs, instagram, print, delay } = require("./../api.js");
require('dotenv').config();

(async () => {
    print(
        chalk`{bold.yellow
  Like all post from Hashtag \n}`);
  
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
            message: "Input limit per-execution [1-5] :",
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
        
        print("Collecting users in tagged media . . .", "wait");
        const tags = await ig.tagFeed(hashtag);
        
        // Logs
        const log = fs.createWriteStream("./logs/hashtags/like.txt", { flags: "a" });
        // Doing tasks
        print(`You will like each ${perExec} posts per-execution`, "ok");
        print(`All logs will be stored here /logs/hashtags/like.txt \n`, "ok");
        do {
            let items = await tags.items();
            items = _.chunk(items, perExec);
            for (let i = 0; i < items.length; i++) {
                await Promise.all(
                    items[i].map(async (media) => {
                        const status = await ig.friendshipStatus(media.user.pk);
                        if (!media.has_liked && !media.user.is_private) {  
                            const task = [ig.like(media.pk)];
                            let [like] = await Promise.all(task);
                            like = like ? chalk.bold.green("Liked") : chalk.bold.red("Not liked");
                            print(`• ${like} post from @${media.user.username}`);
                            log.write(`${new Date().toString()} - Liked post from @${media.user.username} - ${like ? "Success" : "Failed"}\n`);
                        } else print(chalk`• {yellow Skipped @${media.user.username} because their account are already liked}`);
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