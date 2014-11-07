var loadedAssets = 0;
var totalAssets = 1;

var loader = $('#loader');
var spinnerCount = $('#spinnerCount');
var spinnerTotal = $('#spinnerTotal');

function updateSpinner() {
    var visible = ($('#loader').css('display') == 'block') ? true : false;
    
    if (loadedAssets != totalAssets) {
        spinnerCount.text(loadedAssets + 1);
        spinnerTotal.text(totalAssets);
        
        if(!visible) {
            // Not visible yet
            $('#loader').fadeIn();
        }
    } else {
        // Hide
        $('#loader').fadeOut();
    }
}