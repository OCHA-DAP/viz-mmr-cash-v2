var config = {
    data: "data/cash-myanmar-v2.json", //ADD BY FAIZAL edited
    VBSOAFieldName: "Cluster",
    SABTFieldName: "Region",
    TVCPBTFieldName: "Region",
    whereFieldName: "DIS_CODE",
    sum: true,
    sumField: "Beneficiaries",
    geo: "data/District_mmr.json", //ADD BY FAIZAL edited
    joinAttribute: "DIS_CODE",
    nameAttribute: "DIST_NAME",
    color: "#3B88C0",
    mechanismField: "Delivery mechanism",
    conditonalityField: "Conditionality",
    restrictionField: "Restriction",
    ruralField: "RURAL/URBAN",
    transferValue: "Beneficiaries",
    estimatedField: "Estimated"
};


function generatePieValuesAndColors(group, colorsRange){
    let values = [],
        colors = [];
    let arr = group.top(Infinity);
    for (var i = 0; i < arr.length; i++) {
        values.push(arr[i].key);
    }
    for (var i = 0; i < values.length; i++) {
        colors.push(colorsRange[i]);
    }

    return [values, colors];
} //end generatePieValuesAndColors

var brownColors = ['#a8763e', '#d3ba9e', '#caac8b'];
var greenColors = ['#3ec76c', '#51cd7b', '#65d28a', '#79d899','#8ddea8','#a1e3b7','#89d879'];
var otherColors = ['#fa8334','#fa8334','#fee6d6'];

var c10 = d3.scale.category10();
var c20 = d3.scale.category20();
var c20b = d3.scale.category20b();
var c20c = d3.scale.category20c();
var green = ['#20bf55','#36c566','#4ccb76','#62d288','#79d899'];
var brown = ['#20bf55','#36c566','#4ccb76','#62d288','#79d899','#8fdfaa','#a5e5bb','#bcebcc','#d2f2dd','#e8f8ee','#1cab4c','#199844','#16853b'];

function colores_google(n) {
  var colores_g = ['#20bf55','#36c566','#4ccb76','#62d288','#79d899','#8fdfaa','#a5e5bb','#bcebcc','#d2f2dd','#e8f8ee','#1cab4c','#199844','#16853b','#20bf55','#36c566','#4ccb76','#62d288','#79d899','#8fdfaa','#a5e5bb','#bcebcc','#d2f2dd','#e8f8ee','#1cab4c','#199844','#16853b','#eab12f','#ecba46','#eec25e','#f1cb75','#f3d48c','#f5dca3','#f8e5ba','#faedd1','#fcf6e8'];
  return colores_g[n % colores_g.length];
}

function print_filter(filter) {
    var f=eval(filter);
    if (typeof(f.length) != "undefined") {}else{}
    if (typeof(f.top) != "undefined") {f=f.top(Infinity);}else{}
    if (typeof(f.dimension) != "undefined") {f=f.dimension(function(d) { return "";}).top(Infinity);}else{}
    console.log(filter+"("+f.length+") = "+JSON.stringify(f).replace("[","[\n\t").replace(/}\,/g,"},\n\t").replace("]","\n]"));
}


