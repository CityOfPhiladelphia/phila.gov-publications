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
      <div class="filter-container">
        <!-- <div class="date-pickers">
          <datepicker v-model="start" name="start" placeholder="Start date" format="MMM. dd, yyyy" />
          <i class="fa fa-arrow-right"></i>
          <datepicker v-model="end" name="end" placeholder="End date" format="MMM. dd, yyyy" />
        </div>
        <div class="dept-select">
          <v-select
            ref="categorySelect"
            v-model="category"
            label="selectedDepartment"
            placeholder="Filter by owner"
            :options="postTitles"
          />
        </div>
        <div class="clear-filters-button">
          <a class="button content-type-featured full" @click="clearAllFilters()">Clear filters</a>
        </div> -->
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
// import vSelect from "vue-select";
// import Datepicker from "vuejs-datepicker";

const pubsEndpoint = "https://phila.gov/wp-json/publications/v1/";

export default {
  name: "publications",
  components: {
    // vSelect,
    // Datepicker
  },
  data: function() {
    return {
      documents: [],
      categories: [{}],
      currentSort: "date",
      currentSortDir: "desc",
      search:"",
    };
  },
  mounted: function() {
    this.getDocuments();
    this.getDropdownCategories();
  },

  methods: {
 
    getDropdownCategories: function() {
      axios
        .get("https://phila.gov/wp-json/the-latest/v1/categories")
        .then(response => {
          this.categories = response.data;
        })
        .catch(() => {
          this.categories = "Sorry, there was a problem.";
        });
    },

    getDocuments: function() {
      axios
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
</style>
