const { chalk, inquirer, _, fs, instagram, print, delay } = require("./../api.js");
require('dotenv').config();

(async () => {
    print(
        chalk`{bold.yellow
  Like All post from your feeds\n}`);
  
    const questions = [
        {
            type: "input",
            name: "perExec",
            message: "Input limit per-execution [1-5] :",
            validate: (val) => /[0-9]/.test(val) || "Only input numbers",
        },        
    ];

    try {
        const { perExec } = await inquirer.prompt(questions);
        
        // Login Information
        const username = process.env.INSTAGRAM_USERNAME;
        const password = process.env.INSTAGRAM_PASSWORD;
        
        // Auto Change Delay
        function getRandomDelay() {
            const minDelay = 60000; // Minimum Delay
            const maxDelay = 100000; // Maximum Delay
            return Math.floor(Math.random() * (maxDelay - minDelay + 1)) + minDelay;
        }
        
        // Try to Login
        const ig = new instagram(username, password);
        print("Trying to Login . . .", "wait", true);
        const login = await ig.login();
        print(`Logged in as @${login.username} (User ID : ${login.pk})`, "ok");
        
        // Getting Timeline Feeds
        print("Collecting timeline feeds . . .", "wait");
        const feed = await ig.timelineFeed();
        
        // Logs
        const log = fs.createWriteStream("./logs/feeds/like.txt", { flags: "a" });
        
        // Doing tasks
        print(`You will like each ${perExec} post per-execution`, "ok");
        print(`All logs will be stored here /logs/feeds/like.txt \n`, "ok");
        do {
            let items = await feed.items();
            items = _.chunk(items, perExec);
            for (let i = 0; i < items.length; i++) {
                await Promise.all(
                    items[i].map(async (media) => {
                        if (!media.has_liked) {
                            const like = await ig.like(media.pk);
                            print(`• @${media.user.username} ${like ? chalk.bold.green("Liked !") : chalk.bold.red("Failed to Like !")}`);
                            log.write(`${new Date().toString()} - Liked post from @${media.user.username} - ${like ? "Success" : "Failed"}\n`);
                        } else print(chalk`• @${media.user.username} {yellow Already liked !}`);
                    })
                );
                
                // Sleeping
                if (i < items.length - 1) print(`[@${login.username}] Sleeping for ${getRandomDelay()}ms..... \n`, "wait", true);
                await delay(getRandomDelay());
            }
        } while (feed.moreAvailable);
        print(`All tasks done !`, "ok", true);
        log.end();
    } catch (err) {
        print(err, "err");
    }
})();
