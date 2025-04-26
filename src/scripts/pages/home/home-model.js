import { getAllStories } from '../../data/api.js';

export default class HomeModel {
  #stories = [];
  #currentPage = 1;
  #storiesPerPage = 9;
  #isLoadingMore = false;
  #allStoriesLoaded = false;

  constructor() {
    console.log("[Home Model] Initialized");
  }

  async fetchInitialStories() {
    try {
      console.log("[Home Model] Fetching initial stories...");
      const result = await getAllStories({ page: 1, size: this.#storiesPerPage, location: 0 });
      this.#stories = result.listStory || [];
      console.log(`[Home Model] Fetched ${this.#stories.length} initial stories.`);

      this.#allStoriesLoaded = this.#stories.length < this.#storiesPerPage;
      
      return {
        stories: this.#stories,
        allLoaded: this.#allStoriesLoaded
      };
    } catch (error) {
      console.error('[Home Model] Error fetching initial stories:', error);
      throw error;
    }
  }

  async fetchMoreStories() {
    if (this.#isLoadingMore || this.#allStoriesLoaded) {
      return { stories: [], allLoaded: this.#allStoriesLoaded };
    }

    try {
      this.#isLoadingMore = true;
      this.#currentPage += 1;
      console.log(`[Home Model] Fetching page ${this.#currentPage}...`);

      const result = await getAllStories({ 
        page: this.#currentPage, 
        size: this.#storiesPerPage, 
        location: 0 
      });
      
      const newStories = result.listStory || [];
      console.log(`[Home Model] Fetched ${newStories.length} more stories.`);

      if (newStories.length > 0) {
        this.#stories = [...this.#stories, ...newStories];
      }

      this.#allStoriesLoaded = newStories.length < this.#storiesPerPage;
      
      return {
        stories: newStories,
        allLoaded: this.#allStoriesLoaded
      };
    } catch (error) {
      console.error(`[Home Model] Error fetching page ${this.#currentPage}:`, error);
      this.#currentPage -= 1;
      throw error;
    } finally {
      this.#isLoadingMore = false;
    }
  }

  getStories() {
    return this.#stories;
  }

  resetState() {
    this.#stories = [];
    this.#currentPage = 1;
    this.#isLoadingMore = false;
    this.#allStoriesLoaded = false;
  }
}