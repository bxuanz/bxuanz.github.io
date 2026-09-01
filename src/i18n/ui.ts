// 界面文案。内容数据在 src/content/data/*.yaml。

export const ui = {
	nav: {
		about: { en: 'About', zh: '关于' },
		news: { en: 'News', zh: '动态' },
		publications: { en: 'Publications', zh: '论文' },
		education: { en: 'Education', zh: '教育' },
		honors: { en: 'Honors', zh: '荣誉' },
	},
	section: {
		about: { en: 'About Me', zh: '关于我' },
		news: { en: 'News', zh: '近期动态' },
		publications: { en: 'Selected Publications', zh: '代表性论文' },
		education: { en: 'Education', zh: '教育背景' },
		honors: { en: 'Honors', zh: '荣誉奖项' },
		interests: { en: 'Beyond Research', zh: '研究之外' },
		researchInterests: { en: 'Research Interests', zh: '研究兴趣' },
	},
	label: {
		showAll: { en: 'Show all', zh: '显示全部' },
		showLess: { en: 'Show less', zh: '收起' },
		email: { en: 'Email', zh: '邮箱' },
		github: { en: 'GitHub', zh: 'GitHub' },
		scholar: { en: 'Google Scholar', zh: '谷歌学术' },
		cv: { en: 'Curriculum Vitae', zh: '简历' },
		code: { en: 'Code', zh: '代码' },
		firstAuthor: { en: 'First Author', zh: '第一作者' },
		coFirstAuthor: { en: 'Co-first Author', zh: '共同一作' },
		highlight: { en: 'Highlight', zh: 'Highlight' },
		langSwitch: { en: '中文', zh: 'EN' },
		langSwitchTitle: { en: 'Switch to Chinese', zh: '切换为英文' },
	},
	footer: {
		builtWith: { en: 'Built with Astro', zh: '由 Astro 构建' },
	},
};

export const statusLabel = {
	first: ui.label.firstAuthor,
	cofirst: ui.label.coFirstAuthor,
	highlight: ui.label.highlight,
};
