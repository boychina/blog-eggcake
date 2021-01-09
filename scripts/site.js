const fs = require("fs");
const path = require("path");
const dirOption = {
  encoding: "utf8",
  withFileTypes: false,
};
const protocol = "http://";
const hostname = "www.eggcake.cn";
const targetDir = ".next/server/pages";
const extReg = /(.html$)|(^index.html$)/;

const getSites = () => {
  let result = "";
  const dirs = fs.readdirSync(targetDir, dirOption);
  dirs.forEach((file) => {
    const subPath = path.join(targetDir, file);
    if (file.endsWith(".html") && file !== "404.html") {
      result += `${protocol}${path.join(
        hostname,
        file.replace(/(.html$)|(^index.html$)/, "")
      )}\n`;
    }
    const stats = fs.statSync(subPath);
    if (stats.isDirectory()) {
      const pageNames = fs.readdirSync(subPath, dirOption);
      pageNames.forEach((pageName) => {
        if (pageName.endsWith(".html")) {
          result += `${protocol}${path.join(
            hostname,
            file,
            pageName.replace(extReg, "")
          )}\n`;
        }
      });
    }
  });
  return result;
};

const sites = getSites();
console.log(sites);
fs.writeFileSync("public/site.txt", sites, {
  encoding: "utf8",
  mode: 0o666,
  flags: "w",
});
