<template>
  <div>
    <div class="search">
        <input
          id="search-bar"
          v-model="search"
          class="search-field"
          type="text"
          placeholder="Search by title"
        ><input
          ref="archive-search-bar"
          type="submit"
          class="search-submit"
          value="Search"
        >
      </div>
    <div class="filters">
      <datepicker />
      <datepicker />
      <v-select />
    </div>
    <div >
      {{ categories }}
      <table
        class="stack theme-light archive-results"
        data-sticky-container
        v-show="!loading && !emptyResponse && !failure"
      >
        <thead
          class="sticky center bg-white"
          data-sticky
          data-top-anchor="filter-results:bottom"
          data-btm-anchor="page:bottom"
          data-options="marginTop:4.8;"
        >
          <tr>
            <th class="table-sort title" @click="sort('title')">
              <span>Title</span>
            </th>

            <th class="table-sort date" @click="sort('date')">
              <span>Publish date</span>
            </th>
            <th class="department">Department</th>
          </tr>
        </thead>

        <paginate
          name="documents"
          :list="documents"
          class="paginate-list"
          tag="tbody"
          :per="40"
        >
          <tr
            v-for="document in paginated('documents')"
            :key="document.id"
            class="vue-clickable-row"
            v-on:click.stop.prevent="goToDoc(document.link)"
          >
            <td class="title">
              <a
                :href="document.link"
                v-on:click.prevent="goToDoc(document.link)"
              >{{ document.title }}</a>
            </td>
            <td class="date">{{ document.date | formatDate }}</td>
            <td> category </td>
            <!-- <td class="categories">
              <span v-for="(category, i) in document.categories" :key="i">
                <span>{{ category.slang_name }}</span>
                <span v-if="i < document.categories.length - 1">,&nbsp;</span>
              </span>
            </td> -->
          </tr>
        </paginate>
      </table>
      <paginate-links
        for="documents"
        :limit="3"
        :async="true"
        :show-step-links="true"
        :hide-single-page="false"
        :step-links="{
          next: 'Next',
          prev: 'Previous'
        }"
      ></paginate-links>
    </div>
  </div>
</template>

<script>
import moment from "moment";
import axios from "axios";
import vSelect from "vue-select";
import Datepicker from "vuejs-datepicker";
import VuePaginate from 'vue-paginate';
import Vue from 'vue';

Vue.use(VuePaginate)

const pubsEndpoint = "https://phila.gov/wp-json/publications/v1/archives";
const catEndpoint = "https://cors-anywhere.herokuapp.com/https://phila.gov/wp-json/the-latest/v1/categories";

export default {
  name: "publications",
  components: {
    vSelect,
    Datepicker
  },
  data: function() {
    return {
      documents: [],
      categories: [{}],

      currentSort: "date",
      currentSortDir: "desc",

      selected: null,

      selectedCategory: "",

      search: "",
      searchedVal: "",

      loading: false,
      emptyResponse: false,
      failure: false,

      paginate: ["documents"],

      state: {
        startDate: "",
        endDate: "",
        disabled: {
          to: new Date(2015, 1, 1),
          from: new Date()
        }
      }
    };
  },
  filters: {
    formatDate: function(value) {
      if (value) {
        return moment(String(value)).format("MMM. DD, YYYY");
      }
    }
  },
  mounted: function() {
    this.getDocuments();
    // this.getDropdownCategories();
  },
  created: function() {
    
    
  },
  methods: {

    getDocuments: function() {
      axios
      .get(pubsEndpoint, {
        params: {
          count: -1
        }
      })
      .then(response => {
        this.documents = response.data;
        this.successfulResponse;
      })
      .catch(() => {

      });
    },


    getDropdownCategories: function() {
      axios
        .get(catEndpoint)
        .then(response => {
          this.categories = response.data;
        })
        .catch(() => {
          this.categories = "Sorry, there was a problem.";
        });
    },

  
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
</style>
