const { chalk, inquirer, _, fs, instagram, print, delay } = require("./../api.js");
require('dotenv').config();

(async () => {
    print(
        chalk`{bold.yellow
  Follow, Like & Comment post from Hashtag\n}`);
  
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
        
        // Try to Login
        const ig = new instagram(username, password);
        print("Trying to log in...", "wait", true);
        const login = await ig.login();
        print(`Logged in as @${login.username} (User ID : ${login.pk})`, "ok");
        
        // Collecting users
        print("Collecting users in tagged media . . .", "wait");
        const tags = await ig.tagFeed(hashtag);

        // Logs
        const log = fs.createWriteStream("./logs/hashtags/all-activity-log.txt", { flags: "a" });             
        
        // Doing tasks
        print(`You will follow, like & comment each ${perExec} user per-execution\n`, "wait");
        print(`All logs will be stored here /logs/hashtags/all-activity-log.txt`, "ok");
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
                            const task = [ig.follow(media.user.pk), ig.like(media.pk), ig.comment(media.pk, msg)];
                            let [follow, like, comment] = await Promise.all(task);
                            follow = follow ? chalk.bold.green(`Followed`) : chalk.bold.red("Not followed");
                            like = like ? chalk.bold.green("Liked") : chalk.bold.red("Not liked");
                            comment = comment ? chalk.bold.green("Commented") : chalk.bold.red("not commented");
                            print(`• #${hashtag} | ${follow}, ${like}, ${comment} posts from @${media.user.username}`);
                            log.write(`${new Date().toString()} - Followed @${media.user.username} - ${follow ? "Success" : "Failed"}\n`);
log.write(`${new Date().toString()} - Liked post from @${media.user.username} - ${like ? "Success" : "Failed"}\n`);
log.write(`${new Date().toString()} - Commented post from @${media.user.username} - ${comment ? "Success" : "Failed"}\n`);
                        } else print(chalk`• {yellow Skipped @${media.user.username} because your account are already interacted}`);
                    })
                );
                
                // Sleeping 
                if (i < items.length - 1) print(`[@${login.username}] Sleeping for ${getRandomDelay()}ms.... \n`, "wait", true);
                await delay(getRandomDelay());
            }
        } while (tags.moreAvailable);
        print(`Status : All tasks done!`, "ok", true);
        log.end();
    } catch (err) {
        print(err, "err");
    }
})();
