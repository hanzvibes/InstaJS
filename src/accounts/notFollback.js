const { chalk, inquirer, _, fs, instagram, print, delay } = require("./../api.js");
require('dotenv').config();

(async () => {
    print(
        chalk`{bold.yellow
  Unfollow users who not following you back\n}`);
    
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
        print("Try to Login . . .", "wait", true);
        const login = await ig.login();
        print(`Logged in as @${login.username} (ID: ${login.pk})`, "ok");
        
        // Collecting users
        print(`Collecting users who not follows you back . . .`, "wait");
        const getMyFollowers = async () => {
            let followers = [];
            try {
                const get = await ig.followersFeed(login.pk);
                do {
                    let items = await get.items();
                    await Promise.all(items.map((follower) => followers.push({ id: follower.pk, username: follower.username })));
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
                    await Promise.all(items.map((follows) => following.push({ id: follows.pk, username: follows.username })));
                } while (get.moreAvailable);
                return Promise.resolve(following);
            } catch (err) {
                return Promise.reject(err.message);
            }
        };

        let users = [];
        const [following, followers] = await Promise.all([getMyFollowing(), getMyFollowers()]);
        
        // Show total followings
        print(`You're following ${following.length} account...`, "ok");
        
        // Logs
        const log = fs.createWriteStream("./logs/accounts/unfollow.txt", { flags: "a" });
        print(`All logs will be stored here /logs/hashtags/unfollow.txt`, "ok");

        await Promise.all(following.map(async (user) => (users = _.differenceBy(following, followers, "id"))));
        
        // Show total users who not following you back
        print(`Found ${users.length} account who not follows you back`, "ok");
        
        // Doing tasks
        print(`You will unfollow ${perExec} accounts per-execution \n`, "wait");
        users = _.chunk(users, perExec);
        for (let i = 0; i < users.length; i++) {
            await Promise.all(           
                users[i].map(async (user) => {
                    const unfollow = await ig.unfollow(user.id);
                    print(`• @${user.username} ${unfollow ? chalk.bold.green("Unfollowed!") : chalk.bold.red("Failed to Unfollow!")}`);
                    log.write(`${new Date().toString()} - Unfollowed @${user.username} - ${unfollow ? "Success" : "Failed"}\n`);
                })
            );
            
            // Sleeping 
            if (i < users.length - 1) print(`[@${login.username}] Sleeping for ${getRandomDelay()}ms.... \n`, "wait", true);
            await delay(getRandomDelay());
        }
        print(`Status: All Task done!`, "ok", true);
        log.end();
    } catch (err) {
        print(err, "err");
    }
})();