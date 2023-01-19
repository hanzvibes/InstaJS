const { chalk, inquirer, _, fs, instagram, print, delay } = require("./../api.js");
require('dotenv').config();

(async () => {
    print(
        chalk`{bold.yellow
  Comment all post from Hashtag \n}`);
  
    const questions = [
        {
            type: "input",
            name: "hashtag",
            message: "Input hashtag (without '#') :",
            validate: (val) => val.length != 0 || "Please input hashtag!",
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
        const { hashtag, perExec, inputMessage } = await inquirer.prompt(questions);
        
        // Login Information
        const username = process.env.INSTAGRAM_USERNAME;
        const password = process.env.INSTAGRAM_PASSWORD;
        
        // Auto Change Delay
        function getRandomDelay() {
            const minDelay = 600000; // Minimum Delay
            const maxDelay = 1000000; // Maximum Delay
            return Math.floor(Math.random() * (maxDelay - minDelay + 1)) + minDelay;
        }
        
        // Login
        const ig = new instagram(username, password);
        print("Trying to log in . . .", "wait", true);
        const login = await ig.login();
        print(`Logged in as @${login.username} (User ID : ${login.pk})`, "ok");
        
        // Collecting user media
        print("Collecting users in tagged media . . .", "wait");
        const tags = await ig.tagFeed(hashtag);
        
        // Logs
        const log = fs.createWriteStream("./logs/hashtags/comment.txt", { flags: "a" });

        // Doing tasks
        print(`You will comments each ${perExec} posts per-execution`, "ok");
        print(`All logs will be stored here /logs/hashtags/comment.txt \n`, "ok");
        do {
            let items = await tags.items();
            items = _.chunk(items, perExec);
            for (let i = 0; i < items.length; i++) {
                await Promise.all(
                    items[i].map(async (media) => {
                        const status = await ig.friendshipStatus(media.user.pk);
                        if (!media.has_liked && !media.user.is_private && !status.following && !status.followed_by) {
                            const text = inputMessage.split("|");
                            const msg = text[Math.floor(Math.random() * text.length)];
                            const task = [ig.comment(media.pk, msg)];
                            let [comment] = await Promise.all(task);
                            comment = comment ? chalk.bold.green("Commented") : chalk.bold.red("Not commented");
                            print(`• ${comment} post from @${media.user.username}`);
                            log.write(`${new Date().toString()} - Commented post from @${media.user.username} - ${comment ? "Success" : "Failed"}\n`);
                        } else print(chalk`• {yellow Skipped @${media.user.username} because their account was already commented}`);
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
