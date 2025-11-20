// ==UserScript==
// @name         Promotions Track Report Enhanced
// @namespace    http://tampermonkey.net/
// @version      1.4.0
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

    var getData = (el, achievement) => {
        var data = {};

        data.achievement = achievement;

        data.ptDate = $(el).find('td:eq(1)').text().trim();
        data.ptRequired = true;

        var leadershipEl = $(el).find('td:eq(2)');
        data.leadershipRequired = leadershipEl.find('i').not('.fa-ban').length > 0;
        var leadership = leadershipEl.text().trim();
        var leadershipMatches = /Test - (\d\d ... \d\d\d\d)?\s*(?:\((\d+)\))?Interactive -\s?(\d\d ... \d\d\d\d)?/.exec(leadership);

        if (leadershipMatches && leadershipMatches.length > 0) {
            data.leadershipTestDate = leadershipMatches[1];
            data.leadershipTestScore = leadershipMatches[2];
            data.leadershipInteractive = leadershipMatches[3];
        }

        data.drillDate = $(el).find('td:eq(3)').text().trim();
        if (!!$(el).find('td:eq(3)').find('.fa-ban').length) {
            data.drillDate = 'Not required';
            data.drillRequired = false;
        } else {
            data.drillRequired = true;
        }

        var aerospaceEl = $(el).find('td:eq(4)');
        data.aerospaceRequired = aerospaceEl.find('i').not('.fa-ban').length > 0;
        var aerospace = aerospaceEl.text().trim();
        var aerospaceMatches = /Test - (\d\d ... \d\d\d\d)?\s*(?:\((\d+)\))?(?: - .)?Interactive -\s?(\d\d ... \d\d\d\d)?(?: - .)?/.exec(aerospace);

        if (aerospaceMatches && aerospaceMatches.length > 0) {
            data.aerospaceTestDate = aerospaceMatches[1];
            data.aerospaceTestScore = aerospaceMatches[2];
            data.aerospaceInteractive = aerospaceMatches[3];
        }

        data.cdDate = $(el).find('td:eq(5)').text().trim();
        if (!!$(el).find('td:eq(5)').find('.fa-ban').length) {
            data.cdDate = 'Not required';
            data.cdRequired = false;
        } else {
            data.cdRequired = true;
        }

        var specialActivityEl = $(el).find('td:eq(7)');
        data.specialActivityRequired = !specialActivityEl.find('.fa-ban').length;
        data.specialActivity = {};

        var specialActivityChildren = specialActivityEl.contents().filter(function() { return this.nodeType === 3 || this.nodeName === 'B'; });
        for (let i = 0; i < specialActivityChildren.length; i+=2) {
            var splitItem = $(specialActivityChildren[i]).text().split(':');
            if (splitItem.length === 1) {
                data.specialActivity.activity = splitItem[0];
                break;
            } else {
                data.specialActivity[$(specialActivityChildren[i]).text().split(':')[0]] = $(specialActivityChildren[i+1]).text().replace('None', '').trim();
            }
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
            data.joinDate = new Date(tooltipMatches[2]);
            data.email = tooltipMatches[1];
            data.joinDateString = tooltipMatches[2];
            data.eligibilityDateString = tooltipMatches[3];
        }

        data.ready = !!(data.eligibilityDate <= new Date() &&
                        data.ptDate &&
                        (data.leadershipTestDate || data.leadershipInteractive) &&
                        data.drillDate &&
                        (!data.aerospaceRequired || data.aerospaceTestDate || data.aerospaceInteractive) &&
                        data.cdDate &&
                        (!data.specialActivityRequired || Object.values(data.specialActivity).every((x) => x)) &&
                        (!data.sdaRequired || Object.values(data.sda).every((x) => x)));


        data.numRequired = 0;
        data.numRequired += (data.ptRequired ? 1 : 0);
        data.numRequired += (data.leadershipRequired ? 1 : 0);
        data.numRequired += (data.drillRequired ? 1 : 0);
        data.numRequired += (data.aerospaceRequired ? 1 : 0);
        data.numRequired += (data.cdRequired ? 1 : 0);
        data.numRequired += (data.specialActivityRequired ? 1 : 0);
        data.numRequired += (data.sdaRequired ? 1 : 0);

        data.numCompleted = 0;
        data.numCompleted += ((data.ptDate && data.ptRequired) ? 1 : 0);
        data.numCompleted += (data.leadershipRequired && ((data.leadershipTestDate || data.leadershipInteractive)) ? 1 : 0);
        data.numCompleted += ((data.drillDate && data.drillRequired) ? 1 : 0);
        data.numCompleted += (data.aerospaceRequired && ((data.aerospaceTestDate || data.aerospaceInteractive)) ? 1 : 0);
        data.numCompleted += ((data.cdDate && data.cdRequired) ? 1 : 0);
        data.numCompleted += ((data.specialActivityRequired && Object.values(data.specialActivity).every((x) => x)) ? 1 : 0);
        data.numCompleted += ((data.sdaRequired && Object.values(data.sda).every((x) => x)) ? 1 : 0);


        var promotePlus90 = data.achievement === '1' ? new Date(data.joinDate.getTime()) : new Date(data.eligibilityDate.getTime());
        promotePlus90.setTime(promotePlus90.getTime() + ((24*60*60*1000) * 90));
        data.stalled = promotePlus90 <= new Date();

        return data;
    };

    var getEligibilityDateMarkup = (data) => {

        var joinDatePlus8 = new Date(data.joinDate.getTime());
        joinDatePlus8.setTime(joinDatePlus8.getTime() + ((24*60*60*1000) * 56));

        var joinDatePlus2 = new Date(data.joinDate.getTime());
        joinDatePlus2.setTime(joinDatePlus2.getTime() + ((24*60*60*1000) * 14));

        var out = '';

        if (data.achievement === '1') {
            out += '<br/><b>Join Date:</b><br/><span style="color:' + (joinDatePlus8 >= new Date() ? 'green' : joinDatePlus2 >= new Date() ? 'yellow' : 'red') + ';">' + data.joinDateString + '</span>';
        }

        out += '<br/><b>Promotion Eligible:</b><br/><span style="color:' + (data.eligibilityDate <= new Date() ? 'green' : 'red') + ';">' + data.eligibilityDateString + '</span>';
        return out;
    };

    var getAchievement = (el) => {
        return $(el).find('tr:first th:first').text().replace('Achievement', '').trim();
    };

    $('.cadet_track').each((ti, tel) => {
        var achievement = getAchievement(tel);

        $('.row').css('margin','0');

        $("tbody tr", tel).each((i, el) => {
            var data = getData(el, achievement);

            console.log(data);


            if (data.ready) {
                $(el).css('background-color', '#c7ddc7');
            }

            if (data.numRequired - data.numCompleted == 1 && data.stalled) {
                $(el).css('background-color', '#f7ab59');
            } else {
                if (data.stalled) {
                    $(el).css('background-color', '#f78d8d');
                }

                if (data.numRequired - data.numCompleted == 1 && !data.stalled) {
                    $(el).css('background-color', '#fcf89f');
                }
            }

            $(el).find('td:eq(0)').append(() => {
                return getEligibilityDateMarkup(data);
            });

            $(el).parents('.cadet_track').next('.printCadetTracking').children(':eq(' + (((i + 1) * 2) - 1) + ')').each((ci, cel) => {
                if (data.ready) {
                    $(cel).css('background-color', '#c7ddc7').css('-webkit-print-color-adjust','exact').css('padding','10px');
                }

                if (data.numRequired - data.numCompleted == 1) {
                    $(cel).css('background-color', '#fcf89f').css('-webkit-print-color-adjust','exact').css('padding','10px');
                }

                $(cel).find('div:eq(0)').append(() => {
                    return getEligibilityDateMarkup(data);
                });
            });
        });
    });
})();