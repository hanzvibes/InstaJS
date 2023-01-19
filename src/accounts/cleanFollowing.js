const { chalk, inquirer, _, fs, instagram, print, delay } = require("./../api.js");
require('dotenv').config();

(async () => {
    print(
        chalk`{bold.green
  Unfollow all people from your account\n}`);

    const questions = [
        {
            type: "input",
            name: "perExec",
            message: "Input limit per-execution [1-5]:",
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
            const minDelay = 600000; // Minimum Delay
            const maxDelay = 1000000; // Maximum Delay
            return Math.floor(Math.random() * (maxDelay - minDelay + 1)) + minDelay;
        }
        
        // Try to Login
        const ig = new instagram(username, password);
        print("Try to Login . . .", "wait", true);
        const login = await ig.login(),
            info = await ig.userInfo(login.pk);
        print(`Logged in as @${login.username} (ID: ${login.pk})`, "ok");
        
        // Collecting followed users
        print(`Collecting followed users . . .`, "wait");
        
        // Show total following 
        print(`You're following ${info.following_count} users !`, "ok");
        
        // Logs
        const log = fs.createWriteStream("./logs/accounts/unfollow.txt", { flags: "a" });
        
        const following = await ig.followingFeed();
        
        // Doing Tasks
        print(`You will unfollow ${perExec} users per-execution`, "ok");
        print(`All logs will be stored here /logs/hashtags/unfollow.txt \n`, "ok");
        do {
            let items = await following.items();
            items = _.chunk(items, perExec);
            for (let i = 0; i < items.length; i++) {
                await Promise.all(
                    items[i].map(async (user) => {
                        const unfollow = await ig.unfollow(user.pk);
                        print(`• @${user.username} : ${unfollow ? chalk.bold.green("Unfollowed!") : chalk.bold.red("Failed to Unfollow!")}`);
                        log.write(`${new Date().toString()} - Unfollowed @${user.username} - ${unfollow ? "Success" : "Failed"}\n`);
                    })
                );
                
                // Sleeping 
                if (i < items.length - 1) print(`[@${login.username}] Sleeping for ${getRandomDelay()}ms.... \n`, "wait", true);
                await delay(getRandomDelay());
            }
        } while (following.moreAvailable);
        print(`All Tasks done!`, "ok", true);
        log.end();
    } catch (err) {
        print(err, "err");
    }
})();
