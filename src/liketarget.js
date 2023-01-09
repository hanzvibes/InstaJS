const { chalk, inquirer, _, fs, instagram, print, delay } = require("./index.js");

// Description 
(async () => {
    print(
        chalk`{bold.yellow
  Like All Post / Media from Target Account ( Auto Set Delay )\n}`);
  
// Input
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

// Service Start
    try {
        const { username, password, target, perExec } = await inquirer.prompt(questions);
        
        // Delay
        const minDelay = 60000; // Minimum Delay
        const maxDelay = 100000; // Maximum Delay
        const randomDelayTime = Math.floor(Math.random() * (maxDelay - minDelay + 1)) + minDelay;
        
        const ig = new instagram(username, password);
        print("Try to Login . . .", "wait", true);
        const login = await ig.login();
        print(`Logged in as @${login.username} (User ID: ${login.pk})`, "ok");
        print(`Collecting information of @${target}..`, "wait");
        const id = await ig.getIdByUsername(target),
            info = await ig.userInfo(id);
        if (!info.is_private && info.media_count != 0) {
            print(`@${info.username} (User ID: ${info.pk})`, "ok");
            print("Collecting user feeds . . .", "wait");
            const feed = await ig.userFeed(id);
            print(`Doing task with ratio ${perExec} target / ${randomDelayTime} milliseconds \n`, "wait");
            do {
                let items = await feed.items();
                if (items.length != 0) {
                    items = _.chunk(items, perExec);
                    for (let i = 0; i < items.length; i++) {
                        await Promise.all(
                            items[i].map(async (media) => {
                                if (!media.has_liked) {
                                    const like = await ig.like(media.pk);
                                    print(`• ${media.pk} : ${like ? chalk.bold.green("Liked!") : chalk.bold.red("Failed to Like!")}`);
                                } else print(chalk`• @${media.user.username} {yellow Already liked!}`);
                            })
                        );
                        if (i < items.length - 1) print(`[@${login.username}] Sleeping for ${delayTime}ms.... \n`, "wait", true);
                        await delay(randomDelayTime);
                    }
                } else print(`No posts yet!`, "err");
            } while (feed.moreAvailable);
            print(`Status: All Task done!`, "ok", true);
        } else print(`@${target} is private account !`, "err");
    } catch (err) {
        print(err, "err");
    }
})();