function generate3WComponent(config, data, geom) {
    var gv_allvalue =0;
    data.forEach(function(d){
        gv_allvalue+= parseFloat(d[config.sumField]);
    })
    
    var lookup = genLookup(geom, config);

    var SABTChart = dc.rowChart('#hdx-3W-SABT');
    var TVCPBTChart = dc.rowChart('#hdx-3W-TVCPBT');
    

    var VBSOAChart = dc.pieChart('#hdx-3W-VBSOA');
    var whereChart = dc.leafletChoroplethChart('#hdx-3W-where');

    var TBBTChart = dc.rowChart('#hdx-3W-TBBT');
    var MChart = dc.pieChart('#hdx-3W-M');
    var TPChart = dc.pieChart('#hdx-3W-TP');

    var filterMechanismPie = dc.pieChart('#filterMechanism');
    var filtercondPie = dc.pieChart('#filterConditionality');
    var filterRestPie = dc.pieChart('#filterRestriction');
    var filterRuralUrban = dc.pieChart('#filterArea');




    var peopleAssisted = dc.numberDisplay('#peopleAssisted');
    var amountTransfered = dc.numberDisplay('#amountTransfered');
    var numberOrgs = dc.numberDisplay('#numberOrgs');
    var numberClusters = dc.numberDisplay('#numberClusters');

    var cf = crossfilter(data);
    //print_filter(cf);

    var TBBTChartDim = cf.dimension(function (d) {
        return d["Region"];
    });
    var TPChartDim = cf.dimension(function (d) {
        return d["Target Population"];
    });
    var MChartDim = cf.dimension(function (d) {
        return d["Modality"];
    });

    var SABTDimension = cf.dimension(function (d) {
        return d[config.SABTFieldName];
    });
    var TVCPBTDimension = cf.dimension(function (d) {
        return d[config.TVCPBTFieldName];
    });



    var VBSOADimension = cf.dimension(function (d) {
        return d[config.VBSOAFieldName];
    });
    var whereDimension = cf.dimension(function (d) {
        return d[config.whereFieldName];
    });

    var dimMecha = cf.dimension(function (d) {
        return d[config.mechanismField];
    });
    var dimCond = cf.dimension(function (d) {
        return d[config.conditonalityField];
    });
    var dimRest = cf.dimension(function (d) {
        return d[config.restrictionField];
    });
    var dimRuralUrban = cf.dimension(function (d) {
        return d[config.ruralField];
    });

    // var SABTGroup = SABTDimension.group();
    // var VBSOAGroup = VBSOADimension.group();
    // var whereGroup = whereDimension.group();

    // var sortedRegDim = TBBTChartDim.top(Infinity);
    var TBBTChartGroup = TBBTChartDim.group().reduceSum(function (d) {
        return d[config.sumField]
    });
    var MChartGroup = MChartDim.group().reduceSum(function (d) {
        return parseInt(d[config.sumField]);
    });
    var TPChartGroup = TPChartDim.group().reduceSum(function (d) {
        return parseInt(d[config.sumField]);
    });

    var groupMecha = dimMecha.group().reduceSum(function (d) {
        return parseInt(d[config.sumField]);
    });

    var groupCond = dimCond.group().reduceSum(function (d) {
        return parseInt(d[config.sumField]);
    });

    var groupRest = dimRest.group().reduceSum(function (d) {
        return parseInt(d[config.sumField]);
    });

    var groupRuralUrban = dimRuralUrban.group().reduceSum(function (d) {
        return parseInt(d[config.sumField]);
    });


    var SABTGroup = SABTDimension.group().reduceSum(function (d) {
        // var ret = 0;
        // $.each(data,(function(i,j){
        //     if(j['Region'] == d['Region']){
        //         ret +=1;
        //     }
        // }))
        return parseInt(1);
    });
    var TVCPBTGroup = TVCPBTDimension.group().reduceSum(function (d) {
        return parseInt(d['Transfer value']);
    });

    var VBSOAGroup = VBSOADimension.group().reduceSum(function (d) {
        return parseInt(d[config.sumField]);
    });

    var whereGroup = whereDimension.group().reduceSum(function (d) {
        return parseInt(d[config.sumField]);
    });



    var gp = cf.groupAll().reduce(
        function (p, v) {
            p.peopleAssisted += +v[config.sumField];
            p.amountTransfered += +v["Transfer value"]; //ADD BY FAIZAL edited
            p.totalHH += +v["Households"];
            p.numOrgs++;
            if (v["Organization"] in p.orgas){
                p.orgas[v["Organization"]]++;
                // p.numOrgs++; //ADD BY FAIZAL edited
            }
            else {
                p.orgas[v["Organization"]] = 1;
                // p.numOrgs++;
            }

            if (p.totalHH != 0) {
                p.avg = p.amountTransfered / p.totalHH;
                // console.log(p.totalHH);
            } else
                p.avg = 0;
            //console.log(p.orgas);
            return p;
        },
        function (p, v) {
            p.peopleAssisted -= +v[config.sumField];
            p.amountTransfered -= +v["Transfer value"]; //ADD BY FAIZAL edited
            p.totalHH -= +v["Households"];

            p.numOrgs--;
            p.orgas[v["Organization"]]--;
            if (p.orgas[v["Organization"]] == 0) {
                delete p.orgas[v["Organization"]];
                // p.numOrgs--;
            }

            if (p.peopleAssisted < 0) p.peopleAssisted = 0;
            if (p.amountTransfered < 0) p.amountTransfered = 0;
            if (p.totalHH != 0)
                p.avg = p.amountTransfered / p.totalHH;

            return p;
        },
        function () {
            return {
                peopleAssisted: 0,
                amountTransfered: 0,
                totalHH: 0,
                avg: 0,
                numOrgs: 0,
                orgas: {}
            };

        }
    );

    var all = cf.groupAll();

    var formatComma = d3.format(',');
    var formatDecimalComma = d3.format(",.0f");
    var formatDecimal = function (d) {
        ret = d3.format(".3f");
        return "$ " + ret(d);
    };
    var formatDecimalAVG = function (d) {
        ret = d3.format(".1f");
        return "$ " + ret(d);
    };
    var formatMoney = function (d) {
        return "$ " + formatDecimalComma(d);
    };

    var colorScale = d3.scale.ordinal().range(['#A8763E','#00BFA5','#FA8334']);


    filterMechanismPie.width(190)
        .height(190)
        .radius(80)
        .innerRadius(25)
        .dimension(dimMecha)
        .group(groupMecha)
        .colors(colorScale)
        .renderTitle(true)
        .title(function (d) {
            text = d.key + " | No. beneficiaries : " + formatComma(d.value);
            return capitalizeFirstLetter(text);
        });

    var colorScale3 = d3.scale.ordinal().range(['#A8763E','#00BFA5','#FA8334']);

    filtercondPie.width(190)
        .height(190)
        .radius(80)
        .innerRadius(25)
        .dimension(dimCond)
        .group(groupCond)
        .colors(colorScale3)
        .renderTitle(true)
        .title(function (d) {
            text = d.key + " | No. Beneficiaries : " + formatComma(d.value);
            return capitalizeFirstLetter(text);
        });

    filterRestPie.width(190)
        .height(190)
        .radius(80)
        .innerRadius(25)
        .dimension(dimRest)
        .group(groupRest)
        .renderTitle(true)
        .title(function (d) {
            text = d.key + " | No. Beneficiaries : " + formatComma(d.value);
            return capitalizeFirstLetter(text);
        });


    filterRuralUrban.width(190)
        .height(190)
        .radius(80)
        .innerRadius(25)
        .dimension(dimRuralUrban)
        .group(groupRuralUrban)
        .colors(colorScale)
        .renderTitle(true)
        .title(function (d) {
            text = d.key + " | No. Beneficiaries : " + formatComma(d.value);
            return capitalizeFirstLetter(text);
        });


    //tooltip
    var rowtip = d3.tip().attr('class', 'd3-tip').html(function (d) {
        return d.key + ': ' + d3.format('0,000')(d.value);

    });

    SABTChart.width($('.blockbar').width()).height(400).margins({top: 10, right: 10, bottom: 30, left: 0})
        .dimension(SABTDimension)
        .group(SABTGroup)
        .elasticX(true)
        .data(function (group) {
            return group.top(15);
        })
        .labelOffsetY(13)
        .colors([config.color])
        .colorAccessor(function (d, i) {
            return 0;
        })
        .renderTitle(true)
        .title(function (d) {
            text = d.key + " | No. Activities : " + formatComma(d.value);
            return capitalizeFirstLetter(text);
        })
        .xAxis().ticks(5);

    var coloring = ['#eab12f','#20bf55','#1cab4c','#f3d48c','#f8e5ba','#faedd1','#fcf6e8'];
    let pie1 = generatePieValuesAndColors(MChartGroup, brownColors);
    let pieChart1Values = pie1[0],
        pieChart1Colors = pie1[1];
    let pie1ColorScale = d3.scale.ordinal()
        .domain(pieChart1Values)
        .range(pieChart1Colors);
    var indexing2 = 0;
    MChart.width(210).height(190)
       .dimension(MChartDim)
       .group(MChartGroup)
       .renderTitle(true)
       .innerRadius(30)
       .colors(pie1ColorScale.range())
       .colorAccessor(
        function(d){

            return pie1ColorScale.domain().indexOf(d.key);
        })
       .title(function (d) {
            percentage = parseFloat(d.value) / gv_allvalue * 100;
            percentage = percentage.toFixed(2);

            text = d.key + " | Activities : " + formatComma(d.value) +" | "+percentage+'%';
            return capitalizeFirstLetter(text);
       })
    
       .on('renderlet', function(chart) {
        reset_indexing();
          chart.selectAll('rect').on('click', function(d) {
             console.log('click!', d);
             reset_indexing();
          });
       });

    TVCPBTChart.width($('.blockbar').width()).height(400).margins({top: 10, right: 10, bottom: 30, left: 0})
        .dimension(TVCPBTDimension)
        .group(TVCPBTGroup)
        .elasticX(true)
        .data(function (group) {
            return group.top(15);
        })
        .labelOffsetY(13)
        .colors([config.color])
        .colorAccessor(function (d, i) {
            return 0;
        })
        .renderTitle(true)
        .title(function (d) {
            text = d.key + " | Cash Allocation : $" + formatComma(d.value);
            return capitalizeFirstLetter(text);
        })
        .xAxis().ticks(5);

    var docoloring = ['#20bf55','#36c566','#4ccb76','#62d288','#79d899','#8fdfaa','#a5e5bb','#bcebcc','#d2f2dd','#e8f8ee','#1cab4c','#199844','#16853b'];
    let pie2 = generatePieValuesAndColors(VBSOAGroup, greenColors);
    let pieChart2Values = pie2[0],
        pieChart2Colors = pie2[1];
    let pie2ColorScale = d3.scale.ordinal()
        .domain(pieChart2Values)
        .range(pieChart2Colors);
    var indexing = 0;
    VBSOAChart.width(210).height(190)
       .dimension(VBSOADimension)
       .group(VBSOAGroup)
       .renderTitle(true)
       .innerRadius(30)
       .colors(pie2ColorScale.range())
       .colorAccessor(
        function(d){
            return pie2ColorScale.domain().indexOf(d.key);
        })
       .title(function (d) {
            percentage = parseFloat(d.value) / gv_allvalue * 100;
            percentage = percentage.toFixed(2);

            text = d.key + " | No. Beneficiaries : " + formatComma(d.value) +" | "+percentage+'%';
            return capitalizeFirstLetter(text);
       })
       .on('renderlet', function(chart) {
        reset_indexing();
          chart.selectAll('rect').on('click', function(d) {
             console.log('click!', d);
             reset_indexing();
          });
       });


    // VBSOAChart.width($('.blockbar').width()).height(300).margins({top: 10, right: 10, bottom: 30, left: 0})
        // .dimension(VBSOADimension)
        // .group(VBSOAGroup)
        // .elasticX(false)
        // .data(function (group) {
        //     return group.top(15);
        // })
        // .labelOffsetY(20)
        // .colors([config.color])
        // .colorAccessor(function (d) {
        //     return 0;
        // })
        // .renderTitle(true)
        // .title(function (d) {
        //     text = d.key + " | No. Beneficiaries : " + formatComma(d.value);
        //     return capitalizeFirstLetter(text);
        // })
    //     .xAxis().ticks(5);
    

    TBBTChart.width($('.blockbar').width()).height(400).margins({top: 10, right: 10, bottom: 30, left: 0})
        .dimension(TBBTChartDim)
        .group(TBBTChartGroup)
        .elasticX(true)
        .data(function (group) {
            return group.top(17);
        })
        .labelOffsetY(13)
        .colors([config.color])
        .colorAccessor(function (d) {
            return 0;
        })
        .renderTitle(true)
        .title(function (d) {
            text = d.key + " | No. Beneficiaries : " + formatComma(d.value);
            return text; //capitalizeFirstLetter(text);
        })
        .xAxis().ticks(5);


    

    // MChart.width($('.blockbar').width()).height(160).margins({top: 10, right: 10, bottom: 30, left: 0})
    //     .dimension(MChartDim)
    //     .group(MChartGroup)
    //     .elasticX(true)
    //     .data(function (group) {
    //         return group.top(17);
    //     })
    //     .labelOffsetY(13)
    //     .colors([config.color])
    //     .colorAccessor(function (d) {
    //         return 0;
    //     })
    //     .renderTitle(true)
    //     .title(function (d) {
    //         text = d.key + " | Activities : " + formatComma(d.value);
    //         return text; //capitalizeFirstLetter(text);
    //     })
    //     .xAxis().ticks(5);

   
    var selfcoloring = ['#20bf55','#36c566','#4ccb76','#62d288','#79d899','#8fdfaa','#a5e5bb','#bcebcc','#d2f2dd','#e8f8ee','#1cab4c','#199844','#16853b','#20bf55','#36c566','#4ccb76','#62d288','#79d899','#8fdfaa','#a5e5bb','#bcebcc','#d2f2dd','#e8f8ee','#1cab4c','#199844','#16853b','#eab12f','#ecba46','#eec25e','#f1cb75','#f3d48c','#f5dca3','#f8e5ba','#faedd1','#fcf6e8'];
    let pie3 = generatePieValuesAndColors(TPChartGroup, otherColors);
    let pieChart3Values = pie3[0],
        pieChart3Colors = pie3[1];
    let pie3ColorScale = d3.scale.ordinal()
        .domain(pieChart3Values)
        .range(pieChart3Colors);
    var indexing3 = 0;
    TPChart.width(210).height(190)
       .dimension(TPChartDim)
       .group(TPChartGroup)
       .renderTitle(true)
       .innerRadius(30)
       .colors(pie3ColorScale.range())
       .colorAccessor(
        function(d){
            return pie3ColorScale.domain().indexOf(d.key);
        })


       .title(function (d) {
            percentage = parseFloat(d.value) / gv_allvalue * 100;
            percentage = percentage.toFixed(2);

            text = d.key + " | Activities : " + formatComma(d.value) +" | "+percentage+'%';
            return capitalizeFirstLetter(text);
       })
       .label(function(d){
        // percentage = d.value / gv_allvalue_tiga * 100;
        // percentage = percentage.toFixed(2);
        // return d.key+' | '+percentage+'%';
        return d.key;
       })
       .on('renderlet', function(chart) {
        reset_indexing();
          chart.selectAll('rect').on('click', function(d) {
             console.log('click!', d);
             reset_indexing();
          });
       });

       function reset_indexing(){
        console.log('reset indexing');
         indexing = 0;
         indexing2 = 0;
         indexing3 = 0;
       }

    // TPChart.width($('.blockbar').width()).height(160).margins({top: 10, right: 10, bottom: 30, left: 0})
    //     .dimension(TPChartDim)
    //     .group(TPChartGroup)
    //     .elasticX(true)
    //     .data(function (group) {
    //         return group.top(17);
    //     })
    //     .labelOffsetY(13)
    //     .colors([config.color])
    //     .colorAccessor(function (d) {
    //         return 0;
    //     })
    //     .renderTitle(true)
    //     .title(function (d) {
    //         text = d.key + " | No. Targeted Population  : " + formatComma(d.value);
    //         return text; //capitalizeFirstLetter(text);
    //     })
    //     .xAxis().ticks(5);




    dc.dataCount('#count-info')
        .dimension(cf)
        .group(all);

    whereChart.width($('#hxd-3W-where').width())
        .dimension(whereDimension)
        .group(whereGroup)
        .center([0, 0])
        .zoom(0)
        .geojson(geom)
        .colors(['#DDDDDD', '#A7C1D3', '#71A5CA', '#3B88C0', '#056CB6'])
        .colorDomain([0, 4])
        .colorAccessor(function (d) {
            var c = 0
            if (d > 150000) {
                c = 4;
            } else if (d > 50000) {
                c = 3;
            } else if (d > 1000) {
                c = 2;
            } else if (d > 0) {
                c = 1;
            };
            return c
        })
        .featureKeyAccessor(function (feature) {
            return feature.properties[config.joinAttribute];
        }).popup(function (d) {
            text = lookup[d.key] + "<br/>No. Beneficiaries : " + formatComma(d.value);
            return text;
        })
        .renderPopup(true);



    var peopleA = function (d) {
        return d.peopleAssisted;
    };

    var amountT = function (d) {
        return d.amountTransfered;
    };

    var numO = function (d) {
        return d.numOrgs;
    };

    var numAvg = function (d) {
        return d.avg;
    };

    peopleAssisted.group(gp)
        .valueAccessor(peopleA)
        .html({
            none: "<span style=\"color:#03a9f4; font-size: 26px;\">unavailable</span>"
        })
        .formatNumber(formatDecimalComma);
    //        .formatNumber(formatComma);

    amountTransfered.group(gp)
        .valueAccessor(amountT)
        .html({
            none: "<span style=\"color:#03a9f4; font-size: 26px;\">unavailable</span>"
        })
        .formatNumber(formatMoney);

    numberOrgs.group(gp)
        .valueAccessor(numO)
        .formatNumber(formatDecimalComma);

    //j'ai la flemme de changer le nom de la variable mais c'est le AVG
    numberClusters.group(gp)
        .valueAccessor(numAvg)
        .html({
            none: "<span style=\"color:#03a9f4; font-size: 26px;\">unavailable</span>"
        })
        .formatNumber(formatDecimalAVG);



    dc.renderAll();

    var map = whereChart.map();

    zoomToGeom(geom);


    var g = d3.selectAll('#hdx-3W-SABT').select('svg').append('g');
    d3.selectAll('g.row').call(rowtip);
    d3.selectAll('g.row').on('mouseover', rowtip.show).on('mouseout', rowtip.hide);


    function zoomToGeom(geom) {
        var bounds = d3.geo.bounds(geom);
        map.fitBounds([[bounds[0][1], bounds[0][0]], [bounds[1][1], bounds[1][0]]]);
    }

    function genLookup(geojson, config) {
        var lookup = {};
        geojson.features.forEach(function (e) {
            lookup[e.properties[config.joinAttribute]] = String(e.properties[config.nameAttribute]);
        });
        return lookup;
    }

    function capitalizeFirstLetter(string) {
        return string.charAt(0).toUpperCase() + string.slice(1);
    }


}

