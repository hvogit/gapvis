/*
 * Book View
 */
(function(window, gv) {
    var View = gv.View,
        state = gv.state,
        BookView;
    
    // View: BookView (master view for the book screen)
    BookView = View.extend({
        el: '#book-view',
        
        initialize: function(opts) {
            var view = this;
            // listen for state changes
            state.bind('change:bookid', function() {
                view.clear();
                view.updateBook();
            });
            state.bind('change:pageid', view.updatePage, view);
            // instantiate book
            this.updateBook();
        },
        
        updateViews: function() {
            var view = this,
                book = view.model;
            view.children = view.childClasses.map(function(cls) {
                return new cls({ 
                    model: book,
                    parent: view
                })
            });
            return view;
        },
        
        // Render functions
        
        render: function() {
            // render all children
            this.children.forEach(function(child) {
                child.render();
            });
            return this;
        },
        
        clear: function() {
            // delete contents of all children
            view.children.forEach(function(child) {
                child.clear();
            });
            $('page-view').empty();
        },
        
        // Model update functions
        
        updateBook: function() {
            var view = this,
                book = view.model = new gv.Book({ id: state.get('bookid') });
            book.fetch({ 
                success: function() {
                    book.initCollections();
                    if (!state.get('pageid')) {
                        state.set({ pageid: book.firstId() });
                    }
                    view.updateViews().render();
                    view.updatePage();
                },
                error: function() {
                    console.log('Error fetching book ' + book.id)
                }
            });
        },
        
        updatePage: function() {
            var view = this,
                book = view.model,
                pageId = state.get('pageid');
            // we're still loading, come back later
            if (!book.pages.length) {
                book.pages.bind('reset', view.openPage, view);
                return;
            }
            // get the relevant page
            var page = pageId && book.pages.get(pageId) || 
                book.pages.first();
            // another page is open; close it
            if (view.pageView) {
                view.pageView.close();
            }
            // make a new page view if necessary
            if (!page.view) {
                page.bind('change', function() {
                    $('#page-view').append(page.view.render().el);
                    view.updatePage();
                });
                new gv.PageView({ model: page });
            } 
            // page view has been created; show
            else {
                view.pageView = page.view;
                page.view.open();
            }
        }
        
    });
    BookView.key = 'book';
    
}(window, gv));