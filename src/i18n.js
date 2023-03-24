import Vue from 'vue';
import VueI18n from 'vue-i18n';

Vue.use(VueI18n);

export const i18n = new VueI18n({
  locale: 'en',
  fallbackLocale: 'en',
  messages: {
    "en": '',
  },
});

function setI18nLanguage (lang) {
  i18n.locale = lang;
  document.querySelector('html').setAttribute('lang', lang);
  return lang;
}

export function loadLanguageAsync (lang) {
  i18n.setLocaleMessage(lang, languages[lang]);
  return setI18nLanguage(lang);
}

const languages = {
  'en': {
    "Filter documents" : "Filter documents by title",
    "Filter results" : "Filter results",
    "Start date": "Start date",
    "End date": "End date",
    "All departments": "All departments",
    "Clear filters": "Clear filters",
    "Title": "Title",
    "Publish Date": "Publish Date",
    "Department": "Department",
    "Previous": "Previous",
    "Next": "Next",
    "No results":"Sorry, there are no results.",
    "There was a problem":"Sorry, there was a problem. Please try again.",
  },
  'es': {
    "Filter documents" : "Filtrar documentos por título",
    "Filter results" : "Filtrar resultados",
    "Start date": "Fecha de inicio",
    "End date": "Fecha de finalización",
    "All departments": "Todos los departamentos",
    "Clear filters": "Borrar filtros",
    "Title": "Título",
    "Publish Date": "Fecha de publicación",
    "Department": "Departamento",
    "Previous": "Anterior",
    "Next": "Próximo",
    "No results":"Lo sentimos, no hay resultados.",
    "There was a problem":"Lo siento, ha habido un problema. Por favor, inténtalo de nuevo.",
  },
  'zh': {
    "Filter documents" : "按标题筛选文档",
    "Filter results" : "筛选结果",
    "Start date": "开始日期",
    "End date": "结束日期",
    "All departments": "所有部门",
    "Clear filters": "清除筛选条件",
    "Title": "标题",
    "Publish Date": "部门",
    "Department": "Department",
    "Previous": "以前",
    "Next": "下一步",
    "No results":"抱歉，没有结果。",
    "There was a problem":"抱歉，出现了一个问题。请再试一次。",
  },
};