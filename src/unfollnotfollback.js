const { chalk, inquirer, _, fs, instagram, print, delay } = require("./index.js");

// Description 
(async () => {
    print(
        chalk`{bold.yellow
  Unfollow Account Who Not Following You Back\n}`);
    
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
        {
            type: "input",
            name: "delayTime",
            message: "Input delay time (in milliseconds):",
            validate: (val) => /[0-9]/.test(val) || "Only input numbers",
        },
    ];

// Service Start
    try {
        const { username, password, target, perExec, delayTime } = await inquirer.prompt(questions);
        const ig = new instagram(username, password);
        print("Try to Login . . .", "wait", true);
        const login = await ig.login();
        print(`Logged in as @${login.username} (ID: ${login.pk})`, "ok");
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
        print(`You're following ${following.length} Account !`, "ok");
        await Promise.all(following.map(async (user) => (users = _.differenceBy(following, followers, "id"))));
        print(`Found ${users.length} account who not follows you back`, "ok");
        print(`Doing task with ratio ${perExec} target / ${delayTime} milliseconds \n`, "wait");
        users = _.chunk(users, perExec);
        for (let i = 0; i < users.length; i++) {
            await Promise.all(
                users[i].map(async (user) => {
                    const unfollow = await ig.unfollow(user.id);
                    print(`• @${user.username} : ${unfollow ? chalk.bold.green("Unfollowed!") : chalk.bold.red("Failed to Unfollow!")}`);
                })
            );
            if (i < users.length - 1) print(`Current Account is @${login.username}) with Delay ${perExec}/${delayTime}ms \n`, "wait", true);
            await delay(delayTime);
        }
        print(`Status: All Task done!`, "ok", true);
    } catch (err) {
        print(err, "err");
    }
})();