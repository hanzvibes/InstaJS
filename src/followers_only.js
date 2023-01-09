const { chalk, inquirer, _, fs, instagram, print, delay } = require("./index.js");

(async () => {
    print(
        chalk`{bold.yellow
  Follow Account from Target Followers List ( Auto Set Delay )\n}`);
    
    const questions = [
        {
            type: "input",
            name: "username",
            message: "Input Username:",
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

    try {
        const { username, password, target, perExec } = await inquirer.prompt(questions);
        
        // Delay
        const minDelay = 600000; // Minimum Delay
        const maxDelay = 2000000; // Maximum Delay
        const randomDelayTime = Math.floor(Math.random() * (maxDelay - minDelay + 1)) + minDelay;
        
        // Login
        const ig = new instagram(username, password);
        print("Try to Login . . .", "wait", true);
        const login = await ig.login();
        print(`Logged in as @${login.username} (User ID: ${login.pk})`, "ok");             
        
        // Getting user information 
        print(`Collecting information of @${target} . . .`, "wait");
        const id = await ig.getIdByUsername(target),
            info = await ig.userInfo(id);
            
        // Checking target    
        if (!info.is_private) {
            print(`@${target} (User ID: ${id}) => Followers: ${info.follower_count}, Following: ${info.following_count}`, "ok");
            print("Collecting followers list. . .", "wait");
            const targetFollowers = await ig.followersFeed(id);
            
        // Starting service    
            print(`Doing task with ratio ${perExec} target / ${randomDelayTime} milliseconds \n`, "wait");
            do {
                let items = await targetFollowers.items();
                items = _.chunk(items, perExec);
                
        // Loop
                for (let i = 0; i < items.length; i++) {
                    await Promise.all(
                        items[i].map(async (follower) => {
                            const status = await ig.friendshipStatus(follower.pk);
                            if (!status.following && !status.followed_by) {
                                    const task = [ig.follow(follower.pk)];
                                    let [follow] = await Promise.all(task);
                                    follow = follow ? chalk.bold.green(`Followed`) : chalk.bold.red("Failed to follow");
                                    print(`• @${follower.username} : ${follow}`);
                                } else print(chalk`• @${follower.username} : {yellow Already followed/follows you, Skip.}`);
                        })
                    );
                    
       // Pause
                    if (i < items.length - 1) print(`[@${login.username}] Sleeping for ${randomDelayTime}ms.... \n`, "wait", true);
                await delay(randomDelayTime);
            }
            } while (targetFollowers.moreAvailable);
            print(`Status: All Task done!`, "ok", true);
        }
    } catch (err) {
        print(err, "err");
    }
})();