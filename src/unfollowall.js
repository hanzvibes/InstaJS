const { chalk, inquirer, _, fs, instagram, print, delay } = require("./index.js");

// Description
(async () => {
    print(
        chalk`{bold.green
  Unfollow / Remove All Following List from your account ( Auto Set Delay )\n}`);

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
        const login = await ig.login(),
            info = await ig.userInfo(login.pk);
        print(`Logged in as @${login.username} (ID: ${login.pk})`, "ok");
        print(`Collecting followed users . . .`, "wait");
        print(`You're following ${info.following_count} users !`, "ok");
        const following = await ig.followingFeed();
        print(`Doing task with ratio ${perExec} target / ${randomDelayTime} milliseconds \n`, "wait");
        do {
            let items = await following.items();
            items = _.chunk(items, perExec);
            for (let i = 0; i < items.length; i++) {
                await Promise.all(
                    items[i].map(async (user) => {
                        const unfollow = await ig.unfollow(user.pk);
                        print(`• @${user.username} : ${unfollow ? chalk.bold.green("Unfollowed!") : chalk.bold.red("Failed to Unfollow!")}`);
                    })
                );
                if (i < items.length - 1) print(`[@${login.username}] Sleeping for ${randomDelayTime}ms.... \n`, "wait", true);
                await delay(randomDelayTime);
            }
        } while (following.moreAvailable);
        print(`Status: All Task done!`, "ok", true);
    } catch (err) {
        print(err, "err");
    }
})();