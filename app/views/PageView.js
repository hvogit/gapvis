/*
 * Page View
 */
(function(window, gv) {
    var View = gv.View,
        state = gv.state,
        PageView;
    
    // View: PageView (page content)
    PageView = View.extend({
        tagName: 'div',
        className: 'page-view',
        
        initialize: function() {
            var view = this,
                page = view.model;
            view.template = _.template($('#page-template').html());
            // listen for state changes
            state.bind('change:pageview', this.renderPageView, this);
            state.bind('change:placeid', this.renderPlaceHighlight, this);
            // set backreference
            page.view = view;
            // load page
            page.fetch({
                success: function() {
                    view.render();
                },
                error: function() {
                    console.log('Error fetching page ' + view.model.id)
                }
            });
        },
        
        render: function() {
            var view = this;
            $(view.el)
                .html(view.template(view.model.toJSON()));
            view.renderPageView();
            view.renderPlaceHighlight();
            return view;
        },
        
        renderPageView: function() {
            var pageView = state.get('pageview');
            // render
            this.$('.ocr').toggle(pageView == 'text');
            this.$('.img').toggle(pageView == 'image');
        },
        
        renderPlaceHighlight: function() {
            var placeId = state.get('placeid');
            // render
            this.$('span.place').each(function() {
                $(this).toggleClass('hi', $(this).attr('data-place-id') == placeId);
            });
        },
        
        // UI Event Handlers - update state
        
        events: {
            'click .place':    'uiPlaceClick'
        },
        
        uiPlaceClick: function(e) {
            var placeId = $(e.target).attr('data-place-id');
            if (placeId) {
                state.setSerialized('placeid', placeId);
            }
        },
        
    });
    
}(window, gv));