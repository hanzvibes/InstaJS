const { chalk, inquirer, _, fs, instagram, print, delay } = require("./index.js");

// Description 
(async () => {
    print(
        chalk`{bold.yellow
  Follow, Like & Comment post from Hashtag ( Auto Set Delay )\n}`);
  
    const questions = [
        {
            type: "input",
            name: "username",
            message: "Input username:",
            validate: (val) => val.length != 0 || "Please input username!",
        },
        {
            type: "password",
            name: "password",
            mask: "*",
            message: "Input password:",
            validate: (val) => val.length != 0 || "Please input password!",
        },
        {
            type: "input",
            name: "hashtag",
            message: "Input hashtag (without '#'):",
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
            message: "Input limit per-execution:",
            validate: (val) => /[0-9]/.test(val) || "Only input numbers",
        },
    ];

    try {
        const { username, password, hashtag, perExec, inputMessage } = await inquirer.prompt(questions);
        
        // Delay
        const minDelay = 600000; // Minimum Delay
        const maxDelay = 1000000; // Maximum Delay
        const randomDelayTime = Math.floor(Math.random() * (maxDelay - minDelay + 1)) + minDelay;
        
        // Login
        const ig = new instagram(username, password);
        print("Trying to log in . . .", "wait", true);
        const login = await ig.login();
        print(`Logged in as @${login.username} (User ID : ${login.pk})`, "ok");
        print("Collecting users in tagged media . . .", "wait");
        const tags = await ig.tagFeed(hashtag);
        print(`Doing tasks with ratio ${perExec} targets / ${randomDelayTime} milliseconds \n`, "wait");
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
                            print(`• ${follow}, ${like}, ${comment} post from @${media.user.username}`);
                        } else print(chalk`• {yellow Skipped @${media.user.username} because their account are already liked/followed}`);
                    })
                );
                if (i < items.length - 1) print(`[@${login.username}] Sleeping for ${randomDelayTime}ms.... \n`, "wait", true);
                await delay(randomDelayTime);
            }
        } while (tags.moreAvailable);
        print(`Status : All Tasks done!`, "ok", true);
    } catch (err) {
        print(err, "err");
    }
})();
