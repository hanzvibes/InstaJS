const { chalk, inquirer, _, fs, instagram, print, delay } = require("./index.js");

// Description 
(async () => {
    print(
        chalk`{bold.yellow
  Like all post from Hashtag ( Auto Set Delay )\n}`);
  
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
            name: "perExec",
            message: "Input limit per-execution:",
            validate: (val) => /[0-9]/.test(val) || "Only input numbers",
        },
    ];

    try {
        const { username, password, hashtag, perExec } = await inquirer.prompt(questions);
        
        // Delay
        const minDelay = 60000; // Minimum Delay
        const maxDelay = 100000; // Maximum Delay
        const randomDelayTime = Math.floor(Math.random() * (maxDelay - minDelay + 1)) + minDelay;
        
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
                        if (!media.has_liked && !media.user.is_private) {                          
                            const task = [ig.like(media.pk)];
                            let [like] = await Promise.all(task);
                            like = like ? chalk.bold.green("Liked") : chalk.bold.red("Not liked");
                            print(`• ${like} post from @${media.user.username}`);
                        } else print(chalk`• {yellow Skipped @${media.user.username} because their account are already liked}`);
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