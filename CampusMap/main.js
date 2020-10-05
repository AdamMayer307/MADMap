
$(document).ready(function() {
    roomLocator.init();
    $("#searchForm").submit(function(e){
        e.preventDefault(e);
    });
});

$(document).ready(function(){
  $(window).resize;
});
  

var roomLocator = function(){
   
    var tableResults;
    var currentBuilding = '';
    var currentFloor = '';
    var currentRoom = '';
    
    var publicSpreadsheetUrl = 'https://docs.google.com/spreadsheets/d/1QPqtjOdUDF_JDfSUNG-yLHvoa4Mgo_salJuFoe9DB10/edit?usp=sharing';
    //var publicSpreadsheetUrl = 'https://docs.google.com/spreadsheets/d/1V-crn_yNzTc_J4A38knngWy_ZkslBtPLyYndGD2Qryk/edit?usp=sharing';

    function init(){
        resize();
        $('#room-locator-map').html($('#mapcampus').html());
        
        $('#zoomIn').click(function() {
            mapZoom(true);
        });
        $('#zoomOut').click(function() {
            mapZoom(false);
        });
        $('#zoomRest').click(function() {
            mapReset();
        });
        $('#return-to-main').click(mainInfo);
        $('.print-button').click(print);
        mainInfo();

        Tabletop.init({
            key: publicSpreadsheetUrl,
            callback: showInfo,
            simpleSheet: true
        });
    }
  
    function resize(){
        console.log('Resize Map');
        
        var browserWidth = window.innerWidth;
        var browserHeight = window.innerHeight;
        var aspectRatio = browserWidth / browserHeight;
        console.log('BW: ' + browserWidth);
        console.log('BH: ' + browserHeight);
        console.log('AR: ' + aspectRatio);
        
        
        if (browserHeight < browserWidth) {
            var landscapeWidth = browserHeight * aspectRatio;
            landscapeWidth = landscapeWidth - controlsWidth;
            console.log('LSW: ' + landscapeWidth);
            $('#room-locator-map').css('width', landscapeWidth);
            $('#room-locator-map').css('height', browserHeight);
        }
        else {
            var portraitHeight = browserWidth * aspectRatio;
            browserWidth = browserWidth - controlsWidth;
            console.log('PTH: ' + portraitHeight);
            $('#room-locator-map').css('width', browserWidth);
            $('#room-locator-map').css('height', portraitHeight);
        }
       
        
       
        var containerHeight = $('#room-locator-container').innerHeight();
        var containerWidth = $('#room-locator-container').innerWidth();
        
        var controlsWidth = $('#room-locator-controls').width();
        console.log('controlW: ' + containerWidth);
        var infoWidth = $('#room-locator-info').outerWidth();
        
        console.log('cw: ' + containerWidth);
        console.log('ch: ' + containerHeight);

        var map = $('#room-locator-map');
        console.log('map: ' + map);
        
        var mapHeight = $('#room-locator-map').height();
        
        var containerOffset = $('#room-locator-container').offset();
        var mapOffset = map.offset();
        
        $('#room-locator-controls').css('left', mapOffset.left + map.outerWidth() - controlsWidth - containerOffset.left - 30);
        $('#room-locator-info-list').css('height', mapHeight - 8);
        $('#room-locator-info-list-body').css('height', mapHeight - 150);
    
      
    }
    
    function mapZoom(zoom) {
        var change = parseInt($('#room-locator-map svg').attr('width'));
        if (zoom) {
            change = change * 1.10;
        }
        else {
            change = change * 0.90;
        }
        if (change > 600) {
            change = 600;
        }
        if (change < 100) {
            change = 100;
        }
    
        if (zoom) {
            var height = $('#room-locator-map').height();
            var width = $('#room-locator-map').width();
            var top = parseInt((height * (change / 100) - height) / 2);
            var left = parseInt((width * (change / 100) - width) / 2);
            console.log('Top: ' + top + ', Left: ' + left);
            $('#room-locator-map').scrollTop(top);
            $('#room-locator-map').scrollLeft(left);
        }
    
        console.log('width: ' + change);
    
        $('#room-locator-map svg').attr('width', change + '%');
        $('#room-locator-map svg').attr('height', change + '%');
    }
    
    function mapReset() {
        $('#room-locator-map svg').attr('width', '100%');
        $('#room-locator-map svg').attr('height', '100%');
    }  
    
    function mainInfo() {
        $('#room-locator-map').html($('#mapcampus').html());
        $('#room-locator-info-list').slideUp();
        $('#room-locator-info-main').slideDown();
        $('.legend').css('display', 'none');
        $('.jpgImages').css('display', 'none');
        $('.building, .key').hover(
            function() {
                var id = $(this).data('id');
                if (id == undefined) {
                    id = $(this).attr('id');
    
                }
                console.log('id: ' + id);
                highlightItem(id, 0.5);
    
            },
            function() {
                var id = $(this).data('id');
                if (id == undefined) {
                    id = $(this).attr('id');
    
                }
    
                highlightItem(id, 0);
            }
        );
        $('.building, .key').click(
            function() {
                var id = $(this).data('id');
                if (id == undefined) {
                    id = $(this).attr('id');
                    console.log(id);
                }
                showFloor(id);
            }
        );        
    }
    
    function showFloor(buildingId) {
        $('#room-locator-map').html($('#map' + buildingId).html());
        $('#room-locator-info-main').slideUp();
        $('#room-locator-info-list').slideDown();
        $('.legend').css('display', 'block');

        var results = "";
        var otherFloors = "";
        for (var i = 0; i < tableResults.length; i++) {
            if (tableResults[i].building == buildingId) {
                currentBuilding = tableResults[i].buildinglabel;
                currentFloor = tableResults[i].floorlabel;
                results += '<div class="room" data-selected="" data-roomid = "';
                results += tableResults[i].room;
                results += '" data-floorlabel="' + tableResults[i].floorlabel + '">';
                results += tableResults[i].department + ' ' + tableResults[i].roomlabel + '</div>';
                otherFloors = tableResults[i].otherfloors;
            }
        }
        // check to see if this building has other floors
        if (otherFloors != '') {
            var floorOptions = otherFloors.split(',');
            for(var i=0; i < floorOptions.length; i++) {
                var floorDetails = floorOptions[i].split(':');
                if (floorDetails.length == 2) {
                    results += '<div class="floorChoice" data-buildid="' + floorDetails[0] + '">' + floorDetails[1] + '</div>';
                }
            }
        }
        console.log(results);
        $('#room-locator-info-list-title').html('<strong>' + currentBuilding + ': ' + currentFloor + '</strong>');
        $('#room-locator-info-list-body').html(results);
        $('.room').click(
            function() {
                $('#room-locator-map rect').css('opacity', 0);
                $('div.room').attr('data-selected','0');
                var id = $(this).data('roomid');
                currentRoom = $(this).html();
                currentFloor = $(this).data('floorlabel');
                console.log('Room Id:' + id);
                showRoom(id);
                $(this).attr('data-selected', '1');
            }
        );
        $('.room').hover(
            function() {
                var id = $(this).data('roomid');
                highlightItem(id, 1);
            },
            function() {
                var id = $(this).data('roomid');
                if( $(this).attr('data-selected') != '1') {
                     highlightItem(id, 0);
                }
               
            }
        ); 
        $('.floorChoice').click(
            function() {
                var id = $(this).data('buildid');
                showFloor(id);
            }
        );
        $('.showCampusHighlight').click(
            function() {
               $('.pic' + buildingId).css('display', 'block'); 
               $('.jpgImages').css('display', 'block');
            }
        );
         $('.hideCampusHighlight').click(
            function() {
               $('.pic' + buildingId).css('display', 'none');  
            }
        );
         $(".legendHeader").click(
             function() {
               $(".legendContents").slideToggle();
            }
        );
        
    }
   
    
    function locate() {
        var results = '';
        var building = '';
        var q = $('#room-locator-q').val();
        for (var i = 0; i < tableResults.length; i++) {
            if (tableResults[i].roomlabel.indexOf(q) != -1) {
                if (building != tableResults[i].buildinglabel) {
                    building = tableResults[i].buildinglabel;
                    results += '<div class="building">' + building + '</div>';
                }
                results += '<div class="floor" ';
                results += 'data-buildid="' + tableResults[i].mapid + '" ';
                results += 'data-floorlabel="' + tableResults[i].floorlabel + '" ';
                results += 'data-roomid="' + tableResults[i].room + '" ';
                results += 'data-roomlabel="' + tableResults[i].roomlabel + '" ';
                results += '>';
                results += 'Room ' + tableResults[i].roomlabel + ' ' + tableResults[i].floorlabel + '</div>';
            }
        }
        if (results == '') {
            results = '<div class="building">No results found.</div>';
        }
        console.log(results);
        $('#room-locator-info-results').html(results);
        $('.floor').click(
            function() {
                var id = $(this).data('buildid');
                var roomId = $(this).data('roomid');
                currentFloor = $(this).data('floorlabel');
                currentRoom = $(this).data('roomlabel');
                console.log('Building Id:' + id);
                showFloor(id);
                setTimeout(function() { showRoom(roomId); },200);
            }
            
        );
        return false;
    }
    
    function showRoom (id) {
        $('#' + id).css('opacity', 1);
    }    
    
    function highlightItem(id, opacity) {
        $('#' + id).css('opacity', opacity);
        $('#key' + id).css('opacity', opacity);
    }  
    
    function showInfo(data, tabletop) {
        tableResults = data;
        console.log(tableResults);
    }  
    
    function print() {
        var map = window.open("","Map","width=638,height=600,scrollbars=1,resizable=1");
        var html = '<!DOCTYPE html><html><head><meta charset="utf8"><title>Sheridan College Map</title><style>g rect,g path {opacity: 0;}</style></head><body>';
        html += '<button onclick="window.print();" style="float: right;">Print</button>';
        if (currentBuilding == '') {
            html += '<h3>Sheridan College Campus Map</h3>';   
        }
        else if (currentRoom == '') {
            html += '<h3>' + currentBuilding + '</h3>';   
        }
        else {
            html += '<h3>' + currentBuilding + ' ' + currentRoom + ' ' + currentFloor + '</h3>';
        }
        html += $('#room-locator-map').html();
        html += '</body></html>';
        map.document.open();
        map.document.write(html);
        map.document.close();
        return false;
    }
    
    
    return  {
        init:init,
        resize:resize,
        locate:locate
    };
    
}();




