/*
   Licensed to the Apache Software Foundation (ASF) under one or more
   contributor license agreements.  See the NOTICE file distributed with
   this work for additional information regarding copyright ownership.
   The ASF licenses this file to You under the Apache License, Version 2.0
   (the "License"); you may not use this file except in compliance with
   the License.  You may obtain a copy of the License at

       http://www.apache.org/licenses/LICENSE-2.0

   Unless required by applicable law or agreed to in writing, software
   distributed under the License is distributed on an "AS IS" BASIS,
   WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   See the License for the specific language governing permissions and
   limitations under the License.
*/
var showControllersOnly = false;
var seriesFilter = "";
var filtersOnlySampleSeries = true;

/*
 * Add header in statistics table to group metrics by category
 * format
 *
 */
function summaryTableHeader(header) {
    var newRow = header.insertRow(-1);
    newRow.className = "tablesorter-no-sort";
    var cell = document.createElement('th');
    cell.setAttribute("data-sorter", false);
    cell.colSpan = 1;
    cell.innerHTML = "Requests";
    newRow.appendChild(cell);

    cell = document.createElement('th');
    cell.setAttribute("data-sorter", false);
    cell.colSpan = 3;
    cell.innerHTML = "Executions";
    newRow.appendChild(cell);

    cell = document.createElement('th');
    cell.setAttribute("data-sorter", false);
    cell.colSpan = 7;
    cell.innerHTML = "Response Times (ms)";
    newRow.appendChild(cell);

    cell = document.createElement('th');
    cell.setAttribute("data-sorter", false);
    cell.colSpan = 1;
    cell.innerHTML = "Throughput";
    newRow.appendChild(cell);

    cell = document.createElement('th');
    cell.setAttribute("data-sorter", false);
    cell.colSpan = 2;
    cell.innerHTML = "Network (KB/sec)";
    newRow.appendChild(cell);
}

/*
 * Populates the table identified by id parameter with the specified data and
 * format
 *
 */
function createTable(table, info, formatter, defaultSorts, seriesIndex, headerCreator) {
    var tableRef = table[0];

    // Create header and populate it with data.titles array
    var header = tableRef.createTHead();

    // Call callback is available
    if(headerCreator) {
        headerCreator(header);
    }

    var newRow = header.insertRow(-1);
    for (var index = 0; index < info.titles.length; index++) {
        var cell = document.createElement('th');
        cell.innerHTML = info.titles[index];
        newRow.appendChild(cell);
    }

    var tBody;

    // Create overall body if defined
    if(info.overall){
        tBody = document.createElement('tbody');
        tBody.className = "tablesorter-no-sort";
        tableRef.appendChild(tBody);
        var newRow = tBody.insertRow(-1);
        var data = info.overall.data;
        for(var index=0;index < data.length; index++){
            var cell = newRow.insertCell(-1);
            cell.innerHTML = formatter ? formatter(index, data[index]): data[index];
        }
    }

    // Create regular body
    tBody = document.createElement('tbody');
    tableRef.appendChild(tBody);

    var regexp;
    if(seriesFilter) {
        regexp = new RegExp(seriesFilter, 'i');
    }
    // Populate body with data.items array
    for(var index=0; index < info.items.length; index++){
        var item = info.items[index];
        if((!regexp || filtersOnlySampleSeries && !info.supportsControllersDiscrimination || regexp.test(item.data[seriesIndex]))
                &&
                (!showControllersOnly || !info.supportsControllersDiscrimination || item.isController)){
            if(item.data.length > 0) {
                var newRow = tBody.insertRow(-1);
                for(var col=0; col < item.data.length; col++){
                    var cell = newRow.insertCell(-1);
                    cell.innerHTML = formatter ? formatter(col, item.data[col]) : item.data[col];
                }
            }
        }
    }

    // Add support of columns sort
    table.tablesorter({sortList : defaultSorts});
}

