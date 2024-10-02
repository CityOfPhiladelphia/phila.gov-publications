<template>
  <div
    id="publications"
    class="grid-container"
  >
    <div class="vue-search">
      <input
        id="search-bar"
        v-model="search"
        class="search-field"
        type="text"
        :placeholder="$t('Filter documents')"
        @keyup.enter="filterDocuments()"
      >
      <button
        v-if="search.length > 0"
        class="clear-search-btn"
        @click="clearSearch()"
      >
        <i class="fas fa-times" />
      </button>
      <button
        class="search-submit"
        @click="filterDocuments()"
      >
        <i class="fa-solid fa-magnifying-glass" />
      </button>
    </div>
    <div
      id="filter-results"
      class="bg-ghost-gray pam"
    >
      <h4>{{ $t('Filter results') }}</h4>
      <div class="filter-container grid-x grid-margin-x">
        <div class="start-date cell medium-5">
          <datepicker
            v-model="start"
            aria-label="Start date"
            name="Start date"
            :placeholder="$t('Start date')"
            format="MMM. dd, yyyy"
            :typeable="true" 
            :disabled-dates="{ from: new Date() }"
            @closed="filterDocuments()"
          />
        </div>
        <div class="arrow">
          <i class="fas fa-arrow-right" />
        </div>
        
        <div class="end-date cell medium-5 ">
          <datepicker
            v-model="end"
            aria-label="End date"
            name="end"
            :placeholder="$t('End date')"
            format="MMM. dd, yyyy"
            :typeable="true" 
            :disabled-dates="{ from: new Date() }"
            @closed="filterDocuments()"
          />
        </div>
        <div class="cell medium-8 filter-by-owner">
          <v-select
            ref="categorySelect"
            v-model="department"
            label="slang_name"
            :placeholder="$t('All departments')"
            :options="categories"
            :clearable="false"
            @input="filterDocuments()"
          />
        </div>
      </div>
    </div>
    <div
      v-show="loading"
      class="mtm center"
    >
      <i class="fas fa-spinner fa-spin fa-3x" />
    </div>
    <div
      v-show="failure"
      class="h3 mtm center"
    >
      {{ $t('There was a problem') }}
    </div>
    <div class="filter-summary">
      <span class="result-summary">
        <span v-if="emptyResponse">
          No results found for
          <span 
            v-if="displaySearch.length > 0"
            class="search-term"
          >
            <b><em>"{{ displaySearch }}"</em></b>
          </span>
        </span>
        <span v-else-if="$refs.paginator">
          Showing {{ pageStart }} – {{ pageEnd }} of {{ total }} results
          <span 
            v-if="displaySearch.length > 0"
            class="search-term"
          >
            for <b><em>"{{ displaySearch }}"</em></b>
          </span>
        </span>
        <span v-if="displaySearch.length > 0 && start == '' && end == '' && department == ''">
          <input
            type="submit"
            class="clear-button"
            value="Clear all"
            @click="clearAllFilters()"
          >
        </span>
      </span>
      <div>
        <span v-if="department !== ''">
          <button 
            class="filter-button"
            @click="clearDepartment()"
          >
            {{ department }}
            <i class="fa-solid fa-xmark" />
          </button>
        </span>

        <span v-if="start !== '' && end !== ''">
          <button 
            class="filter-button"
            @click="clearDates()"
          > 
            {{ start | formatFilterDate }} - {{ end | formatFilterDate }}
            <i class="fa-solid fa-xmark" />
          </button>
        </span>

        <span v-if="start !== '' && end !== '' || department !== ''">
          <input
            type="submit"
            class="clear-button"
            value="Clear all"
            @click="clearAllFilters()"
          >
        </span>
      </div>
      <div 
        v-if="emptyResponse" 
        class="helper-text"
      >
      <strong>There are no matching results.</strong>
        <br>
        <br>
        Improve your search results by:
        <br>
        <br>
        <ul>
          <li>Using different or fewer search terms.</li>
          <li>Checking your spelling.</li>
          <li>Removing or adjusting any filters.</li>
        </ul>
        Want to start over? Select “Clear all” to reset the search settings.
      </div>
    </div>
    <table 
      v-if="!loading && !failure && !emptyResponse"
      class="stack theme-light archive-results"
    >
      <thead>
        <tr>
          <th 
            :class="sortTitle"
            class="table-sort title"
            @click="sort('title')"
          >
            <span>{{ $t('Title') }}</span>
          </th>
          <th 
            class="table-sort date"
            :class="sortDate"
            @click="sort('date')"
          >
            <span>{{ $t('Publish date') }}</span>
          </th>
          <th>{{ $t('Department') }}</th>
        </tr>
      </thead>
      <!-- <tbody> -->
      <paginate
        ref="paginator"
        name="filteredDocuments"
        :list="filteredDocuments"
        class="paginate-list"
        tag="tbody"
        :per="20"
      >
        <tr
          v-for="post in paginated('filteredDocuments')"
          :key="post.id"
          class="vue-clickable-row"
          @click.stop.prevent="goToDoc(post.link)"
        >
          <!-- {{ post }} -->
          <td class="title">
            <a
              :href="translateLink(post.link)"
              target="_blank"
              @click.prevent="goToDoc(post.link)"
            >{{ post.title }}</a>
          </td>
          <td class="date">
            {{ post.date | formatDate }}
          </td>
          <td class="categories">
            <span
              v-for="(category, i) in post.categories"
              :key="i"
            >
              <span>{{ category.slang_name }}</span>
              <span v-if="i < post.categories.length - 1">,&nbsp;</span>
            </span>
          </td>
        </tr>
        <!-- </tbody> -->
      </paginate>
    </table>
    <paginate-links
      v-show="!loading && !emptyResponse && !failure"
      for="filteredDocuments"
      :async="true"
      :limit="3"
      :show-step-links="true"
      :hide-single-page="false"
      :step-links="{
        next: $t('Next'),
        prev: $t('Previous')
      }"
      @change="scrollToTop(); getPaginationRange()"
    />
  </div>
