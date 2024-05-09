# Welcome to your Chrome Extension

## 结合VSCode插件[Run on Save](https://marketplace.visualstudio.com/items?itemName=emeraldwalk.RunOnSave)和Chrome插件[Extensions Reloader](https://chromewebstore.google.com/detail/extensions-reloader/fimgfedafeadlieiabdeeaodndnlbhid)实现保存源码文件时自动重新加载拓展程序（Hot Reload）

>当前在Windows环境下测试通过，其他系统未测试

### 1.插件的安装和配置

1. 在Chrome浏览器安装插件[Extensions Reloader](https://chromewebstore.google.com/detail/extensions-reloader/fimgfedafeadlieiabdeeaodndnlbhid)

1. 在Chrome浏览器地址栏上填入`chrome://extensions/shortcuts`跳转到快捷键设置页面，保持默认的`Alt+Shift+R`不变，并将Extensions Reloader下设置`Reload all extensions in development`为`Global`

1. 在Vscode安装插件[Run on Save](https://marketplace.visualstudio.com/items?itemName=emeraldwalk.RunOnSave)

### 2.开发中的使用步骤

1. `npm run watch`

1. 打开Chrome浏览器页面

1. 修改并保存源代码文件（当前监听的文件夹为src，如需自定义，请编辑`.vscode/settings.json`下的emeraldwalk.runonsave->commands->match）

1. [Extensions Reloader](https://chromewebstore.google.com/detail/extensions-reloader/fimgfedafeadlieiabdeeaodndnlbhid)插件会显示OK字样，Chrome插件自动刷新完成

### 参考文章

1. https://solomonvictorino.com/reload-chrome-extensions-on-save-vs-code/
1. [请问 windows 上如何通过一行命令实现模拟按键（ctrl+v）？ 正文里有 mac 端的实现](https://www.v2ex.com/t/473454)
1. https://learn.microsoft.com/en-us/office/vba/language/reference/user-interface-help/sendkeys-statement

## What's in this directory
* `config/`: Webpack configuration for this project.
* `public/`: HTML files for the override page.
    * `manifest.json`: Extension [configuration](https://developer.chrome.com/docs/extensions/mv2/manifest/).
* `src/`: Source files for the override page. See [chrome docs](https://developer.chrome.com/docs/extensions/mv3/override/#manifest) for more details.
* `.gitignore`: Lists files to be ignored in your Git repo.
* `package.json`: Contains project configuration, scripts, and dependencies.

## Test the extension
1. `npm run watch`
2. Open [chrome://extensions](chrome://extensions).
3. Enable developer mode (top right of page).
4. Click "Load unpacked extension" (top left page).
5. Select this directory.

## Bundle the extension
To package the source code into static files for the Chrome webstore, execute `npm run build`.

## Documentation
Refer to [the Chrome developer documentation](https://developer.chrome.com/docs/extensions/mv3/getstarted/) to get started.

## VSCode developer tools
Refer to [github.com/gadhagod/vscode-chrome-extension-developer-tools/blob/master/README.md#commands](https://github.com/gadhagod/vscode-chrome-extension-developer-tools/blob/master/README.md#commands).