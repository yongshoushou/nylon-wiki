// nylon-wiki 构建脚本（仓库版）
// 用法：改完 data.js 后在仓库根目录执行  node build.js
// 作用：把 data.js 内联进 index.html（第一个 script 块），保持单文件可部署。
//
// ⚠️ 教训：不要用 indexOf('<script>') 之外的方式找数据块——本仓库 index.html
// 的数据块就是第一个裸 <script>，其后是应用脚本。脚本内置断言防止误伤应用代码。

var fs = require("fs");
var path = require("path");
var root = __dirname;

var data = fs.readFileSync(path.join(root, "data.js"), "utf8");
if (data.indexOf("</" + "script>") >= 0) {
  console.error("[abort] data.js 含 </script>，需先转义");
  process.exit(1);
}

var file = path.join(root, "index.html");
var html = fs.readFileSync(file, "utf8");
var s = html.indexOf("<script>");
var e = html.indexOf("</" + "script>", s);
if (s < 0 || e < 0) { console.error("[abort] 数据块未找到"); process.exit(1); }
html = html.slice(0, s) + "<script>\n" + data + "\n</" + "script>" + html.slice(e + 9);

// 断言：应用代码必须在
["renderHome", "renderEdit", "renderSearch"].forEach(function (fn) {
  if (html.indexOf(fn) < 0) { console.error("[abort] 应用代码丢失：" + fn); process.exit(1); }
});

fs.writeFileSync(file, html);
console.log("同步完成：data.js -> index.html，大小", html.length, "字符");
