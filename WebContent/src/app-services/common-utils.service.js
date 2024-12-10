(function () {
    angular.module('App').factory('CommonUtils', CommonUtils);

    function CommonUtils() {
        var utils = {};

        utils.checkFileName = checkFileName;
        utils.dateFormat = dateFormat;
		utils.checkMenuOption = checkMenuOption;
        return utils;

        function checkFileName(fileName) {
			if(fileName) {
				fileName = fileName.trim();
				fileName = fileName.replace(/\s/g, '_');
				fileName = fileName.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
				fileName = fileName.replace(/[^a-zA-Z0-9-_.]/g, '');
			}
			return fileName;
		}

		function dateFormat(date) {
			let dateFormat = moment(date).format('YYYY-MM-DD')
			return dateFormat;
		}

		function checkMenuOption(lst, id, subId) {
			let found = false;
			for(let i = 0; i < lst.length; i++) {
				if(lst[i]['ID_MENU'] == id && subId && lst[i]['SUBMENUS'] && lst[i]['SUBMENUS']['SUBMENU']) {
					for(let j = 0; j < lst[i]['SUBMENUS']['SUBMENU'].length; j++) {
						if(lst[i]['SUBMENUS']['SUBMENU'][j]['ID_MENU'] === subId)
							found = true;
					}
				}
			}
			return found;
		}

    }

})();