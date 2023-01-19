const { chalk, inquirer, _, fs, instagram, print, delay } = require("./../api.js");
require('dotenv').config();

(async () => {
    print(
        chalk`{bold.yellow
  Like all post from Location [NEW]\n}`)

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
            const minDelay = 60000; // Minimum Delay
            const maxDelay = 1000000; // Maximum Delay
            return Math.floor(Math.random() * (maxDelay - minDelay + 1)) + minDelay;
        }
        
        // Try to Login
        const ig = new instagram(username, password);
        print("Try to Login . . .", "wait", true);
        const login = await ig.login();
        print(`Logged in as @${login.username} (User ID: ${login.pk})`, "ok");
        
        // Collecting media...
        print(`Collecting media on location feed . . .`, "wait");
        const locationFeed = await ig.locationFeed(location);
        
        // Logs
        const log = fs.createWriteStream("./logs/targetLocation/like.txt", { flags: "a" });
        // Doing tasks
        print(`You will like each ${perExec} posts per-execution`, "ok");
        print(`All logs will be stored here /logs/targetLocation/like.txt \n`, "ok");
        do {
            let items = await locationFeed.items();
            items = _.chunk(items, perExec);
            for (let i = 0; i < items.length; i++) {
                await Promise.all(
                    items[i].map(async (media) => {
                        const status = await ig.friendshipStatus(media.user.pk);
                        if (!media.has_liked && !media.user.is_private) {
                            const task = [ig.like(media.pk)];
                            let like = await Promise.all(task);
                            like = like ? chalk.bold.green("Liked") : chalk.bold.red("Not Liked");
                            print(`• ${like} post from @${media.user.username}`);
                            log.write(`${new Date().toString()} - Liked post from @${media.user.username} - ${like ? "Success" : "Failed"}\n`);
                        } else print(chalk`Skipped @${media.user.username} {yellow because their account is already liked}`);
                    })
                );
                if (i < items.length - 1) print(`[@${login.username}] Sleeping for ${getRandomDelay()}ms.... \n`, "wait", true);
                await delay(getRandomDelay());
            }
        } while (locationFeed.moreAvailable);
        print(`Status: All Task done!`, "ok", true);
        log.end();
    } catch (err) {
        print(err, "err");
    }
})();