</template>

<script>
import moment from "moment";
import Vue from "vue";
import axios from "axios";
import vSelect from "vue-select";
import Datepicker from "vuejs-datepicker";
import VuePaginate from "vue-paginate";
import VueFuse from "vue-fuse";
import { loadLanguageAsync } from './../i18n.js';

Vue.use(VueFuse);
Vue.use(VuePaginate);

export default {
  name: "Publications",
  components: {
    vSelect,
    Datepicker,
  },
  filters: {
    formatDate: function (value) {
      if (value) {
        return moment(String(value)).format("MMM. DD, YYYY");
      }
    },
    formatFilterDate: function (value) {
      return moment(String(value)).format("MM/DD/YY");
    },
  },
  data: function () {
    return {
      documents: [],
      categories: [],
      currentSort: "date",
      currentSortDir: "desc",
      search: "",
      displaySearch: "",
      failure: false,
      loading: true,
      start: "",
      end: "",
      pageStart: 0,
      pageEnd: 0,
      total: 0,
      department: "",
      endpointCategories: [],
      endpointCategoriesSlang: [],
      filteredDocuments: [],
      paginate: [ "filteredDocuments" ],
      searchOptions: {
        shouldSort: true,
        tokenize: true,
        threshold: 0.4,
        keys: [ "title" ],
      },
    };
  },
  computed: {
    emptyResponse() {
      return this.filteredDocuments.length == 0;
    },
    sortTitle: function(){
      if (this.currentSort == 'title') {
        return this.currentSortDir;
      } 
      return "";
    },
    sortDate: function(){
      if (this.currentSort == 'date'){
        return this.currentSortDir;
      } 
      return "";
    },

    language() {
      let lang = this.isTranslated(window.location.pathname);
      const validLanguages = [ '/es', '/zh', '/ar', '/ht', '/fr', '/sw', '/pt', '/ru', '/vi' ];
      if (validLanguages.includes(lang)) {
        return lang.substring(1); 
      } 
      return 'en'; 
    },

    slug() {
      let vm = this;
      if (vm.language == 'en') {
        return "https://api.phila.gov/phila/publications/archives?count=-1";
      }

      const languageCode = vm.language; 
      const url = process.env.VUE_APP_BUCKET_URL + `${languageCode}/phila_publications_archives.json`;
      return url;
    },

    currentRouteName() {
      return this.isTranslated(window.location.pathname);
    },

    categoriesSlug(){
      let vm = this;
      if (vm.language == 'en') {
        return "https://api.phila.gov/phila/the-latest/categories";
      }
      const languageCode = vm.language;
      const url = process.env.VUE_APP_BUCKET_URL + `${languageCode}/phila_the-latest_categories.json`;
      return url;
    },
  
  },
  watch: {
    search(val) {
      if(val == '') {
        this.filterDocuments();
      }
    },
  },
  mounted: async function () {
    loadLanguageAsync(this.language);
    await this.getDocuments();
    await this.getAllCategories();
    await this.getDropdownCategories();
    await this.getPaginationRange();
  },

  methods: {
    isTranslated(path) {
      let splitPath = path.split("/");
      const langList = [ 'zh', 'es','ar', 'fr', 'ru', 'ms', 'hi', 'pt', 'bn', 'id', 'sw', 'ja', 'de', 'ko', 'it', 'fa', 'tr', 'nl', 'te', 'vi', 'ht' ];
      for (let i = 0; i < splitPath.length; i++) {
        if (langList.indexOf(splitPath[i]) > -1) {
          return '/'+splitPath[i];
        }
      }
      return null;
    },

    clearDepartment() {
      this.department = '';
      this.filterDocuments();
    },

    clearDates() {
      this.start = '';
      this.end = '';
      this.filterDocuments();
    },

    translateLink(link) {
      let self = this;
      return self.currentRouteName ? self.currentRouteName+link : link;
    },

    filterDocuments: async function () {
      let dateDocuments = await this.dateFilter(this.documents);
      let searchDocuments = await this.searchFilter(dateDocuments);
      let deptDocuments = await this.deptFilter(searchDocuments);
      this.displaySearch = this.search;
      this.filteredDocuments = deptDocuments;
      this.$nextTick(() => {
        this.getPaginationRange();
      });
    },

    dateFilter: async function (documents) {
      if (this.start !== "" && this.end !== "") {
        let queryStart = moment(this.start.setHours(0, 0, 0, 0)).unix(); //convert to 12:00AM of the start date
        let queryEnd = moment(this.end.setHours(23, 59, 59, 0)).unix(); //convert to 11:59pm of the end date

        if (queryEnd < queryStart) {
          return;
        } 
        this.failure = false;
        let datedDocuments = [];
        documents.forEach((document) => {
          let documentDate = moment(document.date).unix();
          if (documentDate >= queryStart && documentDate <= queryEnd) {
            datedDocuments.push(document);
          }
        });
        return datedDocuments;
        
      } 
      return documents;
      
    },

    deptFilter: async function (documents) {
      if (this.department !== "" && this.department !== null) {
        return documents.filter((document) => {
          return document.categories.find((category) => {
            if (category.slang_name === this.department) {
              return true;
            }
          });
        });
      } 
      return documents;
      
    },

    searchFilter: async function (documents) {
      if (this.search) {
        return this.$search(this.search, documents, this.searchOptions);
      }
      return documents;
    },

    getAllCategories: async function () {
      return axios
        .get(this.categoriesSlug)
        .then((response) => {
          this.endpointCategories = response.data;
        })
        .catch((e) => {
          window.console.log(e);
          this.endpointCategories = [];
        });
    },

    getDropdownCategories: async function () {
      this.documents.forEach((document) => {
        document.categories.forEach((category) => {
          let newCategory = category.slang_name;
          if (newCategory !== "") {
            this.categories.push(newCategory);
          }
        });
      });
      this.categories = this.categories.filter(
        (item, index) => this.categories.indexOf(item) === index);
      this.endpointCategories.forEach((category) => {
        this.endpointCategoriesSlang.push(category.slang_name);
      });
      this.categories = this.categories
        .filter((category) => this.endpointCategoriesSlang.includes(category))
        .sort();
      return;
    },

    getPaginationRange: function () {
      let rangeRegex = /^(\d+)-(\d+) of (\d+)$/;
      let matches = rangeRegex.exec(this.$refs.paginator.pageItemsCount);

      if (matches != null) {
        this.pageStart = matches[1];
        this.pageEnd = matches[2];
        this.total = matches[3];
      }
      return;
    },

    getDocuments: async function () {
      return axios
        .get(this.slug)
        .then((response) => {
          this.documents = response.data;
          this.filterDocuments();
          this.loading = false;
          this.failure = false;
        })
        .catch((e) => {
          window.console.log(e);
          this.failure = true;
        });
    },

    goToDoc: function (link) {
      window.location.href = link;
    },

    clearAllFilters: function() {
      this.search = '';
      this.start = '';
      this.end = '';
      this.department = '';
      this.filterDocuments();
    },

    sort: function(column) {
      //if column == current sort, reverse
      if(column === this.currentSort) {
        this.currentSortDir = this.currentSortDir === 'asc' ? 'desc' : 'asc';
      }
      this.currentSort = column;
      this.sortPosts();
    },

    sortPosts: function() {
      this.filteredDocuments = this.filteredDocuments.sort((a,b) => {
        let modifier = 1;
        if(this.currentSortDir === 'desc') {
          modifier = -1;
        }
        if(a[this.currentSort] < b[this.currentSort]) {
          return -1 * modifier;
        }
        if(a[this.currentSort] > b[this.currentSort]) {
          return 1 * modifier;
        }
        return 0;
      });
    },

    clearSearch: function() {
      this.search = '';
      this.filteredDocuments();
    },

    scrollToTop: function () {
      window.scrollTo({
        top: 0,
        behavior: "smooth",
      });
    },
  },
};
</script>

