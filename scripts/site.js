const fs = require("fs");
const path = require("path");
const dirOption = {
  encoding: "utf8",
  withFileTypes: false,
};
const protocol = "http://";
const hostnames = ["www.eggcake.cn", "wap.eggcake.cn"];
const targetDir = ".next/server/pages";
const extReg = /(.html$)|(^index.html$)/;

let siteCount = 0;

const getSites = () => {
  let result = "";
  const dirs = fs.readdirSync(targetDir, dirOption);
  hostnames.forEach((hostItem) => {
    dirs.forEach((file) => {
      const subPath = path.join(targetDir, file);
      if (file.endsWith(".html") && file !== "404.html") {
        siteCount++;
        result += `${protocol}${path.join(
          hostItem,
          file.replace(/(.html$)|(^index.html$)/, "")
        )}\n`;
      }
      const stats = fs.statSync(subPath);
      if (stats.isDirectory()) {
        const pageNames = fs.readdirSync(subPath, dirOption);
        pageNames.forEach((pageName) => {
          if (pageName.endsWith(".html")) {
            siteCount++;
            result += `${protocol}${path.join(
              hostItem,
              file,
              pageName.replace(extReg, "")
            )}\n`;
          }
        });
      }
    });
  });
  return result;
};

const sites = getSites();
console.log(sites);
console.info('🦊🦊🦊🦊🦊🦊🦊🦊🦊🦊🦊🦊🦊🦊🦊🦊🦊🦊🦊🦊总共生成'+ siteCount + '条site数据。');
fs.writeFileSync("public/site.txt", sites, {
  encoding: "utf8",
  mode: 0o666,
  flags: "w",
});
