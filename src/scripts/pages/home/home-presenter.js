export default class HomePresenter {
    #model = null;
    #view = null;
  
    constructor({ model, view }) {
      this.#model = model;
      this.#view = view;
      console.log("[Home Presenter] Initialized");
    }
  
    async init() {
      if (!this.#view.init()) {
        console.error("[Home Presenter] View initialization failed");
        return;
      }
  
      // Set up map observer with callback
      this.#view.setupMapObserver(() => this.#initializeMap());
      
      // Load initial stories
      await this.#loadInitialStories();
      
      // Attach event listeners
      this.#attachEventListeners();
    }
  
    async #loadInitialStories() {
      try {
        const { stories, allLoaded } = await this.#model.fetchInitialStories();
        
        this.#view.removeSkeletonLoaders();
        
        if (stories.length === 0) {
          this.#view.showNoStoriesMessage();
        } else {
          this.#view.renderStoryItems(stories);
          this.#view.showLoadMoreButton(!allLoaded);
          
          // If map is already initialized, update markers
          if (this.#isMapInitialized()) {
            this.#updateMapMarkers();
          }
        }
      } catch (error) {
        this.#view.showStoryLoadError(error);
      }
    }
  
    async #loadMoreStories() {
      this.#view.setLoadMoreButtonLoading(true);
      
      try {
        const { stories, allLoaded } = await this.#model.fetchMoreStories();
        
        if (stories.length > 0) {
          this.#view.renderStoryItems(stories, true);
          
          if (this.#isMapInitialized()) {
            this.#updateMapMarkers();
          }
        }
        
        this.#view.showLoadMoreButton(!allLoaded);
      } catch (error) {
        this.#view.showLoadMoreError(error);
      } finally {
        this.#view.setLoadMoreButtonLoading(false);
      }
    }
  
    #initializeMap() {
      const success = this.#view.initMap();
      
      if (success) {
        const stories = this.#model.getStories();
        if (stories.length > 0) {
          this.#updateMapMarkers();
        }
      }
    }
  
    #isMapInitialized() {
      // This is a simple check - the actual implementation will depend on how your view manages the map
      return true; // The view will handle the null check
    }
  
    #updateMapMarkers() {
      const stories = this.#model.getStories();
      this.#view.populateMapMarkers(stories);
    }
  
    #attachEventListeners() {
      // Attach load more button click event
      this.#view.attachLoadMoreEvent(() => this.#loadMoreStories());
      
      // Attach cleanup events
      window.removeEventListener('hashchange', this.cleanup);
      window.removeEventListener('beforeunload', this.cleanup);
      window.addEventListener('hashchange', this.cleanup.bind(this), { once: true });
      window.addEventListener('beforeunload', this.cleanup.bind(this));
      
      console.log("[Home Presenter] Event listeners attached");
    }
  
    async cleanup() {
      console.log("[Home Presenter] Cleaning up resources...");
      
      // Clean up view
      if (this.#view) {
        this.#view.cleanup();
      }
      
      // Reset model state
      if (this.#model) {
        this.#model.resetState();
      }
      
      // Remove window event listeners
      window.removeEventListener('beforeunload', this.cleanup);
      window.removeEventListener('hashchange', this.cleanup);
      
      console.log("[Home Presenter] Cleanup complete");
    }
  }