//function hxlProxyToJSON(input, headers) {
//    var output = [];
//    var keys = []
//    input.forEach(function (e, i) {
//        if (i == 0) {
//            e.forEach(function (e2, i2) {
//                var parts = e2.split('+');
//                var key = parts[0]
//                if (parts.length > 1) {
//                    var atts = parts.splice(1, parts.length);
//                    atts.sort();
//                    atts.forEach(function (att) {
//                        key += '+' + att
//                    });
//                }
//                keys.push(key);
//            });
//        } else {
//            var row = {};
//            e.forEach(function (e2, i2) {
//                row[keys[i2]] = e2;
//            });
//            output.push(row);
//        }
//    });
//    return output;
//}
//load 3W data

var dataCall = $.ajax({
    type: 'GET',
    url: config.data,
    dataType: 'json',
});

//load geometry

var geomCall = $.ajax({
    type: 'GET',
    url: config.geo,
    dataType: 'json',
});

//when both ready construct 3W

$.when(dataCall, geomCall).then(function (dataArgs, geomArgs) {
    var data = dataArgs[0]; //hxlProxyToJSON(dataArgs[0]);
    var geom = geomArgs[0];
    geom.features.forEach(function (e) {
        e.properties[config.joinAttribute] = String(e.properties[config.joinAttribute]);
    });
    generate3WComponent(config, data, geom);
});


//var formatComma = d3.format(","),
//    formatDecimal = d3.format(".1f"),
//    formatDecimalComma = d3.format(",.2f"),
//    formatSuffix = d3.format("s"),
//    formatSuffixDecimal1 = d3.format(".1s"),
//    formatSuffixDecimal2 = d3.format(".2s"),
//    formatMoney = function(d) { return "$" + formatDecimalComma(d); },
//    formatPercent = d3.format(",.2%");