const { chalk, inquirer, _, fs, instagram, print, delay } = require("./../api.js");
require('dotenv').config();

(async () => {
    print(
        chalk`{bold.yellow
  Follow, Like & Comment post from Target Followers \n }`);
  
    const questions = [
        {
            type: "input",
            name: "target",
            message: "Input target's username (without '@') :",
            validate: (val) => val.length != 0 || "Please input target's username!",
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
            message: "Input limit per-execution :",
            validate: (val) => /[0-9]/.test(val) || "Only input numbers",
        },
    ];

    try {
        const { target, perExec, inputMessage } = await inquirer.prompt(questions);
        
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
        print("Try to log in . . .", "wait", true);
        const login = await ig.login();
        print(`Logged in as @${login.username} (ID : ${login.pk})`, "ok");
        
        // Collecting data
        print(`Collecting information of @${target} . . .`, "wait");
        const id = await ig.getIdByUsername(target),
            info = await ig.userInfo(id);
        if (!info.is_private) {
            print(`@${target} (ID: ${id}) Followers : ${info.follower_count}, Following : ${info.following_count}`, "ok");
            const getMyFollowers = async () => {
                let followers = [];
                try {
                    const get = await ig.followersFeed(login.pk);
                    do {
                        let items = await get.items();
                        await Promise.all(items.map((follower) => followers.push(follower.pk)));
                    } while (get.moreAvailable);
                    return Promise.resolve(followers);
                } catch (err) {
                    return Promise.reject(err.message);
                }
            };
            const getMyFollowing = async () => {
                let following = [];
                try {
                    const get = await ig.followingFeed(login.pk);
                    do {
                        let items = await get.items();
                        await Promise.all(items.map((follows) => following.push(follows.pk)));
                    } while (get.moreAvailable);
                    return Promise.resolve(following);
                } catch (err) {
                    return Promise.reject(err.message);
                }
            };
            const get = [getMyFollowers(), getMyFollowing()];
            const [myFollowers, myFollowing] = await Promise.all(get);
            const targetFollowers = await ig.followersFeed(id);
            
            // Logs
        const log = fs.createWriteStream("./logs/targetFollowers/all-activity-log.txt", { flags: "a" });             
            
            // Doing tasks
            print(`You will Follow, Like & Comment ${perExec} users per-execution`, "ok");
            print(`All logs will be stored here /logs/targetFollowers/all-activity.txt \n`, "ok");           
            do {
                let items = await targetFollowers.items();
                items = _.chunk(items, perExec);
                for (let i = 0; i < items.length; i++) {
                    await Promise.all(
                        items[i].map(async (follower) => {
                            if (!follower.is_private && !myFollowing.includes(follower.pk) && !myFollowers.includes(follower.pk)) {
                                const media = await ig.userFeed(follower.pk),
                                    lastMedia = await media.items();
                                const text = inputMessage.split("|");
                                const msg = text[Math.floor(Math.random() * text.length)];
                                if (lastMedia.length != 0 && lastMedia[0].pk) {
                                    const task = [ig.follow(follower.pk), ig.like(lastMedia[0].pk), ig.comment(lastMedia[0].pk, msg)];
                                    let [follow, like, comment] = await Promise.all(task);
                                    follow = follow ? chalk.bold.green(`Followed`) : chalk.bold.red("Not Followed");
                                    like = like ? chalk.bold.green("Liked") : chalk.bold.red("Not Liked");
                                    comment = comment ? chalk.bold.green("Comment") : chalk.bold.red("Not Commented");
                                    print(`• ${follow}, ${like}, ${comment} post from @${follower.username}`);
                                    log.write(`${new Date().toString()} - ${follow}, ${like}, ${comment} post from @${follower.username}`);
                                } else print(chalk`• @${follower.username} {yellow No posts yet, Skip.}`);
                            } else print(chalk`• {yellow Skipped @${follower.username} because your account are already interacted}`);
                        })
                    );
                    
                    // Sleeping 
                    if (i < items.length - 1) print(`[@${login.username}] Sleeping for ${getRandomDelay()}ms.... \n`, "wait", true);
                    await delay(getRandomDelay());
                }
            } while (targetFollowers.moreAvailable);
            print(`Status: All tasks done!`, "ok", true);
            log.end();
        } else print(`@${target} is private account`, "err");
    } catch (err) {
        print(err, "err");
    }
})();