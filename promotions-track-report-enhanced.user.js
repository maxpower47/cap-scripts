// ==UserScript==
// @name         Promotions Track Report Enhanced
// @namespace    http://tampermonkey.net/
// @version      1.0.3
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

        $("tbody tr", tel).each((i, el) => {
            $(el).append(() => {
                return '<td>' + $('td:eq(0) span', el).attr('data-original-title') + '</td>';
            });

            $(el).parents('.cadet_track').next('.printCadetTracking').children(':eq(' + (((i + 1) * 2) - 1) + ')').each((ci, cel) => {
                $(cel).children()
                    .removeClass(['col-md-2', 'col-md-3'])
                    .addClass('col-md-2');
                $(cel).append(() => {
                    return '<div class="col-md-2">' + $('td:eq(0) span', el).attr('data-original-title') + '</div>';
                });
            });
        });
    });
})();