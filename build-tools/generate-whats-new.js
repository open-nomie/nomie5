const gitlog = require("gitlog").default;
const fs = require("fs");
const ROOT = __dirname + "/../";
const options = {
  repo: ROOT,
};

const commits = gitlog(options);

let features = [];
let fixes = [];
let chores = [];

commits.forEach((commit) => {
  if (commit.subject && commit.subject.search("fix:") > -1) {
    fixes.push(commit.subject.replace("fix: ", ""));
  }
  if (commit.subject && commit.subject.search("feat:") > -1) {
    features.push(commit.subject.replace("feat: ", ""));
  }
  if (commit.subject && commit.subject.search("chore:") > -1) {
    chores.push(commit.subject.replace("chore: ", ""));
  }
});

fs.writeFileSync(`${ROOT}/src-data/whatsNew.json`, JSON.stringify({ features, fixes, chores }));
