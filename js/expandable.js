document.addEventListener('DOMContentLoaded', async () => {
    // Use event delegation to handle clicks on dynamically generated buttons
    document.body.addEventListener('click',(ev) => {
        const isExpandableTitle = !!ev.target.closest(".expandable__title-bar")
        const expandable = ev.target.closest(".expandable");
        
        if(!isExpandableTitle) {
            return;
        }

        expandable.classList.toggle("expandable--open")
    });
});