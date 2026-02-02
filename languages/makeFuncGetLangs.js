const fs = require("fs-extra");
const log = require("../logger/log.js");
const path = require("path");

// حدد ملف اللغة حسب الإعداد، جرب ar أولاً ثم en إذا لم يوجد
let languageCode = global.GoatBot.config.language || "ar";
let pathLanguageFile = path.normalize(`${__dirname}/${languageCode}.js`);

// إذا لم يوجد ملف اللغة المطلوب
if (!fs.existsSync(pathLanguageFile)) {
	log.warn(
		"LANGUAGE",
		`لا يمكن العثور على ملف اللغة ${languageCode}.js، سيتم استخدام ملف اللغة العربي "ar.js"`
	);
	pathLanguageFile = path.normalize(`${__dirname}/ar.js`);

	// إذا لم يكن ar.js موجودًا أيضًا، استخدم en.js كخيار أخير
	if (!fs.existsSync(pathLanguageFile)) {
		log.warn(
			"LANGUAGE",
			`لا يمكن العثور على ملف اللغة العربي ar.js، سيتم استخدام اللغة الإنجليزية en.js`
		);
		pathLanguageFile = path.normalize(`${__dirname}/en.js`);
	}
}

// استيراد محتوى الملف ككائن JS
const languageData = require(pathLanguageFile);
global.language = languageData;

// دالة لإرجاع النصوص حسب الرأس والمفتاح
function getText(head, key, ...args) {
	let langObj = global.language;

	if (typeof head === "object") {
		// دعم الشكل { head: "welcome", lang: "ar" } إذا تم تمريره
		let tmpPath = path.normalize(`${__dirname}/${head.lang}.js`);
		head = head.head;

		if (fs.existsSync(tmpPath)) {
			langObj = require(tmpPath);
		} else {
			log.warn("LANGUAGE", `لا يمكن العثور على ملف اللغة ${tmpPath}, سيتم استخدام اللغة الافتراضية ar.js`);
			langObj = require(`${__dirname}/ar.js`);
		}
	}

	if (!langObj[head]?.hasOwnProperty(key)) {
		return `لا يمكن العثور على النص: "${head}.${key}"`;
	}

	let text = langObj[head][key];

	// استبدال المتغيرات %1 %2 ...
	for (let i = args.length - 1; i >= 0; i--) {
		text = text.replace(new RegExp(`%${i + 1}`, "g"), args[i]);
	}

	return text;
}

module.exports = getText;
