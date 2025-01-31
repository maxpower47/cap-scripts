// ==UserScript==
// @name         Promotions Track Report Enhanced
// @namespace    http://tampermonkey.net/
// @version      1.1.0
// @description  Enhanced cadet promotions track report
// @author       Matthew Schmidt
// @match        https://www.capnhq.gov/CAP.ProfessionalLevels.Web/Reports/CadetPromotionsTrack
// @icon         https://www.capnhq.gov/favicon.ico
// @downloadURL  https://github.com/maxpower47/cap-scripts/raw/refs/heads/main/promotions-track-report-enhanced.user.js
// @updateURL    https://github.com/maxpower47/cap-scripts/raw/refs/heads/main/promotions-track-report-enhanced.user.js
// @require      https://code.jquery.com/jquery-3.7.1.min.js
// @grant        none
// ==/UserScript==

(function() {
    // test update
    'use strict';
    var $ = window.jQuery;

    var getData = (el) => {
        var data = {};

        data.ptDate = $(el).find('td:eq(1)').text().trim();

        var leadership = $(el).find('td:eq(2)').text().trim();
        var leadershipMatches = /Test - (\d\d ... \d\d\d\d)?\s*(?:\((\d\d)\))?Interactive -\s?(\d\d ... \d\d\d\d)?/.exec(leadership);

        if (leadershipMatches && leadershipMatches.length > 0) {
            data.leadershipTestDate = leadershipMatches[1];
            data.leadershipTestScore = leadershipMatches[2];
            data.leadershipInteractive = leadershipMatches[3];
        }

        data.drillDate = $(el).find('td:eq(3)').text().trim();
        if (!!$(el).find('td:eq(3)').find('.fa-ban').length) {
            data.drillDate = 'Not required';
        }



        // TODO - deal with AE sometimes not being required

        var aerospace = $(el).find('td:eq(4)').text().trim();
        var aerospaceMatches = /Test - (\d\d ... \d\d\d\d)?\s*(?:\((\d\d)\))?Interactive -\s?(\d\d ... \d\d\d\d)?/.exec(aerospace);

        if (aerospaceMatches && aerospaceMatches.length > 0) {
            data.aerospaceTestDate = aerospaceMatches[1];
            data.aerospaceTestScore = aerospaceMatches[2];
            data.aerospaceInteractive = aerospaceMatches[3];
        }

        data.cdDate = $(el).find('td:eq(5)').text().trim();
        if (!!$(el).find('td:eq(5)').find('.fa-ban').length) {
            data.cdDate = 'Not required';
        }

        var specialActivityEl = $(el).find('td:eq(7)');
        data.specialActivityRequired = !specialActivityEl.find('.fa-ban').length;
        data.specialActivity = {};

        var specialActivityChildren = specialActivityEl.contents().filter(function() { return this.nodeType === 3 || this.nodeName === 'B'; });
        for (let i = 0; i < specialActivityChildren.length; i+=2) {
            data.specialActivity[$(specialActivityChildren[i]).text().split(':')[0]] = $(specialActivityChildren[i+1]).text().replace('None', '').trim();
        }


        var sdaEl = $(el).find('td:eq(8)');
        data.sdaRequired = !!sdaEl.children().length;
        data.sda = {};

        var sdaChildren = sdaEl.contents().filter(function() { return this.nodeType === 3 || this.nodeName === 'B'; });
        for (let i = 0; i < sdaChildren.length; i+=2) {
            data.sda[$(sdaChildren[i]).text().split(':')[0]] = $(sdaChildren[i+1]).text().replace('None', '').trim();
        }


        data.tooltip = $('td:eq(0) span', el).attr('data-original-title');
        var tooltipMatches = /<b>Email:<\/b><br\/>(.*)<br\/><b>Date Joined:<\/b><br\/>(.*)<br\/><b>Promotion Eligible:<\/b><br\/>(.*)/.exec(data.tooltip)

        if (tooltipMatches && tooltipMatches.length > 0) {
            data.eligibilityDate = new Date(tooltipMatches[3]);
            data.email = tooltipMatches[1];
            data.joinDateString = tooltipMatches[2];
            data.eligibilityDateString = tooltipMatches[3];
        }

        data.ready = !!(data.eligibilityDate <= new Date() &&
                        data.ptDate &&
                        (data.leadershipTestDate || data.leadershipInteractive) &&
                        data.drillDate &&
                        (data.aerospaceTestDate || data.aerospaceInteractive) &&
                        data.cdDate &&
                        (!data.specialActivityRequired || data.specialActivity.values().every((x) => x)) &&
                        (!data.sdaRequired || data.sda.values().every((x) => x)));

        return data;
    };

    var getEligibilityDateMarkup = (data) => {
        return '<br/><b>Promotion Eligible:</b><br/><span style="color:' + (data.eligibilityDate <= new Date() ? 'green' : 'red') + ';">' + data.eligibilityDateString + '</span>';
    };

    $('.cadet_track').each((ti, tel) => {
        $('thead tr:eq(1)', tel).prepend(() => {
            return '<th>Ready</th>';
        });

        $("tbody tr", tel).each((i, el) => {
            var data = getData(el);

            console.log(data);


            $(el).prepend(() => {
                return '<td>' + (data.ready ? 'Ready for promotion' : '') + '</td>';
            });

            $(el).find('td:eq(1)').append(() => {
                return getEligibilityDateMarkup(data);
            });

            $(el).parents('.cadet_track').next('.printCadetTracking').children(':eq(' + (((i + 1) * 2) - 1) + ')').each((ci, cel) => {
                $(cel).children()
                    .removeClass(['col-md-2', 'col-md-3'])
                    .addClass('col-md-2');

                $(cel).prepend(() => {
                    return '<div class="fix-md-1">' + (data.ready ? 'Ready for promotion' : '') + '</div>';
                });

                $(cel).find('div:eq(1)').append(() => {
                    return getEligibilityDateMarkup(data);
                });

                // 12 grid, but col-md-1 doesn't set flex properties at < 768px
                $(cel).find('.fix-md-1').css('flex', '0 0 8.333333%').css('max-width', '8.333333%');
            });
        });
    });


})();