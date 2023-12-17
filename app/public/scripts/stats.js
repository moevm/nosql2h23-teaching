function selectChanged(select) {
    switch (select.selectedIndex) {
        case 0:
            window.location.replace('/?selected=type');
            break;
        case 1:
            window.location.replace('/?selected=subtype');
            break;
        case 2:
            window.location.replace('/?selected=category');
            break;
        case 3:
            window.location.replace('/?selected=location');
            break;
        default:
            break;
    }
}