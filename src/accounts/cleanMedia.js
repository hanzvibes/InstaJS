const { chalk, inquirer, _, fs, instagram, print, delay } = require("./../api.js");
require('dotenv').config();

(async () => {
    print(
        chalk`{bold.yellow
  Delete All Media from your Account ( Post / Photos / Videos / etc )\n}`);
    
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
            const minDelay = 600000; // Minimum Delay
            const maxDelay = 1000000; // Maximum Delay
            return Math.floor(Math.random() * (maxDelay - minDelay + 1)) + minDelay;
        }
        
        // Try to Login
        const ig = new instagram(username, password);
        print("Trying to log iin . . .", "wait", true);
        const login = await ig.login();
        print(`Logged in as @${login.username} (User ID : ${login.pk})`, "ok");
        
        // Log
        const log = fs.createWriteStream("./logs/accounts/unfollow.txt", { flags: "a" });
        print(`All logs will be stored here /logs/hashtags/unfollow.txt`, "ok");
        
        const info = await ig.userInfo(login.pk);
        if (info.media_count != 0) {
            print(`Found ${info.media_count} media`, "ok");
            print("Collecting user feeds . . .", "wait");
            const feed = await ig.userFeed(login.pk);
            
            // Doing tasks
            print(`You will delete ${perExec} post per-execution\n`, "wait");
            do {
                let items = await feed.items();
                items = _.chunk(items, perExec);
                for (let i = 0; i < items.length; i++) {
                    await Promise.all(
                        items[i].map(async (media) => {
                            const type = media.media_type == 1 ? "photo" : media.media_type == 2 ? "video" : "carousel";
                            const del = await ig.deleteMedia(media.pk, type);
                            print(`• /p/${media.code}/ (${media.pk}) : ${del ? chalk.bold.green("was deleted ✓") : chalk.bold.red("failed to delete !")}`);
                            log.write(`${new Date().toString()} - /p/${media.code}/ (${media.pk}) : ${del ? was deleted ✓ : failed to delete !}\n`);
                        })
                    );
                    
                    // Sleeping
                    if (i < items.length - 1) print(`[@${login.username}] Sleeping for ${getRandomDelay()}ms.... \n`, "wait", true);
                    await delay(getRandomDelay());
                }
            } while (feed.moreAvailable);
            print(`Status : All tasks done!`, "ok", true);
        } else print(`Nothing to delete!`, "err");
    } catch (err) {
        print(err, "err");
    }
})();