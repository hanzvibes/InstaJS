const {
  chalk,
  inquirer,
  _,
  fs,
  instagram,
  print,
  delay,
} = require("./../api.js");
require("dotenv").config();

(async () => {
  print(
    chalk`{bold.yellow
  Like post from Target Followers List \n}`
  );

  // Input
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
      const minDelay = 180000; // Minimum Delay
      const maxDelay = 300000; // Maximum Delay
      return Math.floor(Math.random() * (maxDelay - minDelay + 1)) + minDelay;
    }

    // Try to login
    const ig = new instagram(username, password);
    print("Try to Login . . .", "wait", true);
    const login = await ig.login();
    print(`Logged in as @${login.username} (User ID: ${login.pk})`, "ok");

    // Collecting information
    print(`Collecting information of @${target} . . .`, "wait");
    const id = await ig.getIdByUsername(target),
      info = await ig.userInfo(id);

    if (!info.is_private) {
      print(
        `@${target} (User ID: ${id}) Followers : ${info.follower_count}, Following : ${info.following_count}`,
        "ok"
      );
      print("Collecting followers . . .", "wait");
      const targetFollowers = await ig.followersFeed(id);

      // Doing tasks
      print(`You will like each ${perExec} users per-execution \n`, "wait");
      do {
        let items = await targetFollowers.items();
        items = _.chunk(items, perExec);
        for (let i = 0; i < items.length; i++) {
          await Promise.all(
            items[i].map(async (follower) => {
              const status = await ig.friendshipStatus(follower.pk);
              if (
                !follower.is_private &&
                !status.following &&
                !status.followed_by
              ) {
                const media = await ig.userFeed(follower.pk),
                  lastMedia = await media.items();
                if (lastMedia.length != 0 && lastMedia[0].pk) {
                  const task = [ig.like(lastMedia[0].pk)];
                  let [like] = await Promise.all(task);
                  like = like
                    ? chalk.bold.green("Like")
                    : chalk.bold.red("Not Liked");
                  print(`• @${follower.username} : [${like}]`);
                } else
                  print(
                    chalk`• @${follower.username} : {yellow No posts yet, Skip.}`
                  );
              } else
                print(
                  chalk`• @${follower.username} : {yellow Private or already followed/follows you, Skip.}`
                );
            })
          );
          if (i < items.length - 1)
            print(
              `[${login.username}] Sleeping for ${getRandomDelay()}ms.... \n`,
              "wait",
              true
            );
          await delay(getRandomDelay());
        }
      } while (targetFollowers.moreAvailable);
      print(`Status: All Task done!`, "ok", true);
    } else print(`@${target} is private account`, "err");
  } catch (err) {
    print(err, "err");
  }
})();
