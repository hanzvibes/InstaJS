const { chalk, inquirer, _, fs, instagram, print, delay } = require("./../api.js");
require('dotenv').config();

(async () => {
    print(
        chalk`{bold.yellow
  Like All Post from Target Account \n}`);
  
    const questions = [
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
    
    try {
        const { target, perExec } = await inquirer.prompt(questions);
        
        // Login Information
        const username = process.env.INSTAGRAM_USERNAME;
        const password = process.env.INSTAGRAM_PASSWORD;
        
        // Auto Change Delay
        function getRandomDelay() {
            const minDelay = 600000; // Minimum Delay
            const maxDelay = 1000000; // Maximum Delay
            return Math.floor(Math.random() * (maxDelay - minDelay + 1)) + minDelay;
        }
        
        // Try To Login
        const ig = new instagram(username, password);
        print("Try to Login . . .", "wait", true);
        const login = await ig.login();
        print(`Logged in as @${login.username} (User ID: ${login.pk})`, "ok");
        
        // Collecting User Info
        print(`Collecting information of @${target}..`, "wait");
        const id = await ig.getIdByUsername(target),
            info = await ig.userInfo(id);
        if (!info.is_private && info.media_count != 0) {
            print(`@${info.username} (User ID: ${info.pk})`, "ok");
            
            // Collecting User Media    
            print("Collecting user feeds . . .", "wait");
            const feed = await ig.userFeed(id);
            
            // Logs
        const log = fs.createWriteStream("./logs/feeds/like.txt", { flags: "a" });
        
            // Doing Tasks
            print(`You will like each ${perExec} post per-execution`, "ok");
            print(`All logs will be stored here /logs/feeds/like.txt \n`, "ok");
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
                                    log.write(`${new Date().toString()} - Liked post from @${media.user.username} - ${like ? "Success" : "Failed"}\n`);
                                } else print(chalk`• @${media.user.username} {yellow Already liked!}`);
                            })
                        );
                        
                        // Sleeping
                        if (i < items.length - 1) print(`[@${login.username}] Sleeping for ${getRandomDelay()}ms.... \n`, "wait", true);
                        await delay(getRandomDelay());
                    }
                } else print(`No posts yet!`, "err");
            } while (feed.moreAvailable);
            print(`All Tasks done!`, "ok", true);
            log.end();
        } else print(`@${target} is private account !`, "err");
    } catch (err) {
        print(err, "err");
    }
})();