<style lang="scss">
@import 'node_modules/vue-select/dist/vue-select';

table {
  font-size: 14px;
  a {
    color: #0f4d90 !important;
  }
}
#filter-results {
  h4 {
   text-align:left;

  }
  i {
    margin-top:10px; 
  }
}
#publications {
  .grid-margin-x {
    margin: 0 !important;
  }
}

.arrow {
  margin: 0 1rem !important;
}

.start-date{
  margin: 0 !important;
}

.end-date {
  margin: 0 !important;
}

.filter-by-owner{
  font-family:"Open Sans", Helvetica, Roboto, Arial, sans-serif !important;
  margin-left: 2rem !important;
  // min-width: 300px;
  
}
.filter-by-owner .v-select .vs__dropdown-toggle {
  border:none;
  background:white;
}
.filter-by-owner .v-select .vs__open-indicator path{
  bottom:0;
  top:0;
  right:0;
  background: #0f4d90;
  padding: 0 0 0 9px;
  width: 30px;
  height:100%;
  fill: #0f4d90;
}

.filter-summary{
  margin: 16px 0px 16px 0px;
  text-align: left;
}

.search-term {
  margin-right: 8px;
}

.filter-button{
  margin: 8px 8px 0 0;
  padding: 4px;
  border: 2px solid transparent;
  border-radius: 4px;
  background-color: #cfcfcf;
  color: #333333;
  line-height: normal;
  text-transform: capitalize;
  font-weight: normal;
  cursor: pointer;
}

