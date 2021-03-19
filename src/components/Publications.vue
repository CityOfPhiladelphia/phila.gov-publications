<template>
<div class="grid-container">
  <div class="search">
      <input
        id="search-bar"
        v-model="search"
        class="search-field"
        type="text"
        placeholder="Filter documents by title"
      />
      <input ref="archive-search-bar" type="submit" class="search-submit" value="Search" />
      <button v-if="search > 0" class="clear-search-btn" @click="clearAllFilters">
        <i class="fas fa-times" />
      </button>
    </div>
    <div id="filter-results" class="bg-ghost-gray pam">
      <h6>Filter results</h6>
      <div class="filter-container grid-x">
        <div class="cell medium-4 small-10">
       <datepicker
            v-model="start"
            name="start"
            placeholder="Start date"
            format="MMM. dd, yyyy"
            
            @closed="filterPosts()"
          />
        </div>
        <div class="cell medium-1 small-2 mts">
          <i class="fas fa-arrow-right" />
        </div>
        <div class="cell medium-4 small-10">
          <datepicker
            v-model="end"
            name="end"
            placeholder="End date"
            format="MMM. dd, yyyy"
               
            @closed="filterPosts()"
          />
        </div>
  
           <v-select
            ref="categorySelect"
            v-model="department"
            label="slang_name"
            placeholder="All departments"
            :options="categories"
            @input="filterPosts()"
          />
         <div class="cell medium-4 small-24">
          <a
            class="button content-type-featured full"
            @click="clearAllFilters()"
          >Clear filters</a>
        </div>
      </div> 
    </div>
  <table
  class="stack theme-light archive-results">
    <thead
          class="sticky center bg-white"
          data-sticky
          data-top-anchor="filter-results:bottom"
          data-btm-anchor="page:bottom"
          data-options="marginTop:4.8;"
        >
          <tr>
            <th
              class="table-sort title"
            >
              <span>Title</span>
            </th>
            <th
              class="table-sort date"
            >
              <span>Publish date</span>
            </th>
            <th>Department</th>
          </tr>
        </thead>
        <tbody>
          <tr
            v-for="post in documents"
            :key="post.id"
            class="vue-clickable-row"
            @click.stop.prevent="goToPost(post.link)"
          >
            <td class="title">
              <a
                :href="post.link"
                target="_blank"
                @click.prevent="goToPost(post.link)"
              >
                {{ post.title }}
              </a>
            </td>
            <td class="date">
              {{ post.date }}
            </td>
            <td class="categories">
              <span
                v-for="(category, i) in post.categories"
                :key="i"
              >
                <span>{{ category.slang_name }}</span><span v-if="i < post.categories.length - 1">,&nbsp;</span>
              </span>
            </td>
          </tr>
        </tbody>

  </table>
</div>
</template>

<script>
// import moment from "moment";
import axios from "axios";
import vSelect from "vue-select";
import Datepicker from "vuejs-datepicker";

const pubsEndpoint = "https://phila.gov/wp-json/publications/v1/";

export default {
  name: "publications",
  components: {
    vSelect,
    Datepicker
  },
  data: function() {
    return {
      documents: [],
      categories: [],
      currentSort: "date",
      currentSortDir: "desc",
      search:"",
      category: "",
       endpointCategories: [],
      endpointCategoriesSlang: [],
    };
  },
  mounted: async function() {
    await this.getDocuments();
    await this.getAllCategories();
    await this.getDropdownCategories();
  },

  methods: {

 getAllCategories: async function() {
      return axios
        .get(" https://phila.gov/wp-json/the-latest/v1/categories")
        .then(response => {
          this.endpointCategories = response.data;
        })
        .catch (e => {
          window.console.log(e);
          this.endpointCategories = [];
        });
      
    },
    getDropdownCategories: async function () {
      this.documents.forEach((document) => {
        document.categories.forEach((category) => {
          let newCategory = category.slang_name;
          if (newCategory !== '') {
            this.categories.push(newCategory);
          }
        });
      });
      this.categories = this.categories.filter((item, index) => this.categories.indexOf(item) === index);
      this.endpointCategories.forEach((category) => {
        this.endpointCategoriesSlang.push(category.slang_name);
      });
      this.categories = this.categories.filter((category) => this.endpointCategoriesSlang.includes(category)).sort();
      return;
    },

    getDocuments: async function() {
      return axios
        .get(pubsEndpoint + "archives?count=10")
        .then(response => {
          this.documents = response.data;
          
        })
        .catch(() => {
          this.documents = "Sorry there was a problem";
        });
    },

    goToDoc: function(link) {
      window.location.href = link;
    },
    

  },
  computed: {
   
  }
};
</script>

<style>
.filter-by-owner {
  font-family: "Open Sans", Helvetica, Roboto, Arial, sans-serif !important;
}
.filter-by-owner .v-select .dropdown-toggle {
  border: none;
  background: white;
}
.filter-by-owner .v-select .open-indicator {
  bottom: 0;
  top: 0;
  right: 0;
  background: #0f4d90;
  padding: 0 0 0 9px;
  width: 30px;
  height: inherit;
}
.v-select .vs__actions {
  padding: 0;
}
.v-select .dropdown-toggle {
  border-radius: 0;
  padding: 0;
}

.filter-by-owner .v-select .open-indicator:before {
  border-color: white;
}
.filter-by-owner .v-select input[type="search"],
.filter-by-owner .v-select input[type="search"]:focus {
  height: 2.4rem;
  margin: 0;
  border: none;
}
.filter-by-owner ul.dropdown-menu {
  border: none;
  font-weight: bold;
}
.filter-by-owner ul.dropdown-menu li {
  border-bottom: 1px solid #f0f0f0;
}
.filter-by-owner ul.dropdown-menu li a {
  color: #0f4d90;
  padding: 1rem;
}
.filter-by-owner ul.dropdown-menu li a:hover {
  background: #0f4d90;
  color: white;
}
.filter-by-owner .v-select .dropdown-menu > .highlight > a {
  background: #0f4d90;
  color: white;
}
.filter-by-owner .v-select.single .selected-tag {
  background-color: #f0f0f0;
  border: none;
}

.vdp-datepicker [type="text"] {
  height: 2.4rem;
}
.vdp-datepicker input:read-only {
  background: white;
  cursor: pointer;
}
#archive-results .vdp-datepicker__calendar .cell.selected,
#archive-results .vdp-datepicker__calendar .cell.selected.highlighted,
#archive-results .vdp-datepicker__calendar .cell.selected:hover {
  background: #25cef7;
}

td {
  text-align: left;
}


.filter-by-owner{
  font-family:"Open Sans", Helvetica, Roboto, Arial, sans-serif !important;
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

.vs__selected {
  position: absolute;

}
.vs__clear:hover {
  background-color: transparent;
}

.v-select .vs__dropdown-toggle{
  border-radius: 0;
  padding:0;
}

#dept-filter .v-select .vs__dropdown-menu{
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
.vdp-datepicker input:read-only{
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
</style>