$(document).ready(function() {

    // Customize table sorter default options
    $.extend( $.tablesorter.defaults, {
        theme: 'blue',
        cssInfoBlock: "tablesorter-no-sort",
        widthFixed: true,
        widgets: ['zebra']
    });

    var data = {"OkPercent": 100.0, "KoPercent": 0.0};
    var dataset = [
        {
            "label" : "FAIL",
            "data" : data.KoPercent,
            "color" : "#FF6347"
        },
        {
            "label" : "PASS",
            "data" : data.OkPercent,
            "color" : "#9ACD32"
        }];
    $.plot($("#flot-requests-summary"), dataset, {
        series : {
            pie : {
                show : true,
                radius : 1,
                label : {
                    show : true,
                    radius : 3 / 4,
                    formatter : function(label, series) {
                        return '<div style="font-size:8pt;text-align:center;padding:2px;color:white;">'
                            + label
                            + '<br/>'
                            + Math.round10(series.percent, -2)
                            + '%</div>';
                    },
                    background : {
                        opacity : 0.5,
                        color : '#000'
                    }
                }
            }
        },
        legend : {
            show : true
        }
    });

    // Creates APDEX table
    createTable($("#apdexTable"), {"supportsControllersDiscrimination": true, "overall": {"data": [0.875, 500, 1500, "Total"], "isController": false}, "titles": ["Apdex", "T (Toleration threshold)", "F (Frustration threshold)", "Label"], "items": [{"data": [1.0, 500, 1500, "LoginSub-19"], "isController": false}, {"data": [0.5, 500, 1500, "HomePage"], "isController": true}, {"data": [1.0, 500, 1500, "RegisterSub-14"], "isController": false}, {"data": [1.0, 500, 1500, "LoginPage-18"], "isController": false}, {"data": [1.0, 500, 1500, "RegisterPage-12"], "isController": false}, {"data": [0.5, 500, 1500, "HomePage-1"], "isController": false}, {"data": [0.975, 500, 1500, "LoginPage-8"], "isController": false}, {"data": [0.925, 500, 1500, "LoginSub-20"], "isController": false}, {"data": [0.5, 500, 1500, "LoginSub"], "isController": true}, {"data": [1.0, 500, 1500, "RegisterPage"], "isController": true}, {"data": [0.9875, 500, 1500, "LoginPage"], "isController": true}, {"data": [1.0, 500, 1500, "RegisterSub"], "isController": true}]}, function(index, item){
        switch(index){
            case 0:
                item = item.toFixed(3);
                break;
            case 1:
            case 2:
                item = formatDuration(item);
                break;
        }
        return item;
    }, [[0, 0]], 3);

    // Create statistics table
    createTable($("#statisticsTable"), {"supportsControllersDiscrimination": true, "overall": {"data": ["Total", 140, 0, 0.0, 370.6285714285714, 251, 647, 323.0, 595.8, 619.95, 640.85, 39.403321137067266, 145.47235610751477, 20.10844708696876], "isController": false}, "titles": ["Label", "#Samples", "FAIL", "Error %", "Average", "Min", "Max", "Median", "90th pct", "95th pct", "99th pct", "Transactions/s", "Received", "Sent"], "items": [{"data": ["LoginSub-19", 20, 0, 0.0, 355.3999999999999, 295, 497, 344.5, 423.90000000000003, 493.4, 497.0, 14.619883040935672, 46.51521381578947, 10.094001279239766], "isController": false}, {"data": ["HomePage", 20, 0, 0.0, 600.4000000000001, 567, 632, 603.5, 630.3000000000001, 631.95, 632.0, 13.149243918474689, 57.902901051939516, 4.686986357659435], "isController": true}, {"data": ["RegisterSub-14", 20, 0, 0.0, 329.3999999999999, 293, 422, 321.0, 366.6, 419.24999999999994, 422.0, 17.543859649122805, 56.33223684210527, 13.466282894736842], "isController": false}, {"data": ["LoginPage-18", 20, 0, 0.0, 297.49999999999994, 251, 360, 296.0, 340.6, 359.05, 360.0, 17.452006980802793, 61.02748691099477, 7.907940663176266], "isController": false}, {"data": ["RegisterPage-12", 20, 0, 0.0, 278.9, 252, 343, 275.5, 320.30000000000007, 342.0, 343.0, 17.21170395869191, 63.632879733218594, 7.799053356282273], "isController": false}, {"data": ["HomePage-1", 20, 0, 0.0, 600.4000000000001, 567, 632, 603.5, 630.3000000000001, 631.95, 632.0, 13.368983957219251, 58.8705297459893, 4.765311664438503], "isController": false}, {"data": ["LoginPage-8", 20, 0, 0.0, 297.54999999999995, 256, 517, 287.0, 314.40000000000003, 506.89999999999986, 517.0, 16.93480101608806, 59.24038156223539, 7.623968035563082], "isController": false}, {"data": ["LoginSub-20", 20, 0, 0.0, 435.25000000000006, 328, 647, 428.0, 604.1, 644.9, 647.0, 13.966480446927374, 60.82374956354749, 5.605686976256983], "isController": false}, {"data": ["LoginSub", 20, 0, 0.0, 790.6500000000001, 647, 1013, 769.0, 964.8, 1010.5999999999999, 1013.0, 11.580775911986104, 87.27992002026636, 12.643854950781702], "isController": true}, {"data": ["RegisterPage", 20, 0, 0.0, 278.9, 252, 343, 275.5, 320.30000000000007, 342.0, 343.0, 17.21170395869191, 63.632879733218594, 7.799053356282273], "isController": true}, {"data": ["LoginPage", 40, 0, 0.0, 297.52500000000003, 251, 517, 288.0, 335.29999999999995, 359.0499999999999, 517.0, 18.90359168241966, 66.11549651465027, 8.537999172967863], "isController": true}, {"data": ["RegisterSub", 20, 0, 0.0, 329.3999999999999, 293, 422, 321.0, 366.6, 419.24999999999994, 422.0, 17.543859649122805, 56.33223684210527, 13.466282894736842], "isController": true}]}, function(index, item){
        switch(index){
            // Errors pct
            case 3:
                item = item.toFixed(2) + '%';
                break;
            // Mean
            case 4:
            // Mean
            case 7:
            // Median
            case 8:
            // Percentile 1
            case 9:
            // Percentile 2
            case 10:
            // Percentile 3
            case 11:
            // Throughput
            case 12:
            // Kbytes/s
            case 13:
            // Sent Kbytes/s
                item = item.toFixed(2);
                break;
        }
        return item;
    }, [[0, 0]], 0, summaryTableHeader);

    // Create error table
    createTable($("#errorsTable"), {"supportsControllersDiscrimination": false, "titles": ["Type of error", "Number of errors", "% in errors", "% in all samples"], "items": []}, function(index, item){
        switch(index){
            case 2:
            case 3:
                item = item.toFixed(2) + '%';
                break;
        }
        return item;
    }, [[1, 1]]);

        // Create top5 errors by sampler
    createTable($("#top5ErrorsBySamplerTable"), {"supportsControllersDiscrimination": false, "overall": {"data": ["Total", 140, 0, "", "", "", "", "", "", "", "", "", ""], "isController": false}, "titles": ["Sample", "#Samples", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors"], "items": [{"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}]}, function(index, item){
        return item;
    }, [[0, 0]], 0);

});