.filter-button:hover {
  border-color: #2176d2;
  background-color: #cfcfcf;
  color: #333333;
}

.filter-button i{
  padding-left: 4px;
}

.clear-button{
  margin: 12px 0 0 8px;
  border: none;
  background-color: transparent;
  color: #0f4d90;
  cursor: pointer;
  font-weight: 700;
  text-decoration: underline;
  padding: 0px;
}

.helper-text{
  background: rgba(150,201,255,.3);
  padding: 32px;
  margin-top: 2rem;
  width: fit-content;
}

.v-select .vs__actions{
  padding:0 5px 0 0;
}

.v-select .vs__search {
 color: #444444;
 background: white;
 font-size: 100%;
}

.vs__selected {
  position: absolute;
  z-index: 2;
  white-space: nowrap;
  max-width: 280px;
  text-overflow:ellipsis;
  overflow: hidden;
  
}

a.button{
  padding: 0.75rem 0.5rem;
  width: 100%;
}

@media screen and (max-width: 750px){
  .v-select{
    margin-bottom: 1rem;
  }

  a.button{
    width:140px;
  }
  .filter-by-owner {
    margin-left: 0 !important;
  }
  .arrow {
    margin-bottom: 1rem !important;
  }
  #filter-results {
    i {
      margin-top: 0;
    }
  }
}
.vue-search {
  position: relative;
  display: flex;

  .search-field{
    min-height: 3.8rem;
    border: 2px solid #0f4d90;
    background: white;
  }

  .clear-search-btn {
    position: absolute;
    top:16px;
    right: 70px;
    padding: 0;
    font-size: 20px;
    background-color: #fff;
    opacity: 0.8;
    cursor: pointer;
    color: rgba(60, 60, 60, 0.5);
      &:hover {
      background: transparent;
      color: black;
    }
  }

  .search-submit{ 
    padding: 0.4rem;
    font-size: 2rem;
    font-weight: 400;
    background: #0f4d90;
    color: white;
    width: 3.8rem;
    height: 3.8rem;
    cursor: pointer;
  }

  .fa-magnifying-glass{
    font-weight: normal;
  }
}
.vs__clear:hover {
  background-color: transparent;
}

