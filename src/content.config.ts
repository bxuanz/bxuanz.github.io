import { defineCollection } from 'astro:content';
import { z } from 'astro/zod';
import { file } from 'astro/loaders';
import yaml from 'js-yaml';

// 双语字段。en / zh 都是必填：漏掉一个，构建会直接失败并指出具体是哪个字段，
// 而不是静默渲染出半边空白。
const bilingual = z.object({ en: z.string(), zh: z.string() });

// ── 主页的结构化数据（YAML，双语）─────────────────────────────────
//
// 这些 YAML 都写成列表（每条以 - 开头），文件里的顺序就是网页上的顺序。
//
// 为什么需要下面这个 orderedList：file() loader 返回条目时按 id 字母序排，
// 会把书写顺序打乱；而它对缺 id 的列表条目只打一条日志就静默丢弃。所以这里
// 在解析时用补零的下标当 id——字母序恰好等于文件顺序，写内容的人不用管 id。

const orderedList = (text: string) => {
	const items = yaml.load(text);
	if (!Array.isArray(items)) {
		throw new Error('这个 YAML 需要写成列表，每条以 - 开头');
	}
	return items.map((item, i) => ({
		...(item as Record<string, unknown>),
		id: String(i).padStart(3, '0'),
	}));
};

// profile 只有一条，包成单条记录，于是 YAML 里可以平铺书写。
const single = (text: string) => ({ main: yaml.load(text) });

const profile = defineCollection({
	loader: file('src/content/data/profile.yaml', { parser: single }),
	schema: z.object({
		name: bilingual,
		title: bilingual,
		university: bilingual,
		location: bilingual,
		email: z.string().email(),
		avatar: z.string(),
		motto: z.string(),
		bio: bilingual,
		researchStatement: bilingual,
		collaboration: bilingual,
		links: z.object({
			github: z.string().url(),
			scholar: z.string().url(),
			cv: z.string().default(''),
		}),
	}),
});

const focusAreas = defineCollection({
	loader: file('src/content/data/focus-areas.yaml', { parser: orderedList }),
	schema: bilingual,
});

const interests = defineCollection({
	loader: file('src/content/data/interests.yaml', { parser: orderedList }),
	schema: z.object({
		name: bilingual,
		link: z.string().default(''),
	}),
});

const education = defineCollection({
	loader: file('src/content/data/education.yaml', { parser: orderedList }),
	schema: z.object({
		degree: bilingual,
		school: bilingual,
		year: bilingual,
		description: bilingual,
		// 校徽路径，放在 public/assets/ 下；可省略，省略时只显示校名
		logo: z.string().optional(),
	}),
});

const honors = defineCollection({
	loader: file('src/content/data/honors.yaml', { parser: orderedList }),
	schema: z.object({
		title: bilingual,
		// coerce 让 year 写成 2025 或 "2025" 都能通过
		year: z.coerce.string(),
		issuer: bilingual,
	}),
});

const publications = defineCollection({
	loader: file('src/content/data/publications.yaml', { parser: orderedList }),
	schema: z.object({
		title: z.string(),
		authors: z.string(),
		venue: z.string(),
		venueShort: z.string(),
		year: z.coerce.string(),
		// 可以同时挂多个角标，例如 [first, highlight]。
		// 含 first 或 cofirst 的默认显示，其余折叠起来。不填就是没有角标。
		status: z
			.array(z.enum(['first', 'cofirst', 'highlight']))
			.default([]),
		image: z.string().optional(),
		github: z.string().url().optional(),
		description: bilingual,
	}),
});

export const collections = {
	profile,
	focusAreas,
	interests,
	education,
	honors,
	publications,
};
