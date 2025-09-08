# Client Theme Design

## 目录架构

- client
	- **README.md**
	- **main.htm**  			// 主入口（切换主题）
	- **js/icafe.js**			// 由exe生成
	- core								// 核心通用能力
		- **apiclient.js**	// api ajax client
		- **core.js**				// core function
		- lib								// third pard js/css
		- js								// core js
		- css								// core css
	- themes							// 主题目录，每个主题为一个目录，入口文件固定为`main.htm`
		- icafemenu					// 迁移兼容 client/html/js/ocafe.js
			- css
			- js
			- images
			- **main.htm**		// 主题入口文件
			- manifest.json		// 主题信息
		- reborn
  		- ...
                - icafemenu_theme_v2
                        - **main.htm**

## Cyberpunk Theme

The UI uses `css/cyberpunk.css` to provide a Cyberpunk Dojo look. Colors and fonts are configured via CSS variables:

```
--bg, --primary, --accent, --accent-2, --info, --blue, --neon-pink
```

### Theme toggle

A button with id `theme-toggle` switches between dark and light modes. The choice is saved in `localStorage` and applied on load.