.v-select .vs__dropdown-toggle{
  border-radius: 0;
  padding:0;
}

.filter-by-owner .v-select .vs__dropdown-menu{
 width: 400px;
}

.filter-by-owner .v-select input[type=search],
.v-select input[type=search]:focus{
  border:none;
}
.filter-by-owner .v-select .vs__open-indicator{
  border-color:white;
  cursor: pointer;
}
.filter-by-owner .v-select input[type=search],
.filter-by-owner .v-select input[type=search]:focus {
  height: 2.4rem;
  margin:0;
}
.filter-by-owner ul.vs__dropdown-menu{
  border:none;
  font-weight: bold;
  overflow-x: hidden;
}
.filter-by-owner ul.vs__dropdown-menu li{
  border-bottom: 1px solid #f0f0f0;
  padding: 15px 0 15px 10px;
}

.vdp-datepicker [type='text'] {
  height: 2.4rem;
}
.vdp-datepicker input{
  background: white;
  cursor: pointer;
}
#archive-results .vdp-datepicker__calendar .cell.selected,
#archive-results .vdp-datepicker__calendar .cell.selected.highlighted,
#archive-results .vdp-datepicker__calendar .cell.selected:hover {
  background: #25cef7;
}

.vs__dropdown-option--highlight.vs__dropdown-option{
  background: #0f4d90;
  color: white;
}

.vdp-datepicker__calendar span.prev.disabled {
    display: inline-block !important;
  }

  .vdp-datepicker__calendar span.next.disabled {
    display: inline-block !important;
  }
  
td {
  text-align: left;
}

.paginate-links{
  float:right;
}
</style>
