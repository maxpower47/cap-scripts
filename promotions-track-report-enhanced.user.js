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

    $('.cadet_track').each((ti, tel) => {
        $('thead tr:eq(1)', tel).append(() => {
            return '<th>Dates</th>';
        });

        $('thead tr:eq(1)', tel).prepend(() => {
            return '<th>Ready</th>';
        });

        $("tbody tr", tel).each((i, el) => {

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
            var aerospace = $(el).find('td:eq(4)').text().trim();


            var aerospaceMatches = /Test - (\d\d ... \d\d\d\d)?\s*(?:\((\d\d)\))?Interactive -\s?(\d\d ... \d\d\d\d)?/.exec(aerospace);

            if (aerospaceMatches && aerospaceMatches.length > 0) {
                data.aerospaceTestDate = aerospaceMatches[1];
                data.aerospaceTestScore = aerospaceMatches[2];
                data.aerospaceInteractive = aerospaceMatches[3];
            }

            data.cdDate = $(el).find('td:eq(5)').text().trim();

            var tooltip = $('td:eq(0) span', el).attr('data-original-title');

            var tooltipMatches = /<b>Email:<\/b><br\/>(.*)<br\/><b>Date Joined:<\/b><br\/>(.*)<br\/><b>Promotion Eligible:<\/b><br\/>(.*)/.exec(tooltip)

            if (tooltipMatches && tooltipMatches.length > 0) {
                data.eligibilityDate = new Date(tooltipMatches[3]);
            }

            console.log(data);

            var ready = false;


            if (data.eligibilityDate <= new Date() &&
                data.ptDate &&
                (data.leadershipTestDate || data.leadershipInteractive) &&
                data.drillDate &&
                (data.aerospaceTestDate || data.aerospaceInteractive) &&
                data.cdDate) {
                ready = true;
            }


                $(el).prepend(() => {
                    return '<td>' + (ready ? 'Ready for promotion' : '') + '</td>';
                });


                            $(el).append(() => {
                    return '<td>' + tooltip + '</td>';
                });

            $(el).parents('.cadet_track').next('.printCadetTracking').children(':eq(' + (((i + 1) * 2) - 1) + ')').each((ci, cel) => {
                $(cel).children()
                    .removeClass(['col-md-2', 'col-md-3'])
                    .addClass('col-md-2');


                $(cel).append(() => {
                    return '<div class="col-md-2">' + (ready ? 'Ready for promotion<br/>' : '') + tooltip + '</div>';
                });
            });
        });
    });
})();