<template>
  <div
    id="publications"
    class="grid-container"
  >
    <div class="search">
      <input
        id="search-bar"
        v-model="search"
        class="search-field"
        type="text"
        placeholder="Filter documents by title"
        @keyup.enter="filterDocuments();"
      >
      <input
        ref="archive-search-bar"
        type="submit"
        class="search-submit"
        value="Search"
        @click="filterDocuments();"
      >
      <button
        v-if="search.length > 0"
        class="clear-search-btn"
        @click="clearSearch()"
      >
        <i class="fas fa-times" />
      </button>
    </div>
    <div
      id="filter-results"
      class="bg-ghost-gray pam"
    >
      <h6>Filter results</h6>
      <div class="filter-container grid-x grid-margin-x">
        <div class="cell medium-5 small-10">
          <datepicker
            v-model="start"
            name="start"
            placeholder="Start date"
            format="MMM. dd, yyyy"
            :typeable="true" 
            :disabled-dates="{ from: new Date() }"
            @closed="filterDocuments()"
          />
        </div>
        <div class="cell medium-1 small-10">
          <i class="fas fa-arrow-right" />
        </div>
        
        <div class="cell medium-5 ">
          <datepicker
            v-model="end"
            name="end"
            placeholder="End date"
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
            placeholder="All departments"
            :options="categories"
            @input="filterDocuments()"
          />
        </div>
        <div class="cell medium-5 ">
          <a
            class="button content-type-featured full"
            @click="clearAllFilters()"
          >Clear filters</a>
        </div>
      </div>
    </div>
    <table class="stack theme-light archive-results">
      <thead
      >
        <tr>
          <th class="table-sort title">
            <span>Title</span>
          </th>
          <th class="table-sort date">
            <span>Publish date</span>
          </th>
          <th>Department</th>
        </tr>
      </thead>
      <!-- <tbody> -->
      <paginate
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
          @click.stop.prevent="goToPost(post.link)"
        >
          <td class="title">
            <a
              :href="post.link"
              target="_blank"
              @click.prevent="goToPost(post.link)"
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
      for="filteredDocuments"
      :async="true"
      :limit="3"
      :show-step-links="true"
      :hide-single-page="false"
      :step-links="{
        next: 'Next',
        prev: 'Previous'
      }"
      @change="scrollToTop"
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

Vue.use(VueFuse);
Vue.use(VuePaginate);

const pubsEndpoint = "https://www.phila.gov/wp-json/publications/v1/";

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
  },
  data: function () {
    return {
      documents: [],
      categories: [],
      currentSort: "date",
      currentSortDir: "desc",
      search: "",
      failure: false,
      start: "",
      end: "",
      department: "",
      endpointCategories: [],
      endpointCategoriesSlang: [],
      filteredDocuments: [],
      paginate: [ "filteredDocuments" ],
      searchOptions: {
        shouldSort: false,
        threshold: 0.3,
        keys: [ "title" ],
      },
    };
  },
  watch: {
    search(val) {
      if(val == '') {
        this.filterDocuments();
      }
    },
  },
  mounted: async function () {
    await this.getDocuments();
    await this.getAllCategories();
    await this.getDropdownCategories();
  },

  methods: {
    filterDocuments: async function () {
      let dateDocuments = await this.dateFilter(this.documents);
      let searchDocuments = await this.searchFilter(dateDocuments);
      this.filteredDocuments  = await this.deptFilter(searchDocuments);
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
        return this.documents.filter((document) => {
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
        .get("https://www.phila.gov/wp-json/the-latest/v1/categories")
        .then((response) => {
          this.endpointCategories = response.data;
        })
        .catch((e) => {
          console.log(e);
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
        (item, index) => this.categories.indexOf(item) === index
      );
      this.endpointCategories.forEach((category) => {
        this.endpointCategoriesSlang.push(category.slang_name);
      });
      this.categories = this.categories
        .filter((category) => this.endpointCategoriesSlang.includes(category))
        .sort();
      return;
    },

    getDocuments: async function () {
      return axios
        .get(pubsEndpoint + "archives")
        .then((response) => {
          this.documents = response.data;
          this.filterDocuments();
        })
        .catch((e) => {
          console.log(e);
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

    clearSearch: function() {
      this.search = '';
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
#publications {
  max-width: 850px;
}

#filter-results {
  h6 {
   text-align:left;

  }
  i {
    margin-top:10px; 
  }
}

.filter-by-owner{
  font-family:"Open Sans", Helvetica, Roboto, Arial, sans-serif !important;
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

.v-select .vs__actions{
  padding:0 5px 0 0;
}

.v-select .vs__search {
 color: #a1a1a1;
 background: white;
}

.clear-search-btn {
  position: absolute;
  top: 16px;
  right: 70px;
  padding: 0;
  font-size: 20px;
  background-color: #fff;
  opacity: 0.8;
  z-index: 999;
  cursor: pointer;
  color: rgba(60, 60, 60, 0.5);
  &:hover {
    background: transparent;
    color: black;
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
td {
  text-align: left;
}

.paginate-links{
  float:right;
}

</style>
