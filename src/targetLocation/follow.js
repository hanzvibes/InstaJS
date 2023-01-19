const { chalk, inquirer, _, fs, instagram, print, delay } = require("./../api.js");
require('dotenv').config();

(async () => {
    print(
        chalk`{bold.yellow
  Folow all people from Location\n}`);
  
    const questions = [
        {
            type: "input",
            name: "location",
            message: "Input location ID:",
            validate: (val) => /[0-9]/.test(val) || "Only input numbers",
        },
        {
            type: "input",
            name: "perExec",
            message: "Input limit per-execution:",
            validate: (val) => /[0-9]/.test(val) || "Only input numbers",
        },
    ];

    try {
        const { location, perExec } = await inquirer.prompt(questions);
        
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
        print(`Logged in as @${login.username} (User ID : ${login.pk})`, "ok");
        
        // Collecting Media
        print(`Collecting media on location feed . . .`, "wait");
        const locationFeed = await ig.locationFeed(location);
        
        // Logs
        const log = fs.createWriteStream("./logs/targetLocation/follow.txt", { flags: "a" });

        // Doing tasks
        print(`You will follow each ${perExec} users per-execution`, "ok");
        print(`All logs will be stored here /logs/targetLocation/follow.txt \n`, "ok");
        do {
            let items = await locationFeed.items();
            items = _.chunk(items, perExec);
            for (let i = 0; i < items.length; i++) {
                await Promise.all(
                    items[i].map(async (media) => {
                        const status = await ig.friendshipStatus(media.user.pk);
                        if (!media.user.is_private && !status.following && !status.followed_by) {
                            const task = [ig.follow(media.user.pk)];
                            let follow = await Promise.all(task);
                            follow = follow ? chalk.bold.green(`Followed`) : chalk.bold.red("Not Followed");
                            print(`• ${follow} @${media.user.username}`);
                            log.write(`${new Date().toString()} - Followed @${media.user.username} - ${follow ? "Success" : "Failed"}\n`);
                        } else print(chalk`Skipped @${media.user.username} {yellow because their account is already followed or following you}`);
                    })
                );
                if (i < items.length - 1) print(`[@(${login.username}] Sleeping for ${getRandomDelay()}ms.... \n`, "wait", true);
                await delay(getRandomDelay());
            }
        } while (locationFeed.moreAvailable);
        print(`Status: All tasks done!`, "ok", true);
        log.end();
    } catch (err) {
        print(err, "err");
    }
})();
