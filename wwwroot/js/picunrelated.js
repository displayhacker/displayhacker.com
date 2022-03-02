$
    (
        () => {
            $('.open-in-new-window')
                .click(
                    (e) => {
                        e.preventDefault();
                        
                        var href = $(e.currentTarget).attr('href');
                        window.open(href);
                    }
                )
            ;
        }
    )
;

function selectNavLink(selector) {
    var element = $(selector);
    element.addClass('selected');
    element
        .click(
            (e) => {
                e.preventDefault();
            }
        )
    ;
}